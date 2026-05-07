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

  // Manual flag fallback URLs
  const FLAG_OVERRIDES = {
    Afghanistan: "https://flagcdn.com/w640/af.png"
  };

  // Read URL params:
  // countries.html?continent=Europe
  // countries.html?country=France
  const params = new URLSearchParams(window.location.search);
  const selectedContinent = params.get("continent");
  const selectedCountry = params.get("country");

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

  function applyFlagFallback(countryCard) {
    if (!countryCard) return countryCard;

    if (FLAG_OVERRIDES[countryCard.name]) {
      countryCard.flag = FLAG_OVERRIDES[countryCard.name];
    }

    if (!countryCard.flag) {
      countryCard.flag = "https://placehold.co/640x400?text=No+Flag";
    }

    return countryCard;
  }

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

    return entries
      .map(([code, info]) => {
        const name = info?.name || "—";
        const symbol = info?.symbol ? ` (${info.symbol})` : "";
        return `${code} — ${name}${symbol}`;
      })
      .join(", ");
  }

  function openDetail(countryCard) {
    countryCard = applyFlagFallback(countryCard);

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
            onerror="this.onerror=null; this.src='https://placehold.co/640x400?text=No+Flag';"
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

    overlayEl.classList.remove("hidden");
    overlayEl.classList.add("flex");

    requestAnimationFrame(() => {
      overlayEl.classList.add("is-open");
    });

    overlayCloseBtn?.focus();
  }

  function closeDetail() {
    overlayEl.classList.remove("is-open");

    window.setTimeout(() => {
      overlayEl.classList.add("hidden");
      overlayEl.classList.remove("flex");
    }, 250);
  }

  overlayCloseBtn?.addEventListener("click", closeDetail);

  overlayEl?.addEventListener("click", (e) => {
    if (e.target === overlayEl) {
      closeDetail();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (
      e.key === "Escape" &&
      overlayEl &&
      !overlayEl.classList.contains("hidden")
    ) {
      closeDetail();
    }
  });

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
      c = applyFlagFallback(c);

      const card = document.createElement("button");
      card.type = "button";
      card.className =
        "w-full text-left bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-50";

      card.innerHTML = `
        <img
          src="${c.flag}"
          alt="Flag of ${c.name}"
          class="w-full h-28 object-cover"
          onerror="this.onerror=null; this.src='https://placehold.co/640x400?text=No+Flag';"
        />

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

  async function init() {
    try {
      if (
        !fetchAllCountries ||
        !countryToCardData ||
        !mapRegion ||
        !EXCLUDED_COUNTRIES
      ) {
        throw new Error("GlobalVillageCountries helpers not found on window.");
      }

      let allCountries = await fetchAllCountries();

      allCountries = allCountries.filter((c) => {
        const name = c.name?.common || "";
        return !EXCLUDED_COUNTRIES.has(name);
      });

      let cardData = allCountries.map((country) => {
        const base = countryToCardData(country);

        base.region = mapRegion(country);
        base.apiRegion = country.region || "—";
        base.subregion = country.subregion || "—";
        base.population = country.population || 0;
        base.area = country.area || 0;
        base.languages = country.languages || {};
        base.currencies = country.currencies || {};
        base.timezones = country.timezones || [];

        return applyFlagFallback(base);
      });

      if (selectedContinent) {
        cardData = cardData.filter((c) => c.region === selectedContinent);
      }

      renderCountryGrid(cardData);

      if (selectedCountry) {
        const wanted = selectedCountry.trim().toLowerCase();

        let match = cardData.find(
          (c) => (c.name || "").trim().toLowerCase() === wanted
        );

        if (!match) {
          match = cardData.find((c) =>
            (c.name || "").trim().toLowerCase().includes(wanted)
          );
        }

        if (match) {
          openDetail(match);
        }
      }
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