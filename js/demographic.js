/**
 * Created by akselreiten on 14/04/16.
 */

//  Will be used to save the loaded JSON data
var demographicData = [];
var freedomData = [];

//  Variables for the visualization instances
var gdpChart,
    educationChart,
    employmentChart,
    internetChart,
    freedomOfNetChart;

// Date parser to convert strings to date objects
var parseDate = d3.time.format("%Y").parse;

//  Start application by loading the data
loadData();

function loadData() {

    queue()
        .defer(d3.json, "../data/demographics/demographics-by-year.json")
        .defer(d3.json, "../data/freedom-house/freedom_house_2015.json")
        .await(processData);

}

function processData(error,data1,data2){

    demographicData = data1;
    demographicData.countries.forEach(function(d){
        d.years.forEach(function(k){
            k.gdp = +k.gdp;
            k.unemployment = +k.unemployment;
            k.university = +k.university;
            k.water = +k.water;
            k.internet = +k.internet;
            k.year = parseDate(k.year.toString());
        })
    });

    freedomData = data2;
    freedomData.forEach(function(d){
        d.Total_score = +d.Total_score;
        d.Obstacle_to_access = +d.Obstacle_to_access;
        d.Limits_on_content = +d.Limits_on_content;
        d.Violations_of_user_rights = +d.Violations_of_user_rights;
    });

    createVis();

}

function createVis() {
    gdpChart = new LineChart("gdp-chart",demographicData,"gdp");
    educationChart = new LineChart("education-chart",demographicData,"university");
    employmentChart = new LineChart("employment-chart",demographicData,"unemployment");
    internetChart = new LineChart("internet-chart",demographicData,"internet");
    //freedomOfNetChart = new BarChart("freedom-of-net-barchart",freedomData);
}

