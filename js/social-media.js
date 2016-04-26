/**
 * Created by MagnusMoan on 06/04/16.
 */

//  Will be used to save the loaded JSON data
var allData = [];
var platformData = [];
var countryData = [];
var descriptionText = [];
var platformCountryBreakdown = {};

//  Set ordinal color scale
var colorScale = d3.scale.category20();

//  Variables for the visualization instances
var timeLine;

// Date parser
var dateFormat = d3.time.format("%m-%d-%Y").parse;

//  Start application by loading the data
loadData();

function loadData() {

    queue()
        .defer(d3.json, "../data/social-media/social-network-users.json")
        .defer(d3.json, "../data/social-media/descriptionText.json")
        .await(processData);
}

function processData(error, jsonData, textData){
    if(!error){
        descriptionText = textData;
        allData = jsonData;
        platformData = allData.Platform;
        countryData = allData.Country;
        platformCountryBreakdown = allData.PlatformPercent;

        //   Preparing the data
        platformData.forEach(function(d){
            d.Date = dateFormat(d.Date);
            d.Msg = (d.Msg === "true");
        });

        platformData.sort(function(a,b) {
            return b.Current_size - a.Current_size;
        });

        //   Create visualization
        createVis();
    } else {
        console.log(error);
    }
}

function createVis() {
    barChart = new BarChart("social-media-bar-chart", countryData, platformCountryBreakdown);
    timeLine = new Timeline("social-media-timeline", platformData, descriptionText);
}

function selectPlatform(platform) {
   barChart.chosen = false;
   barChart.current = platform;
   barChart.updateVis();
}


