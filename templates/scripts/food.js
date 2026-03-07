// scripts/food.js
(function () {
  const CULTURAL_URL = "culturalData.json";
  const RESTCOUNTRIES_URL =
    "https://restcountries.com/v3.1/all?fields=name,region,subregion,flags";

  // Wikipedia image fetch (no API key)
  const WIKI_SUMMARY_BASE = "https://en.wikipedia.org/api/rest_v1/page/summary/";

  // TheMealDB (auto foods + images)
  const MEALDB_RANDOM = "https://www.themealdb.com/api/json/v1/1/random.php";

  const PLACEHOLDER_IMG = "https://placehold.co/1200x900/eee/555?text=Food+Image";
  const FLAG_PLACEHOLDER = "https://placehold.co/240x160?text=Flag";

  const IMG_CACHE_KEY = "gv_food_img_cache_v3";
  const FAVS_KEY = "gv_food_favs_v3";

  // ⭐ Show 5 foods at a time
  const PAGE_SIZE = 4;

  // ⭐ How many extra API foods to pull each load (increase if you want more variety)
  const EXTRA_MEALS = 60; // pulls ~60 random meals into the pool

  // Safety caps
  const MEALDB_BATCH = 10;
  const MAX_ROUNDS = 12;

  // Area -> Country mapping (best effort)
  const AREA_TO_COUNTRY = {
    American: "United States",
    British: "United Kingdom",
    Canadian: "Canada",
    Chinese: "China",
    Croatian: "Croatia",
    Dutch: "Netherlands",
    Egyptian: "Egypt",
    Filipino: "Philippines",
    French: "France",
    Greek: "Greece",
    Indian: "India",
    Irish: "Ireland",
    Italian: "Italy",
    Jamaican: "Jamaica",
    Japanese: "Japan",
    Kenyan: "Kenya",
    Malaysian: "Malaysia",
    Mexican: "Mexico",
    Moroccan: "Morocco",
    Polish: "Poland",
    Portuguese: "Portugal",
    Russian: "Russia",
    Spanish: "Spain",
    Thai: "Thailand",
    Tunisian: "Tunisia",
    Turkish: "Turkey",
    Vietnamese: "Vietnam",
  };

  // ---------- Helpers ----------
  function normalise(s) {
    return (s || "").toString().trim();
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function keyFor(country, food) {
    return `${normalise(country)}::${normalise(food)}`.toLowerCase();
  }

  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function mapContinentFromCountryApi(c) {
    const region = c.region || "";
    const sub = c.subregion || "";
    if (region === "Americas") {
      if (String(sub).includes("South")) return "South America";
      return "North America";
    }
    if (region === "Antarctic") return "Oceania";
    return region || "Unknown";
  }

  function uniqByKey(items, makeKey) {
    const seen = new Set();
    const out = [];
    for (const it of items) {
      const k = makeKey(it);
      if (!k || seen.has(k)) continue;
      seen.add(k);
      out.push(it);
    }
    return out;
  }

  // ---------- LocalStorage ----------
  function loadFavs() {
    try {
      const raw = localStorage.getItem(FAVS_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set();
    }
  }

  function saveFavs(set) {
    try {
      localStorage.setItem(FAVS_KEY, JSON.stringify(Array.from(set)));
    } catch {}
  }

  function loadImgCache() {
    try {
      const raw = localStorage.getItem(IMG_CACHE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function saveImgCache(cache) {
    try {
      localStorage.setItem(IMG_CACHE_KEY, JSON.stringify(cache));
    } catch {}
  }

  const imgCache = loadImgCache();

  // ---------- Wikipedia image fetch ----------
  async function fetchWikiThumbnail(title) {
    const url = WIKI_SUMMARY_BASE + encodeURIComponent(title);
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.thumbnail?.source || data?.originalimage?.source || null;
  }

  async function getFoodImageUrl(foodName) {
    const foodKey = normalise(foodName).toLowerCase();
    if (!foodKey) return PLACEHOLDER_IMG;

    if (imgCache[foodKey]) return imgCache[foodKey];

    const tries = [
      normalise(foodName),
      `${normalise(foodName)} (food)`,
      `${normalise(foodName)} (dish)`,
    ];

    for (const t of tries) {
      try {
        const img = await fetchWikiThumbnail(t);
        if (img) {
          imgCache[foodKey] = img;
          saveImgCache(imgCache);
          return img;
        }
      } catch {}
    }

    imgCache[foodKey] = PLACEHOLDER_IMG;
    saveImgCache(imgCache);
    return PLACEHOLDER_IMG;
  }

  // ---------- TheMealDB fetch (auto foods + images) ----------
  async function fetchRandomMeal() {
    const res = await fetch(MEALDB_RANDOM);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.meals?.[0] || null;
  }

  async function fetchExtraMeals(targetCount) {
    const got = new Map(); // idMeal -> meal
    let rounds = 0;

    while (got.size < targetCount && rounds < MAX_ROUNDS) {
      rounds++;

      const batch = Array.from({ length: MEALDB_BATCH }, () =>
        fetchRandomMeal().catch(() => null)
      );
      const meals = await Promise.all(batch);

      for (const m of meals) {
        if (!m?.idMeal) continue;
        if (got.has(m.idMeal)) continue;
        got.set(m.idMeal, m);
        if (got.size >= targetCount) break;
      }
    }

    return Array.from(got.values());
  }

  // ---------- Confetti ----------
  function confettiPop() {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.inset = "0";
    container.style.pointerEvents = "none";
    container.style.zIndex = "9999";
    document.body.appendChild(container);

    const pieces = 70;
    for (let i = 0; i < pieces; i++) {
      const p = document.createElement("div");
      p.style.position = "absolute";
      p.style.left = `${50 + (Math.random() - 0.5) * 18}vw`;
      p.style.top = `${16 + (Math.random() - 0.5) * 6}vh`;
      p.style.width = `${6 + Math.random() * 10}px`;
      p.style.height = `${4 + Math.random() * 8}px`;
      p.style.borderRadius = "2px";
      p.style.background = `hsl(${Math.floor(Math.random() * 360)} 85% 60%)`;
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      p.style.opacity = "1";
      p.style.transition = "transform 900ms ease, opacity 900ms ease";
      container.appendChild(p);

      requestAnimationFrame(() => {
        const dx = (Math.random() - 0.5) * 260;
        const dy = 240 + Math.random() * 220;
        p.style.transform = `translate(${dx}px, ${dy}px) rotate(${720 + Math.random() * 720}deg)`;
        p.style.opacity = "0";
      });
    }

    setTimeout(() => container.remove(), 1000);
  }

  // ---------- Elements ----------
  const gridEl = document.getElementById("foodGrid");
  const emptyEl = document.getElementById("emptyState");

  const searchEl = document.getElementById("searchInput");
  const continentEl = document.getElementById("continentSelect");
  const sortEl = document.getElementById("sortSelect");
  const onlyFavsEl = document.getElementById("onlyFavs");

  const countBadgeEl = document.getElementById("countBadge");
  const favBadgeEl = document.getElementById("favBadge");

  const randomBtn = document.getElementById("randomBtn");
  const refreshBtn =
    document.getElementById("refreshBtn") || document.getElementById("shuffleBtn");
  const clearFavsBtn = document.getElementById("clearFavsBtn");

  // Modal
  const overlayEl = document.getElementById("detailOverlay");
  const closeBtn = document.getElementById("detailClose");

  const modalFlag = document.getElementById("modalFlag");
  const modalTitle = document.getElementById("modalTitle");
  const modalSubtitle = document.getElementById("modalSubtitle");
  const modalFoodImg = document.getElementById("modalFoodImg");
  const modalFoodName = document.getElementById("modalFoodName");
  const modalCountry = document.getElementById("modalCountry");
  const modalContinent = document.getElementById("modalContinent");
  const modalTips = document.getElementById("modalTips");
  const modalFavBtn = document.getElementById("modalFavBtn");
  const modalCopyBtn = document.getElementById("modalCopyBtn");
  const modalToast = document.getElementById("modalToast");

  // ---------- State ----------
  let allItems = [];      // all foods (cultural + API)
  let featuredItems = []; // 5 random foods shown by default
  let favs = loadFavs();
  let currentModalItem = null;

  let countryLookup = new Map(); // for flags/continents

  function updateBadges(filteredCount) {
    countBadgeEl.textContent = String(filteredCount);
    favBadgeEl.textContent = String(favs.size);
  }

  function closeModal() {
    overlayEl.classList.add("hidden");
    overlayEl.classList.remove("flex");
    currentModalItem = null;
    modalToast.textContent = "";
  }

  async function openModal(item) {
    currentModalItem = item;

    modalFlag.src = item.flagUrl || FLAG_PLACEHOLDER;
    modalFlag.alt = `Flag of ${item.country}`;

    modalTitle.textContent = item.food;
    modalSubtitle.textContent = item.country;

    modalFoodName.textContent = item.food;
    modalCountry.textContent = item.country;
    modalContinent.textContent = `Continent: ${item.continent}`;

    const tips = [
      `Search “${item.food} recipe” online for ingredients + steps.`,
      `Try finding a restaurant serving ${item.food} near you.`,
      `Tell a friend your favourite ${item.food} version.`,
    ];
    modalTips.innerHTML = tips.map((t) => `<li>${escapeHtml(t)}</li>`).join("");

    const k = keyFor(item.country, item.food);
    modalFavBtn.textContent = favs.has(k) ? "★ Favourited" : "☆ Favourite";

    overlayEl.classList.remove("hidden");
    overlayEl.classList.add("flex");

    // Image priority: item.imageUrl (MealDB) -> Wikipedia -> placeholder
    modalFoodImg.src = item.imageUrl || PLACEHOLDER_IMG;
    if (!item.imageUrl || item.imageUrl === PLACEHOLDER_IMG) {
      try {
        const img = await getFoodImageUrl(item.food);
        item.imageUrl = img;
        modalFoodImg.src = img;
      } catch {}
    }
  }

  function toggleFav(item) {
    const k = keyFor(item.country, item.food);
    if (favs.has(k)) favs.delete(k);
    else favs.add(k);

    saveFavs(favs);
    confettiPop();

    if (currentModalItem && keyFor(currentModalItem.country, currentModalItem.food) === k) {
      modalFavBtn.textContent = favs.has(k) ? "★ Favourited" : "☆ Favourite";
      modalToast.textContent = favs.has(k) ? "Saved 💖" : "Removed 💔";
      setTimeout(() => (modalToast.textContent = ""), 900);
    }

    render();
  }

  function buildCard(item) {
    const k = keyFor(item.country, item.food);
    const isFav = favs.has(k);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className =
      "w-full text-left bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-50";

    btn.innerHTML = `
      <div class="relative">
        <img data-food-img
          src="${escapeHtml(item.imageUrl || PLACEHOLDER_IMG)}"
          alt="${escapeHtml(item.food)} photo"
          class="w-full h-44 object-cover"
          onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}';"
        />
        <div class="absolute top-3 left-3 flex items-center gap-2">
          <img
            src="${escapeHtml(item.flagUrl || FLAG_PLACEHOLDER)}"
            alt="Flag of ${escapeHtml(item.country)}"
            class="w-10 h-7 object-cover rounded-md border border-white/70 shadow"
            onerror="this.onerror=null;this.src='${FLAG_PLACEHOLDER}';"
          />
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/80 backdrop-blur border border-white/60">
            ${escapeHtml(item.continent)}
          </span>
        </div>

        <div class="absolute top-3 right-3">
          <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${
            isFav ? "bg-rose-600 text-white" : "bg-white/80"
          } border border-white/60">
            ${isFav ? "★ Fav" : "☆"}
          </span>
        </div>
      </div>

      <div class="p-4">
        <h3 class="font-semibold text-slate-800 text-base truncate">${escapeHtml(item.food)}</h3>
        <p class="text-sm text-slate-500 truncate">${escapeHtml(item.country)}</p>

        <div class="mt-3 flex items-center justify-between gap-2">
          <span class="text-xs text-slate-500">
            Source: <span class="font-semibold text-slate-700">${escapeHtml(item.source || "Cultural")}</span>
          </span>

          <div class="flex items-center gap-2">
            <button type="button"
              class="favBtn px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition text-sm font-medium"
              aria-label="Toggle favourite"
            >${isFav ? "★" : "☆"}</button>

            <span class="text-indigo-600 text-sm font-medium">Details →</span>
          </div>
        </div>
      </div>
    `;

    // If no image, try Wikipedia in background
    const imgEl = btn.querySelector("[data-food-img]");
    if (!item.imageUrl) {
      (async () => {
        try {
          const img = await getFoodImageUrl(item.food);
          item.imageUrl = img;
          imgEl.src = img;
        } catch {
          imgEl.src = PLACEHOLDER_IMG;
        }
      })();
    }

    btn.addEventListener("click", (e) => {
      const favBtn = e.target?.closest?.(".favBtn");
      if (favBtn) return;
      openModal(item);
    });

    btn.querySelector(".favBtn").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFav(item);
    });

    return btn;
  }

  function regenerateFeatured() {
    featuredItems = shuffleArray(allItems).slice(0, PAGE_SIZE);
  }

  function getBaseList() {
    const q = normalise(searchEl.value);
    const cont = normalise(continentEl.value);
    const favOnly = !!onlyFavsEl.checked;
    const hasFilters = !!q || !!cont || favOnly;

    // When filters are active, search across the entire pool
    return hasFilters ? allItems : featuredItems;
  }

  function getFiltered() {
    const q = normalise(searchEl.value).toLowerCase();
    const continent = normalise(continentEl.value);
    const onlyFavs = !!onlyFavsEl.checked;

    let items = getBaseList().slice();

    if (continent) items = items.filter((x) => x.continent === continent);

    if (q) {
      items = items.filter((x) =>
        x.food.toLowerCase().includes(q) ||
        x.country.toLowerCase().includes(q) ||
        x.continent.toLowerCase().includes(q)
      );
    }

    if (onlyFavs) items = items.filter((x) => favs.has(keyFor(x.country, x.food)));

    const sortMode = sortEl.value;
    if (sortMode === "az") items.sort((a, b) => a.food.localeCompare(b.food));
    else if (sortMode === "za") items.sort((a, b) => b.food.localeCompare(a.food));
    else items.sort((a, b) => a.country.localeCompare(b.country) || a.food.localeCompare(b.food));

    return items;
  }

  function render() {
    const items = getFiltered();
    gridEl.innerHTML = "";
    emptyEl.classList.toggle("hidden", items.length > 0);
    updateBadges(items.length);
    items.forEach((item) => gridEl.appendChild(buildCard(item)));
  }

  async function loadCountryLookup() {
    const res = await fetch(RESTCOUNTRIES_URL);
    if (!res.ok) throw new Error("Failed to load REST Countries API");
    const countries = await res.json();

    const map = new Map();
    countries.forEach((c) => {
      const name = c?.name?.common;
      if (!name) return;
      map.set(name.toLowerCase(), {
        name,
        continent: mapContinentFromCountryApi(c),
        flagUrl: c?.flags?.png || c?.flags?.svg || FLAG_PLACEHOLDER,
      });
    });
    countryLookup = map;
  }

  function metaForCountry(countryName) {
    return (
      countryLookup.get(countryName.toLowerCase()) || {
        name: countryName,
        continent: "Unknown",
        flagUrl: FLAG_PLACEHOLDER,
      }
    );
  }

  async function loadData() {
    gridEl.innerHTML = `
      <div class="col-span-full rounded-2xl bg-white border border-slate-200 p-6 text-slate-600">
        Loading foods… 🍽️
      </div>
    `;

    // Load cultural data + countries meta
    const [culturalResp, countriesOk] = await Promise.all([
      fetch(CULTURAL_URL),
      loadCountryLookup().then(() => true).catch(() => false),
    ]);

    if (!culturalResp.ok) throw new Error("Failed to load culturalData.json");
    const culturalData = await culturalResp.json();

    // Build cultural items
    const culturalItems = [];
    Object.keys(culturalData).forEach((countryName) => {
      const entry = culturalData[countryName] || {};
      const foods = Array.isArray(entry.foods) ? entry.foods : [];
      const count = foods.length;

      const meta = metaForCountry(countryName);

      foods.forEach((food) => {
        const foodName = normalise(food);
        if (!foodName || foodName.toLowerCase() === "traditional local cuisine") return;

        culturalItems.push({
          country: meta.name,
          continent: meta.continent,
          food: foodName,
          flagUrl: meta.flagUrl,
          imageUrl: null, // will come from Wikipedia
          countFoodsInCountry: count || 0,
          source: "Cultural",
        });
      });
    });

    // Fetch extra meals (with images) + map their "Area" to a country (best effort)
    let apiItems = [];
    try {
      const meals = await fetchExtraMeals(EXTRA_MEALS);

      apiItems = meals.map((m) => {
        const area = normalise(m.strArea || "Unknown");
        const countryName = AREA_TO_COUNTRY[area] || area || "Unknown";

        const meta = metaForCountry(countryName);

        return {
          country: meta.name,
          continent: meta.continent,
          food: normalise(m.strMeal || "Unknown dish"),
          flagUrl: meta.flagUrl,
          imageUrl: m.strMealThumb || null, //  real image from TheMealDB
          countFoodsInCountry: 0,
          source: "TheMealDB",
        };
      });
    } catch {
      apiItems = [];
    }

    // Merge + dedupe by (country + food)
    allItems = uniqByKey(
      [...culturalItems, ...apiItems],
      (x) => keyFor(x.country, x.food)
    );

    regenerateFeatured();
    render();
  }

  function wireEvents() {
    const rerender = () => render();

    searchEl.addEventListener("input", rerender);
    continentEl.addEventListener("change", rerender);
    sortEl.addEventListener("change", rerender);
    onlyFavsEl.addEventListener("change", rerender);

    randomBtn.addEventListener("click", () => {
      const items = getFiltered();
      if (!items.length) return;
      openModal(pickRandom(items));
    });

    // Refresh button gets a new set of 5
    if (refreshBtn) {
      refreshBtn.addEventListener("click", () => {
        regenerateFeatured();
        render();
      });
    }

    clearFavsBtn.addEventListener("click", () => {
      favs = new Set();
      saveFavs(favs);
      render();
    });

    closeBtn.addEventListener("click", closeModal);
    overlayEl.addEventListener("click", (e) => {
      if (e.target === overlayEl) closeModal();
    });

    modalFoodImg.addEventListener("error", () => (modalFoodImg.src = PLACEHOLDER_IMG));
    modalFlag.addEventListener("error", () => (modalFlag.src = FLAG_PLACEHOLDER));

    modalFavBtn.addEventListener("click", () => {
      if (!currentModalItem) return;
      toggleFav(currentModalItem);
    });

    modalCopyBtn.addEventListener("click", async () => {
      if (!currentModalItem) return;
      try {
        await navigator.clipboard.writeText(currentModalItem.food);
        modalToast.textContent = "Copied ✅";
        setTimeout(() => (modalToast.textContent = ""), 900);
      } catch {
        modalToast.textContent = "Couldn’t copy 😭";
        setTimeout(() => (modalToast.textContent = ""), 900);
      }
    });
  }

  async function init() {
    try {
      wireEvents();
      await loadData();
    } catch (e) {
      console.error(e);
      gridEl.innerHTML = `
        <div class="col-span-full bg-red-50 text-red-700 p-4 rounded-2xl text-sm border border-red-200">
          Sorry bestie — I couldn’t load the food data right now.
        </div>
      `;
    }
  }

  init();
})();
