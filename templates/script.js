// API-driven culture data loader for all countries
// Uses REST Countries API: https://restcountries.com/v3.1/all

// Lightweight list of Arab League members to tag "Arab" region
new Set([
  "Algeria","Bahrain","Comoros","Djibouti","Egypt","Iraq","Jordan","Kuwait",
  "Lebanon","Libya","Mauritania","Morocco","Oman","Palestine","Qatar",
  "Saudi Arabia","Somalia","Sudan","Syria","Tunisia","United Arab Emirates","Yemen"
]);
// Countries to hide from display (non-political content policy)
const EXCLUDED_COUNTRIES = new Set(["Israel"]);


function mapRegion(country) {
  const region = country.region || "";
  const subregion = country.subregion || "";




  // Map Americas into North/South using subregion
  if (region === "Americas") {
    if (subregion.includes("South")) return "South America";
    if (subregion.includes("North") || subregion.includes("Caribbean") || subregion.includes("Central")) return "North America";
    return "North America";
  }


  if (region === "Antarctic") return "Oceania"; // fold into Oceania for now
  return region || "Unknown";
}

// building a culture object from a REST Countries item
function countryToCulture(country, id) {
  const image = (country.flags && (country.flags.png || country.flags.svg)) || "https://placehold.co/640x360";

  // Default placeholders
  return {
    id,
    name: country.name?.common || "Unknown",
    region: mapRegion(country),
    image,
    foods: ["Traditional cuisine"],
    holidays: ["National Day"],
    music: ["Folk music"],
    clothes: ["Traditional dress"],
    traditions: ["Cultural festivals"]
  };
}

// Fetch country data from REST Countries API
async function fetchAllCountries() {
  const url = "https://restcountries.com/v3.1/all?fields=name,region,subregion,flags,independent";
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch countries: ${resp.status}`);
  const data = await resp.json();
  data.sort((a, b) => (a.name?.common || "").localeCompare(b.name?.common || ""));
  return data;
}

// Load and render cultures
async function loadCultures(filter = {}) {
  const grid = document.getElementById('culture-grid');
  grid.innerHTML = '';

  try {
    // Fetch both countries and cultural enrichment data
    const [countries, culturalData] = await Promise.all([
      fetchAllCountries(),
      fetch('culturalData.json').then(r => r.json())
    ]);

    // Filter out excluded countries
    const visibleCountries = countries.filter(c => {
      const name = c.name?.common || "";
      return !EXCLUDED_COUNTRIES.has(name);
    });

    // Build enriched culture objects
    let cultures = visibleCountries.map((c, idx) => {
      const base = countryToCulture(c, idx + 1);
      const enrich = culturalData[base.name] || {};
      return { ...base, ...enrich };
    });

    // Apply region filter if provided
    if (filter.region) {
      cultures = cultures.filter(c => c.region === filter.region);
    }

    // Render cards
    cultures.forEach(culture => {
      const card = document.createElement('custom-culture-card');
      card.setAttribute('data-culture', JSON.stringify(culture));
      grid.appendChild(card);
    });

    // Refresh feather icons
    if (window.feather && typeof window.feather.replace === 'function') {
      window.feather.replace();
    }
  } catch (err) {
    console.error(err);
    const errorDiv = document.createElement('div');
    errorDiv.className = "bg-red-50 text-red-700 p-4 rounded-lg";
    errorDiv.textContent = "Sorry, we couldn't load countries or cultural data right now.";
    grid.appendChild(errorDiv);
  }
}

// Listen for sidebar filter changes
document.addEventListener('filterChange', (e) => {
  loadCultures(e.detail);
});
