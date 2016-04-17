/**
 * Created by MagnusMoan on 11/04/16.
 */



BarChart = function(_parentElement,_countryData, _platformData){
    this.parentElement = _parentElement;
    this.platformData = _platformData;
    this.countryData = _countryData;

    this.current = "Facebook";
    this.foo = "Country";
    this.chosen = false;

    this.initVis();
}

BarChart.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 40, right: 0, bottom: 100, left: 160 };

    vis.width = 700 - vis.margin.left - vis.margin.right,
        vis.height = 350 - vis.margin.top - vis.margin.bottom;


    //  SVG drawing area
    vis.svg = d3.select("#"+vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    //  Scales
    vis.x = d3.scale.ordinal()
        .range(0,vis.width)
        .rangeRoundBands([0,vis.width],.2);

    vis.y = d3.scale.linear()
        .range([vis.height,0])
        .domain([0,50]);


    //  Axis
    vis.yTicks = [10,20,30,40];

    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom");

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .tickValues(vis.yTicks)
        .tickFormat(function(d) {
            return d + "%"
        })
        .orient("left");

    vis.svg.append("g")
        .attr("class","x-axis axis")
        .style("stroke", "white")
        .attr("transform","translate(0,"+vis.height+")");

    vis.svg.append("g")
        .attr("class","y-axis axis");

    //  Tooltip placeholder
    vis.tooltip = vis.svg.append("g")
        .attr("transform","translate(10,10)")
        .append("text")
        .attr("class","t1")
        .attr("dx",8)
        .attr("dy","-.3em");

    //  Append y-label
    vis.svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "end")
        .attr("y", -10)
        .attr("x", 0)
        .attr("dy", ".01em")
        .attr("transform", "rotate(0)");

    //  Append title
    vis.title = vis.svg.append("text")
        .attr("class", "title-label")
        .attr("text-anchor", "middle")
        .attr("y", 0)
        .attr("x", vis.width/2)
        .attr("dy", ".1em")
        .attr("transform", "rotate(0)");


    //  Init wrangleData
    vis.wrangleData();

}


//  Function for data wrangling.
BarChart.prototype.wrangleData = function(){
    var vis = this;

    //  Currently no data wrangling needed
    //  Update the visualization
    vis.updateVis();
}


//  The drawing function
BarChart.prototype.updateVis = function(){

    var vis = this;

    if (vis.chosen) {
        //vis.title.text("Social media usage in ".concat(vis.current));
        vis.displayData = vis.platformData;
    } else {
        //vis.title.text(vis.current.concat(" usage in %"));
        vis.displayData = vis.countryData;
    }

    //  Update domain
    vis.x.domain(vis.displayData.map(function(d){return d[vis.foo]}));

    //  Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);

    //  Create rectangles
    var rect = vis.svg.selectAll("rect")
        .data(vis.displayData);

    rect.enter()
        .append("rect")
        .attr("class","bar");

    rect.attr("x", function(d){return vis.x(d[vis.foo])})
        .attr("y", function(d){
            if (d.Percent[vis.current] != null) {
                return vis.y(d.Percent[vis.current]);
            } return 0;
        })
        .attr("width", vis.x.rangeBand())
        .attr("height",function(d){
            if (d.Percent[vis.current] != null) {
                return vis.height - vis.y(d.Percent[vis.current]);
            } return 0; });

    rect.exit()
        .remove();

    //  Update label positioning
    vis.svg.selectAll(".x-axis text")
        .attr("y",0)
        .attr("x",-10)
        .attr("dy",".35em")
        .attr("transform","rotate(-60)")
        .style("text-anchor","end");

    //  Update y-label
    vis.svg.selectAll(".y-label")
        //.text("Total Score")
        .style("font-size",8);

    // Draw grid lines
    vis.svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(0,0)")
        .call(d3.svg.axis()
            .scale(vis.y)
            .orient("left")
            .tickValues(vis.yTicks)
            .tickSize(-vis.width, 0,0)
            .tickFormat(""));

}