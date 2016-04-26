var dataset;
var color;
var node;

var chartOptions = {
    gdp : "GDP (U.S. Dollars)",
    internet : "Internet Users (% of Population)",
    water : "Access to Safe Water (% of Population)",
    university : "Enrolled in university (% of Population)",
    unemployment : "Unemployment (% of Population)"
};

d3.select("#data-select").selectAll("option")
    .data(d3.keys(chartOptions))
    .enter()
    .append("option")
    .attr("value",function (key) { return key; })
    .text(function (key) { return chartOptions[key]; });

var selectedYear = 1991;
var selectedCat = "gdp";

var margin = {top: 40, right: 40, bottom: 40, left: 40};

var width = 900 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;


var mousemove = function(d) {
    var xPosition = d3.event.pageX + 5;
    var yPosition = d3.event.pageY + 5;

    d3.select("#tooltip")
        .style("left", xPosition + "px")
        .style("top", yPosition + "px");
    d3.select("#tooltip #heading")
        .html("<b>" + d.country + "</b>");
    d3.select("#tooltip #moreInfo")
        .html(chartOptions[selectedCat] + ": " + d[selectedCat].years[selectedYear]);
    d3.select("#tooltip").classed("hidden", false);
};

var mouseout = function() {
    d3.select("#tooltip").classed("hidden", true);
};



d3.select("#year-select").selectAll("option")
    .data([1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001,
        2002,2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014])
    .enter()
    .append("option")
    .attr("value", function(d) { return d; })
    .text(function(d) { return d; });

color = d3.scale.category20c();

var treemap = d3.layout.treemap()
    .size([width, height])
    .sticky(true)
    .value(function(d) {
        if (d[selectedCat].years[selectedYear] !== "..") {
            return d[selectedCat].years[selectedYear];
        } else {
            return 0;
        }
    });

var div = d3.select("#tree-map").append("div")
    .style("position", "relative")
    .style("width", (width + margin.left + margin.right) + "px")
    .style("height", (height + margin.top + margin.bottom) + "px")
    .style("left", margin.left + "px")
    .style("top", margin.top + "px");

d3.json("../data/treemap/treeJson.json", function(error, root) {
    if (error) throw error;

    node = div.datum(root).selectAll(".node")
        .data(treemap.nodes)
        .enter().append("div")
        .attr("class", "node")
        .call(position)
        .style("background", function(d) {
            return d.children ? color(d.region) : null;
        })
        .text(function(d) { return d.children ? null : d.country; })
        .on("mousemove", mousemove)
        .on("mouseout", mouseout);

    d3.selectAll(".form-control").on("change", function change() {
        selectedCat = d3.select("#data-select").property("value");

        node
            .data(treemap.value(function(d) {
                if (d[selectedCat].years[selectedYear] !== "..") {
                    return d[selectedCat].years[selectedYear];
                } else {
                    return 0;
                }
            }).nodes)
            .transition()
            .duration(1500)
            .call(position);
    });

});


function position() {
    this.style("left", function(d) { return d.x + "px"; })
        .style("top", function(d) { return d.y + "px"; })
        .style("width", function(d) { return Math.max(0, d.dx + 1) + "px"; })
        .style("height", function(d) { return Math.max(0, d.dy + 1) + "px"; });
}

var currentAttribute = 0;

var attributeArray = ["1991", "1992", "1993", "1994", "1995", "1996", "1997", "1998", "1999", "2000", "2001", "2002", "2003", "2004", "2005", "2006", "2007", "2008", "2009", "2010", "2011", "2012", "2013", "2014"];

makeSlider();

function makeSlider() {
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
                selectedYear = attributeArray[currentAttribute];
                d3.select('#clock').html(selectedYear);

                node
                    .data(treemap.value(function(d) {
                        if (d[selectedCat].years[selectedYear] !== "..") {
                            return d[selectedCat].years[selectedYear];
                        } else {
                            return 0;
                        }
                    }).nodes)
                    .transition()
                    .duration(1500)
                    .call(position);
            }
        });

    d3.select("#slider").call(yearSlider);

    if (yearSlider.value() != undefined) {
        yearSlider.destroy();
    }
    yearSlider.value(d3.select('#clock').html());
    d3.select("#slider").call(yearSlider);
}
