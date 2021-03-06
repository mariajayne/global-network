/**
 * Created by akselreiten on 17/04/16.
 */

var legend_box_h = 100;
var legend_box_w = 100;
var cencorshipLabels = ["Free", "Partly Free", "Not Free", "No data"]

var cencorshipMapping = {
    "#4daf4a": "Free",
    "#377eb8": "Partly Free",
    "#e41a1c": "Not Free"
}

// labels for default map legend
var internetAccessLabels = ["100%", "75%", "50%", "25%", "10%","0%", "No data"]

// attribute array of years for quick access of each year's percentages
var attributeArray = ["1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998", "1999", "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014"];

// Global variables, flags, etc.
var currentAttribute = 0,
    currentYear = -2,
    countries,
    dataRange,
    playing = false,
    reachedEnd = true,
    percentage,
    pattern;

WorldMap = function(_parentElement, _mapData, _freedomData, _demographicData) {
    this.parentElement = _parentElement;
    this.mapData = _mapData;
    this.freedomData = _freedomData;
    this.demographicData = _demographicData;
    this.displayData = this.data;
    this.initVis();
}

WorldMap.prototype.initVis = function() {

    var vis = this;

    vis.margin = {
        top: 0,
        right: 20,
        bottom: 0,
        left: 20
    };
    vis.width = $( document ).width() * 2/3.1 - vis.margin.left - vis.margin.right;
    vis.height = 550 - vis.margin.top - vis.margin.bottom;

    function zoom() {
        vis.svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .call(d3.behavior.zoom().scaleExtent([1, 6]).on("zoom", zoom))
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
        .append("g");

    vis.projection = d3.geo.mercator()
        .center([15, 45])
        .scale(130)
        .translate([vis.width / 2, vis.height / 2]);

    vis.path = d3.geo.path()
        .projection(vis.projection);

    /* Add rectangles for choosing view
    vis.rectDemographics = vis.svg.append("rect")
        .attr("x", vis.width/2 - 30)
        .attr("y", vis.height * 0.95)
        .attr("class", "btn-dashboard")
        .attr("id", "btn-demographics")
        .attr("width", 100)
        .attr("height", 23)
        .style("fill","yellow")
        .on("click",changeView);*/

    //	Tooltip
    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([0, 0])
        .html(function(d) {
            return d.properties.admin;
        });

    // striped pattern for countries with no data
    pattern = vis.svg.append("pattern")
        .attr({
            id: "no_information",
            width: "4",
            height: "8",
            patternUnits: "userSpaceOnUse",
            patternTransform: "rotate(55)"
        })
        .append("rect")
        .attr({
            width: "3",
            height: "8",
            fill: "lightgray"
        });

    // position clock and button based on screen size
    document.getElementById('clock').setAttribute("style",
                                        "margin-left:" + vis.width / 2 + "px");
    document.getElementById('playbutton').setAttribute("style",
                                        "margin-left:" + vis.width * 0.43 +
                                        "px; " + "margin-top:" +
                                        vis.height * 0.4 + "px");

    vis.processData();
    vis.sequenceMap();
    vis.animateMap();
    vis.mapSlider();
}

WorldMap.prototype.processData = function() {
    var vis = this;
    var countryData = this.demographicData.countries;
    countries = this.mapData.objects.countries.geometries;
    // for each geometry object
    for (var i in countries) {
        for (var j in countryData) {
            // where the ids match
            if (countries[i].properties.id == countryData[j].country_id) {
                for (var y = 0; y < 24; y++) {
                    for (var k in countryData[i].years[y]) {
                        // don't add extraneous props
                        if (k != 'country' && k != 'country_id' && k != 'gdp' && k != 'internet' && k != 'labor_force' && k != 'population' && k != 'unemployment' && k != "total_internet_users") {
                            // add each year/percentage pair as a key/value to geometry object
                            countries[i].properties[countryData[j].years[y].year.getFullYear()] = Number(countryData[j].years[y].internet);
                        }
                    }
                }
                break;
            }
        }
    }

    // populate the clock initially with the current year
    d3.select('#clock').html(attributeArray[attributeArray.length - 1]);
    // create the map now with our newly populated data object
    vis.createVisualization();
}

WorldMap.prototype.createVisualization = function() {
    currentYear = attributeArray[attributeArray.length - 1];
    currentAttribute = attributeArray.length - 1;
    var vis = this;
    vis.world = topojson.feature(vis.mapData, vis.mapData.objects.countries).features;
    vis.svg.call(vis.tip);

    vis.svg.selectAll("path")
        .data(vis.world)
        .enter().append("path")
        .attr("d", vis.path)
        .attr("class", "projection")
        .attr("class", "country")
        .attr("id", function(d) {
            return "" + d.properties.id;
        })
        .style("stroke", "white")
        .style("stroke-width", .3)
        .on("click", selectCountry)
        .on('mousemove', function(d, i) {
            if (d.properties[attributeArray[currentAttribute]] !== undefined && !isNaN(d.properties[attributeArray[currentAttribute]])) {
                percentage = (d.properties[attributeArray[currentAttribute]]).toFixed(2) + "%";
            } else {
                percentage = "No data available";
            }
            if (cencorShipFlag < 0) {
                vis.tip.html(d.properties.admin + "<br> Internet Usage (" + currentYear + "): " + percentage);
            } else {
                if (d.properties[2014] !== undefined && !isNaN(d.properties[2014])) {
                    percentage = (d.properties[2014]).toFixed(2) + "%";
                } else {
                    percentage = "No data available";
                }
                vis.tip.html(d.properties.admin + "<br> Internet Usage (2014): " + percentage)
            }
            vis.tip.show(d);

        })
        .on('mouseout', vis.tip.hide);

    // Remove Antarctica
    vis.svg.select("#ATA").remove();

    d3.select('#anim-playing').html("stopped");
    this.updateVisualization();
}

WorldMap.prototype.sequenceMap = function() {
    var vis = this;

    d3.selectAll('.country')
        .style('fill', function(d) {
            return getColor(d.properties[attributeArray[currentAttribute]]);
        });
}

function getColor(valueIn) {
    var vis = this;
    var color = d3.scale.linear()
        .domain([0, 100])
        .range([0.1, 1]);
    if (valueIn !== undefined && !isNaN(valueIn)) {
        // return fill color with desired opacity
        return 'rgba(77, 148, 255, ' + color(valueIn) + ')';
    } else {
        // return striped pattern for undefined or NaN values
        return "url(#no_information)";
    }
}

WorldMap.prototype.countryColor = function() {
    var vis = this,
        colorsData =
        topojson.feature(vis.mapData, vis.mapData.objects.countries).features;
    var countryColors = {};
    colorsData.forEach(function(d) {
        countryColors[d.properties.id] = getColor(d.properties[attributeArray[currentAttribute]]);
    });
    return countryColors;
}

WorldMap.prototype.animateMap = function() {
    var timer, endSlider = false,
        vis = this,
        animation;

    d3.select('#playbutton')
        .on('click', function() {
            playing = !playing;
            animation = playing ? 'stop' : 'play';
            $('#animate_to_' + animation).get(0).beginElement();
            if (playing) {
                d3.select('#anim-playing').html("playing");
                d3.select('#cencorship').disabled = true;
            }
            else {
                d3.select('#anim-playing').html("stopped");
                d3.select('#cencorship').disabled = false;
            }
            setTimeout(function periodicFunc() {
                if (reachedEnd && playing) {
                    currentAttribute = -1;
                }
                if (playing && (currentAttribute < attributeArray.length - 1)) {
                    reachedEnd = false;
                    currentAttribute++;
                    currentYear = attributeArray[currentAttribute];

                    d3.selectAll('.country')
                        .transition()
                        .duration(700)
                        .style('fill', function(d) {
                            return getColor(d.properties[attributeArray[currentAttribute]]);
                        });

                    d3.select('#clock').html(currentYear);
                    vis.mapSlider();
                    setTimeout(periodicFunc, 700);
                } else {
                    if (currentAttribute >= attributeArray.length - 1) {
                        vis.sequenceMap();
                    }
                    if ((currentAttribute == attributeArray.length - 1) && playing) {
                        playing = false;
                        animation = 'play';
                        $('#animate_to_' + animation).get(0).beginElement();
                        reachedEnd = true;
                        d3.select('#anim-playing').html("stopped");
                    }
                }
            }, 1000);
        });
}

WorldMap.prototype.mapSlider = function() {
    var minYear = 1991,
        maxYear = 2014;

    var yearSlider = d3.slider()
        .axis(true).min(minYear).max(maxYear).step(1)
        .on("slide", function(evt, value) {
            if (value % 1 === 0) {
                for (var i = 0; i < attributeArray.length; i++) {
                    if (value == attributeArray[i]) {
                        currentAttribute = i;
                    }
                }
                currentYear = attributeArray[currentAttribute];
                d3.select('#clock').html(currentYear);

                d3.selectAll('.country')
                    .transition()
                    .duration(700)
                    .style('fill', function(d) {
                        return getColor(d.properties[currentYear]);
                    });
            }
        });

    d3.select("#slider").call(yearSlider);

    if (yearSlider.value() != undefined) {
        yearSlider.destroy();
    }
    yearSlider.value(d3.select('#clock').html());
    d3.select("#slider").call(yearSlider);
}

WorldMap.prototype.updateVisualization = function() {

    var vis = this;
    var legendList;

    //  Append legend only if cencorshipflag is on
    if (cencorShipFlag > 0) {
        legendList = [colorScaleCencorship["Free"], colorScaleCencorship["Partly Free"], colorScaleCencorship["Not Free"], "gray"]
    } else {
        legendList = [colorScaleInternetAccess["100%"], colorScaleInternetAccess["75%"],
            colorScaleInternetAccess["50%"], colorScaleInternetAccess["25%"],
            colorScaleInternetAccess["10%"], colorScaleInternetAccess["0%"],
            "lightgray"
        ];
    }

    var legendContainer = vis.svg.selectAll('g')
        .data(legendList);

    var legend = legendContainer.enter().append("g");
    legend.append("rect");
    legend.append("text");

    legendContainer.select("rect")
        .attr("x", function(d, i) {
            if (cencorShipFlag > 0)
                return 10;
            return 5;
        })
        .attr("y", function(d, i) {
            if (cencorShipFlag > 0)
                return vis.height * 3 / 4 + i * 20;
            return vis.height * 3/4 + i * 20;
        })
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", function(d) {
            return d;
        });

    legendContainer.select("text")
        .attr("x", function(d) {
            if (cencorShipFlag > 0)
                return 40;
            return 35;
        })
        .attr("y", function(d, i) {
            if (cencorShipFlag > 0)
                return 12 + vis.height * 3 / 4 + i * 20;
            return 12 + vis.height * 3/4 + i * 20;
        })
        .style("fill", function(d) {
            if (cencorShipFlag > 0)
                return d;
            return '#000';
        })
        .text(function(d, i) {
            if (cencorShipFlag > 0)
                return cencorshipLabels[i];
            return internetAccessLabels[i];
        });

    legendContainer.exit().remove();
}
