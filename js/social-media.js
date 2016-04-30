/**
 * Created by MagnusMoan on 06/04/16.
 */

//  Will be used to save the loaded JSON data
var allData = [];
var platformData = [];
var descriptionText = [];
var platformCountryBreakdown = {};

//  Variables for the visualization instances
var timeLine;

// Transition duration for all animations
var transitionTime = 250;

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
    barChart = new BarChart("social-media-bar-chart", platformCountryBreakdown);
    timeLine = new Timeline("social-media-timeline", platformData, descriptionText);
}

// Function linking the two visualizations. Hovering over a bar will highlight a circle in the timeline.
function showPlatformInfo(platform) {
    timeLine.hoverAction(findPlatformInfo(platform), document.getElementById(platform + "-circle"));
}

// Function linking the two visualizations. Called when mouse stops hovering over a rectangle.
function hidePlatformInfo() {
    timeLine.hoverOutAction();
}

// Helper to find a json object for a specified platform
function findPlatformInfo(platform) {
    for (var i = 0; i < platformData.length; i++) {
        if (platformData[i].Platform == platform) {
            return platformData[i];
        }
    }
    return null;
}

d3.select("#redLegendCircle").append("svg").attr("height", 20).attr("width", 20)
    .append("circle").attr("cx", 13).attr("cy", 12.2).attr("r", 6).attr("fill", "#a31313");
d3.select("#blueLegendCircle").append("svg").attr("height", 20).attr("width", 20)
    .append("circle").attr("cx", 13).attr("cy", 12.2).attr("r", 6).attr("fill", "#0d2e67");
