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

var attributeArray = ["1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998", "1999", "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014"];
var currentAttribute = 0,
    currentYear = 2014,
    // attributeArray = [],
    countries,
    dataRange,
    playing = false,
    percentage;

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
    vis.width = 800 - vis.margin.left - vis.margin.right;
    vis.height = 450 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.projection = d3.geo.mercator()
        .center([15, 45])
        .scale(100)
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

    this.processData();

}

WorldMap.prototype.processData = function() {
    var countryData = this.demographicData.countries;
    console.log(countryData);
    // function accepts any errors from the queue function as first argument, then
    // each data object in the order of chained defer() methods above
    countries = this.mapData.objects.countries.geometries; // store the path in variable for ease
    console.log(countryData[0].years[0].year.getFullYear());
    for (var i in countries) { // for each geometry object
        for (var j in countryData) {
            // console.log(countryData[j]);
            if (countries[i].properties.id == countryData[j].country_id) { // if they match
                for (var y = 0; y < 24; y++) {
                    for (var k in countryData[i].years[y]) { // for each column in the a row within the CSV
                        if (k != 'country' && k != 'country_id' && k != 'gdp' && k != 'internet' && k != 'labor_force' && k != 'population' && k != 'unemployment' && k != "total_internet_users") { // let's not add the name or id as props since we already have them
                            // if (attributeArray.indexOf(k) == -1) {
                            //   attributeArray.push('year'.getFullYear()); // add new column headings to our array for later
                            // }
                            countries[i].properties[countryData[j].years[y].year.getFullYear()] = Number(countryData[j].years[y].internet); // add each CSV column key/value to geometry object
                        }
                    }
                }
                break;
            }
        }
    }
    console.log(attributeArray);
    d3.select('#clock').html(attributeArray[currentAttribute]); // populate the clock initially with the current year
    this.createVisualization(); // let's mug the map now with our newly populated data object
}

WorldMap.prototype.createVisualization = function() {
    var vis = this;
    vis.world = topojson.feature(vis.mapData, vis.mapData.objects.countries).features;
    vis.svg.call(vis.tip);
    console.log(vis.world);

    vis.svg.selectAll("path")
        .data(vis.world)
        .enter().append("path")
        .attr("d", vis.path)
        .attr("class", "projection")
        .attr("class", "country")
        .attr("id", function(d) {
            return "" + d.properties.id;
        })
        .style("fill", "#4d94ff")
        .style("stroke", "white")
        .style("stroke-width", .3)
        .on("click", selectCountry)
        .on('mouseover', function(d, i) {
            console.log(d.properties[attributeArray[currentAttribute]]);
            if (d.properties[attributeArray[currentAttribute]] !== undefined
                && !isNaN(d.properties[attributeArray[currentAttribute]])) {
                percentage = (d.properties[attributeArray[currentAttribute]]).toFixed(2) + "%";
            } else {
                percentage = "No data available";
            }
            vis.tip.html(d.properties.admin + "<br>" + currentYear + "<br>" + percentage);
            vis.tip.show(d);

        })
        .on('mouseout', vis.tip.hide);

    this.sequenceMap();
}

WorldMap.prototype.sequenceMap = function() {
  var vis = this;
  // dataRange = vis.getDataRange();
  var opacity;
  d3.selectAll('.country')
      .attr('fill-opacity', function(d) {
          if (d.properties[attributeArray[currentAttribute]] !== undefined
              && !isNaN(d.properties[attributeArray[currentAttribute]])) {
              opacity = getColor(d.properties[attributeArray[currentAttribute]]);
              return opacity;
          } else {
              return 0;
          }
      });
}

function getColor(valueIn) {
  var vis = this;
  // var countryData = vis.mapData.objects.countries.geometries, valueIn,
  //     valuesIn = vis.getDataRange();
  // console.log(valuesIn);
  // console.log(countryData);
  // for (var i = 0; i < countryData.length; i++) {
    // console.log(countryData[i].properties.admin);
    // valueIn = countryData[i].properties[currentYear];
    var color = d3.scale.linear()
      .domain([0, 100])
      .range([0.3, 1]);
    // TODO decide if countries with no values should have a specific color
    if (valueIn !== undefined && !isNaN(valueIn)) {
      return color(valueIn);
    } else {
      return color(0);
    }
  // }
}

WorldMap.prototype.animateMap = function() {
  var timer;
  var endSlider = false;

  // $('#playbutton').click(function() {
  //   playing1 = !playing1;
  //   var animation = playing1 ? 'stop' : 'play';
  //   $('#animate_to_' + animation).get(0).beginElement();
  // });

  d3.select('#playbutton')
    .on('click', function() {
      playing = !playing;
      var animation = playing ? 'stop' : 'play';
      $('#animate_to_' + animation).get(0).beginElement();

      setTimeout(function periodicFunc() {
        if (playing && (currentAttribute < attributeArray.length - 1)) {
          currentAttribute++;
          currentYear = attributeArray[currentAttribute];
          this.sequenceMap();
          this.mapSlider();
          d3.select('#clock').html(currentYear);
          setTimeout(periodicFunc, 500);
        } else {
          console.log(currentAttribute);
          console.log(attributeArray.length);
          if (currentAttribute >= attributeArray.length - 1) {
            sequenceMap();
          }
          if ((currentAttribute == attributeArray.length - 1) && playing) {

            currentAttribute = -1;
            playing = false;
            animation = 'play'
            $('#animate_to_' + animation).get(0).beginElement();
          }
        }
      }, 1000);
    });
}

WorldMap.prototype.mapSlider = function() {
  var minYear = 1990,
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
        dataRange = getDataRange();
        d3.selectAll('.country')
          .transition()
          .duration(300)
          .attr('fill-opacity', function(d) {
            // return getColor(d.properties[currentYear], dataRange);
          });
      }
    });

  d3.select("#slider").call(yearSlider);

  if (currentYear != 0) {
    console.log(currentYear);
    // TODO figure out how to make this efficient...
    // bug when it restarts
    // TODO fix restarting issue
    yearSlider.destroy();
    yearSlider.value(currentYear);
    d3.select("#slider").call(yearSlider);
    // d3.dispatch("slide", "slideend").slide(d3.event, currentYear);
    // d3.select("#slider3").style(position, currentYear)
  }
}

WorldMap.prototype.updateVisualization = function() {

    var vis = this;
    var legendList;


    //  Append legend only if cencorshipflag is on
    if (cencorShipFlag > 0) {
        legendList = [colorScaleCencorship["Free"], colorScaleCencorship["Partly Free"], colorScaleCencorship["Not Free"], "gray"]
    } else {
        legendList = [];
    }

    var legendContainer = vis.svg.selectAll('g')
        .data(legendList);

    var legend = legendContainer.enter().append("g");
    legend.append("rect");
    legend.append("text");

    legendContainer.select("rect")
        .attr("x", 10)
        .attr("y", function(d, i) {
            return vis.height * 3 / 4 + i * 20
        })
        .attr("width", 15)
        .attr("height", 15)
        .style("fill", function(d) {
            return d
        });

    legendContainer.select("text")
        .attr("x", 40)
        .attr("y", function(d, i) {
            return 12 + vis.height * 3 / 4 + i * 20
        })
        .style("fill", function(d) {
            return d
        })
        .text(function(d, i) {
            return cencorshipLabels[i];
        });

    legendContainer.exit().remove();

}
