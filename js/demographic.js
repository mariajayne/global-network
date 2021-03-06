/**
 * Created by akselreiten on 14/04/16.
 */

//  Global variables: JSON data, Mappings, Flags etc
var demographicData = [];
var freedomData = [];
var internetFreedomData = [];
var map = [];
var countryDigits = [];
var countryMapping = {};
var cencorShipFlag = -1;
var cencorshipMapping = {};
var timerYear;

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
var bisectDate = d3.bisector(function(d) {
    return d.year;
}).left;
var parseDate = d3.time.format("%Y").parse;

function formatYLabel(point, metric) {
    if (metric == 'gdp' || 'total_internet_users') {
        return formatValue(point)
    } else if (metric == 'internet' || 'unemployment' || 'university') {
        return formatPercent(point / 100)
    }
}

//  Variables for selecting countries on map
var selectedCountries = ["WLD"]
var defaultCountryColor = "gray";
var colorScale = d3.scale.category20();
var colorScaleCencorship = {
    "Free": '#4daf4a',
    "Partly Free": '#377eb8',
    "Not Free": '#e41a1c'
}
var colorScaleInternetAccess = {
    "100%": '#4d94ff',
    "75%": 'rgba(77, 148, 255, 0.75)',
    "50%": 'rgba(77, 148, 255, 0.5)',
    "25%": 'rgba(77, 148, 255, 0.25)',
    "10%": 'rgba(77, 148, 255, 0.1)',
    "0%": '#fff',
    "No data" : 'lightgray'
}

function selectCountry(d) {
    if (cencorShipFlag < 0) {
        setColorMapDemographic(d);
    } else {
        setColorMapCencorship(d);
    }
}

//  Enables selection of countries in "demographic mode"
function setColorMapDemographic(d) {
    var colorInfo = worldMap.countryColor(),
        country = d.properties.id;
    if (selectedCountries.indexOf(country) != -1) {
        selectedCountries.splice(selectedCountries.indexOf(country), 1);
        for (var i in colorInfo) {
            if (country == i) {
                d3.select("#" + country).style("fill", colorInfo[i]);
            }
        }
    } else {
        selectedCountries.push(country);
        d3.select("#" + country).style("fill", colorScale(d.properties.id));
    }
    wrangleChartData();
}

//  Enables selection of countries in "cencorship mode"
function setColorMapCencorship(d) {
    var country = d.properties.id;
    if (country in cencorshipMapping) {
        if (selectedCountries.indexOf(country) != -1) {
            selectedCountries.splice(selectedCountries.indexOf(country), 1);
            d3.select("#" + country).style("fill", colorScaleCencorship[cencorshipMapping[d.properties.id]]);
            d3.select("#bar-" + country).style("fill", colorScaleCencorship[cencorshipMapping[d.properties.id]]);
        } else {
            selectedCountries.push(country);
            d3.select("#" + country).style("fill", "orange");
            d3.select("#bar-" + country).style("fill","orange");
        }
        wrangleChartData();
    }
}

//  Set default colormap when in "cencorship"-mode
function setDefaultColorMapCencorship() {
    d3.select("#COD").style("fill", "gray");
    d3.select("#ROU").style("fill", "gray");
    d3.select("#SDS").style("fill", "gray");
    d3.select("#SOL").style("fill", "gray");
    d3.select("#KOS").style("fill", "gray");
    d3.select("#SAH").style("fill", "gray");
    d3.select("#TWN").style("fill", "gray");
    d3.select("#TLS").style("fill", "gray");
    setDefaultColorMap();
    freedomData.forEach(function(d) {
        d3.select("#" + countryMapping[d.Country])
            .style("fill-opacity", .9)
            .style("fill", colorScaleCencorship[d.Status]);
        cencorshipMapping[countryMapping[d.Country]] = d.Status;
    });
}

//  Set default colors on map when in "demographic mode"
function setDefaultColorMap() {
    demographicData.countries.forEach(function(d) {
        if (d.country_id.length == 3) {
            d3.select("#" + d.country_id)
                .style("fill-opacity", 1)
                .style("fill", defaultCountryColor);
        }
    })
}

