/**
 * Created by MagnusMoan on 17/04/16.
 */

var yearDelay = 1500.0;
var nodeDelay, blinkDelay;

WorldMap = function(_parentElement, _mapData, _data, _globalNumberOfUsers) {
    this.parentElement = _parentElement;
    this.mapData = _mapData;
    this.data = _data;
    this.displayData = this.data;
    this.cities = this.data;
    this.globalNumberOfUsers = _globalNumberOfUsers;

    this.initVis();
}


WorldMap.prototype.initVis = function(){

    var vis = this;

    vis.margin = {top: 0, right: 0, bottom: 0, left: 0};
    vis.width = window.innerWidth * 0.8;
    vis.height = window.innerHeight;


    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", window.innerHeight - (document.getElementById("frontpage-headline").offsetHeight))//vis.height + vis.margin.top)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.projection = d3.geo.mercator()
        .center([0,0])
        .scale(120)
        .translate([vis.width / 2, vis.height / 1.9]);

    vis.path = d3.geo.path()
        .projection(vis.projection);

    // Scale for radius of circles

    vis.r = d3.scale.log()
        .base(Math.E)
        .domain([1000,10000000])
        .range([0.05,5]);


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
        .attr("id",function(d){return "" + d.properties.id;});

    // Remove Antarctica
    vis.svg.select("#ATA").remove();

    vis.yearCounter = document.getElementById("yearCounter");
    vis.userCounter = document.getElementById("userCounter1");


    // The following code adds the nodes in an iterative fashion. Currently this approach only works for the first
    // few years, after that the number of nodes becomes to big.

    var outerCounter = 0;
    var year = 1993;
    vis.current_year = vis.cities[0];
    nodeDelay = (yearDelay / vis.current_year.length);
    blinkDelay = .2*nodeDelay;

    var innerCounter = 0;

    var innerRefreshId = setInterval(function() {
        vis.updateVisualization(vis.current_year[innerCounter]);
        innerCounter++;
        if (innerCounter == vis.current_year.length) {
            clearInterval(innerRefreshId);
        }
    }, nodeDelay);


    var refreshId = setInterval(function() {
        vis.current_year = vis.cities[outerCounter];
        vis.userCounter.innerHTML = numberWithCommas(parseInt(vis.userCounter.innerHTML.replace(/,/g,''))
            + parseInt(vis.globalNumberOfUsers[0][outerCounter]));
        vis.yearCounter.innerHTML = (parseInt(vis.yearCounter.innerHTML) + 1);
        nodeDelay = yearDelay / vis.current_year.length;
        var innerCounter = 0;
        var innerRefreshId = setInterval(function() {
            vis.updateVisualization(vis.current_year[innerCounter]);
            innerCounter++;
            if (innerCounter == vis.current_year.length) {
                clearInterval(innerRefreshId);
            }
        }, nodeDelay);
        outerCounter++;
        if (outerCounter == vis.cities.length - 1){
            clearInterval(refreshId);
        }
    }, yearDelay);

}

WorldMap.prototype.updateVisualization = function (newNode){

    var vis = this;

    var circle = vis.svg.append("circle")
        .attr("class", "node")

        .attr("transform", function(d) {
            return "translate(" + vis.projection([newNode.Long, newNode.Lat]) + ")";
        })
        .attr("r", function(d) { return vis.r(newNode.Pop)})
        .attr("fill", "#1B3F8B")
        .attr("opacity", 1)
        .transition()
        .duration(250)
        .attr("fill", "#3b5998");

}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}