/**
 * Created by MagnusMoan on 17/04/16.
 */

WorldMap = function(_parentElement, _mapData, _data){
    this.parentElement = _parentElement;
    this.mapData = _mapData;
    this.data = _data;
    this.displayData = this.data;

    this.cities = [{"City":"NY", "Pop":8175133, "Long":-74.006, "Lat":40.714},
        {"City":"LA", "Pop":3792621, "Long":-118.244, "Lat":34.052},
        {"City":"Chicago", "Pop":2695598, "Long":-87.65, "Lat":41.85},
        {"City":"Brooklyn", "Pop":2300664, "Long":-73.95, "Lat":40.65},
        {"City":"Houston", "Pop":2099451, "Long":-95.363, "Lat":29.763},
        {"City":"Oslo", "Pop":500000, "Long":10.7522, "Lat":59.9139}];

    this.initVis();


}

WorldMap.prototype.initVis = function(){

    var vis = this;

    vis.margin = {top: 0, right: 20, bottom: 0, left: 20};
    vis.width = 1200 - vis.margin.left - vis.margin.right;
    vis.height = 800 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.projection = d3.geo.mercator()
        .center([15,45])
        .scale(120)
        .translate([vis.width / 2, vis.height / 2]);

    vis.path = d3.geo.path()
        .projection(vis.projection);

    // Scale for radius of circles

    vis.r = d3.scale.log()
        .base(Math.E)
        .domain([100000,8175133])
        .range([1,10]);

    console.log(vis.r(8175133));

    this.createVisualization();

}

WorldMap.prototype.createVisualization = function (){

    var vis = this;

    vis.world = topojson.feature(vis.mapData, vis.mapData.objects.countries).features;

    vis.svg.selectAll("path")
        .data(vis.world)
        .enter().append("path")
        .attr("d",vis.path)
        .attr("class","projection")
        .attr("id",function(d){return "" + d.properties.id;})
        .style("fill","grey");
        //.on("click", selectCountry)

    var node = vis.svg.selectAll(".node")
        .data(vis.cities)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("r", function(d) { return vis.r(d.Pop)})
        .attr("fill", "yellow")
        .attr("transform", function(d) {
            return "translate(" + vis.projection([d.Long, d.Lat]) + ")";
        })
        .on("click", function(d) {console.log(d.City) });


}