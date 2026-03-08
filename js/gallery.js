// vars
let country = getUrlVars()["country"].replaceAll("%20", " ");
let imgs = null;
let viewerImg = document.getElementById("curr-img");
let prevBtn = document.getElementById("prev-icon");
let nextBtn = document.getElementById("next-icon");
let curImg = 0;

// call funcs
setCountryName();
loadGallery();

/**
 * Set country name in page heading.
 */
function setCountryName() {
  // page title
  document.title = country + " Gallery";

  // heading
  let countryHeading = document.getElementById("gallery-country");
  countryHeading.innerText = country;
}

/**
 * Load gallery of images.
 */
async function loadGallery() {
  await loadData();
  let galleryContainer = document.getElementById("img-gallery-container");
  imgs = imgsMap.get(country);
  imgs.forEach((img, i) => {
    let newImg = document.createElement("img");
    newImg.src = imgsPath + country + "/" + img;
    newImg.alt = "Image of " + country + ".";
    newImg.classList.add("gallery-img");
    newImg.addEventListener("click", function () {
      console.log("clicked");
      curImg = i;
      updateViewer();
      window.scrollTo(0, 0);
    })
    galleryContainer.appendChild(newImg);
  });
  createViewer();
}

/**
 * Create image viewer.
 */
function createViewer() {
  // set first image
  viewerImg = document.createElement("img");
  document.getElementById("img-viewer").append(viewerImg);
  viewerImg.id = "curr-img";
  viewerImg.src = imgsPath + country + "/" + imgs[curImg];
  viewerImg.alt = "Image of " + country + ".";

  // add event listeners to next/prev btns
  nextBtn.addEventListener("click", function(e) {
    curImg++;
    updateViewer();
  });
  prevBtn.addEventListener("click", function(e) {
    curImg--;
    updateViewer();
  });
}

/**
 * Helper method to change the image in the viewer based on the user's input using the prev
 * and next btns.
 */
function updateViewer() {
  // clamp
  let max = imgs.length - 1;
  if (curImg < 0) {
    curImg = max;
  }
  if (curImg > max) {
    curImg = 0;
  }

  viewerImg.src = imgsPath + country + "/" + imgs[curImg];
}
