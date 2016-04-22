/**
 * Created by akselreiten on 17/04/16.
 */

var legend_box_h = 100;
var legend_box_w = 100;
var cencorshipLabels = ["Free","Partly Free", "Not Free","No data"]

var cencorshipMapping = {
    "#4daf4a": "Free",
    "#377eb8": "Partly Free",
    "#e41a1c": "Not Free"
}

WorldMap = function(_parentElement, _mapData,_freedomData){
    this.parentElement = _parentElement;
    this.mapData = _mapData;
    this.freedomData = _freedomData;
    this.displayData = this.data;
    this.initVis();
}

WorldMap.prototype.initVis = function(){

    var vis = this;

    vis.margin = {top: 0, right: 20, bottom: 0, left: 20};
    vis.width = 800 - vis.margin.left - vis.margin.right;
    vis.height = 450 - vis.margin.top - vis.margin.bottom;

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
        .style("fill","yellow")
        .on("click",changeView);

    //	Tooltip
    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([0,0])
        .html(function(d){
            return d.properties.admin;
        });

    this.createVisualization();

}

WorldMap.prototype.createVisualization = function (){

    var vis = this;
    vis.world = topojson.feature(vis.mapData, vis.mapData.objects.countries).features
    vis.svg.call(vis.tip);

    vis.svg.selectAll("path")
        .data(vis.world)
        .enter().append("path")
        .attr("d",vis.path)
        .attr("class","projection")
        .attr("id",function(d){return "" + d.properties.id;})
        .style("fill",defaultCountryColor)
        .style("stroke","white")
        .style("stroke-width", .3)
        .on("click", selectCountry)
        .on('mouseover',vis.tip.show)
        .on('mouseout',vis.tip.hide);

}


WorldMap.prototype.updateVisualization = function() {

    var vis = this;
    var legendList;

    //  Append legend only if cencorshipflag is on
    if (cencorShipFlag > 0) {legendList = [colorScaleCencorship["Free"], colorScaleCencorship["Partly Free"], colorScaleCencorship["Not Free"],"gray"]}
    else{legendList = [];}

    var legendContainer = vis.svg.selectAll('g')
        .data(legendList);

    var legend = legendContainer.enter().append("g");
    legend.append("rect");
    legend.append("text");

    legendContainer.select("rect")
        .attr("x", 10)
        .attr("y", function(d,i){return vis.height*3/4 + i * 20})
        .attr("width", 15)
        .attr("height",15)
        .style("fill", function(d){
            return d
        });

    legendContainer.select("text")
        .attr("x", 40)
        .attr("y", function(d,i){return 12 + vis.height*3/4 + i * 20})
        .style("fill", function(d){
            return d
        })
        .text(function(d,i){
            return cencorshipLabels[i];
        });

    legendContainer.exit().remove();

}