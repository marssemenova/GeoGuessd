// global vars
let dataInfoPath = "/../data/data-info.json";
let imgsPath = "/../data/";
let dataset = null;

// call funcs
loadData();

/**
 * Load data info from /data/data-info.json.
 */
function loadData() {
  d3.json(dataInfoPath).then(function(data) {
    dataset = data;
    console.log(dataset);
  });

}

