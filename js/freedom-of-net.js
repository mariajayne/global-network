/**
 * Created by akselreiten on 05/04/16.
 */

//  Will be used to save the loaded JSON data
var allData = [];

//  Set ordinal color scale
var colorScale = d3.scale.category20();

//  Variables for the visualization instances
var barChart;


//  Start application by loading the data
loadData();

function loadData(){
    d3.json("../data/freedom-house/freedom_house_2015.json",function(error,jsonData){
       if(!error){
           allData = jsonData;

           //   Preparing the data
           allData.forEach(function(d){
               d.Total_score = +d.Total_score;
               d.Obstacle_to_access = +d.Obstacle_to_access;
               d.Limits_on_content = +d.Limits_on_content;
               d.Violations_of_user_rights = +d.Violations_of_user_rights;
           });

           //   Create visualization
           createVis();
       }
    });
}

function createVis() {
    barChart = new BarChart("freedom-of-net-barchart",allData);
}

