// vars
let country = getUrlVars()["country"].replaceAll("%20", " ");
let imgs = null;
let imgViewer = document.getElementById("curr-img");
let prevBtn = document.getElementById("prev-icon");
let nextBtn = document.getElementById("next-icon");
let currImg = 0;

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
      currImg = i;
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
  imgViewer.src = imgsPath + country + "/" + imgs[currImg];
  imgViewer.alt = "Image of " + country + ".";

  // add event listeners to next/prev btns
  nextBtn.addEventListener("click", function(e) {
    currImg++;
    updateViewer();
  });
  prevBtn.addEventListener("click", function(e) {
    currImg--;
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
  if (currImg < 0) {
    currImg = max;
  }
  if (currImg > max) {
    currImg = 0;
  }

  imgViewer.src = imgsPath + country + "/" + imgs[currImg];
}
