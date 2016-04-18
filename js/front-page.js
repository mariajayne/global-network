/**
 * Created by MagnusMoan on 17/04/16.
 */


var map = [],
    demographicData = [];

loadData();

function loadData() {

    queue()
        .defer(d3.json, "../data/demographics/world-topo.json")
        .await(processData);

}

function processData(error,data){

    map = data;

    createVis();

}

function createVis() {
    console.log(map);
    worldMap = new WorldMap("map",map,demographicData);
}