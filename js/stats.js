// vars
let chartContainer = document.getElementById("stats-chart-container");
let countryStats = new Map();
let minAnswerCount = 0, maxAnswerCount = 0;
let chartSVGElement = null;
let whichSortFunc = 1;
let sortByNumAnswers = function (a, b) { // 1
  let aAns = a[1].correct + a[1].wrong;
  let bAns = b[1].correct + b[1].wrong;
  if (aAns !== bAns) {
    return aAns < bAns ? 1 : -1;
  } else {
    return a[0] > b[0] ? 1 : -1;
  }
};
let sortByNumCorrect = function (a, b) { // 2
  let aCorrect = a[1].correct;
  let bCorrect = b[1].correct;
  if (aCorrect !== bCorrect) {
    return aCorrect < bCorrect ? 1 : -1;
  } else {
    return a[0] > b[0] ? 1 : -1;
  }
};
let sortByNumWrong = function (a, b) { // 3
  let aWrong = a[1].wrong;
  let bWrong = b[1].wrong;
  if (aWrong !== bWrong) {
    return aWrong < bWrong ? 1 : -1;
  } else {
    return a[0] > b[0] ? 1 : -1;
  }
};

// call funcs
setContent();

/**
 * If there is session data, display it.
 */
async function setContent() {
  loadSessionHistory();
  if (sessionHistory !== []) {
    await loadData();
    if (debug) {
      sessionHistory = getDummySessionHistory(100);
    }
    document.getElementById("no-history-err").classList.add("hide-element");
    document.getElementById("session-data-container").classList.remove("hide-element");
    processCountryStats();
    createPercentageChart();
    fillRecentSessionTable();
    fillBestCountriesTable();
    fillWorstCountriesTable();
    createStatsChart();
  }
}

/**
 * Process country stats for use in data generation.
 */
function processCountryStats() {
  // init
  for (let x = 0; x < countryList.length; x++) {
    let currCountry = countryList[x];
    let newEntry = {
      "country": currCountry,
      "correct": 0,
      "wrong": 0
    }
    countryStats.set(currCountry, newEntry);
  }

  // tally
  for (let x = 0; x < sessionHistory.length; x++) {
    let session = sessionHistory[x];
    for (let i = 0; i < session.answers.length; i++) {
      let ans = session.answers[i];
      ans.correct ? countryStats.get(ans.country).correct++ : countryStats.get(ans.country).wrong++;
    }
  }

  // get max + min
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
}

/**
 * Create the percentage pie chart.
 */
function createPercentageChart() {

}

/**
 * Fill in the recent sessions table.
 */
function fillRecentSessionTable() {

}

/**
 * Fill in the best countries table.
 */
function fillBestCountriesTable() {

}

/**
 * Fill in the worst countries table.
 */
function fillWorstCountriesTable() {

}

/**
 * Create the stats chart.
 */
function createStatsChart() {
  // append svg
  let w = chartContainer.offsetWidth;
  let h = chartContainer.offsetHeight;

  let svg = d3.select("#stats-chart-container")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("viewBox", "0 0 " + w + " " + h)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("id", "stats-chart");
  chartSVGElement = document.getElementById("stats-chart");

  // set up an observer
  let observer = new ResizeObserver(entries => {
    let e = entries[0];
    chartSVGElement.setAttribute("width", e.contentRect.width);
    chartSVGElement.setAttribute("height", e.contentRect.height);
  })
  observer.observe(chartContainer)

  // gen different sorts
  let statsData = Array.from(countryStats);
  let sortByNumAnswersChart = drawStatsChart(statsData.sort(sortByNumAnswers), 1);
  let sortByNumCorrectChart = drawStatsChart(statsData.sort(sortByNumCorrect), 2);
  let sortByNumWrongChart = drawStatsChart(statsData.sort(sortByNumWrong), 3);

  sortByNumCorrectChart.attr("opacity", 0);
  sortByNumWrongChart.attr("opacity", 0);

  let chartZoom = d3.zoom()
    .scaleExtent([1, 2])
    .on("zoom", zoomedChart);
  svg.call(chartZoom);

  // set up btn to handle switch
  let sortTypeText = document.getElementById("sort-type-text");
  document.getElementById("sort-btn").addEventListener("click", function(e) {
    whichSortFunc++;
    if (whichSortFunc > 3) {
      whichSortFunc = 1;
    }
    svg.call(chartZoom.transform, d3.zoomIdentity);
    if (whichSortFunc === 1) {
      sortByNumAnswersChart.attr("opacity", 1);
      sortByNumWrongChart.attr("opacity", 0);
      sortTypeText.innerText = "Sorted by most to least answers";
    }
    if (whichSortFunc === 2) {
      sortByNumAnswersChart.attr("opacity", 0);
      sortByNumCorrectChart.attr("opacity", 1);
      sortTypeText.innerText = "Sorted by most to least correct answers";
    }
    if (whichSortFunc === 3) {
      sortByNumCorrectChart.attr("opacity", 0);
      sortByNumWrongChart.attr("opacity", 1);
      sortTypeText.innerText = "Sorted by most to least wrong answers";
    }
  })
}

