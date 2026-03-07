document.addEventListener("DOMContentLoaded", () => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Scroll Progress ---------------- */
  const bar = document.getElementById("scrollProgressBar");

  function updateScrollProgress() {
    if (!bar) return;

    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || 0;
    const scrollHeight = (doc.scrollHeight || 0) - (doc.clientHeight || 0);

    const percent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    bar.style.width = Math.min(100, Math.max(0, percent)) + "%";
  }

  updateScrollProgress();
  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress);

  /* ---------------- Scroll Reveal ---------------- */
  const revealElements = document.querySelectorAll(".reveal");

  function showElement(el) {
    el.classList.add("is-visible");
  }

  if (prefersReduced) {
    revealElements.forEach(showElement);
  } else if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          showElement(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((el) => observer.observe(el));
  } else {
    revealElements.forEach(showElement);
  }

  /* ---------------- Animated Counters ---------------- */
  const counters = document.querySelectorAll(".stat-number[data-count]");

  function animateCounter(el) {
    if (el.dataset.done === "1") return;
    el.dataset.done = "1";

    const target = parseInt(el.dataset.count, 10) || 0;

    if (prefersReduced) {
      el.textContent = target.toLocaleString();
      return;
    }

    const duration = 1200;
    const start = performance.now();

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(target * easeOut(progress));
      el.textContent = value.toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }

  /* ---------------- Confetti ---------------- */
  const confettiCanvas = document.getElementById("confettiCanvas");
  const confettiCtx = confettiCanvas?.getContext("2d");

  function sizeConfettiCanvas() {
    if (!confettiCanvas) return;
    const parent = confettiCanvas.parentElement;
    if (!parent) return;
    const r = parent.getBoundingClientRect();
    confettiCanvas.width = Math.max(1, Math.floor(r.width));
    confettiCanvas.height = Math.max(1, Math.floor(r.height));
  }

  window.addEventListener("resize", sizeConfettiCanvas);

  function confettiPop() {
    if (prefersReduced) return;
    if (!confettiCanvas || !confettiCtx) return;

    sizeConfettiCanvas();

    const w = confettiCanvas.width;
    const h = confettiCanvas.height;

    const pieces = [];
    const count = 80;

    for (let i = 0; i < count; i++) {
      pieces.push({
        x: w / 2 + (Math.random() - 0.5) * 60,
        y: h / 3 + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * -5 - 2,
        g: 0.18 + Math.random() * 0.08,
        s: 3 + Math.random() * 4,
        a: 1,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.2,
        hue: Math.floor(Math.random() * 360)
      });
    }

    const start = performance.now();
    const duration = 850;

    function frame(now) {
      const t = now - start;
      confettiCtx.clearRect(0, 0, w, h);

      pieces.forEach((p) => {
        p.vy += p.g;
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;

        if (t > duration * 0.6) {
          p.a = Math.max(0, 1 - (t - duration * 0.6) / (duration * 0.4));
        }

        confettiCtx.save();
        confettiCtx.globalAlpha = p.a;
        confettiCtx.fillStyle = `hsl(${p.hue}, 80%, 65%)`;
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate(p.r);
        confettiCtx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s);
        confettiCtx.restore();
      });

      if (t < duration) requestAnimationFrame(frame);
      else confettiCtx.clearRect(0, 0, w, h);
    }

    requestAnimationFrame(frame);
  }

  /* ---------------- Fun Fact (REST Countries) + Favourites + Explore Link ---------------- */
  const factText = document.getElementById("funFactText");
  const factBtn = document.getElementById("newFactBtn");
  const favBtn = document.getElementById("favFactBtn");
  const exploreBtn = document.getElementById("exploreCountryBtn");
  const favsList = document.getElementById("favsList");
  const clearFavsBtn = document.getElementById("clearFavsBtn");

  const STORAGE_KEY = "gv_favourite_facts";

  let countriesCache = null;
  let currentFact = null; // { text, countryName }
  let lastFactText = "";

  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  async function loadCountriesOnce() {
    if (countriesCache) return countriesCache;

    const url = "https://restcountries.com/v3.1/all?fields=name,capital,region,population";
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Countries API failed");
    countriesCache = await resp.json();
    return countriesCache;
  }

  function formatPop(n) {
    try { return Number(n).toLocaleString(); } catch { return String(n); }
  }

  function buildCountryFact(country) {
    const name = country?.name?.common || "This country";
    const region = country?.region || "somewhere in the world";
    const capital = Array.isArray(country?.capital) && country.capital.length ? country.capital[0] : null;
    const population = typeof country?.population === "number" ? formatPop(country.population) : null;

    const templates = [
      capital ? `${name} is in ${region}, and its capital city is ${capital}.` : `${name} is in ${region}.`,
      population ? `${name} has a population of about ${population} people.` : `${name} is home to many different communities.`,
      capital && population ? `${name}'s capital is ${capital}, and millions of people live there.` : `${name} has unique cities and places to explore.`,
    ];

    let text = pick(templates);
    if (text === lastFactText && templates.length > 1) {
      text = pick(templates.filter(t => t !== lastFactText));
    }
    lastFactText = text;

    return { text, countryName: name };
  }

  function setExploreLink(countryName) {
    if (!exploreBtn) return;

    if (!countryName) {
      exploreBtn.classList.add("hidden");
      exploreBtn.href = "countries.html";
      return;
    }

    exploreBtn.classList.remove("hidden");
    exploreBtn.href = `countries.html?country=${encodeURIComponent(countryName)}`;
  }

  function fadeSetText(el, text) {
    if (!el) return;
    if (prefersReduced) {
      el.textContent = text;
      el.style.opacity = 1;
      return;
    }
    el.style.opacity = 0;
    setTimeout(() => {
      el.textContent = text;
      el.style.opacity = 1;
    }, 160);
  }

  function loadFavs() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function saveFavs(arr) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  }

  function isCurrentFavourited() {
    if (!currentFact?.text) return false;
    return loadFavs().some(f => f.text === currentFact.text);
  }

  function updateFavButton() {
    if (!favBtn) return;
    favBtn.textContent = isCurrentFavourited() ? "❤️ Favourited" : "❤️ Favourite";
  }

  function renderFavs() {
    if (!favsList) return;

    const favs = loadFavs();
    if (!favs.length) {
      favsList.innerHTML = `<p class="text-sm text-slate-500">No favourites yet — tap ❤️ to save one.</p>`;
      return;
    }

    const shown = favs.slice().reverse().slice(0, 8);

    favsList.innerHTML = shown.map((f) => {
      const safeText = String(f.text).replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const country = f.countryName || "";
      const exploreHref = country ? `countries.html?country=${encodeURIComponent(country)}` : "countries.html";

      return `
        <div class="flex items-start justify-between gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
          <div class="min-w-0">
            <p class="text-sm text-slate-700">${safeText}</p>
            <div class="mt-2">
              <a href="${exploreHref}" class="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition">
                Explore →
              </a>
            </div>
          </div>
          <button class="text-xs text-slate-500 hover:text-slate-700 transition shrink-0"
                  data-remove-fav="${String(f.text).replace(/"/g, "&quot;")}">
            Remove
          </button>
        </div>
      `;
    }).join("");

    favsList.querySelectorAll("[data-remove-fav]").forEach(btn => {
      btn.addEventListener("click", () => {
        const text = btn.getAttribute("data-remove-fav");
        const all = loadFavs();
        const next = all.filter(x => x.text !== text);
        saveFavs(next);
        renderFavs();
        updateFavButton();
      });
    });
  }

  async function showNewFunFact() {
    if (!factText) return;

    try {
      const countries = await loadCountriesOnce();
      const built = buildCountryFact(pick(countries));

      currentFact = built;
      setExploreLink(built.countryName);

      fadeSetText(factText, built.text);
      updateFavButton();
      renderFavs();
      confettiPop();
    } catch {
      currentFact = { text: "The world is full of amazing cultures — pick a continent and start exploring!", countryName: null };
      setExploreLink(null);
      fadeSetText(factText, currentFact.text);
      updateFavButton();
      renderFavs();
    }
  }

  if (factBtn) factBtn.addEventListener("click", showNewFunFact);

  if (favBtn) {
    favBtn.addEventListener("click", () => {
      if (!currentFact?.text) return;

      const favs = loadFavs();
      const exists = favs.some(f => f.text === currentFact.text);

      if (exists) {
        saveFavs(favs.filter(f => f.text !== currentFact.text));
      } else {
        favs.push({
          text: currentFact.text,
          countryName: currentFact.countryName || null,
          savedAt: Date.now()
        });
        saveFavs(favs);
      }

      updateFavButton();
      renderFavs();
    });
  }

  if (clearFavsBtn) {
    clearFavsBtn.addEventListener("click", () => {
      saveFavs([]);
      renderFavs();
      updateFavButton();
    });
  }

  if (factText) showNewFunFact();
});
