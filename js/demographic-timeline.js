/**
 * Created by akselreiten on 15/04/16.
 */

Timeline = function(_parentElement, _data,_metric){
    this.parentElement = _parentElement;
    this.data = _data;
    this.metric = _metric;
    this.displayData = this.data.years;
    this.initVis();

}


Timeline.prototype.initVis = function(){
    var vis = this;

    vis.margin = {top:30,right:40,bottom:20,left:65}
    vis.width = 370 - vis.margin.left - vis.margin.right;
    vis.height = 120 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales and axes
    vis.x = d3.time.scale()
        .range([0, vis.width])
        .domain(d3.extent(vis.displayData, function(d) {return d.year; }));

    vis.y = d3.scale.linear()
        .range([vis.height, 0])
        .domain([0, d3.max(vis.displayData, function(d) {
            return d[vis.metric]; })]);

    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom");

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left")
        .tickFormat(function(d){return formatYLabel(d, vis.metric)})
        .ticks(4);

    // SVG area path generator
    vis.area = d3.svg.area()
        .defined(function(d) {return !isNaN(d[vis.metric])})
        .x(function(d) { return vis.x(d.year); })
        .y0(vis.height)
        .y1(function(d) { return vis.y(d[vis.metric]); });

    vis.svg.append("path")
        .datum(vis.displayData)
        .attr("fill", "#ccc")
        .attr("d", vis.area);

    //  Appending main title
    vis.svg.append("text")
        .attr("class", "axis-title")
        .attr("text-anchor", "middle")
        .style("font-size","10")
        .attr("y", 10)
        .attr("x", vis.width/2)
        .attr("dy", ".75em")
        .attr("transform", "rotate(0)")
        .text("Total internet users (1991 to 2014)");

    // Initialize brush component
    vis.brush = d3.svg.brush()
        .x(vis.x)
        .on("brush",brushed);

    vis.svg.append("g")
        .attr("class","x brush")
        .call(vis.brush)
        .selectAll("rect")
        .attr("y",-6)
        .attr("height",vis.height + 7);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(vis.xAxis);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + 0 + ")")
        .call(vis.yAxis);


}


