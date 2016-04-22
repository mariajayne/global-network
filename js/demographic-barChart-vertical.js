/**
 * Created by akselreiten on 17/04/16.
 */


VerticalBarChart = function(_parentElement,_data,_demographicData){
    this.parentElement = _parentElement;
    this.data = _data;
    this.demographicData = _demographicData;
    this.displayData = [];
    this.initVis();
}

VerticalBarChart.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 10, right: 60, bottom: 60, left: 100 };

    //  $(document).width()
    vis.width = 300- vis.margin.left - vis.margin.right;
    vis.height = 650 - vis.margin.top - vis.margin.bottom;

    //  SVG drawing area
    vis.svg = d3.select("#"+vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    //  Scales
    vis.x = d3.scale.linear()
        .range([0,vis.width]);

    vis.y = d3.scale.ordinal()
        .range(vis.height,0)
        .rangeRoundBands([0,vis.height],.2);

    //  Axis
    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom");

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left");

    /*vis.x2Axis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom");*/

    vis.svg.append("g")
        .attr("class","x-axis axis")
        .attr("transform","translate(0,"+vis.height+")");

    vis.svg.append("g")
        .attr("class","y-axis axis");

    vis.svg.append("g")
        .attr("class","x2-axis axis")
        .attr("transform","translate(0,"+20+")");

    //  Tooltip placeholder
    vis.tooltip = vis.svg.append("g")
        .attr("transform","translate(100,30)")
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
        .attr("transform", "rotate(0)")

    //  Append title
    vis.svg.append("text")
        .attr("class", "title-label")
        .attr("text-anchor", "middle")
        .attr("y", 0)
        .attr("x", vis.width/2 -20)
        .attr("dy", ".1em")
        .attr("transform", "rotate(0)")
        .text("Degree of National Surveillance and Censorship (% 2014)")
        .style("fill","black");

    //  Appending line
    vis.line = d3.svg.line()
        .x(function(d){return vis.x(d.x)})
        .y(function(d){return vis.y(d.y)});

    //	Tooltip
    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([0,0])
        .html(function(d){return d.country + "<br><small>Internet usage 2014: " + d.internet2014 + "%</small>";});

    //  Init wrangleData
    vis.wrangleData();

}


//  Function for data wrangling.
VerticalBarChart.prototype.wrangleData = function(){
    var vis = this;


    vis.updateVis();
}


//  The drawing function
VerticalBarChart.prototype.updateVis = function(){

    var vis = this;

    //  Sort data
    vis.data.sort(function(a,b){ return a.Total_score - b.Total_score});

    //  Update domain
    vis.x.domain([0,100]);
    vis.y.domain(vis.data.map(function(d){return d.Country}));

    //  Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    //vis.svg.select(".x2-axis").call(vis.x2Axis);
    vis.svg.select(".y-axis").call(vis.yAxis);
    vis.svg.call(vis.tip);


    //  Create rectangles
    var rect = vis.svg.selectAll("rect")
        .data(vis.data);

    rect.enter()
        .append("rect")
        .attr("class","bar")
        .attr("id",function(d){return "bar-" + countryMapping[d.Country]})
        .attr("x", 0)
        .attr("y", function(d){return vis.y(d.Country)})
        .attr("width", function(d){return vis.x(d.Total_score);})
        .attr("height",vis.y.rangeBand())
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
        .attr("r",3)
        .attr("cx", function(d){return vis.x(d.internet2014)})
        .attr("cy", function(d){return vis.y(d.country) + 3})
        .style("fill","gray")
        .on('mouseover',vis.tip.show)
        .on('mouseout',vis.tip.hide);

    /*
    dots.append("text")
        .attr("x", function(d){return vis.x(d.internet2014) + 10})
        .attr("y", function(d){return vis.y(d.country) + 5})
        .text(function(d){return d.country})
        .style("fill","black");*/

    //  Update label positioning
    vis.svg.selectAll(".x-axis text")
        .attr("y",-20)
        .attr("x",0)
        .attr("dy",".35em")
        .attr("transform","rotate(0)")
        .style("text-anchor","end");

    /*  Update y-label
    vis.svg.selectAll(".y-label")
        .text("Total Score")
        .style("font-size",8); */


}