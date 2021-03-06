/**
 * Created by akselreiten on 05/04/16.
 */


var regressionCountries = [];

BarChart = function(_parentElement,_data, _demographicData){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];
    this.demographicData = _demographicData;

    this.initVis();
}

BarChart.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 40, right: 60, bottom: 60, left: 30 };

    vis.width = $( document ).width()*0.90 - vis.margin.left - vis.margin.right,
    vis.height = 250 - vis.margin.top - vis.margin.bottom;


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

    /*
    vis.xRegression = d3.scale.linear()
        .range([0,vis.width]);
    */

    vis.y = d3.scale.linear()
        .range([vis.height,0]);

    vis.colorScale = {"Free" : 'white',"Partly Free" : '#bdbdbd',"Not Free" : '#636363'};
    // The colorful: vis.colorScale = {"Free" : '#4daf4a',"Partly Free" : '#377eb8',"Not Free" : '#e41a1c'}
    //vis.colorScale = d3.scale.category10().domain(vis.data.map(function(d){return d.Status}));

    //  Axis
    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom");

    /*
    vis.xAxisRegression = d3.svg.axis()
        .scale(vis.xRegression)
        .orient("bottom");*/

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left");

    vis.svg.append("g")
        .attr("class","x-axis axis")
        .attr("transform","translate(0,"+vis.height+")");

    vis.svg.append("g")
        .attr("class","x-axis-regression axis")
        .attr("transform","translate(0,"+vis.height+")");

    vis.svg.append("g")
        .attr("class","y-axis axis");


    //  Tooltip placeholder
    vis.tooltip = vis.svg.append("g")
        .attr("transform","translate(10,50)")
        .append("text")
        .attr("class","t1")
        .attr("dx",8)
        .attr("dy","-.3em");

    //  Append y-label
    vis.svg.append("text")
        .attr("class", "y-label")
        .attr("text-anchor", "start")
        .attr("y", -10)
        .attr("x", -30)
        .attr("dy", ".01em")
        .attr("transform", "rotate(0)")

    //  Append title
    vis.svg.append("text")
        .attr("class", "title-label")
        .attr("text-anchor", "middle")
        .attr("y", 0)
        .attr("x", vis.width/2)
        .attr("dy", ".1em")
        .attr("transform", "rotate(0)")
        .text("Internet usage vs Freedom of the Internet (% 2014)");

    /*
    var count = -1;
    vis.line = d3.svg.line()
        .x(function(d){
            console.log(vis.xRegression(count))
            count = count + 1;
            return vis.xRegression(count)})
        .y(function(d){
            return vis.y(d[1])})
        .interpolate('basis');*/

    //	Tooltip
    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([0,0])
        .html(function(d){return d.country + "<br><small>Internet usage 2014: " + d.internet2014 + "%</small>";});

    //  Init wrangleData
    vis.wrangleData();

}


//  Function for data wrangling.
BarChart.prototype.wrangleData = function(){
    var vis = this;

    //  Currently no data wrangling needed
    //  Update vis
    vis.updateVis();
}


//  The drawing function
BarChart.prototype.updateVis = function(){

    var vis = this;

    //  Sort data
    vis.data.sort(function(a,b){ return a.Total_score - b.Total_score});

    //  Update domain
    vis.x.domain(vis.data.map(function(d){return d.Country}));
    /*vis.xRegression.domain([0,65]);*/
    vis.y.domain([0,d3.max(vis.data,function(d){return d.Total_score})]);

    //  Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
    /*vis.svg.select(".x-axis-regression").call(vis.xRegression);*/
    vis.svg.call(vis.tip);

    //  Create rectangles
    var rect = vis.svg.selectAll("rect")
        .data(vis.data);

    rect.enter()
        .append("rect")
        .attr("class","bar")
        .attr("id",function(d){
            return "bar-" + countryMapping[d.Country]})
        .attr("x", function(d){return vis.x(d.Country)})
        .attr("y", function(d){return vis.y(d.Total_score)})
        .attr("width", vis.x.rangeBand())
        .attr("height",function(d){return vis.height - vis.y(d.Total_score);})
        .style("fill",function(d){return colorScaleCencorship[d.Status]});

    rect.on("mouseover",function(d){vis.tooltip.text(d.Country + ": " + d.Total_score)})
        .on("mouseout",function(d){vis.tooltip.text("")});

    rect.exit()
        .transition()
        .remove();

    var dots = vis.svg.selectAll("dot")
        .data(vis.demographicData)
        .enter();

    dots.append("circle")
        .attr("class","dot")
        .attr("r",3.5)
        .attr("cx", function(d){return vis.x(d.country) + 7})
        .attr("cy", function(d){return vis.y(d.internet2014)})
        .style("fill","black")
        .style("opacity","0.5")
        .on('mouseover',vis.tip.show)
        .on('mouseout',vis.tip.hide);

    /*
    vis.svg.append("path")
        .datum(regressionLine)
        .attr("class","line")
        .attr("d", vis.line)
        .style("stroke","black");*/

    //  Update label positioning
    vis.svg.selectAll(".x-axis text")
        .attr("y",0)
        .attr("x",-10)
        .attr("dy",".35em")
        .attr("transform","rotate(-65)")
        .style("text-anchor","end");

    //  Update y-label
    vis.svg.selectAll(".y-label")
        .text("Total Score of 'Internet Freedom' ")
        .style("font-size",8);



}