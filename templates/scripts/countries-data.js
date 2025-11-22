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
    if (subregion.includes("South")) return "South America";
    return "North America"; // includes North, Central, Caribbean
  }

  // Antarctic → group under Oceania to avoid empty categories
  if (region === "Antarctic") return "Oceania";

  // Use direct regions for:
  // Asia, Europe, Africa, Oceania
  return region || "Unknown";
}

// Format data for cards
function countryToCardData(country) {
  const name = country.name?.common || "Unknown";
  const region = mapRegion(country);
  const capital = Array.isArray(country.capital)
    ? country.capital[0]
    : country.capital || "—";

  const population = country.population || 0;

  const flag =
    (country.flags && (country.flags.png || country.flags.svg)) ||
    "https://placehold.co/320x200";

  return {
    name,
    region,
    capital,
    population,
    flag
  };
}

// Fetch all countries from REST Countries API
async function fetchAllCountries() {
  const url =
    "https://restcountries.com/v3.1/all?fields=name,region,subregion,flags,capital,population";

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
