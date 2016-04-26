// TODO make slider pretty
// TODO make map compound

//globals
var width, height, projection, path, graticule, svg, attributeArray = [],
  currentAttribute = 0,
  playing = false,
  currentYear = 0,
  countryInternetData,
  percentage;

var tooltip = d3.select('body').append('div')
  .attr('class', 'hidden tooltip');

function init() {

  setMap();
  animateMap();
  mapSlider();
}

function setMap() {

  width = 960, height = 650;

  projection = d3.geo.fahey()
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
  // function accepts any errors from the queue function as first argument, then
  // each data object in the order of chained defer() methods above
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
  d3.select('#clock').html(attributeArray[currentAttribute]);
  drawMap(world);
}

function drawMap(world) {
  currentYear = 1990;

  svg.selectAll(".country")
    .data(topojson.feature(world, world.objects.countries).features)
    .enter().append("path")
    .attr("class", "country")
    .attr("id", function(d) {
      return "code_" + d.properties.id;
    }, true)
    .attr("d", path)
    .on('mousemove', function(d, i) {
      var mouse = d3.mouse(svg.node()).map(function(d) {
        return parseInt(d);
      });

      if (d.properties[attributeArray[currentAttribute]] !== undefined) {
        percentage = (d.properties[attributeArray[currentAttribute]]).toFixed(2);
      } else {
        percentage = 0;
      }

      tooltip.classed('hidden', false)
        .attr('style', 'left:' + (mouse[0] + 180) +
          'px; top:' + (mouse[1] - 20) + 'px')
        .html(d.properties.admin + "<br>" + currentYear + "<br>" + percentage + "%");
    })
    .on('mouseout', function() {
      tooltip.classed('hidden', true);
    });

  var dataRange = getDataRange();
  d3.selectAll('.country')
    .attr('fill-opacity', function(d) {
      if (d.properties[attributeArray[currentAttribute]] !== undefined) {
        return getColor(d.properties[currentYear], dataRange);
      } else {
        return 0;
      }
    });
}

function sequenceMap() {

  var dataRange = getDataRange();
  d3.selectAll('.country').transition()
    .duration(700)
    .attr('fill-opacity', function(d) {
      if (d.properties[attributeArray[currentAttribute]] !== undefined) {
        return getColor(d.properties[currentYear], dataRange);
      } else {
        return 0;
      }
    })
}

function getColor(valueIn, valuesIn) {
  var color = d3.scale.linear()
    .domain([valuesIn[0], valuesIn[1]])
    .range([0, 1]);
  // TODO decide if countries with no values should have a specific color
  if (valueIn === undefined || valueIn == 0) {
    return color(0);
  } else {
    return color(valueIn);
  }
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

  d3.select('#playbutton')
    .on('click', function() {
      playing = !playing;
      var animation = playing ? 'stop' : 'play';
      $('#animate_to_' + animation).get(0).beginElement();

      setTimeout(function periodicFunc() {
        if (playing && (currentAttribute < attributeArray.length - 1)) {
          currentAttribute++;
          currentYear = attributeArray[currentAttribute];
          sequenceMap();
          mapSlider();
          d3.select('#clock').html(currentYear);
          setTimeout(periodicFunc, 500);
        } else {
          if (currentAttribute >= attributeArray.length - 1) {
            sequenceMap();
          }
          if ((currentAttribute == attributeArray.length - 1) && playing) {

            currentAttribute = -1;
            playing = false;
            animation = 'play'
            $('#animate_to_' + animation).get(0).beginElement();
          }
        }
      }, 1000);
    });
}

function mapSlider() {
  var minYear = 1990,
    maxYear = 2014;

  var yearSlider = d3.slider()
    .axis(true).min(minYear).max(maxYear).step(1)
    .on("slide", function(evt, value) {
      if (value % 1 === 0) {
        for (var i = 0; i < attributeArray.length; i++) {
          if (value == attributeArray[i]) {
            currentAttribute = i;
          }
        }
        currentYear = attributeArray[currentAttribute];
        d3.select('#clock').html(currentYear);
        var dataRange = getDataRange();
        d3.selectAll('.country')
          .transition()
          .duration(300)
          .attr('fill-opacity', function(d) {
            return getColor(d.properties[currentYear], dataRange);
          });
      }
    });

  d3.select("#slider").call(yearSlider);

  if (currentYear != 0) {
    console.log(currentYear);
    // TODO figure out how to make this efficient...
    // bug when it restarts
    // TODO fix restarting issue
    yearSlider.destroy();
    yearSlider.value(currentYear);
    d3.select("#slider").call(yearSlider);
    // d3.dispatch("slide", "slideend").slide(d3.event, currentYear);
    // d3.select("#slider3").style(position, currentYear)
  }
}

window.onload = init();
