var width, height, projection, path, graticule, svg, attributeArray = [],
  currentAttribute = 0,
  playing = false;

function init() {

  setMap();
  animateMap();

}

function setMap() {

  width = 960, height = 580;

  projection = d3.geo.mercator()
    .scale(170)
    .translate([width / 2, height / 2])
    .precision(.1);

  path = d3.geo.path()
    .projection(projection);

  graticule = d3.geo.graticule();

  svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

  svg.append("defs").append("path")
    .datum({
      type: "Sphere"
    })
    .attr("id", "sphere")
    .attr("d", path);

  svg.append("use")
    .attr("class", "stroke")
    .attr("xlink:href", "#sphere");

  svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);

  loadData();

}

function loadData() {

  queue()
    .defer(d3.json, "data/internet-access/world-topo.json")
    .defer(d3.csv, "data/internet-access/internetData.csv")
    .await(processData);
}

function processData(error, world, countryData) {
  var countries = world.objects.countries.geometries;
  for (var i in countries) {
    for (var j in countryData) {
      if (countries[i].properties.id == countryData[j].id) {
        for (var k in countryData[i]) {
          if (k != 'name' && k != 'id') {
            if (attributeArray.indexOf(k) == -1) {
              attributeArray.push(k);
            }
            countries[i].properties[k] = Number(countryData[j][k])
          }
        }
        break;
      }
    }
  }

  // populate the clock initially with the current year
  d3.select('#clock').html(attributeArray[currentAttribute]);
  drawMap(world);

}

function drawMap(world) {

  svg.selectAll(".country")
    .data(topojson.feature(world, world.objects.countries).features)
    .enter().append("path")
    .attr("class", "country")
    .attr("id", function(d) {
      return "code_" + d.properties.id;
    }, true)
    .attr("d", path);

  var dataRange = getDataRange();
  d3.selectAll('.country')
    .attr('fill-opacity', function(d) {
      // return an opacity value based on the current value
      return getColor(d.properties[attributeArray[currentAttribute]], dataRange);
    });
}

function sequenceMap() {

  var dataRange = getDataRange();
  d3.selectAll('.country').transition()
    .duration(700)
    .attr('fill-opacity', function(d) {
      // the end color value
      return getColor(d.properties[attributeArray[currentAttribute]], dataRange);
    })
}

function getColor(valueIn, valuesIn) {

  var color = d3.scale.linear()
    .domain([valuesIn[0], valuesIn[1]])
    .range([.2, 1]);
     // output for opacity between .2 and 1

  return color(valueIn);
}

function getDataRange() {
  var min = Infinity,
    max = -Infinity;
  d3.selectAll('.country')
    .each(function(d, i) {
      var currentValue = d.properties[attributeArray[currentAttribute]];
      if (currentValue <= min && currentValue != -99 && currentValue != 'undefined') {
        min = currentValue;
      }
      if (currentValue >= max && currentValue != -99 && currentValue != 'undefined') {
        max = currentValue;
      }
    });
  return [min, max];
}

function animateMap() {

  var timer;
  d3.select('#play')
    // when user clicks the play button
    .on('click', function() {
      // if the map is currently playing
      if (playing == false) {
        timer = setInterval(function() {
          if (currentAttribute < attributeArray.length - 1) {
            currentAttribute += 1;
          } else {
            currentAttribute = 0;
          }
          // update the representation of the map
          sequenceMap();
          // update the clock
          d3.select('#clock').html(attributeArray[currentAttribute]);
        }, 500);

        // change the button label to stop
        d3.select(this).html('Stop Animation');
        // change the status of the animation
        playing = true;
      } else {
        // stop the animation by clearing the interval
        clearInterval(timer);
        // change the button label to play
        d3.select(this).html('Play Animation');
        playing = false;
      }
    });
}


window.onload = init();
