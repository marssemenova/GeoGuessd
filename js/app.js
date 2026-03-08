// global vars
let dataInfoPath = "/GeoGuessd/data/data-info.json";
let imgsPath = "/GeoGuessd/data/images/";
let mapInfoFile = "/GeoGuessd/data/world.geojson";
let dataset = null;
let imgsMap = new Map();

/**
 * Load data info from /data/data-info.json.
 */
function loadData() {
  return new Promise((resolve) => {
    d3.json(dataInfoPath).then(async function (data) {
      dataset = data;
      await pruneData();
      dataset.sort(function (a, b) {
        return b.num_entries - a.num_entries;
      })
      createImagesMap();
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
    let countryList = [];
    d3.json(mapInfoFile).then(function (data) {
      // extract list of countries
      for (let x = 0; x < data.features.length; x++) {
        let country = data.features[x].properties.name;
        countryList.push(country);
      }

      // remove from dataset if country not in country list
      for (let x = 0; x < dataset.length; x++) {
        let curCountry = dataset[x].country;
        if (!countryList.includes(curCountry)) {
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
