// scripts/guess-flag.js
// Guess The Flag game logic
// 10 questions, score + streak tracking, confetti, and subtle animations

const EXCLUDED_COUNTRIES = new Set(["Israel"]);

// Number of questions per quiz
const TOTAL_QUESTIONS = 10;

const API_URL = // REST Countries API
  "https://restcountries.com/v3.1/all?fields=name,flags,independent";

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]; // Pick a random item from an array
}

function shuffle(arr) {
  const a = arr.slice(); // Shuffle an array without changing the original
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normaliseName(country) {
  return country?.name?.common?.trim() || "Unknown";
// Safely extract a clean country name
}

function getFlagUrl(country) {
  return (
    country?.flags?.png ||
    country?.flags?.svg ||
    "https://placehold.co/640x400?text=No+Flag"
  );
}

async function fetchCountries() {
  const resp = await fetch(API_URL);
  if (!resp.ok) throw new Error("Failed to fetch countries");
  const data = await resp.json();

  const cleaned = data
    .filter((c) => {
      const name = normaliseName(c);
      if (!name || name === "Unknown") return false;
      if (EXCLUDED_COUNTRIES.has(name)) return false;
      const flag = getFlagUrl(c);
      return !!flag;
    })
    .filter((c) => c.independent !== false);

  const seen = new Set();
  const unique = [];
  for (const c of cleaned) {
    const n = normaliseName(c);
    const key = n.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(c);
    }
  }
  return unique;
}

/* ----------------------------- Confetti ----------------------------- */
function ensureConfettiCanvas() {
  let canvas = document.getElementById("confettiCanvas");
  if (canvas) return canvas;

  canvas = document.createElement("canvas");
  canvas.id = "confettiCanvas";
  canvas.style.position = "fixed";
  canvas.style.inset = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
  };
  resize();
  window.addEventListener("resize", resize);

  return canvas;
}

function confettiBurst({ // Trigger a short confetti burst animation
  durationMs = 1100,
  particleCount = 110,
  gravity = 0.12,
  spread = Math.PI * 1.2,
} = {}) {
  const canvas = ensureConfettiCanvas();
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;

  const W = canvas.width;
  const H = canvas.height;

  const originX = (window.innerWidth / 2) * dpr;
  const originY = (window.innerHeight * 0.18) * dpr;

  const particles = [];
  for (let i = 0; i < particleCount; i++) {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * spread;
    const speed = (6 + Math.random() * 10) * dpr;
    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      w: (6 + Math.random() * 8) * dpr,
      h: (4 + Math.random() * 6) * dpr,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.25,
      alpha: 1,
      // don't set colors explicitly (we'll use random HSL without fixed palette)
      hue: Math.floor(Math.random() * 360),
    });
  }

  const start = performance.now();

  function step(now) {
    const t = now - start;
    ctx.clearRect(0, 0, W, H);

    for (const p of particles) {
      p.vy += gravity * dpr;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;

      // fade out towards end
      p.alpha = Math.max(0, 1 - t / durationMs);

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = `hsl(${p.hue} 85% 60%)`;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }

    if (t < durationMs) {
      requestAnimationFrame(step);
    } else {
      ctx.clearRect(0, 0, W, H);
    }
  }

  requestAnimationFrame(step);
}

/* Micro Animations */
function injectMicroStylesOnce() {
  if (document.getElementById("guessFlagMicroStyles")) return;

  const style = document.createElement("style");
  style.id = "guessFlagMicroStyles";
  style.textContent = `
    .gf-pop { animation: gfPop 220ms ease-out; }
    @keyframes gfPop { 0%{transform:scale(.98)} 70%{transform:scale(1.02)} 100%{transform:scale(1)} }

    .gf-fadein { animation: gfFadeIn 240ms ease-out; }
    @keyframes gfFadeIn { from{opacity:0; transform:translateY(4px)} to{opacity:1; transform:translateY(0)} }

    .gf-flag { opacity:0; transform:translateY(6px); }
    .gf-flag.show { animation: gfFlagIn 260ms ease-out forwards; }
    @keyframes gfFlagIn { to{opacity:1; transform:translateY(0)} }
  `;
  document.head.appendChild(style);
}

