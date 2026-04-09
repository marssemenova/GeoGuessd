# GeoGuessd - A GeoGuessr Trainer
###### CSCI4166 project Winter 2026

This project implements a visualization of the distribution of images across countries in [GeoGuessr](https://www.geoguessr.com/),
a popular online game where a player tries to determine the exact location an image was taken. This is also accompanied by
a training tool which keeps track of performance and visualizes it.

## Setup

### 1. Download the code
### 2. Download the data

Since I felt it would have created too many dependencies to automate this step
you will have to manually download the dataset, unzip it, and place it in the `/data/images/` folder.
The dataset can be downloaded as a `.zip` from
[here](https://www.kaggle.com/datasets/ubitquitin/geolocation-geoguessr-images-50k?resource=download).
Please make sure you have enough space to unzip it. Once you have unzipped it, move all the folders
in `/archive/compressed_dataset/` to the `/data/images/` folder in the source code. The directory should look
like this when you've done this:

![Source code structure.](img/readme/code_struct.PNG "Source code structure")

# Usage
1. You will need to run a local server to display the webpage. There are many ways to do this but the suggested
method is to use WAMP as this is what was used in development. If for any reason you need to change the prefix of the
application, there is a variable `pathPrefix` at the top of `/js/app.js` may be of use.
2. Open `index.html` to view the homepage.

# Notes
- Since I had a medical emergency I didn't have quite as much time as I would like to work on
this and I didn't think it would be wise to spend a long time figuring out how to deploy the app properly so
instead I have written a bash script that does what Node.js or a database would have done and saves the info
about the data to a `.json` file. Running it once whenever the data is updated is sufficient.
- I omitted some regions (Martinique, Reunion, Svalbard and Jan Mayen) since the map didn't have information for them and it is beyond my capabilities
and the scope of this project for me to add them myself. Some names in the map data have also been changed to match
the folder name for ease of use and may not match the official name.
- Since the highest number of entries is significantly higher than the number of entries for all the other countries
the bar charts are scaled logarithmically and the colour scale uses a threshold scale based on the average number of images per country.
- If you're too lazy to generate your own data (I know I was) I've included an option to replace the session history data saved in local
storage with auto generated dummy data. You can enable this by setting the `debug` variable at the top of `/js/app.js` to `true`. Note that
the reset data button will not work as it will just load in new dummy data.
- You can print the country of the displayed image in the trainer by setting `cheatsEnabled` at the top of `/js/app.js` to `true`

# Citations
- Some assets taken from [GeoGuessr.com](https://www.geoguessr.com/)
- [Futura PT Font Family](https://font.download/font/futura-pt)
- [Favicon generator](https://realfavicongenerator.net/)
- [Map tutorial](https://d3-graph-gallery.com/graph/backgroundmap_basic.html)
- [ne_10m_admin_0_countries.json](https://github.com/martynafford/natural-earth-geojson/tree/master/10m/cultural)
- [Map zoom tutorial](https://observablehq.com/@d3/zoom-to-bounding-box)

## Icons
- [Back arrow](https://www.flaticon.com/free-icon/back-arrow_3272525?related_id=3272680&origin=search)
- [Next/prev arrow](https://www.flaticon.com/free-icon/back-arrow_11488614?term=left+arrow&page=1&position=41&origin=search&related_id=11488614)
- [Placeholder image](https://www.flaticon.com/free-icon/no-pictures_5762943)
