/**
 * Created by MagnusMoan on 04/04/16.
 */


Timeline = function(_parentElement,_data) {
    this.parentElement = _parentElement;
    this.data = _data;

    this.initVis();
};


Timeline.prototype.initVis = function() {
    var vis = this;

    vis.margin = { top: 40, right: 20, bottom: 60, left: 60 };

    vis.width = 1200 - vis.margin.left - vis.margin.right,
    vis.height = 400 - vis.margin.top - vis.margin.bottom;


    //  SVG drawing area
    vis.svg = d3.select("#"+vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .attr("id", "timeline-drawing-space")
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // scales
    vis.x = d3.time.scale()
        .range([0, vis.width])
        .domain([dateFormat("01-01-1997"), dateFormat("01-01-2015")]);

    vis.r = d3.scale.linear()
        .range([0, 150])
        .domain([0,d3.max(vis.data, function(d){return d.Current_size})]);


    // Axis
    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom")
        .outerTickSize(0);

    vis.svg.append("g")
        .attr("class","x-axis")
        .attr("transform","translate(0,"+(vis.height - 100)+")");

    // Main information box
    vis.title = vis.svg.append("g")
        .attr("transform","translate(0,0)")
        .append("text")
        .attr("id","title")
        .attr("y", 0)
        .attr("x", vis.width/2)
        .attr("text-anchor", "middle")
        .text("Social networks");

    vis.platformInfo = document.getElementById("platformInfo");
    vis.platformInfo.style.marginLeft = "660px";
    vis.platformInfo.style.marginTop = "50px";

    vis.wrangleData();
};


Timeline.prototype.wrangleData = function() {
    var vis = this;

    // TODO
    vis.updateVis();
};

Timeline.prototype.updateVis = function() {
    var vis = this;

    // Add axis
    vis.svg.select(".x-axis").call(vis.xAxis);

    // Create circles
    var circle = vis.svg.selectAll("circle")
        .data(vis.data);

    circle.enter()
        .append("circle")
        .attr("class", "circle")
        .attr("cx", function(d) { return vis.x(d.Date)})
        .attr("cy", vis.height-100)
        .attr("r", function(d) {return vis.r(d.Current_size)})
        .attr("fill", "#white")
        .attr("opacity", 0.5);

    // Hovering actions
    circle.on("mouseover", function(d) {
        vis.title.text(d.Platform);
        vis.platformInfo.innerHTML = "Active users: " + d.Current_size + " million";
        d3.selectAll(".circle").transition().duration(250).attr("opacity", 0.1);
        d3.select(this).transition().duration(250).attr("opacity", 0.7)});

    circle.on("mouseout", function(d) {
        vis.title.text("Social networks");
        vis.platformInfo.innerHTML = "";
        d3.selectAll(".circle").transition().duration(250).attr("opacity",.5);
    });

    circle.exit()
        .remove();






};
