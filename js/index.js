// vars
let mapContainer = document.getElementById("map-container");
let chartContainer = document.getElementById("chart-container");
let mapSVGElement = null;
let chartSVGElement = null;
let minImgCount = 0, maxImgCount = 0, avgImgCount = 0;
let countriesGrp = null;
let chartGrp = null;

// call funcs
createMap();

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
  let domain = [binSize.toFixed(0), (2*binSize).toFixed(0), (3*binSize).toFixed(0), (4*binSize).toFixed(0), maxImgCount.toFixed(0)];
  let colorScale = d3.scaleThreshold()
    .domain(domain)
    .range(colorScheme);

  let projection = d3.geoNaturalEarth1() // map + projection
    .scale(w / 1.8 / Math.PI)
    .translate([w / 2, h / 2])

  let mapZoom = d3.zoom()
    .scaleExtent([1, 20])
    .on("zoom", zoomedMap);

  d3.json(mapInfoFile).then(function (data) {
    countriesGrp = svg.append("g");
    countriesGrp.attr("id", "path-grp")
      .selectAll("path")
      .data(data.features)
      .join("path")
      .attr("fill", (d) => {
        if (!imgsMap.has(d.properties.ADMIN)) {
          return "var(--no-data-gray)"
        }
        return colorScale(imgsMap.get(d.properties.ADMIN).length);
      })
      .attr("d", d3.geoPath()
        .projection(projection)
      )
      .style("stroke", "#fff")
      .style("stroke-width", "0.5px")
      .attr("cursor", function (d) {
        if (imgsMap.has(d.properties.ADMIN)) {
          return "pointer";
        }
      })
      .attr("class", function (d) {
        if (imgsMap.has(d.properties.ADMIN)) {
          return "country-path";
        }
      })
      .on("mouseover", function (e, d) {
        if (imgsMap.has(d.properties.ADMIN)) {
          d3.select("#disp-grp-txt").text(d.properties.ADMIN + " - " + imgsMap.get(d.properties.ADMIN).length);
          d3.select("#disp-grp").style("display", "block");
          d3.select("#disp-grp-border").attr("width", document.getElementById("disp-grp-txt").getBBox().width + 30);
        }
      })
      .on("mouseout", function () {
        d3.select("#disp-grp")
          .style("display", "none");
      })
      .on("click", function (e, d) {
        if (imgsMap.has(d.properties.ADMIN)) {
          window.location.href = "/GeoGuessd/pages/gallery.html?country=" + d.properties.ADMIN.replaceAll(" ", "%20");
        }
      })

    svg.call(mapZoom);

    // draw labels
    let dispGrp = svg.append("g").attr("id", "disp-grp");
    dispGrp.append("rect")
      .attr("x", 50)
      .attr("y", h - 200)
      .attr("fill", "white")
      .attr("width", 200)
      .attr("height", 50)
      .attr("stroke", "var(--link-colour)")
      .attr("stroke-width", "10px")
      .attr("rx", "5px")
      .attr("id", "disp-grp-border");
    dispGrp.append("text")
      .attr("x", 65)
      .attr("y", h-169)
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
      .attr("y", h - 80)
      .text(d => d)
      .style("text-anchor", "middle")
      .style("font-size", 8)
      .style("fill", "#000000")
    scaleTxtGrp.append("text")
      .attr("x", 50)
      .attr("y", h - 80)
      .text(minImgCount)
      .style("text-anchor", "middle")
      .style("font-size", 8)
      .style("fill", "#000000")

    svg.append("g").selectAll("rect").data(domain).enter().append("rect")
      .attr("x", function(d, i) {
        return 50 + (i * 50);
      })
      .attr("y", h - 100)
      .attr("width", 50)
      .attr("height", 10)
      .attr("fill", function(d) {
        return colorScale(d-1);
      });
  })

  createBarChart();
}

/**
 * Function which handles zooming in on the map. From https://observablehq.com/@d3/zoom-to-bounding-box.
 * @param event
 */
