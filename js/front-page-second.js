
// Hide navbar until animation starts
document.getElementById("frontpage-headline").style.visibility = "hidden";


var map = [],
    demographicData = [],
    globalNumberOfUsers = [];

loadData();

function loadData() {
    queue()
        .defer(d3.json, "../data/demographics/world-topo.json")
        .defer(d3.json, "../data/nodeMap/Test.json")
        .await(processData);
}

function processData(error,data1,data2){
    map = data1;
    demographicData = data2.slice(0,-1);
    globalNumberOfUsers = data2.slice(-1);
    createVis();
}

function createVis() {
    document.getElementById("frontpage-headline").style.visibility = "visible";
    d3.select("#cover").transition().duration(2000).style("opacity", 0);
    worldMap = new WorldMap("map",map,demographicData, globalNumberOfUsers);
}

d3.select("#legendCircle").append("svg").attr("height", 25).attr("width", 25)
    .append("circle").attr("cx", 19).attr("cy", 15).attr("r", 5.5).attr("fill", "#3b5998");
