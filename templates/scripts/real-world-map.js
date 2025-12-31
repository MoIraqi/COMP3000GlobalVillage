// scripts/real-world-map.js
(() => {
  const GEOJSON_URL =
    "https://cdn.jsdelivr.net/npm/@highcharts/map-collection@2.3.0/custom/world-continents.geo.json";

  const WIDTH = 1000;
  const HEIGHT = 520;

  function goToContinent(continentName) {
    const u = new URL("countries.html", window.location.href);
    u.searchParams.set("continent", continentName);
    window.location.href = u.toString();
  }

  window.addEventListener("DOMContentLoaded", async () => {
    const svg = document.getElementById("worldMap");
    if (!svg) return;

    svg.setAttribute("viewBox", `0 0 ${WIDTH} ${HEIGHT}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Clickable world map by continent");
    svg.innerHTML = "";

    const res = await fetch(GEOJSON_URL);
    if (!res.ok) throw new Error("Failed to load continent GeoJSON");
    const geojson = await res.json();

    // ✅ IMPORTANT: this GeoJSON is ALREADY projected, so use geoIdentity (not Mercator)
    const projection = d3.geoIdentity().reflectY(true).fitSize([WIDTH, HEIGHT], geojson);
    const path = d3.geoPath(projection);

    const root = d3.select(svg);
    const g = root.append("g").attr("class", "continents");

    // Draw continent shapes
    g.selectAll("path.continent")
      .data(geojson.features)
      .enter()
      .append("path")
      .attr("class", "continent")
      .attr("d", path)
      .attr("data-continent", (d) => d.properties?.name ?? "")
      .attr("tabindex", 0)
      .attr("role", "button")
      .attr("aria-label", (d) => `Open ${d.properties?.name ?? "continent"}`)
      .on("click", (_, d) => {
        const name = d.properties?.name;
        if (name) goToContinent(name);
      })
      .on("keydown", (event, d) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          const name = d.properties?.name;
          if (name) goToContinent(name);
        }
      });

    // Labels
    g.selectAll("text.continent-label")
      .data(geojson.features)
      .enter()
      .append("text")
      .attr("class", "continent-label")
      .attr("x", (d) => path.centroid(d)[0])
      .attr("y", (d) => path.centroid(d)[1])
      .text((d) => d.properties?.name ?? "")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle");
  });
})();
