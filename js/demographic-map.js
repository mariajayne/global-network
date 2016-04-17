/**
 * Created by akselreiten on 17/04/16.
 */


WorldMap = function(_parentElement, _mapData, _data){
    this.parentElement = _parentElement;
    this.mapData = _mapData;
    this.data = _data;
    this.displayData = this.data;
    this.initVis();
}

WorldMap.prototype.initVis = function(){

    var vis = this;

    vis.margin = {top: 0, right: 20, bottom: 0, left: 20};
    vis.width = 800 - vis.margin.left - vis.margin.right;
    vis.height = 500 - vis.margin.top - vis.margin.bottom;

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

    this.createVisualization();

}

WorldMap.prototype.createVisualization = function (){

    var vis = this;

    vis.world = topojson.feature(vis.mapData, vis.mapData.objects.countries).features

    vis.svg.selectAll("path")
        .data(vis.world)
        .enter().append("path")
        .attr("d",vis.path)
        .attr("class","projection")
        .attr("id",function(d){return "" + d.properties.id;})
        .style("fill",defaultCountryColor)
        .on("click", selectCountry)


}