// scripts/countries.js

(async function () {
  const {
    EXCLUDED_COUNTRIES,
    mapRegion,
    countryToCardData,
    fetchAllCountries
  } = window.GlobalVillageCountries || {};

  const breadcrumbEl = document.getElementById("breadcrumb");
  const titleEl = document.getElementById("continentTitle");
  const gridEl = document.getElementById("countryGrid");
  const overlayEl = document.getElementById("detailOverlay");
  const overlayTitleEl = document.getElementById("detailTitle");
  const overlayBodyEl = document.getElementById("detailBody");
  const overlayCloseBtn = document.getElementById("detailClose");

  let culturalData = {};

  // Read ?continent= from URL, e.g. countries.html?continent=Europe
  const params = new URLSearchParams(window.location.search);
  const selectedContinent = params.get("continent"); // can be null

  // Set page title + breadcrumb
  function setHeaderAndBreadcrumb() {
    if (selectedContinent) {
      titleEl.textContent = selectedContinent;
      breadcrumbEl.textContent = `Home • ${selectedContinent}`;
    } else {
      titleEl.textContent = "All Countries";
      breadcrumbEl.textContent = "Home • All Countries";
    }
  }

  setHeaderAndBreadcrumb();

  // Helper: format population nicely
  function formatPopulation(pop) {
    if (!pop) return "Unknown";
    if (pop >= 1_000_000_000) return (pop / 1_000_000_000).toFixed(1) + "B";
    if (pop >= 1_000_000) return (pop / 1_000_000).toFixed(1) + "M";
    if (pop >= 1_000) return (pop / 1_000).toFixed(1) + "K";
    return String(pop);
  }

  // Open the detail overlay for a single country
  function openDetail(countryCard) {
    const enrich = culturalData[countryCard.name] || null;

    overlayTitleEl.textContent = countryCard.name;

    // Build the detail body (basic info + cultural info if we have it)
    const leftCol = `
      <div class="space-y-3">
        <img src="${countryCard.flag}" 
             alt="Flag of ${countryCard.name}" 
             class="w-full max-h-40 object-cover rounded-xl border border-slate-200 mb-3" />
        <p><span class="font-semibold text-slate-700">Region:</span> ${countryCard.region}</p>
        <p><span class="font-semibold text-slate-700">Capital:</span> ${countryCard.capital}</p>
        <p><span class="font-semibold text-slate-700">Population:</span> ${formatPopulation(countryCard.population)}</p>
      </div>
    `;

    let rightCol = `
      <div class="space-y-3 text-sm text-slate-700">
        <p>This country is part of the Global Village dataset. Cultural details may be limited for now.</p>
      </div>
    `;

    if (enrich) {
      const foods = enrich.foods?.join(", ") || "—";
      const holidays = enrich.holidays?.join(", ") || "—";
      const music = enrich.music?.join(", ") || "—";
      const clothes = enrich.clothes?.join(", ") || "—";
      const traditions = enrich.traditions?.join(", ") || "—";

      rightCol = `
        <div class="space-y-4 text-sm text-slate-700">
          <div>
            <h4 class="font-semibold text-indigo-600 mb-1">Famous Foods</h4>
            <p>${foods}</p>
          </div>
          <div>
            <h4 class="font-semibold text-indigo-600 mb-1">Key Holidays</h4>
            <p>${holidays}</p>
          </div>
          <div>
            <h4 class="font-semibold text-indigo-600 mb-1">Music & Sound</h4>
            <p>${music}</p>
          </div>
          <div>
            <h4 class="font-semibold text-indigo-600 mb-1">Traditional Clothing</h4>
            <p>${clothes}</p>
          </div>
          <div>
            <h4 class="font-semibold text-indigo-600 mb-1">Traditions</h4>
            <p>${traditions}</p>
          </div>
        </div>
      `;
    }

    overlayBodyEl.innerHTML = leftCol + rightCol;
    overlayEl.classList.remove("hidden");
    overlayEl.classList.add("flex");
  }

  function closeDetail() {
    overlayEl.classList.add("hidden");
    overlayEl.classList.remove("flex");
  }

  if (overlayCloseBtn) {
    overlayCloseBtn.addEventListener("click", closeDetail);
  }
  if (overlayEl) {
    overlayEl.addEventListener("click", (e) => {
      if (e.target === overlayEl) closeDetail();
    });
  }

  // Render all the cards into #countryGrid
  function renderCountryGrid(countries) {
    gridEl.innerHTML = "";

    if (!countries.length) {
      const div = document.createElement("div");
      div.className = "col-span-full text-center text-slate-500 py-10";
      div.textContent = "No countries available for this region.";
      gridEl.appendChild(div);
      return;
    }

    countries.forEach((c) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className =
        "w-full text-left bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-50";

      card.innerHTML = `
        <img src="${c.flag}"
             alt="Flag of ${c.name}"
             class="w-full h-28 object-cover" />
        <div class="p-3">
          <h3 class="font-semibold text-slate-800 text-sm truncate">${c.name}</h3>
          <p class="text-xs text-slate-500">${c.region}</p>
          <p class="text-xs text-slate-500 mt-1">Capital: ${c.capital}</p>
        </div>
      `;

      card.addEventListener("click", () => openDetail(c));
      gridEl.appendChild(card);
    });
  }

  // Main load function
  async function init() {
    try {
      // Load cultural enrichment JSON (Japan, France, India, Palestine, etc.)
      try {
        const culturalResp = await fetch("culturalData.json");
        if (culturalResp.ok) {
          culturalData = await culturalResp.json();
        } else {
          culturalData = {};
        }
      } catch {
        culturalData = {};
      }

      // Load all countries from API
      let allCountries = await fetchAllCountries();

      // Filter out excluded countries (💡 this removes Israel)
      allCountries = allCountries.filter((c) => {
        const name = c.name?.common || "";
        return !EXCLUDED_COUNTRIES.has(name);
      });

      // Turn into our card data
      let cardData = allCountries.map((country) => {
        const base = countryToCardData(country);
        // Attach mapped region (just to be safe)
        base.region = mapRegion(country);
        base.population = country.population || 0;
        return base;
      });

      // Filter by continent if one is selected
      if (selectedContinent) {
        cardData = cardData.filter((c) => c.region === selectedContinent);
      }

      renderCountryGrid(cardData);
    } catch (err) {
      console.error(err);
      gridEl.innerHTML = "";
      const errorDiv = document.createElement("div");
      errorDiv.className =
        "col-span-full bg-red-50 text-red-700 p-4 rounded-lg text-sm";
      errorDiv.textContent =
        "Sorry, we could not load countries right now. Please try again later.";
      gridEl.appendChild(errorDiv);
    }
  }

  await init();
})();
