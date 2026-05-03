const EXCLUDED_COUNTRIES = new Set(["Israel"]);
const TOTAL_QUESTIONS = 10;
const API_URL = "https://restcountries.com/v3.1/all?fields=name,capital,population,independent";

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffle(arr) {
  const copy = arr.slice();

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy;
}

function normaliseCountryName(country) {
  return country?.name?.common?.trim() || "Unknown";
}

function cleanNameForGame(name) {
  return name.replace(/[^a-zA-Z ]/g, "").trim();
}

function scrambleWord(name, difficulty = "easy") {
  const wordForDifficulty = difficulty === "hard" ? name.toLowerCase() : name;
  const letters = wordForDifficulty.replace(/\s+/g, "").split("");

  if (letters.length < 2) return wordForDifficulty;

  let scrambled = letters.slice();
  let attempts = 0;

  while (scrambled.join("") === letters.join("") && attempts < 20) {
    scrambled = shuffle(letters);
    attempts += 1;
  }

  return scrambled.join(" ");
}

function buttonClass(kind = "default") {
  const base =
    "w-full text-left px-4 py-3 rounded-xl border transition font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500";

  if (kind === "correct") {
    return base + " bg-emerald-50 border-emerald-200 text-emerald-900";
  }

  if (kind === "wrong") {
    return base + " bg-rose-50 border-rose-200 text-rose-900";
  }

  if (kind === "disabled") {
    return base + " bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed";
  }

  return base + " bg-white border-slate-200 hover:bg-slate-50";
}

async function fetchCountries() {
  const resp = await fetch(API_URL);

  if (!resp.ok) {
    throw new Error("Failed to fetch countries");
  }

  const data = await resp.json();

  const cleaned = data
    .filter((country) => {
      const name = normaliseCountryName(country);

      if (!name || name === "Unknown") return false;
      if (EXCLUDED_COUNTRIES.has(name)) return false;
      if (country.independent === false) return false;

      const cleanedName = cleanNameForGame(name);
      return cleanedName.length >= 4;
    })
    .map((country) => ({
      name: normaliseCountryName(country),
      cleanedName: cleanNameForGame(normaliseCountryName(country)),
      capital: Array.isArray(country.capital)
        ? country.capital[0]
        : country.capital || "Unknown",
      population: country.population || 0
    }));

  const unique = [];
  const seen = new Set();

  for (const country of cleaned) {
    const key = country.name.toLowerCase();

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(country);
    }
  }

  return unique;
}

