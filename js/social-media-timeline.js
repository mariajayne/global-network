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

    vis.margin = { top: 40, right: 0, bottom: 60, left: 60 };

    vis.width = 1200 - vis.margin.left - vis.margin.right,
    vis.height = 400 - vis.margin.top - vis.margin.bottom;


    //  SVG drawing area
    vis.svg = d3.select("#"+vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // scales
    vis.x = d3.time.scale()
        .range(0, vis.width)
        .domain([dateFormat("01-01-1998"), dateFormat("01-01-2016")]);


    // Axis
    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom");

    // Main information box
    vis.mainInfo = vis.svg.append("g")
        .attr("transform","translate(0,0)")
        .append("text")
        .attr("id","mainInfo")
        .attr("y", 0)
        .attr("x", vis.width/2)
        .attr("text-anchor", "middle");

    vis.wrangleData();
};


Timeline.prototype.wrangleData = function() {
    var vis = this;

    // TODO
    vis.updateVis();
};

Timeline.prototype.updateVis = function() {
    var vis = this;

    // TODO

    vis.data.sort(function(a,b) {
        return b.Current_size - a.Current_size;
    });

    (console.log(vis.data[0].Date));

    console.log(d3.extent(vis.data, function(d) {
        return d.Date;
    }));
    console.log(vis.x(vis.data[0].Date));



    console.log(vis.data);
};
