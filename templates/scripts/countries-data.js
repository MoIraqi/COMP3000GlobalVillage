// scripts/countries-data.js
// Helper utilities for loading all countries (except Israel)

// Countries to exclude
const EXCLUDED_COUNTRIES = new Set(["Israel"]);

// Map REST Countries regions/subregions into your standard continent names
function mapRegion(country) {
  const region = country.region || "";
  const subregion = country.subregion || "";

  // --- Americas split ---
  if (region === "Americas") {
    if ((subregion || "").includes("South")) return "South America";
    return "North America"; // includes North, Central, Caribbean
  }

  // Antarctic → group under Oceania to avoid empty categories
  if (region === "Antarctic") return "Oceania";

  // Use direct regions for: Asia, Europe, Africa, Oceania
  return region || "Unknown";
}

// Format data for cards + detail overlay
function countryToCardData(country) {
  const name = country.name?.common || "Unknown";

  // For filtering in your app (continent-style)
  const region = mapRegion(country);

  // For display (actual API region/subregion)
  const apiRegion = country.region || "—";
  const subregion = country.subregion || "—";

  const capital = Array.isArray(country.capital)
    ? country.capital[0]
    : (country.capital || "—");

  const population = country.population || 0;
  const area = country.area || 0;

  const languages = country.languages || {};     // { eng: "English", ... }
  const currencies = country.currencies || {};   // { GBP: { name, symbol }, ... }
  const timezones = Array.isArray(country.timezones) ? country.timezones : [];

  const flag =
    (country.flags && (country.flags.png || country.flags.svg)) ||
    "https://placehold.co/320x200";

  return {
    name,
    region,      // mapped continent label (used by your filter)
    apiRegion,   // real region from API (shown in detail)
    subregion,
    capital,
    population,
    area,
    languages,
    currencies,
    timezones,
    flag
  };
}

// Fetch all countries from REST Countries API
async function fetchAllCountries() {
  const url =
    "https://restcountries.com/v3.1/all?fields=name,region,subregion,flags,capital,population,area,languages,currencies,timezones";

  const resp = await fetch(url);
  if (!resp.ok) throw new Error("Failed to fetch countries");

  const data = await resp.json();

  // Sort alphabetically
  data.sort((a, b) => {
    const an = a.name?.common || "";
    const bn = b.name?.common || "";
    return an.localeCompare(bn);
  });

  return data;
}

window.GlobalVillageCountries = {
  EXCLUDED_COUNTRIES,
  mapRegion,
  countryToCardData,
  fetchAllCountries
};
