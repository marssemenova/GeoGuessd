let debug = true;

// global vars
let dataInfoPath = "/GeoGuessd/data/data-info.json";
let imgsPath = "/GeoGuessd/data/images/";
let mapInfoFile = "/GeoGuessd/data/ne_10m_admin_0_countries.json";
let dataset = null;
let imgsMap = new Map();
let countryList = null;
let sessionHistory = [];

/**
 * Load data info from /data/data-info.json.
 */
function loadData() {
  return new Promise((resolve) => {
    d3.json(dataInfoPath).then(async function (data) {
      dataset = data;
      await pruneData();
      // sort + update country list
      dataset.sort(function (a, b) {
        return b.num_entries - a.num_entries;
      })
      createImagesMap();
      console.log("Dataset:")
      console.log(dataset);
      resolve("resolved");
    });
  });
}

/**
 * Remove data that isn't compatible with the map.
 */
function pruneData() {
  return new Promise((resolve) => {
    countryList = [];
    d3.json(mapInfoFile).then(function (data) {
      // extract list of countries
      for (let x = 0; x < data.features.length; x++) {
        let country = data.features[x].properties.ADMIN;
        if (country === "South Georgia and South Sandwich Islands") { // change South Georgia and South Sandwich Islands to South Georgia and the Islands
          country = "South Georgia and the Islands";
        }
        countryList.push(country);
      }

      // remove from dataset if country not in country list
      for (let x = 0; x < dataset.length; x++) {
        let currCountry = dataset[x].country;
        if (currCountry === "South Georgia and South Sandwich Islands" && countryList.includes("South Georgia and the Islands")) { // change South Georgia and South Sandwich Islands to South Georgia and the Islands
          currCountry = "South Georgia and the Islands";
          dataset[x].country = currCountry;
        }
        if (!countryList.includes(currCountry)) {
          dataset.splice(x, 1);
          x--;
        }
      }

      resolve("resolved");
    });
  });
}

/**
 * Create a map from countries to arrays of images from the dataset.
 */
function createImagesMap() {
  for (let x = 0; x < dataset.length; x++) {
    let currObj = dataset[x];
    imgsMap.set(currObj.country, currObj.entries);
  }

  countryList = Array.from(imgsMap.keys());
}

/**
 * Load user session history from local storage.
 */
function loadSessionHistory(){
  sessionHistory = localStorage.getItem("sessionHistory");
  if (sessionHistory === null) {
    sessionHistory = [];
  } else {
    sessionHistory = JSON.parse(sessionHistory);
  }
  if (debug) {
    sessionHistory = getDummySessionHistory(100);
  }
  console.log("Loaded session history:")
  console.log(sessionHistory);
}

/**
 * Helper method to parse arguments passed through a link. From
 * https://stackoverflow.com/questions/46247336/how-can-i-pass-data-through-a-link-using-just-javascript-and-html.
 * @returns Object of pairs.
 */
function getUrlVars() {
  var vars = [], hash;
  var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
  for(var i = 0; i < hashes.length; i++)
  {
    hash = hashes[i].split('=');
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
  }
  return vars;
}

/**
 * Helper method to generate dummy session data.
 * @param numSessions Number of sessions.
 * @returns JSON object of session data.
 */
function getDummySessionHistory(numSessions){
  let dummySessionHistory = [];
  for (let x = 0; x < numSessions; x++) {
    let numAnswers = Math.floor(Math.random() * 9) + 1;
    let currAnswers = [];
    let correct = 0, wrong = 0;
    for (let i = 0; i < numAnswers; i++) {
      let currCountry = countryList[Math.floor(Math.random() * countryList.length)];
      let isCorrect = !!Math.floor(Math.random() * 2);
      currAnswers.push({
        "country" : currCountry,
        "correct" : isCorrect
      });
      isCorrect ? correct++ : wrong++;
    }
    let newEntry = {
      "time" : (new Date()).toJSON(),
      "correct" : correct,
      "wrong" : wrong,
      "answers" : currAnswers
    }
    dummySessionHistory.unshift(newEntry);
  }
  console.log("Loaded dummy session history:")
  console.log(dummySessionHistory);
  return dummySessionHistory;
}
