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

  function labelLines(name) {
    if (name === "North America") return ["North", "America"];
    if (name === "South America") return ["South", "America"];
    return [name];
  }

  function startFontSize(name) {
    switch (name) {
      case "Asia":
        return 24;
      case "Africa":
        return 20;
      case "North America":
      case "South America":
        return 18;
      case "Europe":
        return 15;
      case "Oceania":
        return 15;
      default:
        return 16;
    }
  }

  function makeSvgPoint(svg, x, y) {
    const p = svg.createSVGPoint();
    p.x = x;
    p.y = y;
    return p;
  }

  function labelFitsInPath(svg, pathEl, textEl) {
    if (!pathEl || !textEl) return false;
    if (typeof pathEl.isPointInFill !== "function") return false;

    const bb = textEl.getBBox();
    const PAD = 3;

    const corners = [
      [bb.x + PAD, bb.y + PAD],
      [bb.x + bb.width - PAD, bb.y + PAD],
      [bb.x + PAD, bb.y + bb.height - PAD],
      [bb.x + bb.width - PAD, bb.y + bb.height - PAD],
    ];

    for (const [x, y] of corners) {
      const pt = makeSvgPoint(svg, x, y);
      if (!pathEl.isPointInFill(pt)) return false;
    }
    return true;
  }

  function* spiralPoints(cx, cy, maxRadius = 120, step = 6) {
    yield [cx, cy];

    for (let r = step; r <= maxRadius; r += step) {
      const samples = Math.max(12, Math.floor((2 * Math.PI * r) / step));
      for (let i = 0; i < samples; i++) {
        const a = (i / samples) * Math.PI * 2;
        yield [
          cx + Math.cos(a) * r,
          cy + Math.sin(a) * r
        ];
      }
    }
  }

  function setTextLines(textSel, name, x) {
    const lines = labelLines(name);
    textSel.text(null);

    if (lines.length === 1) {
      textSel.append("tspan").attr("x", x).attr("dy", "0em").text(lines[0]);
      return;
    }

    textSel.append("tspan").attr("x", x).attr("dy", "-0.4em").text(lines[0]);
    textSel.append("tspan").attr("x", x).attr("dy", "1.1em").text(lines[1]);
  }

  function placeLabelInside(svg, pathEl, textEl, name, cx, cy) {
    const minSize = 10;
    let size = startFontSize(name);

    while (size >= minSize) {
      textEl.style.fontSize = `${size}px`;

      for (const [x, y] of spiralPoints(cx, cy)) {
        textEl.setAttribute("x", x);
        textEl.setAttribute("y", y);

        const sel = d3.select(textEl);
        setTextLines(sel, name, x);

        if (labelFitsInPath(svg, pathEl, textEl)) {
          return true;
        }
      }

      size -= 1;
    }

    return false;
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

    const projection = d3
      .geoIdentity()
      .reflectY(true)
      .fitSize([WIDTH, HEIGHT], geojson);

    const path = d3.geoPath(projection);

    const root = d3.select(svg);
    const g = root.append("g").attr("class", "continents");

    const pathSel = g
      .selectAll("path.continent")
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
      });

    const labels = g
      .selectAll("text.continent-label")
      .data(geojson.features)
      .enter()
      .append("text")
      .attr("class", "continent-label")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle");

    labels.each(function (d, i) {
      const name = d.properties?.name ?? "";
      let [cx, cy] = path.centroid(d);


      if (name === "North America") {
        cx -= 75;  // move left
        cy += 10;  // slight down adjustment
      }

      if (name === "Europe") {
        cx -= 5;  // move left
        cy += 18;  // slight down adjustment
      }

      this.style.fontSize = `${startFontSize(name)}px`;
      this.setAttribute("x", cx);
      this.setAttribute("y", cy);

      setTextLines(d3.select(this), name, cx);

      const pathEl = pathSel.nodes()[i];
      if (typeof pathEl?.isPointInFill === "function") {
        placeLabelInside(svg, pathEl, this, name, cx, cy);
      }
    });
  });
})();
