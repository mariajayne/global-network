/**
 * Created by akselreiten on 14/04/16.
 */

//  Will be used to save the loaded JSON data
var demographicData = [];
var freedomData = [];
var map = [];

//  Variables for the visualization instances
var gdpChart,
    educationChart,
    employmentChart,
    internetChart,
    freedomOfNetChart,
    freedomOfNetVerticalChart,
    timeline,
    worldMap;

//  Variables for selecting countries on map
var selectedCountries = []
var defaultCountryColor = "gray";
var selectedCountryColor = "white";

function selectCountry(d){
    var country = d.properties.id;
    var countryName = d.properties.admin;
    if (selectedCountries.indexOf(country) != -1){
        selectedCountries.splice(selectedCountries.indexOf(country))
        d3.select("#" + country).style("fill",defaultCountryColor);
        d3.select("#bar-" + countryName).style("fill",defaultCountryColor);
    }
    else{
        selectedCountries.push(country);
        d3.select("#" + country).style("fill",selectedCountryColor);
        d3.select("#bar-" + countryName).style("fill",selectedCountryColor);
    }
    wrangleChartData();
}


// Date parser to convert strings to date objects
var parseDate = d3.time.format("%Y").parse;

function brushed(){
    internetChart.x.domain(timeline.brush.empty() ? timeline.x.domain() : timeline.brush.extent());
    gdpChart.x.domain(timeline.brush.empty() ? timeline.x.domain() : timeline.brush.extent());
    educationChart.x.domain(timeline.brush.empty() ? timeline.x.domain() : timeline.brush.extent());
    employmentChart.x.domain(timeline.brush.empty() ? timeline.x.domain() : timeline.brush.extent());
    wrangleChartData();
}

function wrangleChartData(){
    internetChart.wrangleData();
    gdpChart.wrangleData();
    educationChart.wrangleData();
    employmentChart.wrangleData();
}

//  Start application by loading the data
loadData();

function loadData() {

    queue()
        .defer(d3.json, "../data/demographics/test-demographics-by-year.json")
        .defer(d3.json, "../data/freedom-house/freedom_house_2015.json")
        .defer(d3.json, "../data/demographics/world-topo.json")
        .await(processData);

}

function processData(error,data1,data2,data3){

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

    demographicData.world.forEach(function(d){
        d.years.forEach(function(k){
            k.average_gdp = +k.average_gdp;
            k.total_gdp = +k.total_gdp;
            k.total_internet_usage = +k.total_internet_usage;
            k.year = parseDate(k.year.toString());
        })
    })

    freedomData = data2;
    freedomData.forEach(function(d){
        d.Total_score = +d.Total_score;
        d.Obstacle_to_access = +d.Obstacle_to_access;
        d.Limits_on_content = +d.Limits_on_content;
        d.Violations_of_user_rights = +d.Violations_of_user_rights;
    });

    map = data3;

    createVis();

}

function createVis() {
    $("#freedom-of-net-barchart-vertical").hide(0);
    gdpChart = new LineChart("gdp-chart",demographicData,"gdp");
    educationChart = new LineChart("education-chart",demographicData,"university");
    employmentChart = new LineChart("employment-chart",demographicData,"unemployment");
    internetChart = new LineChart("internet-chart",demographicData,"internet");
    //freedomOfNetChart = new BarChart("freedom-of-net-barchart",freedomData);
    freedomOfNetVerticalChart = new VerticalBarChart("freedom-of-net-barchart-vertical",freedomData);
    timeline = new Timeline("timeline-container",demographicData.world[0],"total_internet_usage");
    worldMap = new WorldMap("world-map",map,demographicData);
}

