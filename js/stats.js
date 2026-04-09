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
  let aTot = a[1].correct + a[1].wrong;
  let bTot = b[1].correct + b[1].wrong;
  if (!(aTot === 0 || bTot === 0) && aCorrect/aTot !== bCorrect/bTot) {
    if (aCorrect === 0) {
      return 1;
    }
    if (bCorrect === 0) {
      return -1;
    }
    return aCorrect/aTot < bCorrect/bTot ? 1 : -1;
  } else {
    if (aCorrect !== bCorrect) {
      return aCorrect < bCorrect ? 1 : -1;
    } else {
      if (aTot !== bTot) {
        return aTot < bTot ? 1 : -1;
      }
      return a[0] > b[0] ? 1 : -1;
    }
  }
};
let sortByNumWrong = function (a, b) { // 3
  let aWrong = a[1].wrong;
  let bWrong = b[1].wrong;
  let aTot = a[1].correct + a[1].wrong;
  let bTot = b[1].correct + b[1].wrong;
  if (!(aTot === 0 || bTot === 0) && aWrong/aTot !== bWrong/bTot) {
    if (aWrong === 0) {
      return 1;
    }
    if (bWrong === 0) {
      return -1;
    }
    return aWrong/aTot < bWrong/bTot ? 1 : -1;
  } else {
    if (aWrong !== bWrong) {
      return aWrong < bWrong ? 1 : -1;
    } else {
      if (aTot != bTot) {
        return aTot < bTot ? 1 : -1;
      }
      return a[0] > b[0] ? 1 : -1;
    }
  }
};

// call funcs
setContent();

/**
 * If there is session data, display it.
 */
