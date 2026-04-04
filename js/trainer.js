// vars
let currImg = document.getElementById("curr-img");
let checkBtn = document.getElementById("check-btn");
let skipOrNextBtn = document.getElementById("skip-next-btn");
let textbox = document.getElementById("ans-field");
let saveSessionBtn = document.getElementById("save-btn");
let resetSessionBtn = document.getElementById("reset-btn");
let statsBtn = document.getElementById("stats-btn");
let imgDataLoaded = false;
let sessionHistoryLoaded = false;
let correct = 0;
let wrong = 0; // skips count as a wrong
let answers = [];
let currCountry = null;
let imgsSet = null;

// call funcs
loadImage();
eventHandlingSetup();

/**
 * Create a set of pairs of image files and their country.
 */
function createImgsSet() {
  let countries = Array.from(imgsMap.keys());
  imgsSet = [];
  for (let country of countries) {
    let currImgs = imgsMap.get(country);
    for (let img of currImgs) {
      imgsSet.push({
        "country" : country,
        "file" : img
      });
    }
  }
}

/**
 * Load a new image into the container.
 */
async function loadImage() {
  textbox.classList.remove("correct-ans", "wrong-ans");
  skipOrNextBtn.innerText = "Skip";
  skipOrNextBtn.classList.remove("green-btn-active");
  skipOrNextBtn.classList.add("red-btn-active");
  if (!imgDataLoaded) {
    await loadData();
    createImgsSet();
    imgDataLoaded = true;
  }
  let randInd = Math.floor(Math.random() * imgsSet.length);
  currImg.src = imgsPath + imgsSet[randInd].country + "/" + imgsSet[randInd].file;
  currCountry = imgsSet[randInd].country;
  textbox.value = "";
  textbox.disabled = false;
}

/**
 * Set up event handlers for user input.
 */
function eventHandlingSetup() {
  // stats btn
  statsBtn.addEventListener("click", function(e) {
    window.location.href = "/GeoGuessd/pages/stats.html";
  });

  // input field
  textbox.addEventListener("input", function(e) {
    let input = textbox.value;
    if (input === "") {
      checkBtn.classList.add("inactive-btn");
      checkBtn.classList.remove("white-btn-active");
    } else {
      checkBtn.classList.remove("inactive-btn");
      checkBtn.classList.add("white-btn-active")
    }
  });

  // save session btn
  saveSessionBtn.addEventListener("click", function(e) {
    if (!saveSessionBtn.classList.contains("inactive-btn")) {
      saveSession();
    }
  });

  // reset session btn
  resetSessionBtn.addEventListener("click", function(e) {
    if (!resetSessionBtn.classList.contains("inactive-btn")) {
      resetSession();
    }
  });

  // check btn
  checkBtn.addEventListener("click", function(e) {
    if (!checkBtn.classList.contains("inactive-btn")) {
      checkAnswer(textbox.value);
    }
  });

  // skip/next btn
  skipOrNextBtn.addEventListener("click", function(e) {
    if (skipOrNextBtn.innerText === "Skip") {
      checkAnswer("");
    } else { // next
      if (answers.length === 1) {
        saveSessionBtn.classList.remove("inactive-btn");
        saveSessionBtn.classList.add("green-btn-active")
        resetSessionBtn.classList.remove("inactive-btn");
        resetSessionBtn.classList.add("red-btn-active")
      }
      loadImage();
    }
  });
}

/**
 * Check entered answer.
 * @param answer Answer to check.
 */
function checkAnswer(answer) {
  textbox.disabled = true;
  skipOrNextBtn.innerText = "Next";
  skipOrNextBtn.classList.remove("red-btn-active");
  skipOrNextBtn.classList.add("green-btn-active");
  checkBtn.classList.remove("white-btn-active");
  checkBtn.classList.add("inactive-btn");
  let isCorrect = answer.trim().toLowerCase() === currCountry.trim().toLowerCase();
  answers.push({
    "country" : currCountry,
    "answer" : isCorrect
  });
  textbox.value = currCountry;
  if (isCorrect) {
    correct++;
    textbox.classList.add("correct-ans");
  } else {
    wrong++;
    textbox.classList.add("wrong-ans");
  }
}
function saveSession() { // TODO: implement file loading in app.js, have save session btn
  if (!sessionHistoryLoaded) {
    loadSessionHistory();
    sessionHistoryLoaded = true;
  }

  // save session
  let newEntry = {
    "time" : (new Date()).toJSON(),
    "correct" : correct,
    "wrong" : wrong,
    "answers" : answers
  }
  sessionHistory.unshift(newEntry);
  localStorage.setItem("sessionHistory", JSON.stringify(sessionHistory));

  // reset session
  resetSession();
}

function resetSession() { // TODO: implement file loading in app.js, have save session btn
  answers = [];
  correct = 0;
  wrong = 0;
  saveSessionBtn.classList.remove("green-btn-active")
  saveSessionBtn.classList.add("inactive-btn");
  resetSessionBtn.classList.remove("red-btn-active")
  resetSessionBtn.classList.add("inactive-btn");
  loadImage();
}
