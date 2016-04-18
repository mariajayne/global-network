/**
 * Created by MagnusMoan on 17/04/16.
 */

var yearDelay = 5000.0;

WorldMap = function(_parentElement, _mapData, _data){
    this.parentElement = _parentElement;
    this.mapData = _mapData;
    this.data = _data;
    this.displayData = this.data;
    this.odometer = document.getElementById("odometer");
    /*
    this.cities = [{"City":"NY", "Pop":8175133, "Long":-74.006, "Lat":40.714},
        {"City":"LA", "Pop":3792621, "Long":-118.244, "Lat":34.052},
        {"City":"Chicago", "Pop":2695598, "Long":-87.65, "Lat":41.85},
        {"City":"Brooklyn", "Pop":2300664, "Long":-73.95, "Lat":40.65},
        {"City":"Houston", "Pop":2099451, "Long":-95.363, "Lat":29.763},
        {"City":"Oslo", "Pop":500000, "Long":10.7522, "Lat":59.9139}];*/

    this.cities = this.data;
    console.log(this.cities);

    /*for (var i = 1; i < this.cities.length; i++) {
        this.cities[i] = this.cities[i].concat(this.cities[i-1]);
    }*/


    setTimeout(function(){
        this.odometer.innerHTML = 7654321;
    }, 1000);

    this.initVis();


}



WorldMap.prototype.initVis = function(){

    var vis = this;

    vis.margin = {top: -250, right: 20, bottom: 100, left: 20};
    vis.width = screen.width - vis.margin.left - vis.margin.right;
    vis.height = screen.height - vis.margin.bottom;


    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.projection = d3.geo.mercator()
        .center([15,70])
        .scale(200)
        .translate([vis.width / 2, vis.height / 2]);

    vis.path = d3.geo.path()
        .projection(vis.projection);

    // Scale for radius of circles

    vis.r = d3.scale.log()
        .base(Math.E)
        .domain([1000,100000000])
        .range([0.5,7]);

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
        .attr("id",function(d){return "" + d.properties.id;});

    /*for (var i = 0; i < vis.cities.length; i++) {
        for (var j = 0; j < vis.cities[i].length; j++) {
            vis.updateVisualization(vis.cities[i][j]);
        }
    }*/


    var outerCounter = 0;
    var refreshId = window.setInterval(function() {
        vis.current_year = vis.cities[outerCounter];
        var innerCounter = 0;
        var innerRefreshId = window.setInterval(function() {
            vis.updateVisualization(vis.current_year[innerCounter]);
            innerCounter++;
            if (innerCounter == vis.current_year.length) {
                clearInterval(innerRefreshId);
            }
        }, yearDelay / vis.current_year.length);
        outerCounter++;
        if (outerCounter == vis.cities.length - 1){
            clearInterval(refreshId);
        }
    }, yearDelay)
}

WorldMap.prototype.updateVisualization = function (newNode){

    var vis = this;
    var timeBetween = yearDelay / vis.current_year.length;


    vis.svg.append("circle")
        .attr("class", "node")
        .attr("fill", "white")
        .attr("r", function(d) { return vis.r(newNode.Pop)})
        .attr("transform", function(d) {
            return "translate(" + vis.projection([newNode.Long, newNode.Lat]) + ")";
        });
        /*.transition()
        .delay(timeBetween)
        .attr("opacity",.5);*/

    /*
    var circle = vis.svg.selectAll(".node")
        .data(vis.current_year);

    circle.enter()
        .append("circle")
        .attr("class", "node");

    circle
        .style("box-shadow", "0 0 30px 15px #fff")
        .transition()
        .delay(function(d,i) { return i * 10})
        .attr("r", function(d) { return vis.r(d.Pop)})
        .attr("fill", "#FEFCD7")
        .attr("transform", function(d) {
            return "translate(" + vis.projection([d.Long, d.Lat]) + ")";
        });*/
}