//  Changes view between Demographic mode and cencorship mode
function changeView() {
    if (d3.select('#anim-playing').html() == "stopped") {
        cencorShipFlag = cencorShipFlag * (-1);
        worldMap.updateVisualization();
        if (cencorShipFlag > 0) {
            setDefaultColorMapCencorship();
        }
        if (cencorShipFlag < 0) {
            worldMap.sequenceMap();
        }
        if ($("#freedom-of-net-barchart").is(":visible") == false) {
            timerYear = d3.select('#clock').html();
            $("#playbutton").hide(0);
            $("#slider").hide(0);
            d3.select('#clock').html("2014");
            $("#container-demographics").hide();
            $(".container-cencorship").show();
            $("#freedom-of-net-barchart").show(0);
            $("#btn-cencorship").css("background-color","black");
            $("#btn-cencorship").css("color","white");
            $("#btn-demographics").css("background-color","white");
            $("#btn-demographics").css("color","black");
        } else {
            $("#playbutton").show(0);
            $("#slider").show(0);
            d3.select('#clock').html(timerYear);
            $("#container-demographics").show();
            $(".container-cencorship").hide();
            $("#freedom-of-net-barchart").hide(0);
            $("#btn-cencorship").css("background-color","white");
            $("#btn-cencorship").css("color","black");
            $("#btn-demographics").css("background-color","black");
            $("#btn-demographics").css("color","white");
        }
    }
}

function brushed() {
    internetChart.x.domain(timeline.brush.empty() ? timeline.x.domain() : timeline.brush.extent());
    gdpChart.x.domain(timeline.brush.empty() ? timeline.x.domain() : timeline.brush.extent());
    employmentChart.x.domain(timeline.brush.empty() ? timeline.x.domain() : timeline.brush.extent());
    wrangleChartData();
}

function wrangleChartData() {
    internetChart.wrangleData();
    gdpChart.wrangleData();
    employmentChart.wrangleData();
}

function triggerLineChartToolTip(d){

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

function processData(error, data1, data2, data3, data4, data5) {

    demographicData = data1;
    demographicData.countries.forEach(function(d) {
        if (d.country_id.length == 3) {
            countryDigits.push(d.country_id)
        }
        d.years.forEach(function(k) {
            k.gdp = +k.gdp;
            k.unemployment = +k.unemployment;
            k.internet = +k.internet;
            k.year = parseDate(k.year.toString());
        })
    });

    demographicData.world.years.forEach(function(k) {
        k.gdp = +k.gdp;
        k.unemployment = +k.unemployment;
        k.internet = +k.internet;
        k.year = parseDate(k.year.toString());
    })

    freedomData = data2;
    freedomData.forEach(function(d) {
        d.Total_score = +d.Total_score;
        d.Obstacle_to_access = +d.Obstacle_to_access;
        d.Limits_on_content = +d.Limits_on_content;
        d.Violations_of_user_rights = +d.Violations_of_user_rights;
    });

    map = data3;

    countryMapping = data4;

    internetFreedomData = data5;
    internetFreedomData.forEach(function(d) {
        d.internet2014 = +d.internet2014;
    });

    createVis();

}

function createVis() {
    gdpChart = new LineChart("gdp-chart",demographicData,"gdp");
    employmentChart = new LineChart("employment-chart",demographicData,"unemployment");
    internetChart = new LineChart("internet-chart",demographicData,"internet");
    freedomOfNetChart = new BarChart("freedom-of-net-barchart",freedomData,internetFreedomData);
    timeline = new Timeline("timeline-chart",demographicData.world,"total_internet_users");
    worldMap = new WorldMap("world-map",map,freedomData,demographicData);
}


function mouseMoveAllGraphs(vis) {
    gdpChart.mouseMove(vis);
    employmentChart.mouseMove(vis);
    internetChart.mouseMove(vis);
}

function mouseOverAll() {
    gdpChart.focus.style("display",null);
    employmentChart.focus.style("display",null);
    internetChart.focus.style("display",null);
}

function mouseOutAll() {
    gdpChart.focus.style("display","none");
    employmentChart.focus.style("display","none");
    internetChart.focus.style("display","none");
}
