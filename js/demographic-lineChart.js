/**
 * Created by akselreiten on 15/04/16.
 */

var commasFormatter = d3.format(",.0f");

var metricMap = {
    "gdp" : "Gross Domestic Product (GDP)",
    "internet" : "Internet Users ",
    "unemployment" : "Unemployment",
    "university" : "University"
}

var labelMap = {
    "gdp" : ""
}

LineChart= function(_parentElement,_data,_metric){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];
    this.metric = _metric;
    this.initVis();
}

LineChart.prototype.initVis = function(){
    var vis = this;

    //  Defining margins
    vis.margin = {top:30,right:20,bottom:20,left:100}
    vis.width = 300 - vis.margin.left - vis.margin.right;
    vis.height = 150 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate("+ vis.margin.left+ "," + vis.margin.top + ")");

    // Scales
    vis.x = d3.time.scale().range([0, vis.width]);

    vis.y = d3.scale.linear().range([vis.height, 0]);

    //  Axis
    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom")
        .ticks(7);

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left")
        //.tickFormat(function(d) { return "$" + commasFormatter(d/1000000) + "M"; })
        .ticks(7);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    //  Appending line
    vis.line = d3.svg.line()
        .defined(function(d){return d})
        .x(function(d){return vis.x(d.year)})
        .y(function(d){return vis.y(d[vis.metric])})
        .interpolate('basis');

    //  Appending labels to x axis
    vis.svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", vis.width)
        .attr("y", vis.height)
        .text("");

    //  Appending labels to y axis
    vis.svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("y", -20)
        .attr("x", 0)
        .attr("dy", ".75em")
        .attr("transform", "rotate(0)")
        .text("$");

    //  Appending title
    vis.svg.append("text")
        .attr("class", "axis-title")
        .attr("text-anchor", "middle")
        .attr("y", -20)
        .attr("x", vis.width/2)
        .attr("dy", ".75em")
        .attr("transform", "rotate(0)")
        .text(metricMap[vis.metric]);

    vis.wrangleData();
}


LineChart.prototype.wrangleData = function(){
    var vis = this;

    vis.displayData = vis.data.countries[15].years;

    vis.updateVis();
}


LineChart.prototype.updateVis = function(){
    var vis = this;

    vis.x.domain(d3.extent(vis.displayData,function(d){return d.year}))
    vis.y.domain([0,d3.max(vis.displayData,function(d){return d[vis.metric]})])

    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);

    //  Appending Line
    var linegraph = vis.svg.selectAll("path")
        .data(vis.displayData);

    linegraph.enter().append("path")
        .attr("class","line");

    linegraph
        .style("stroke",2)
        .attr("d",vis.line(vis.displayData));


}