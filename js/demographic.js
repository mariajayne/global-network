/**
 * Created by akselreiten on 14/04/16.
 */

//  Will be used to save the loaded JSON data
var allData = [];

//  Set ordinal color scale
var colorScale = d3.scale.category20();

//  Variables for the visualization instances
var gdpChart,
    educationChart,
    employmentChart,
    internetChart;

// Date parser to convert strings to date objects
var parseDate = d3.time.format("%Y").parse;

//  Start application by loading the data
loadData();

function loadData(){
    d3.json("../data/demographics/demographics-by-year.json",function(error,csvData){
        if(!error){

            //  Saving data to global variable
            allData = csvData;

            //  Preprosessing data
            allData.countries.forEach(function(d){
                d.years.forEach(function(k){
                    k.gdp = +k.gdp;
                    k.unemployment = +k.unemployment;
                    k.university = +k.university;
                    k.water = +k.water;
                    k.internet = +k.internet;
                    k.year = parseDate(k.year.toString());
                })
            });
        }

        //   Create visualization
        createVis();

    });
}

function createVis() {
    gdpChart = new GDPChart("gdp-chart",allData);
    //internetChart = new InternetChart("internet-chart",allData);
}