function zoomedMap(event) {
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
function createBarChart() {
  // append svg
  let w = mapContainer.offsetWidth;
  let h = mapContainer.offsetHeight;

  let svg = d3.select("#chart-container")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("viewBox", "0 0 " + w + " " + h)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("id", "map-chart");
  chartSVGElement = document.getElementById("map-chart");

  // set up an observer
  let observer = new ResizeObserver(entries => {
    let e = entries[0];
    chartSVGElement.setAttribute("width", e.contentRect.width);
    chartSVGElement.setAttribute("height", e.contentRect.height);
  })
  observer.observe(chartContainer)

  // draw chart
  let colorScheme = d3.schemePurples[6];
  let binSize = avgImgCount/5;
  let domain = [binSize.toFixed(0), (2*binSize).toFixed(0), (3*binSize).toFixed(0), (4*binSize).toFixed(0), maxImgCount.toFixed(0)];
  let colorScale = d3.scaleThreshold()
    .domain(domain)
    .range(colorScheme);

  let chartZoom = d3.zoom()
    .scaleExtent([1, 2])
    .on("zoom", zoomedChart);

  let scaleY = d3.scaleLog([1, 10], [100, 3700]);

  let wChart = 2850;
  chartGrp = svg.append("g");
  chartGrp.selectAll("rect").data(dataset).enter().append("rect")
    .attr("x", function(d, i) {
      return -750 + (i * (wChart / dataset.length));
    })
    .attr("y", function(d, i) {
      return (h-150) - (400 * (scaleY(d.num_entries)/maxImgCount));
    })
    .attr("width", ((wChart / dataset.length) - ((wChart / dataset.length) * 0.2)))
    .attr("height", function(d) {
      return 400 * (scaleY(d.num_entries)/maxImgCount);
    })
    .attr("fill", function(d) {
      return colorScale(d.num_entries);
    })
    .attr("class", "chart-bar")
    .on("click", function (e, d) {
      window.location.href = "/GeoGuessd/pages/gallery.html?country=" + d.country.replaceAll(" ", "%20");
    });

  // draw bar labels
  chartGrp.append("g").selectAll("text").data(dataset).enter().append("text")
    .attr("x", function(d, i) {
      return -738 + (i * (wChart / dataset.length));
    })
    .attr("y", function(d) {
      return (h-155) - (400 * (scaleY(d.num_entries)/maxImgCount));
    })
    .text((d) => d.num_entries)
    .style("text-anchor", "middle")
    .style("font-size", 10)
    .style("fill", "#000000");

  // draw x axis labels
  let countries = Array.from(imgsMap.keys());
  let longNameIndex = countries.findIndex(d => d === "South Georgia and South Sandwich Islands"); // change South Georgia and South Sandwich Islands to South Georgia and the Islands
  countries[longNameIndex] = "South Georgia & the Islands";
  let scaleX = d3.scaleBand()
    .domain(countries)
    .range([-865, 1985]);

  chartGrp.append("g")
    .attr("transform", "translate(100,100)")
    .call(d3.axisBottom(scaleX)).attr("color", "transparent")
    .selectAll("text")
    .attr("transform", "translate(0," + (h - 250) + ")rotate(-60)")
    .style("text-anchor", "end")
    .style("font-size", 12)
    .style("fill", "black")
    .style("fill", "black")

  svg.call(chartZoom);

  // draw color scale
  let scaleTxtGrp = svg.append("g");
  scaleTxtGrp.selectAll("text").data(domain).enter().append("text")
    .attr("x", function(d, i) {
      return 1950 + (i * 50);
    })
    .attr("y", 75)
    .text(d => d)
    .style("text-anchor", "middle")
    .style("font-size", 12)
    .style("fill", "#000000")
  scaleTxtGrp.append("text")
    .attr("x", 1900)
    .attr("y", 75)
    .text(minImgCount)
    .style("text-anchor", "middle")
    .style("font-size", 12)
    .style("fill", "#000000")

  svg.append("g").selectAll("rect").data(domain).enter().append("rect")
    .attr("x", function(d, i) {
      return 1900 + (i * 50);
    })
    .attr("y", 50)
    .attr("width", 50)
    .attr("height", 10)
    .attr("fill", function(d) {
      return colorScale(d-1);
    });
}

/**
 * Function which handles zooming in on the chart. From https://observablehq.com/@d3/zoom-to-bounding-box.
 * @param event
 */
function zoomedChart(event) {
  let {transform} = event;
  chartGrp.attr("transform", transform);
  chartGrp.attr("stroke-width", 1 / transform.k);
}
