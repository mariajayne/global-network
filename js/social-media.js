/**
 * Created by MagnusMoan on 06/04/16.
 */

//  Will be used to save the loaded JSON data
var allData = [];

//  Set ordinal color scale
var colorScale = d3.scale.category20();

//  Variables for the visualization instances
var timeLine;

// Date parser
var dateFormat = d3.time.format("%m.%d.%Y").parse;


//  Start application by loading the data
loadData();

function loadData(){
    d3.json("../data/social-media/social-media-users.json",function(error,jsonData){
        if(!error){
            allData = jsonData;
            console.log(allData);

            //   Preparing the data
            allData.forEach(function(d){
                d.Date = dateFormat(d.Date);
            });

            //   Create visualization
            createVis();
        }
    });
}

function createVis() {
    timeLine = new Timeline("social-media-timeline", allData);
}