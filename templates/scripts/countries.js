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

  function formatNumber(n) {
    if (n === null || n === undefined || Number.isNaN(Number(n))) return "—";
    return Number(n).toLocaleString();
  }

  function formatAreaKm2(area) {
    if (!area || Number.isNaN(Number(area))) return "—";
    return `${Number(area).toLocaleString()} km²`;
  }

  function formatLanguages(languagesObj) {
    if (!languagesObj || typeof languagesObj !== "object") return "—";
    const vals = Object.values(languagesObj).filter(Boolean);
    return vals.length ? vals.join(", ") : "—";
  }

  function formatCurrencies(currenciesObj) {
    if (!currenciesObj || typeof currenciesObj !== "object") return "—";
    const entries = Object.entries(currenciesObj);
    if (!entries.length) return "—";

    // "GBP — British pound (£), EUR — Euro (€)"
    return entries
      .map(([code, info]) => {
        const name = info?.name || "—";
        const symbol = info?.symbol ? ` (${info.symbol})` : "";
        return `${code} — ${name}${symbol}`;
      })
      .join(", ");
  }

  function formatTimezones(tzs) {
    if (!Array.isArray(tzs) || !tzs.length) return "—";
    return tzs.join(", ");
  }

  // Open the detail overlay for a single country
  function openDetail(countryCard) {
    overlayTitleEl.textContent = countryCard.name;

    const timezonesChips =
      Array.isArray(countryCard.timezones) && countryCard.timezones.length
        ? `<div class="gv-chipwrap">${countryCard.timezones
            .map((tz) => `<span class="gv-chip">${tz}</span>`)
            .join("")}</div>`
        : "—";

    overlayBodyEl.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-3">
          <img
            src="${countryCard.flag}"
            alt="Flag of ${countryCard.name}"
            class="gv-flag w-full h-44 object-contain rounded-2xl"
          />

          <div class="text-sm text-slate-600 leading-relaxed">
            <span class="font-semibold text-slate-800">Region / Subregion:</span>
            ${countryCard.apiRegion || "—"} / ${countryCard.subregion || "—"}
          </div>
        </div>

        <div class="gv-dl">
          <div class="gv-row">
            <div class="gv-label">Capital</div>
            <div class="gv-value">${countryCard.capital || "—"}</div>
          </div>

          <div class="gv-row">
            <div class="gv-label">Population</div>
            <div class="gv-value">${formatNumber(countryCard.population)}</div>
          </div>

          <div class="gv-row">
            <div class="gv-label">Area</div>
            <div class="gv-value">${formatAreaKm2(countryCard.area)}</div>
          </div>

          <div class="gv-row">
            <div class="gv-label">Languages</div>
            <div class="gv-value">${formatLanguages(countryCard.languages)}</div>
          </div>

          <div class="gv-row">
            <div class="gv-label">Currencies</div>
            <div class="gv-value">${formatCurrencies(countryCard.currencies)}</div>
          </div>

          <div class="gv-row">
            <div class="gv-label">Timezones</div>
            <div class="gv-value">${timezonesChips}</div>
          </div>
        </div>
      </div>
    `;

    // Show overlay, then animate in
    overlayEl.classList.remove("hidden");
    overlayEl.classList.add("flex");

    requestAnimationFrame(() => {
      overlayEl.classList.add("is-open");
    });

    overlayCloseBtn?.focus();
  }

  function closeDetail() {
    overlayEl.classList.remove("is-open");

    // After transition, hide completely
    window.setTimeout(() => {
      overlayEl.classList.add("hidden");
      overlayEl.classList.remove("flex");
    }, 250);
  }

  // Close button
  overlayCloseBtn?.addEventListener("click", closeDetail);

  // Click outside modal closes
  overlayEl?.addEventListener("click", (e) => {
    if (e.target === overlayEl) closeDetail();
  });

  // ESC closes
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlayEl && !overlayEl.classList.contains("hidden")) {
      closeDetail();
    }
  });

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
      // Load all countries from API
      let allCountries = await fetchAllCountries();

      // Filter out excluded countries (removes Israel)
      allCountries = allCountries.filter((c) => {
        const name = c.name?.common || "";
        return !EXCLUDED_COUNTRIES.has(name);
      });

      // Turn into card data
      let cardData = allCountries.map((country) => {
        const base = countryToCardData(country);
        base.region = mapRegion(country); // ensure mapped region is consistent
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
