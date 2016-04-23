/**
 * Created by akselreiten on 14/04/16.
 */

//  Global variables: JSON data, Mappings, Flags etc
var demographicData = [];
var freedomData = [];
var internetFreedomData = [];
var map = [];
var countryDigits = []
var countryMapping = {}
var cencorShipFlag = -1;
var cencorshipMapping = {};

//  Variables for the visualization instances
var gdpChart,
    employmentChart,
    internetChart,
    freedomOfNetVerticalChart,
    timeline,
    worldMap;

//  Helper functions
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
var colorScale = d3.scale.category20();
var colorScaleCencorship = {"Free" : '#4daf4a',"Partly Free" : '#377eb8',"Not Free" : '#e41a1c'}

function selectCountry(d){
    if (cencorShipFlag < 0){setColorMapDemographic(d)}
    else{setColorMapCencorship(d)}
}

//  Enables selection of countries in "demographic mode"
function setColorMapDemographic(d){
    var country = d.properties.id;
    if (selectedCountries.indexOf(country) != -1){
        selectedCountries.splice(selectedCountries.indexOf(country))
        d3.select("#" + country).style("fill",defaultCountryColor);
    }else{
        selectedCountries.push(country);
        d3.select("#" + country).style("fill",colorScale(d.properties.id));
    }
    wrangleChartData();
}

//  Enables selection of countries in "cencorship mode"
function setColorMapCencorship(d){
    var country = d.properties.id;
    if (country in cencorshipMapping){
        if (selectedCountries.indexOf(country) != -1){
            selectedCountries.splice(selectedCountries.indexOf(country))
            d3.select("#" + country).style("fill",colorScaleCencorship[cencorshipMapping[d.properties.id]]);
            d3.select("#bar-" + country).style("fill",colorScaleCencorship[cencorshipMapping[d.properties.id]]);
        }else{
            selectedCountries.push(country);
            d3.select("#" + country).style("fill", "white");
            d3.select("#bar-" + country).style("fill","white");
        }
        wrangleChartData();
    }
}

//  Set default colormap when in "cencorship"-mode
function setDefaultColorMapCencorship(){
    freedomData.forEach(function(d){
        d3.select("#" + countryMapping[d.Country])
            .style("fill-opacity",.9)
            .style("fill", colorScaleCencorship[d.Status]);
        cencorshipMapping[countryMapping[d.Country]] = d.Status;
    });
}

//  Set default colors on map when in "demographic mode"
function setDefaultColorMap(){
    demographicData.countries.forEach(function(d){
        if (d.country_id.length == 3){
            d3.select("#" + d.country_id)
                .style("fill-opacity",1)
                .style("fill",defaultCountryColor);
        }
    })
}


function changeView(){
    cencorShipFlag = cencorShipFlag * (-1)
    if (cencorShipFlag > 0){
        setDefaultColorMapCencorship();
        worldMap.updateVisualization();
    };
    if (cencorShipFlag < 0){
        setDefaultColorMap()};
        worldMap.updateVisualization();
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
        .defer(d3.json, "../data/freedom-house/internetFreedomCountries.json")
        .await(processData);

}

function processData(error,data1,data2,data3,data4,data5){

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

    internetFreedomData = data5;
    internetFreedomData.forEach(function(d){d.internet2014 = +d.internet2014;});

    createVis();

}

function createVis() {
    $("#freedom-of-net-barchart-vertical").hide(0);
    gdpChart = new LineChart("gdp-chart",demographicData,"gdp");
    employmentChart = new LineChart("employment-chart",demographicData,"unemployment");
    internetChart = new LineChart("internet-chart",demographicData,"internet");
    //freedomOfNetChart = new BarChart("freedom-of-net-barchart",freedomData);
    freedomOfNetVerticalChart = new VerticalBarChart("freedom-of-net-barchart-vertical",freedomData,internetFreedomData);
    timeline = new Timeline("timeline-chart",demographicData.world,"total_internet_users");
    worldMap = new WorldMap("world-map",map,freedomData);
}

