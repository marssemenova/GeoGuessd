# GeoGuessd - A GeoGuessr Trainer
###### CSCI4166 Project Winter 2026

TODO

## Setup

### 1. Download the code
### 2. Download the data

Since I felt it would have created too many dependencies to automate this step with Python
you will have to manually download the dataset, unzip it, and place it in the `/data/images/` folder.
The dataset can be downloaded as a `.zip` from
[here](https://www.kaggle.com/datasets/ubitquitin/geolocation-geoguessr-images-50k?resource=download).
Please make sure you have enough space to unzip it. Once you have unzipped it, move all the folders
in `/archive/compressed_dataset/` to the `/data/images/` folder in the source code. The directory should look
like this when you've done this:

![Source code structure.](img/readme/code_struct.PNG "Source code structure")

# Usage
1. You will need to run a local server to display the webpage. There are many ways to do this but the suggested
method is to use WAMP as this is what was used in development.
2. The homepage will display TODO

# Notes
- Since I had a medical emergency I didn't have quite as much time as I would like to work on
this and I didn't think it would be wise to spend a long time figuring out how to deploy the app properly so
instead I have written a bash script that does what Node.js or a database would have done and saves the info
about the data to a `.json` file. Running it once whenever the data is updated is sufficient.

# Citations
- Some assets taken from [GeoGuessr.com](https://www.geoguessr.com/)
- [Futura PT Font Family](https://font.download/font/futura-pt)
- [Favicon generator](https://realfavicongenerator.net/)

## Icons
- [Back arrow](https://www.flaticon.com/free-icon/back-arrow_3272525?related_id=3272680&origin=search)
- [Next/prev arrow](https://www.flaticon.com/free-icon/back-arrow_11488614?term=left+arrow&page=1&position=41&origin=search&related_id=11488614)
