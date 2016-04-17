/**
 * Created by MagnusMoan on 06/04/16.
 */

//  Will be used to save the loaded JSON data
var allData = [];
var platformData = [];
var countryData = [];
var platformCountryBreakdown = {};

//  Set ordinal color scale
var colorScale = d3.scale.category20();

//  Variables for the visualization instances
var timeLine;

// Date parser
var dateFormat = d3.time.format("%m-%d-%Y").parse;

//  Start application by loading the data
loadData();

function loadData(){
    d3.json("../data/social-media/social-network-users.json",function(error,jsonData){
        if(!error){
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

            console.log(countryData);
            console.log(platformCountryBreakdown);

            //   Create visualization
            createVis();
        }
    });
}

function createVis() {
    timeLine = new Timeline("social-media-timeline", platformData);
    barChart = new BarChart("social-media-bar-chart", countryData, platformCountryBreakdown);
}

function selectPlatform(platform) {
   barChart.chosen = false;
   barChart.current = platform;
   barChart.updateVis();
}