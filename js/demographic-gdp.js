/**
 * Created by akselreiten on 14/04/16.
 */


GDPChart= function(_parentElement,_data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];

    //  Debug RAW data
    console.log(this.data);

    this.initVis();
}

GDPChart.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

    vis.width = 800 - vis.margin.left - vis.margin.right,
        vis.height = 400 - vis.margin.top - vis.margin.bottom;


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
        .range([vis.height,0]);

    vis.colorScale = {"Free" : '#4daf4a',"Partly Free" : '#377eb8',"Not Free" : '#e41a1c'}
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
        .attr("transform", "rotate(0)")

    //  Append title
    vis.svg.append("text")
        .attr("class", "title-label")
        .attr("text-anchor", "middle")
        .attr("y", 0)
        .attr("x", vis.width/2)
        .attr("dy", ".1em")
        .attr("transform", "rotate(0)")
        .text("Freedom of the internet");

    //  Init wrangleData
    vis.wrangleData();

}