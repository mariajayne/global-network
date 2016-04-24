/**
 * Created by akselreiten on 15/04/16.
 */

var metricMap = {
    "gdp" : "", // "GDP (current LCU)",
    "internet" : "", //"Internet users (per 100 people) ",
    "unemployment" : "", //"Total Unemployment (% of labor force)",
    "university" : "", //"Gross enrolment ratio, University(%)"
}

var labelMap = {
    "gdp" : "Gross Domestic Product Per Capita (USD)",
    "internet" : "Internet users (% of population)",
    "unemployment" : "Unemployment (% of work force)",
}

var styleColor = "gray";

LineChart= function(_parentElement,_data,_metric){
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];
    this.metric = _metric;
    this.initVis();
}

LineChart.prototype.initVis = function(){
    var vis = this;

    //  Defining margins, height and width
    vis.margin = {top:30,right:40,bottom:20,left:25}
    vis.width = 350 - vis.margin.left - vis.margin.right;
    vis.height = 180 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate("+ vis.margin.left+ "," + vis.margin.top + ")");

    //  Overlay with path clipping
    vis.svg.append("defs").append("clipPath")
        .attr("id","clip")
        .append("rect")
        .attr("width",vis.width)
        .attr("height",vis.height);

    // Scales
    vis.x = d3.time.scale()
        .range([0, vis.width])
        .domain(d3.extent(vis.data.countries[0].years, function(d){return d.year}));

    vis.y = d3.scale.linear().range([vis.height, 0]);

    //  Axis
    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom")
        .ticks(9);

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left")
        .tickFormat(function(d){return formatYLabel(d, vis.metric)})
        .ticks(6);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    //  Appending line
    vis.line = d3.svg.line()
        .defined(function(d) {return !isNaN(d[vis.metric])})
        .x(function(d){return vis.x(d.year)})
        .y(function(d){return vis.y(d[vis.metric])})
        .interpolate('basis');

    //  Appending labels to x axis
    vis.svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", vis.width)
        .attr("y", vis.height)
        .text("");

    //  Appending labels to y axis
    vis.svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "middle")
        .attr("y", -10)
        .attr("x", vis.width/2)
        .attr("dy", ".35em")
        .attr("transform", "rotate(0)")
        .text(labelMap[vis.metric]);

    //  Appending main title
    vis.svg.append("text")
        .attr("class", "axis-title")
        .attr("text-anchor", "start")
        .attr("y", 0)
        .attr("x", 0)
        .attr("dy", ".75em")
        .attr("transform", "rotate(0)")
        .text(metricMap[vis.metric]);


    //  Appending line and circle for tool-tips
    vis.focus = vis.svg.append("g").style("display","none");

    vis.focus.append("circle")
        .attr("class","y")
        .style("fill","#58B957")
        .style("stroke",styleColor)
        .attr("r",5);

    vis.focus.append("line")
        .attr("class","x")
        .style("stroke",styleColor)
        .style("stroke-dasharray","10,5")
        .style("opacity",0.9)
        .attr("y1",0)
        .attr("y2",vis.height);

    vis.focus.append("text")
        .attr("class", "y1")
        .style("stroke", styleColor)
        .style("font-size",14)
        .style("stroke-width", "1px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "-.3em");

    vis.focus.append("text")
        .attr("class", "y2")
        .style("stroke", styleColor)
        .style("font-size",12)
        .style("stroke-width", "0.75px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "-.3em");

    //Append rectangle for monitoring pointer-events
    vis.svg.append("rect")
        .attr("width",vis.width)
        .attr("height",vis.height)
        .style("fill","none")
        .style("pointer-events","all")
        .on("mouseover",function(){vis.focus.style("display",null);})
        .on("mouseout",function(){vis.focus.style("display","none");})
        .on("mousemove", mouseMove);

    function mouseMove () {
        var indexCountry = vis.displayData.length - 1;
        var x0 = vis.x.invert(d3.mouse(this)[0]);
        var i = bisectDate(vis.displayData[indexCountry].years, x0, 1);
        var d0 = vis.displayData[indexCountry].years[i - 1];
        var d1 = vis.displayData[indexCountry].years[i];
        var d = x0 - d0.year > d1.year- x0 ? d1 : d0;

        vis.focus.select("circle.y")
            .attr("transform","translate(" + vis.x(d.year) + "," + vis.y(d[vis.metric]) + ")");
        vis.focus.select("line.x")
            .attr("transform","translate(" + vis.x(d.year) + "," + vis.height + ")")
            .attr("y1", 0).attr("y2", -vis.height);
        vis.focus.select("text.y1")
            .attr("transform","translate(" + vis.x(d.year) + "," + 35 + ")")
            .text("Value: " + formatYLabel(d[vis.metric],vis.metric));
        vis.focus.select("text.y2")
            .attr("transform","translate(" + vis.x(d.year) + "," + 50 + ")")
            .text("Year: " + formatYear(d.year));
    }

    vis.wrangleData();

}


LineChart.prototype.wrangleData = function(){
    var vis = this;
    if (selectedCountries.length == 0){vis.displayData = [vis.data.countries[13]]}
    else{
        var countryScope = selectedCountries;
        vis.displayData = vis.data.countries.filter(function(d){return (countryScope.indexOf(d.country_id) >= 0)})
    }
    vis.updateVis();
}


LineChart.prototype.updateVis = function(){

    var vis = this;

    //  Set y-domain
    if (vis.metric == 'internet'){
        vis.y.domain([0,100]);
    }
    else{
        vis.y.domain([0,d3.max(vis.displayData,
                function(d){return d3.max(d.years,function(y){return y[vis.metric]})}
        )]);
    }

    // Call axis functions with the new domain
    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);

    //  Append line
    vis.svg.selectAll(".line").remove();
    vis.svg.selectAll(".text").remove();

    var lines = vis.svg.selectAll(".line")
        .data(vis.displayData)
        .attr("class","line");

    lines.enter().append("path")
        .attr("class","line")
        .attr("d",function(d){return vis.line(d.years)})
        .style("stroke",function(d){return colorScale(d.country_id);});

    var text = vis.svg.selectAll(".text")
        .data(vis.displayData)
        .attr("class","text");

    text.enter().append("text")
        .attr("class","text")
        .datum(function(d){return d.years[d.years.length - 1]})
        .attr("transform",function(d){return "translate("+vis.x(d.year)+","+vis.y(d[vis.metric]) + ")"; })
        .attr("x",2)
        .attr("dy",".35em")
        .style("stroke",styleColor)
        .style("font-size","10px")
        .text(function(d){return d.country_id;});


}