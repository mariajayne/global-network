/**
 * Created by akselreiten on 17/04/16.
 */


function changeView(){
    if ($("#internet-chart").is(":visible")){
        $("#col3").insertBefore("#col2");
        $("#internet-chart").hide(0);
        $("#gdp-chart").hide(0);
        $("#employment-chart").hide(0);
        $("#freedom-of-net-barchart-vertical").show(0);
    }else{
        $("#col2").insertBefore("#col3");
        $("#internet-chart").show(0);
        $("#gdp-chart").show(0);
        $("#employment-chart").show(0);
        $("#freedom-of-net-barchart-vertical").hide(0);
    }


}

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

    // Add rectangles for choosing view
    vis.rectDemographics = vis.svg.append("rect")
        .attr("x", vis.width/2 - 30)
        .attr("y", vis.height * 0.95)
        .attr("class", "btn-dashboard")
        .attr("id", "btn-demographics")
        .attr("width", 100)
        .attr("height", 23)
        .style("fill","lightblue")
        .on("click",changeView);

    vis.rectDemographics.append("text")
        .attr("x",20)
        .attr("y",20)
        .text("hejarflihbaerf");

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
        .on("click", selectCountry);




}