(function () {
  const qIndexEl = document.getElementById("qIndex");
  const qTotalEl = document.getElementById("qTotal");
  const scoreEl = document.getElementById("score");
  const timerEl = document.getElementById("timer");
  const scrambleWordEl = document.getElementById("scrambleWord");
  const hintTextEl = document.getElementById("hintText");
  const choicesEl = document.getElementById("choices");
  const feedbackEl = document.getElementById("feedback");
  const nextBtn = document.getElementById("nextBtn");
  const restartBtn = document.getElementById("restartBtn");
  const difficultyEl = document.getElementById("difficulty");

  const endScreenEl = document.getElementById("endScreen");
  const finalScoreEl = document.getElementById("finalScore");
  const finalTotalEl = document.getElementById("finalTotal");
  const playAgainBtn = document.getElementById("playAgainBtn");

  let countries = [];
  let usedNames = new Set();

  let currentQuestion = 0;
  let score = 0;
  let currentCorrectName = "";
  let currentCorrectCountry = null;
  let locked = false;

  let timerId = null;
  let timeLeft = 15;

  qTotalEl.textContent = String(TOTAL_QUESTIONS);
  finalTotalEl.textContent = String(TOTAL_QUESTIONS);

  function getDifficultyTime() {
    return difficultyEl.value === "hard" ? 8 : 15;
  }

  function getDifficultyPool() {
    if (difficultyEl.value === "hard") {
      return countries.filter((country) => country.cleanedName.length >= 7);
    }

    return countries.filter((country) => country.cleanedName.length >= 4);
  }

  function resetTimer() {
    clearInterval(timerId);

    timeLeft = getDifficultyTime();
    timerEl.textContent = String(timeLeft);

    timerId = setInterval(() => {
      timeLeft -= 1;
      timerEl.textContent = String(timeLeft);

      if (timeLeft <= 0) {
        clearInterval(timerId);
        handleTimeUp();
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerId);
  }

  function resetUIForQuestion() {
    feedbackEl.textContent = "";
    nextBtn.disabled = true;
    locked = false;
    choicesEl.innerHTML = "";
  }

  function lockChoices() {
    const buttons = choicesEl.querySelectorAll("button");

    buttons.forEach((button) => {
      button.disabled = true;
    });
  }

  function revealAnswer(chosenName) {
    const buttons = Array.from(choicesEl.querySelectorAll("button"));

    buttons.forEach((button) => {
      const text = (button.textContent || "").trim();

      if (text.toLowerCase() === currentCorrectName.toLowerCase()) {
        button.className = buttonClass("correct");
      } else if (chosenName && text.toLowerCase() === chosenName.toLowerCase()) {
        button.className = buttonClass("wrong");
      } else {
        button.className = buttonClass("disabled");
      }
    });
  }

  function endGame() {
    stopTimer();

    endScreenEl.classList.remove("hidden");
    finalScoreEl.textContent = String(score);
    nextBtn.disabled = true;

    const buttons = choicesEl.querySelectorAll("button");

    buttons.forEach((button) => {
      button.disabled = true;
    });
  }

  function buildChoices(correctCountry) {
    const correctName = correctCountry.name;

    const wrongPool = getDifficultyPool()
      .map((country) => country.name)
      .filter((name) => name.toLowerCase() !== correctName.toLowerCase());

    const wrongs = new Set();

    while (wrongs.size < 3 && wrongPool.length > 3) {
      wrongs.add(pickRandom(wrongPool));
    }

    const options = shuffle([correctName, ...Array.from(wrongs)]);

    choicesEl.innerHTML = "";

    options.forEach((optionName) => {
      const button = document.createElement("button");

      button.type = "button";
      button.textContent = optionName;
      button.className = buttonClass("default");

      button.addEventListener("click", () => handleAnswer(optionName));

      choicesEl.appendChild(button);
    });
  }

  function pickNewCountry() {
    const pool = getDifficultyPool();
    const available = pool.filter(
      (country) => !usedNames.has(country.name.toLowerCase())
    );

    const chosen = available.length ? pickRandom(available) : pickRandom(pool);

    usedNames.add(chosen.name.toLowerCase());

    return chosen;
  }

  function showQuestion() {
    endScreenEl.classList.add("hidden");

    currentQuestion += 1;
    qIndexEl.textContent = String(currentQuestion);

    resetUIForQuestion();

    const chosen = pickNewCountry();

    currentCorrectCountry = chosen;
    currentCorrectName = chosen.name;

    scrambleWordEl.textContent = scrambleWord(
      chosen.cleanedName,
      difficultyEl.value
    );

    if (difficultyEl.value === "easy") {
      hintTextEl.textContent = `Hint: this country has ${chosen.cleanedName.length} letters. The capital letter is included.`;
    } else {
      hintTextEl.textContent = `Hint: this country has ${chosen.cleanedName.length} letters. No capital letter is shown.`;
    }

    buildChoices(chosen);
    resetTimer();

    nextBtn.textContent =
      currentQuestion === TOTAL_QUESTIONS ? "Finish →" : "Next →";
  }

  function handleAnswer(chosenName) {
    if (locked) return;

    locked = true;

    stopTimer();
    lockChoices();

    nextBtn.disabled = false;

    const isCorrect =
      chosenName.toLowerCase() === currentCorrectName.toLowerCase();

    if (isCorrect) {
      score += 1;
      scoreEl.textContent = String(score);
      feedbackEl.textContent = "Correct ✅";
      revealAnswer(null);
    } else {
      feedbackEl.textContent = `Incorrect ❌ It was ${currentCorrectName}.`;
      revealAnswer(chosenName);
    }
  }

  function handleTimeUp() {
    if (locked) return;

    locked = true;

    lockChoices();

    nextBtn.disabled = false;
    feedbackEl.textContent = `Time’s up ⏰ It was ${currentCorrectName}.`;

    revealAnswer(null);
  }

  function restartGame() {
    stopTimer();

    currentQuestion = 0;
    score = 0;
    currentCorrectName = "";
    currentCorrectCountry = null;
    locked = false;
    usedNames = new Set();

    scoreEl.textContent = "0";
    feedbackEl.textContent = "";
    nextBtn.disabled = true;
    nextBtn.textContent = "Next →";
    endScreenEl.classList.add("hidden");

    showQuestion();
  }

  async function init() {
    try {
      choicesEl.innerHTML = `
        <div class="text-slate-500 text-sm">
          Loading countries...
        </div>
      `;

      countries = await fetchCountries();

      if (!countries.length) {
        choicesEl.innerHTML = `
          <div class="bg-red-50 text-red-700 p-4 rounded-xl text-sm">
            Sorry, we couldn't load countries right now.
          </div>
        `;
        return;
      }

      restartGame();
    } catch (error) {
      console.error(error);

      choicesEl.innerHTML = `
        <div class="bg-red-50 text-red-700 p-4 rounded-xl text-sm">
          Sorry, we couldn't load countries right now.
        </div>
      `;
    }
  }

  nextBtn.addEventListener("click", () => {
    if (!locked) return;

    if (currentQuestion >= TOTAL_QUESTIONS) {
      endGame();
      return;
    }

    showQuestion();
  });

  restartBtn.addEventListener("click", restartGame);
  playAgainBtn.addEventListener("click", restartGame);
  difficultyEl.addEventListener("change", restartGame);

  init();
})();