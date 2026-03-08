// vars
let mapContainer = document.getElementById("map-container");
let mapSVGElement = null;
let minImgCount = 0, maxImgCount = 0, avgImgCount = 0;
let mapInfoFile = "/GeoGuessd/data/world.geojson";
let countriesGrp = null;
let mapZoom = null;

// call funcs
createMap();
createBarGraph();

/**
 * Create map on homepage.
 */
async function createMap() {
  await loadData();
  calcImgMaxMin();

  // append svg
  let w = mapContainer.offsetWidth;
  let h = mapContainer.offsetHeight;

  let svg = d3.select("#map-container")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("viewBox", "0 0 " + w + " " + h)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("id", "map");
  mapSVGElement = document.getElementById("map");

  // set up an observer
  let observer = new ResizeObserver(entries => {
    let e = entries[0];
    mapSVGElement.setAttribute("width", e.contentRect.width);
    mapSVGElement.setAttribute("height", e.contentRect.height);
  })
  observer.observe(mapContainer)

  // draw map
  let colorScheme = d3.schemePurples[6];
  let binSize = avgImgCount/5;
  let domain = [binSize.toFixed(0), (2*binSize).toFixed(0), (3*binSize).toFixed(0), (4*binSize).toFixed(0), (maxImgCount-1).toFixed(0)];
  let colorScale = d3.scaleThreshold()
    .domain(domain)
    .range(colorScheme);

  let projection = d3.geoNaturalEarth1() // map + projection
    .scale(w / 1.8 / Math.PI)
    .translate([w / 2, h / 2])

  mapZoom = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoomed);

  d3.json(mapInfoFile).then(function (data) {
    countriesGrp = svg.append("g");
    countriesGrp.attr("id", "path-grp")
      .selectAll("path")
      .data(data.features)
      .join("path")
      .attr("fill", (d) => {
        if (!imgsMap.has(d.properties.name)) {
          return "var(--no-data-gray)"
        }
        return colorScale(imgsMap.get(d.properties.name).length);
      })
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      .style("stroke", "#fff")
      .style("stroke-width", "0.5px")
      .attr("cursor", function (d) {
        if (imgsMap.has(d.properties.name)) {
          return "pointer";
        }
      })
      .attr("class", function (d) {
        if (imgsMap.has(d.properties.name)) {
          return "country-path";
        }
      })
      .on("mouseover", function (e, d) {
        if (imgsMap.has(d.properties.name)) {
          d3.select("#disp-grp-txt").text(d.properties.name + " - " + imgsMap.get(d.properties.name).length);
          d3.select("#disp-grp").style("display", "block");
          d3.select("#disp-grp-border").attr("width", document.getElementById("disp-grp-txt").getBBox().width + 30);
        }
      })
      .on("mouseout", function () {
        d3.select("#disp-grp")
          .style("display", "none");
      })
      .on("click", function (e, d) {
        if (imgsMap.has(d.properties.name)) {
          window.location.href = "/GeoGuessd/pages/gallery.html?country=" + d.properties.name.replaceAll(" ", "%20");
        }
      })

    svg.call(mapZoom);

    // draw labels
    let dispGrp = svg.append("g").attr("id", "disp-grp").style("z-index", "1").raise();
    dispGrp.append("rect")
      .attr("x", 50)
      .attr("y", 519)
      .attr("fill", "white")
      .attr("width", 200)
      .attr("height", 50)
      .attr("stroke", "red")
      .attr("stroke-width", "10px")
      .attr("rx", "5px")
      .attr("id", "disp-grp-border");
    dispGrp.append("text")
      .attr("x", 65)
      .attr("y", 550)
      .text("Country: x entries")
      .style("text-anchor", "start")
      .style("font-size", 20)
      .style("fill", "#000000")
      .attr("id", "disp-grp-txt");

    // draw scale
    let scaleTxtGrp = svg.append("g");
    scaleTxtGrp.selectAll("text").data(domain).enter().append("text")
      .attr("x", function(d, i) {
        return 100 + (i * 50);
      })
      .attr("y", 620)
      .text(d => d)
      .style("text-anchor", "middle")
      .style("font-size", 8)
      .style("fill", "#000000")
    scaleTxtGrp.append("text")
      .attr("x", 50)
      .attr("y", 620)
      .text(minImgCount)
      .style("text-anchor", "middle")
      .style("font-size", 8)
      .style("fill", "#000000")

    svg.append("g").selectAll("rect").data(domain).enter().append("rect")
      .attr("x", function(d, i) {
        return 50 + (i * 50);
      })
      .attr("y", 600)
      .attr("width", 50)
      .attr("height", "10")
      .attr("fill", function(d, i) {
        return colorScale(d-1);
      });
  })
}

/**
 * Function which handles zooming in on the map. From https://observablehq.com/@d3/zoom-to-bounding-box.
 * @param event
 */
function zoomed(event) {
  let {transform} = event;
  countriesGrp.attr("transform", transform);
  countriesGrp.attr("stroke-width", 1 / transform.k);
}

/**
 * Helper function to calculate some stats about the dataset.
 */
function calcImgMaxMin() {
  maxImgCount = -1;
  minImgCount = Number.MAX_SAFE_INTEGER;
  for (let x = 0; x < dataset.length; x++) {
    let currEntries = dataset[x].num_entries;
    avgImgCount += currEntries;
    if (currEntries > maxImgCount) {
      maxImgCount = currEntries;
    }
    if (currEntries < minImgCount) {
      minImgCount = currEntries;
    }
  }
  avgImgCount /= dataset.length;
}

/**
 * Create bar graph.
 */
function createBarGraph() {

}
