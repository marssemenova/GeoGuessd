// call funcs
setContent();

async function setContent() {
  loadSessionHistory();
  if (sessionHistory !== []) {
    await loadData();
    loadSessionHistory();
    document.getElementById("no-history-err").classList.add("hide-element");
    document.getElementById("session-data-container").classList.remove("hide-element");
  }
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

  let scaleY = d3.scaleLog([1, 10], [100, 3000]);

  let wChart = 2500;
  let barH = 350
  chartGrp = svg.append("g");
  chartGrp.selectAll("rect").data(dataset).enter().append("rect")
    .attr("x", function(d, i) {
      return -650 + (i * (wChart / dataset.length));
    })
    .attr("y", function(d, i) {
      return (h-175) - (barH * (scaleY(d.num_entries)/maxImgCount));
    })
    .attr("width", ((wChart / dataset.length) - ((wChart / dataset.length) * 0.2)))
    .attr("height", function(d) {
      return barH * (scaleY(d.num_entries)/maxImgCount);
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
      return -642 + (i * (wChart / dataset.length));
    })
    .attr("y", function(d) {
      return (h-179) - (barH * (scaleY(d.num_entries)/maxImgCount));
    })
    .text((d) => d.num_entries)
    .style("text-anchor", "middle")
    .style("font-size", 8)
    .style("fill", "#000000");

  // draw x axis labels
  let countries = Array.from(imgsMap.keys());
  let scaleX = d3.scaleBand()
    .domain(countries)
    .range([-765, wChart-765]);

  chartGrp.append("g")
    .attr("transform", "translate(100,100)")
    .call(d3.axisBottom(scaleX)).attr("color", "transparent")
    .selectAll("text")
    .attr("transform", "translate(0," + (h - 275) + ")rotate(-60)")
    .style("text-anchor", "end")
    .style("font-size", 12)
    .style("fill", "black")
    .style("fill", "black")

  svg.call(chartZoom);

  // draw color scale
  let scaleTxtGrp = svg.append("g");
  scaleTxtGrp.selectAll("text").data(domain).enter().append("text")
    .attr("x", function(d, i) {
      return 1500 + (i * 50);
    })
    .attr("y", 75)
    .text(d => d)
    .style("text-anchor", "middle")
    .style("font-size", 12)
    .style("fill", "#000000")
  scaleTxtGrp.append("text")
    .attr("x", 1450)
    .attr("y", 75)
    .text(minImgCount)
    .style("text-anchor", "middle")
    .style("font-size", 12)
    .style("fill", "#000000")

  svg.append("g").selectAll("rect").data(domain).enter().append("rect")
    .attr("x", function(d, i) {
      return 1450 + (i * 50);
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