(function () {
  injectMicroStylesOnce();

  // Elements
  const qIndexEl = document.getElementById("qIndex");
  const qTotalEl = document.getElementById("qTotal");
  const scoreEl = document.getElementById("score");
  const flagImgEl = document.getElementById("flagImg");
  const flagAltHintEl = document.getElementById("flagAltHint");
  const choicesEl = document.getElementById("choices");
  const feedbackEl = document.getElementById("feedback");
  const nextBtn = document.getElementById("nextBtn");
  const restartBtn = document.getElementById("restartBtn");

  const endScreenEl = document.getElementById("endScreen");
  const finalScoreEl = document.getElementById("finalScore");
  const finalTotalEl = document.getElementById("finalTotal");
  const playAgainBtn = document.getElementById("playAgainBtn");

  // We'll add a streak badge dynamically (no HTML changes needed)
  let streakEl = null;

  // State
  let countries = [];
  let usedNames = new Set();

  let currentQuestion = 0;
  let score = 0;
  let currentCorrectName = "";
  let locked = false;

  let correctStreak = 0;

  qTotalEl.textContent = String(TOTAL_QUESTIONS);
  finalTotalEl.textContent = String(TOTAL_QUESTIONS);

  function ensureStreakBadge() {
    if (streakEl) return streakEl;

    // Put badge under score block if possible
    const scoreBlock = scoreEl?.closest("div") || scoreEl?.parentElement;
    streakEl = document.createElement("div");
    streakEl.className =
      "ml-0 md:ml-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600";
    streakEl.innerHTML = `<span class="font-semibold">Streak:</span> <span id="streakNum">0</span>`;
    const streakNum = streakEl.querySelector("#streakNum");

    // Try to insert near score box (best effort)
    if (scoreBlock?.parentElement) {
      scoreBlock.parentElement.appendChild(streakEl);
    }

    // Store ref for quick update
    streakEl._num = streakNum;
    return streakEl;
  }

  function updateStreakUI() {
    const badge = ensureStreakBadge();
    if (badge?._num) badge._num.textContent = String(correctStreak);

    // little pop
    if (badge) {
      badge.classList.remove("gf-pop");
      void badge.offsetWidth; // reflow
      badge.classList.add("gf-pop");
    }
  }

  function resetUIForQuestion() {
    feedbackEl.textContent = "";
    nextBtn.disabled = true;
    locked = false;
    choicesEl.innerHTML = "";
  }

  function setButtonState(btn, kind) {
    const base =
      "w-full text-left px-4 py-3 rounded-xl border transition font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500";

    if (kind === "correct") {
      btn.className = base + " bg-emerald-50 border-emerald-200 text-emerald-900";
      return;
    }
    if (kind === "wrong") {
      btn.className = base + " bg-rose-50 border-rose-200 text-rose-900";
      return;
    }
    if (kind === "disabled") {
      btn.className =
        base + " bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed";
      return;
    }

    btn.className = base + " bg-white border-slate-200 hover:bg-slate-50";
  }

  function endQuiz() {
    endScreenEl.classList.remove("hidden");
    finalScoreEl.textContent = String(score);
    nextBtn.disabled = true;

    const btns = choicesEl.querySelectorAll("button");
    btns.forEach((b) => setButtonState(b, "disabled"));

    // tiny celebration if you did well
    if (score >= 8) confettiBurst({ particleCount: 160, durationMs: 1400 });
  }

  function buildChoices(correctCountry) {
    const correctName = normaliseName(correctCountry);

    const wrongPool = countries
      .map(normaliseName)
      .filter((n) => n && n.toLowerCase() !== correctName.toLowerCase());

    const wrongs = new Set();
    while (wrongs.size < 3 && wrongPool.length > 3) {
      wrongs.add(pickRandom(wrongPool));
    }

    const options = shuffle([correctName, ...Array.from(wrongs)]);

    choicesEl.innerHTML = "";
    options.forEach((optName) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = optName;
      setButtonState(btn, "default");

      btn.addEventListener("click", () => handleAnswer(btn, optName));
      choicesEl.appendChild(btn);

      // fade in choices
      btn.classList.add("gf-fadein");
    });
  }

  function lockChoices() {
    const btns = choicesEl.querySelectorAll("button");
    btns.forEach((b) => {
      b.disabled = true;
    });
  }

  function revealCorrectAndWrong(chosenName) {
    const btns = Array.from(choicesEl.querySelectorAll("button"));
    btns.forEach((b) => {
      const name = (b.textContent || "").trim();
      if (name.toLowerCase() === currentCorrectName.toLowerCase()) {
        setButtonState(b, "correct");
      } else if (name.toLowerCase() === chosenName.toLowerCase()) {
        setButtonState(b, "wrong");
      } else {
        setButtonState(b, "disabled");
      }
    });
  }

function handleAnswer(btn, chosenName) {
  if (locked) return;
  locked = true;

  lockChoices();
  nextBtn.disabled = false;

  btn.classList.remove("gf-pop");
  void btn.offsetWidth;
  btn.classList.add("gf-pop");

  const isCorrect =
    chosenName.toLowerCase() === currentCorrectName.toLowerCase();

  if (isCorrect) {
    score += 1;
    scoreEl.textContent = String(score);

    correctStreak += 1;
    updateStreakUI();

    feedbackEl.textContent = "Correct bestie ✅";
    revealCorrectAndWrong("__none__");

    // 🎉 CONFETTI EVERY TIME 🎉
    confettiBurst();
  } else {
    feedbackEl.textContent = `Nope bestie ❌ It was ${currentCorrectName}.`;

    correctStreak = 0;
    updateStreakUI();

    revealCorrectAndWrong(chosenName);
  }
}


  function pickNewCountry() {
    const available = countries.filter((c) => {
      const name = normaliseName(c).toLowerCase();
      return !usedNames.has(name);
    });

    const chosen = available.length ? pickRandom(available) : pickRandom(countries);
    usedNames.add(normaliseName(chosen).toLowerCase());
    return chosen;
  }

  function showQuestion() {
    endScreenEl.classList.add("hidden");

    currentQuestion += 1;
    qIndexEl.textContent = String(currentQuestion);

    resetUIForQuestion();

    const chosen = pickNewCountry();
    currentCorrectName = normaliseName(chosen);

    // flag fade-in
    const flagUrl = getFlagUrl(chosen);
    flagImgEl.classList.remove("show");
    flagImgEl.classList.add("gf-flag");
    flagImgEl.src = flagUrl;
    flagImgEl.alt = "Flag to guess";

    flagImgEl.onload = () => {
      flagImgEl.classList.add("show");
    };

    flagAltHintEl.textContent = "Tip: choose the country name that matches the flag.";
    buildChoices(chosen);

    // If it's the last question, make the Next button say Finish once answered
    if (currentQuestion === TOTAL_QUESTIONS) {
      nextBtn.textContent = "Finish →";
    } else {
      nextBtn.textContent = "Next →";
    }
  }

  function restartQuiz() {
    currentQuestion = 0;
    score = 0;
    usedNames = new Set();
    currentCorrectName = "";
    locked = false;

    correctStreak = 0;

    scoreEl.textContent = "0";
    feedbackEl.textContent = "";
    nextBtn.disabled = true;
    nextBtn.textContent = "Next →";

    endScreenEl.classList.add("hidden");
    updateStreakUI();
    showQuestion();
  }

  async function init() {
    try {
      ensureStreakBadge();
      updateStreakUI();

      choicesEl.innerHTML = `
        <div class="text-slate-500 text-sm">
          Loading flags...
        </div>
      `;

      countries = await fetchCountries();

      if (!countries.length) {
        choicesEl.innerHTML = `
          <div class="bg-red-50 text-red-700 p-4 rounded-xl text-sm">
            Sorry, we couldn't load flags right now.
          </div>
        `;
        return;
      }

      restartQuiz();
    } catch (e) {
      console.error(e);
      choicesEl.innerHTML = `
        <div class="bg-red-50 text-red-700 p-4 rounded-xl text-sm">
          Sorry, we couldn't load flags right now.
        </div>
      `;
    }
  }

  nextBtn.addEventListener("click", () => {
    if (!locked) return;

    // If we just answered the last question, end now
    if (currentQuestion >= TOTAL_QUESTIONS) {
      endQuiz();
      return;
    }

    showQuestion();
  });

  restartBtn.addEventListener("click", restartQuiz);
  playAgainBtn.addEventListener("click", restartQuiz);

  init();
})();
