/**
 * Created by akselreiten on 14/04/16.
 */

///////////////////////////////////////////
/////////     Main          ///////////////
/////////     Controller    ///////////////
///////////////////////////////////////////

//  Will be used to save the loaded JSON data
var allData = [];

//  Set ordinal color scale
var colorScale = d3.scale.category20();

//  Variables for the visualization instances
var gdpChart,
    educationChart,
    employmentChart,
    internetChart;


//  Start application by loading the data
loadData();

function loadData(){
    d3.csv("../data/demographicData.csv",function(error,csvData){
        if(!error){
            allData = csvData;

            //   Preparing the data
            allData.forEach(function(d){
                console.log(d.country)

            });

            //   Create visualization

        }
    });
}

function processData(){

}

function createVis() {
    gdpChart = new GDPChart("gdp-chart",allData);
}

