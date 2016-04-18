/**
 * Created by akselreiten on 17/04/16.
 */


VerticalBarChart = function(_parentElement,_data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    this.initVis();
}

VerticalBarChart.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 20, right: 60, bottom: 60, left: 100 };


    //  $(document).width()
    vis.width = 300- vis.margin.left - vis.margin.right;
    vis.height = 670 - vis.margin.top - vis.margin.bottom;


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

    vis.colorScale = {"Free" : 'white',"Partly Free" : '#bdbdbd',"Not Free" : '#636363'};
    // The colorful: vis.colorScale = {"Free" : '#4daf4a',"Partly Free" : '#377eb8',"Not Free" : '#e41a1c'}
    //vis.colorScale = d3.scale.category10().domain(vis.data.map(function(d){return d.Status}));

    //  Axis
    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom");

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left");

    vis.svg.append("g")
        .attr("class","x-axis axis")
        .attr("transform","translate(0,"+vis.height+")");

    vis.svg.append("g")
        .attr("class","y-axis axis");

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
        .attr("y", -10)
        .attr("x", vis.width/2 -20)
        .attr("dy", ".1em")
        .attr("transform", "rotate(0)")
        .text("Degree of National Surveillance and Censorship (% 2014)");

    //  Init wrangleData
    vis.wrangleData();

}


//  Function for data wrangling.
VerticalBarChart.prototype.wrangleData = function(){
    var vis = this;

    //  Currently no data wrangling needed
    //  Update vis
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
    vis.svg.select(".y-axis").call(vis.yAxis);

    //  Create rectangles
    var rect = vis.svg.selectAll("rect")
        .data(vis.data);

    rect.enter()
        .append("rect")
        .attr("class","bar")
        .attr("id",function(d){return "bar-" + d.Country})
        .attr("x", 0)
        .attr("y", function(d){return vis.y(d.Country)})
        .attr("width", function(d){return vis.x(d.Total_score);})
        .attr("height",vis.y.rangeBand())
        .style("fill",function(d){return vis.colorScale[d.Status]});

    rect.on("mouseover",function(d){vis.tooltip.text(d.Country + ": " + d.Total_score)})
        .on("mouseout",function(d){vis.tooltip.text("")});

    rect.exit()
        .transition()
        .remove();

    //  Update label positioning
    vis.svg.selectAll(".x-axis text")
        .attr("y",0)
        .attr("x",0)
        .attr("dy",".35em")
        .attr("transform","rotate(0)")
        .style("text-anchor","end");

    /*  Update y-label
    vis.svg.selectAll(".y-label")
        .text("Total Score")
        .style("font-size",8); */


}