/**
 * Draw bar chart based on specified sort functions.
 * @param statsData Data to plot.
 * @param whichSort Which sort function was used.
 * @returns Group with generated bar graph appended to the svg element.
 */
function drawStatsChart(statsData, whichSort) {
  // draw chart
  let w = chartSVGElement.getAttribute("width"), h = chartSVGElement.getAttribute("height");
  let svg = d3.select("#stats-chart").append("g");

  let wChart = w - 100;
  let barH = 150;
  let chartGrp = svg.append("g").attr("id", "stats-chart-grp-" + whichSort);
  chartGrp.append("g").selectAll("rect").data(statsData).enter().append("rect")
    .attr("x", function(d, i) {
      return 50 + (i * (wChart / countryList.length));
    })
    .attr("y", function(d) {
      if (d[1].correct + d[1].wrong === 0) {
        return 0;
      }
      if (whichSort === 2) {
        return (h - 125) - (barH * ((d[1].correct + d[1].wrong) / maxAnswerCount) * (d[1].correct / (d[1].correct + d[1].wrong)));
      } else {
        return (h - 125) - (barH * ((d[1].correct + d[1].wrong) / maxAnswerCount) * (d[1].wrong / (d[1].correct + d[1].wrong)));
      }
    })
    .attr("width", ((wChart / countryList.length) - ((wChart / countryList.length) * 0.2)))
    .attr("height", function(d) {
      if (d[1].correct + d[1].wrong === 0) {
        return 0;
      }
      if (whichSort === 2) {
        return barH * ((d[1].correct + d[1].wrong) / maxAnswerCount) * (d[1].correct / (d[1].correct + d[1].wrong));
      } else {
        return barH * ((d[1].correct + d[1].wrong) / maxAnswerCount) * (d[1].wrong / (d[1].correct + d[1].wrong));
      }
    })
    .attr("fill", function() {
      if (whichSort === 2) {
        return "var(--link-colour)"
      } else {
        return "red";
      }
    })
    .attr("class", "chart-bar");
  chartGrp.append("g").selectAll("rect").data(statsData).enter().append("rect")
    .attr("x", function(d, i) {
      return 50 + (i * (wChart / countryList.length));
    })
    .attr("y", function(d) {
      if (d[1].correct + d[1].wrong === 0) {
        return 0;
      }
      if (whichSort === 2) {
        return (h - 125) - (barH * ((d[1].correct + d[1].wrong) / maxAnswerCount) * (d[1].correct / (d[1].correct + d[1].wrong))) - barH * ((d[1].correct + d[1].wrong) / maxAnswerCount) * (d[1].wrong / (d[1].correct + d[1].wrong));
      } else {
        return (h - 125) - (barH * ((d[1].correct + d[1].wrong) / maxAnswerCount) * (d[1].wrong / (d[1].correct + d[1].wrong))) - barH * ((d[1].correct + d[1].wrong) / maxAnswerCount) * (d[1].correct / (d[1].correct + d[1].wrong));
      }
    })
    .attr("width", ((wChart / countryList.length) - ((wChart / countryList.length) * 0.2)))
    .attr("height", function(d) {
      if (d[1].correct + d[1].wrong === 0) {
        return 0;
      }
      if (whichSort === 2) {
        return barH * ((d[1].correct + d[1].wrong) / maxAnswerCount) * (d[1].wrong / (d[1].correct + d[1].wrong));
      } else {
        return barH * ((d[1].correct + d[1].wrong) / maxAnswerCount) * (d[1].correct / (d[1].correct + d[1].wrong));
      }
    })
    .attr("fill", function() {
      if (whichSort === 2) {
        return "red";
      } else {
        return "var(--link-colour)";
      }
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

  return svg;
}

/**
 * Function which handles zooming in on the chart. From https://observablehq.com/@d3/zoom-to-bounding-box.
 * @param event
 */
function zoomedChart(event) {
  let {transform} = event;
  let chartGrp = d3.select("#stats-chart-grp-" + whichSortFunc);
  chartGrp.attr("transform", transform);
  chartGrp.attr("stroke-width", 1 / transform.k);
}
