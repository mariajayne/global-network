/**
 * Created by MagnusMoan on 17/04/16.
 */


var map = [],
    demographicData = [];

loadData();

function loadData() {

    queue()
        .defer(d3.json, "../data/demographics/world-topo.json")
        .defer(d3.json, "../data/nodeMap/EList.json")
        .await(processData);

}

function processData(error,data1,data2){

    map = data1;
    demographicData = data2;

    createVis();

}

function createVis() {
    console.log(map);
    worldMap = new WorldMap("map",map,demographicData);
}