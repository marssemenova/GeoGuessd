// vars
let chartContainer = document.getElementById("chart-container");
let countryStats = new Map();
let minAnswerCount = 0, maxAnswerCount = 0;
let chartSVGElement = null;
let chartGrp = null;
let sortFunc = 0;
let sortByNumAnswers = function (a, b) {
  let aAns = a[1].correct + a[1].wrong;
  let bAns = b[1].correct + b[1].wrong;
  if (aAns !== bAns) {
    return aAns < bAns ? 1 : -1;
  } else {
    return a[0] > b[0] ? 1 : -1;
  }
}

// call funcs
setContent();

async function setContent() {
  loadSessionHistory();
  if (sessionHistory !== []) {
    await loadData();
    if (debug) {
      sessionHistory = getDummySessionHistory(10);
    }
    document.getElementById("no-history-err").classList.add("hide-element");
    document.getElementById("session-data-container").classList.remove("hide-element");
    processCountryStats();
  }
}

function processCountryStats() {
  for (let x = 0; x < countryList.length; x++) {
    let currCountry = countryList[x];
    let newEntry = {
      "country": currCountry,
      "correct": 0,
      "wrong": 0
    }
    countryStats.set(currCountry, newEntry);
  }

  for (let x = 0; x < sessionHistory.length; x++) {
    let session = sessionHistory[x];
    for (let i = 0; i < session.answers.length; i++) {
      let ans = session.answers[i];
      ans.correct ? countryStats.get(ans.country).correct++ : countryStats.get(ans.country).wrong++;
    }
  }

  minAnswerCount = countryStats.get(countryList[0]).correct + countryStats.get(countryList[0]).wrong;
  maxAnswerCount = minAnswerCount;

  for (let x = 0; x < countryList.length; x++) {
    let currCountry = countryList[x];
    let currCountryStats = countryStats.get(currCountry);
    let numAnswers = currCountryStats.correct + currCountryStats.wrong;
    if (numAnswers > maxAnswerCount) {
      maxAnswerCount = numAnswers;
    }
    if (numAnswers < minAnswerCount) {
      minAnswerCount = numAnswers;
    }
  }

  createBarChart(sortByNumAnswers);
}

function createBarChart() {
  drawBarChart(sortByNumAnswers);
}

/**
 * Create bar chart.
 */
function drawBarChart(sortFunc) {
  // append svg
  let w = chartContainer.offsetWidth;
  let h = chartContainer.offsetHeight;

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
  let statsData = Array.from(countryStats);
  statsData.sort(sortFunc);

  let chartZoom = d3.zoom()
    .scaleExtent([1, 2])
    .on("zoom", zoomedChart);

  let wChart = w - 100;
  let barH = 150;
  chartGrp = svg.append("g");
  chartGrp.append("g").selectAll("rect").data(statsData).enter().append("rect")
    .attr("x", function(d, i) {
      return 50 + (i * (wChart / countryList.length));
    })
    .attr("y", function(d) {
      return (h-125) - (barH * ((d[1].correct + d[1].wrong)/maxAnswerCount) * (d[1].correct/(d[1].correct + d[1].wrong)));
    })
    .attr("width", ((wChart / countryList.length) - ((wChart / countryList.length) * 0.2)))
    .attr("height", function(d) {
      return barH * ((d[1].correct + d[1].wrong)/maxAnswerCount) * (d[1].correct/(d[1].correct + d[1].wrong));
    })
    .attr("fill", function() {
      return "red";
    })
    .attr("class", "chart-bar");
  chartGrp.append("g").selectAll("rect").data(statsData).enter().append("rect")
    .attr("x", function(d, i) {
      return 50 + (i * (wChart / countryList.length));
    })
    .attr("y", function(d) {
      return (h-125) - (barH * ((d[1].correct + d[1].wrong)/maxAnswerCount) * (d[1].correct/(d[1].correct + d[1].wrong))) - barH * ((d[1].correct + d[1].wrong)/maxAnswerCount) * (d[1].wrong/(d[1].correct + d[1].wrong));
    })
    .attr("width", ((wChart / countryList.length) - ((wChart / countryList.length) * 0.2)))
    .attr("height", function(d) {
      return barH * ((d[1].correct + d[1].wrong)/maxAnswerCount) * (d[1].wrong/(d[1].correct + d[1].wrong));
    })
    .attr("fill", function() {
      return "var(--link-colour)";
    })
    .attr("class", "chart-bar");

  // draw bar labels
  chartGrp.append("g").selectAll("text").data(statsData).enter().append("text")
    .attr("x", function(d, i) {
      return 54 + (i * (wChart / countryList.length));
    })
    .attr("y", function(d) {
      return (h-128) - (barH * ((d[1].correct + d[1].wrong)/maxAnswerCount));
    })
    .text((d) => (d[1].correct + d[1].wrong))
    .style("text-anchor", "middle")
    .style("font-size", 4)
    .style("fill", "#000000");

  // draw x axis labels
  let scaleX = d3.scaleBand()
    .domain(Array.from(statsData, (el) => el[0]))
    .range([-62, wChart-62]);

  chartGrp.append("g")
    .attr("transform", "translate(100,100)")
    .call(d3.axisBottom(scaleX)).attr("color", "transparent")
    .selectAll("text")
    .attr("transform", "translate(0," + (h - 225) + ")rotate(-60)")
    .style("text-anchor", "end")
    .style("font-size", 8)
    .style("fill", "black")
    .style("fill", "black")

  svg.call(chartZoom);
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