async function setContent() {
  await loadData();
  loadSessionHistory();
  if (sessionHistory.length !== 0) {
    document.getElementById("no-history-err-container").classList.add("hide-element");
    document.getElementById("session-data-container").classList.remove("hide-element");
    document.getElementById("reset-btn").addEventListener("click", function(e) {
      if (!debug) {
        sessionHistory = [];
        localStorage.setItem("sessionHistory", JSON.stringify(sessionHistory));
      }
      location.reload();
    });
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

  countryStats = Array.from(countryStats);
}

/**
 * Create the percentage pie chart.
 */
function createPercentageChart() {
  let percentageChartContainer = document.getElementById("percentage-chart");
  let w = percentageChartContainer.offsetWidth;
  let h = percentageChartContainer.offsetHeight;

  console.log(w, h);
  let svg = d3.select("#percentage-chart")
    .append("svg")
    .attr("width", w)
    .attr("height", h)
    .attr("viewBox", "0 0 " + w + " " + h)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .attr("id", "percentage-chart-svg")
  let chartSVGElement2 = document.getElementById("percentage-chart-svg");

  // set up an observer
  let observer2 = new ResizeObserver(entries => {
    let e = entries[0];
    chartSVGElement2.setAttribute("width", e.contentRect.width);
    chartSVGElement2.setAttribute("height", e.contentRect.width);
  })
  observer2.observe(percentageChartContainer)

  // calc tot correct + wrong
  let totCorrect = 0, totWrong = 0;
  for (let x = 0; x < sessionHistory.length; x++) {
    totCorrect += sessionHistory[x].correct;
    totWrong += sessionHistory[x].wrong;
  }

  // setup params
  let r = Math.min(w, h) / 2 - 20;
  let data = {"totCorrect": totCorrect, "totWrong": totWrong};
  let colour = d3.scaleOrdinal()
    .domain(["totCorrect", "totWrong"])
    .range(["var(--link-colour)", "red"]);
  let pie = d3.pie().sort(null).value((d) => d[1]);
  let arcs = d3.arc()
    .innerRadius(r/2)
    .outerRadius(r);

  // build pie chart
  svg.append("g").selectAll("slices").data(pie(Object.entries(data))).enter().append("path")
    .attr("d", arcs)
    .attr("fill", function(d) {
      return colour(d.data[0]);
    })
    .attr("transform", "translate(" + w/2 + "," + h/2 + ")");

  // add text
  let percentage = Math.round(totCorrect/(totCorrect+totWrong)*100);
  if (totCorrect !== 0 && percentage === 0) {
    percentage = "<1"
  }
  svg.append("text")
    .attr("x", w/2)
    .attr("y", h/2 + 7)
    .text(percentage + "%")
    .style("text-anchor", "middle")
    .style("font-size", 24)
    .style("font-weight", "bold")
    .style("fill", "var(--link-colour)");
}

/**
 * Fill in the best countries table.
 */
function fillBestCountriesTable() {
  let bestCountriesTable = document.getElementById("best-countries-list");
  fillRankTable(bestCountriesTable, sortByNumCorrect, true);
}

/**
 * Fill in the worst countries table.
 */
function fillWorstCountriesTable() {
  let worstCountriesTable = document.getElementById("worst-countries-list");
  fillRankTable(worstCountriesTable, sortByNumWrong, false);
}

/**
 * Helper function to fill the rank tables
 * @param table Table to fill.
 * @param sortFunc Sort function to use on the data.
 * @param isBest Use to indicate which table to fill.
 */
function fillRankTable(table, sortFunc, isBest) {
  let data = countryStats.sort(sortFunc);

  let country, percentage, li;
  for (let x = 0; x < 10; x++) {
    country = data[x][0];
    li = table.children[x].children[0];
    if (data[x][1].correct + data[x][1].wrong === 0 || (isBest ? data[x][1].correct : data[x][1].wrong) === 0) {
      percentage = 0;
      li.children[1].innerText = "0%";
    } else {
      percentage = (isBest ? data[x][1].correct : data[x][1].wrong) / (data[x][1].correct + data[x][1].wrong) * 100;
      li.children[1].innerText = Math.round(percentage) + "%";
      if (percentage === 0) {
        li.children[1].innerText = "<1%";
      }
    }
    li.children[0].innerText = country;
  }
}

/**
 * Fill in the recent sessions table.
 */
function fillRecentSessionTable() {
  let recentSessionsTable = document.getElementById("recent-sessions-list");

  let time, tot, percentage, li;
  let svgContainer, w, h;
  for (let x = 0; x < (sessionHistory.length < 10 ? sessionHistory.length : 10); x++) {
    li = recentSessionsTable.children[x].children[0];
    li.style.visibility = "visible";

    // set time
    time = new Date(sessionHistory[x].time);
    let mins =
    li.children[0].innerText = time.getHours() + ":" + ("0" + time.getMinutes()).slice(-2) + " " + time.getDate() + "/" + (time.getMonth()+1) + "/" + (time.getFullYear().toString()).substring(2);

    // set svg
    svgContainer = li.children[1];
    w = svgContainer.offsetWidth;
    h = svgContainer.offsetHeight;

    let svg = d3.select("#session-his-" + (x+1))
      .append("svg")
      .attr("width", w)
      .attr("height", h)
      .attr("viewBox", "0 0 " + w + " " + h)
      .attr("preserveAspectRatio", "xMidYMid meet")
    tot = sessionHistory[x].correct + sessionHistory[x].wrong;
    if (tot === 0) {
      percentage = 0
    } else {
      percentage = sessionHistory[x].correct / tot;
    }
    svg.append("rect")
      .attr("x", 0)
      .attr("y", h-h/2.5)
      .attr("width", percentage*w)
      .attr("height", h/2.5)
      .attr("fill", "var(--link-colour)")
    svg.append("rect")
      .attr("x", percentage*w)
      .attr("y", h - h/2.5)
      .attr("width", (1-percentage)*w)
      .attr("height", h/2.5)
      .attr("fill", "red")
    svg.append("text")
      .attr("x", w/2)
      .attr("y", h/2)
      .text(tot)
      .style("text-anchor", "middle")
      .style("font-size", 9)
      .style("fill", "#000000");

    // set percentage
    if (percentage !== 0 && Math.round(percentage * 100) === 0) {
      li.children[2].innerText = "<1%";
    } else {
      li.children[2].innerText = Math.round(percentage * 100) + "%";
    }
  }
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
  let sortByNumAnswersChart = drawStatsChart(countryStats, 1);
  let sortByNumCorrectChart = drawStatsChart(countryStats, 2);
  let sortByNumWrongChart = drawStatsChart(countryStats, 3);

  sortByNumCorrectChart.attr("opacity", 0);
  sortByNumWrongChart.attr("opacity", 0);

  let chartZoom = d3.zoom()
    .scaleExtent([1, 3])
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
  // sort
  if (whichSort === 1) {
    statsData.sort(sortByNumAnswers)
  }
  if (whichSort === 2) {
    statsData.sort(sortByNumCorrect)
  }
  if (whichSort === 3) {
    statsData.sort(sortByNumWrong)
  }

  // draw chart
  let w = chartSVGElement.getAttribute("width"), h = chartSVGElement.getAttribute("height");
  let svg = d3.select("#stats-chart").append("g");

  let wChart = w - 100;
  let barH = h*0.45;
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
    .text(function(d) {
      if (whichSort === 1) {
        return d[1].correct + d[1].wrong;
      }
      if (d[1].correct + d[1].wrong === 0) {
        return "0%";
      }
      if (whichSort === 2) {
        if (d[1].correct !== 0 && Math.round(d[1].correct/(d[1].correct + d[1].wrong)*100) === 0) {
          return "<1%";
        }
        return Math.round(d[1].correct/(d[1].correct + d[1].wrong)*100) + "%";
      }
      if (whichSort === 3) {
        if (d[1].wrong !== 0 && Math.round(d[1].wrong/(d[1].correct + d[1].wrong)*100) === 0) {
          return "<1%";
        }
        return Math.round(d[1].wrong/(d[1].correct + d[1].wrong)*100) + "%";
      }
    })
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
