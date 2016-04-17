/**
 * Created by akselreiten on 15/04/16.
 */

var metricMap = {
    "gdp" : "GDP (current LCU)",
    "internet" : "Internet users (per 100 people) ",
    "unemployment" : "Total Unemployment (% of labor force)",
    "university" : "Gross enrolment ratio, University(%)"
}

var labelMap = {
    "gdp" : "$USD",
    "internet" : "% of population",
    "unemployment" : "% of work force",
    "university" : "%"
}

var formatValue = d3.format(".2s");
var formatPercent = d3.format(".0%");
var formatYear = d3.time.format("%Y");
var bisectDate = d3.bisector(function(d) { return d.year; }).left;

function formatYLabel(point, metric){
    if (metric == 'gdp'){return formatValue(point)}
    else if (metric == 'internet' || 'unemployment' || 'university'){return formatPercent(point/100)}
}

LineChart= function(_parentElement,_data,_metric){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];
    this.metric = _metric;
    this.initVis();
    console.log(this.data);
}

LineChart.prototype.initVis = function(){
    var vis = this;

    //  Defining margins, height and width
    vis.margin = {top:30,right:20,bottom:20,left:100}
    vis.width = 350 - vis.margin.left - vis.margin.right;
    vis.height = 200 - vis.margin.top - vis.margin.bottom;

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
        .tickFormat(function(d){return formatYLabel(d, vis.metric)})
        //.tickFormat(function(d) { return "$" + commasFormatter(d/1000000) + "M"; })
        .ticks(7);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    //  Appending line
    vis.line = d3.svg.line()
        .defined(function(d) {return !isNaN(d[vis.metric])})
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
        .text(labelMap[vis.metric]);

    //  Appending main title
    vis.svg.append("text")
        .attr("class", "axis-title")
        .attr("text-anchor", "middle")
        .attr("y", -20)
        .attr("x", vis.width/2)
        .attr("dy", ".75em")
        .attr("transform", "rotate(0)")
        .text(metricMap[vis.metric]);

    //  Appending line and circle for tool-tips
    vis.focus = vis.svg.append("g").style("display","none");

    vis.focus.append("circle")
        .attr("class","y")
        .style("fill","#58B957")
        .style("stroke","gray")
        .attr("r",5);

    vis.focus.append("line")
        .attr("class","x")
        .style("stroke","black")
        .style("stroke-dasharray","10,5")
        .style("opacity",0.9)
        .attr("y1",0)
        .attr("y2",vis.height);

    vis.focus.append("text")
        .attr("class", "y1")
        .style("stroke", "black")
        .style("font-size",14)
        .style("stroke-width", "1px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "-.3em");

    vis.focus.append("text")
        .attr("class", "y2")
        .style("stroke", "gray")
        .style("font-size",12)
        .style("stroke-width", "0.75px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "-.3em");

    //Append rectangle for monitoring pointer-events
    vis.svg.append("rect")
        .attr("width",vis.width)
        .attr("height",vis.height)
        .style("fill","none")
        .style("pointer-events","all")
        .on("mouseover",function(){vis.focus.style("display",null);})
        .on("mouseout",function(){vis.focus.style("display","none");})
        .on("mousemove",mouseMove);

    function mouseMove() {

        var x0 = vis.x.invert(d3.mouse(this)[0])
        var i = bisectDate(vis.displayData, x0, 1),
            d0 = vis.displayData[i - 1],
            d1 = vis.displayData[i],
            d = x0 - d0.year > d1.year- x0 ? d1 : d0;

        vis.focus.select("circle.y")
            .attr("transform","translate(" + vis.x(d.year) + "," + vis.y(d[vis.metric]) + ")");
        vis.focus.select("line.x")
            .attr("transform","translate(" + vis.x(d.year) + "," + vis.height + ")")
            .attr("y1", 0).attr("y2", -vis.height);
        vis.focus.select("text.y1")
            .attr("transform","translate(" + vis.x(d.year) + "," + 35 + ")")
            .text(formatYLabel(d[vis.metric],vis.metric));
        vis.focus.select("text.y2")
            .attr("transform","translate(" + vis.x(d.year) + "," + 50 + ")")
            .text("Year: " + formatYear(d.year));
    }

    vis.wrangleData();
}


LineChart.prototype.wrangleData = function(){
    var vis = this;
    var countryScope;

    if (selectedCountries.length == 0){
        vis.displayData = vis.data.world[0].years
    }
    else{
        var countryScope = selectedCountries[0] || "USA"
        vis.displayData = vis.data.countries.filter(function(d){return (d.country_id == countryScope)})[0].years
    }

    vis.updateVis();
}


LineChart.prototype.updateVis = function(){
    var vis = this;

    vis.x.domain(d3.extent(vis.displayData,function(d){return d.year}));
    vis.y.domain([0,d3.max(vis.displayData,function(d) {return d[vis.metric]})]);

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