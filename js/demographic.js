/**
 * Created by akselreiten on 14/04/16.
 */

//  Will be used to save the loaded JSON data
var demographicData = [];
var freedomData = [];
var map = [];
var countryDigits = []
var countryMapping = {}
var cencorShipFlag = -1;

//  Variables for the visualization instances
var gdpChart,
    educationChart,
    employmentChart,
    internetChart,
    freedomOfNetChart,
    freedomOfNetVerticalChart,
    timeline,
    worldMap;


//  Formating functions
var formatValue = d3.format(".2s");
var formatPercent = d3.format(".00%");
var formatYear = d3.time.format("%Y");
var bisectDate = d3.bisector(function(d) {return d.year; }).left;

function formatYLabel(point, metric){
    if (metric == 'gdp' || 'total_internet_users'){return formatValue(point)}
    else if (metric == 'internet' || 'unemployment' || 'university'){return formatPercent(point/100)}
}

//  Variables for selecting countries on map
var selectedCountries = ["WLD"]
var defaultCountryColor = "gray";
var selectedCountryColor = "white";
var colorScale = d3.scale.category20();
var colorScaleCencorship = {"Free" : '#4daf4a',"Partly Free" : '#377eb8',"Not Free" : '#e41a1c'}

/*function selectCountry(d){
    var country = d.properties.id;
    var countryName = d.properties.admin;
    if (selectedCountries.indexOf(country) != -1){
        selectedCountries.splice(selectedCountries.indexOf(country))
        d3.select("#" + country).style("fill",defaultCountryColor);
        d3.select("#bar-" + countryName).style("fill",defaultCountryColor);
    }
    else{
        selectedCountries.push(country);
        d3.select("#" + country).style("fill",function(d){return colorScale(d.properties.id)});
        d3.select("#bar-" + countryName).style("fill",selectedCountryColor);
    }
    wrangleChartData();
}*/

function selectCountry(d){
    if (cencorShipFlag < 0){setColorMapDemographic(d)}
    else{setColorMapCencorShip(d)}
}

function setColorMapDemographic(d){
    var country = d.properties.id;
    var countryName = d.properties.admin;
    if (selectedCountries.indexOf(country) != -1){
        selectedCountries.splice(selectedCountries.indexOf(country))
        d3.select("#" + country).style("fill",defaultCountryColor);
    }else{
        selectedCountries.push(country);
        d3.select("#" + country).style("fill",function(d){return colorScale(d.properties.id)});
    }
    wrangleChartData();
}

function setColorMapCencorShip(){
    freedomData.forEach(function(d){
        d3.select("#" + countryMapping[d.Country]).style("fill", colorScaleCencorship[d.Status]);
    });
}

function setDefaultColorMap(){
    demographicData.countries.forEach(function(d){
        if (d.country_id.length == 3){
            d3.select("#" + d.country_id).style("fill",defaultCountryColor);
        }

    })
}

function changeView(){
    cencorShipFlag = cencorShipFlag * (-1)
    if (cencorShipFlag > 0){setColorMapCencorShip()};
    if (cencorShipFlag < 0){setDefaultColorMap()};
    if ($("#internet-chart").is(":visible")){
        $("#col3").insertBefore("#col2");
        $("#internet-chart").hide(0);
        $("#gdp-chart").hide(0);
        $("#employment-chart").hide(0);
        $("#timeline-chart").hide(0);
        $("#freedom-of-net-barchart-vertical").show(0);
    }else{
        $("#col2").insertBefore("#col3");
        $("#internet-chart").show(0);
        $("#gdp-chart").show(0);
        $("#employment-chart").show(0);
        $("#timeline-chart").show(0);
        $("#freedom-of-net-barchart-vertical").hide(0);
    }
}

// Date parser to convert strings to date objects
var parseDate = d3.time.format("%Y").parse;

function brushed(){
    internetChart.x.domain(timeline.brush.empty() ? timeline.x.domain() : timeline.brush.extent());
    gdpChart.x.domain(timeline.brush.empty() ? timeline.x.domain() : timeline.brush.extent());
    employmentChart.x.domain(timeline.brush.empty() ? timeline.x.domain() : timeline.brush.extent());
    wrangleChartData();
}

function wrangleChartData(){
    internetChart.wrangleData();
    gdpChart.wrangleData();
    //educationChart.wrangleData();
    employmentChart.wrangleData();
}

//  Start application by loading the data
loadData();

function loadData() {

    queue()
        .defer(d3.json, "../data/demographics/worldDataComplete.json")
        .defer(d3.json, "../data/freedom-house/freedom_house_2015.json")
        .defer(d3.json, "../data/demographics/world-topo.json")
        .defer(d3.json, "../data/freedom-house/countryMapping.json")
        .await(processData);

}

function processData(error,data1,data2,data3,data4){

    demographicData = data1;
    demographicData.countries.forEach(function(d){
        if (d.country_id.length == 3) {
            countryDigits.push(d.country_id)
        }
        d.years.forEach(function(k){
            k.gdp = +k.gdp;
            k.unemployment = +k.unemployment;
            k.internet = +k.internet;
            k.year = parseDate(k.year.toString());
        })
    });

    demographicData.world.years.forEach(function(k){
        k.gdp = +k.gdp;
        k.unemployment = +k.unemployment;
        k.internet = +k.internet;
        k.year = parseDate(k.year.toString());
    })

    freedomData = data2;
    freedomData.forEach(function(d){
        d.Total_score = +d.Total_score;
        d.Obstacle_to_access = +d.Obstacle_to_access;
        d.Limits_on_content = +d.Limits_on_content;
        d.Violations_of_user_rights = +d.Violations_of_user_rights;
    });

    map = data3;

    countryMapping = data4;

    //  Modify colorScale
    colorScale["WLD"] = "gray"

    createVis();

}

function createVis() {
    $("#freedom-of-net-barchart-vertical").hide(0);
    gdpChart = new LineChart("gdp-chart",demographicData,"gdp");
    employmentChart = new LineChart("employment-chart",demographicData,"unemployment");
    internetChart = new LineChart("internet-chart",demographicData,"internet");
    //freedomOfNetChart = new BarChart("freedom-of-net-barchart",freedomData);
    freedomOfNetVerticalChart = new VerticalBarChart("freedom-of-net-barchart-vertical",freedomData);
    timeline = new Timeline("timeline-chart",demographicData.world,"total_internet_users");
    worldMap = new WorldMap("world-map",map);
}

