/**
 * Created by MagnusMoan on 04/04/16.
 */


Timeline = function(_parentElement,_data, _descriptionText) {
    this.parentElement = _parentElement;
    this.data = _data;

    this.descriptionText = _descriptionText;

    this.initVis();
};


Timeline.prototype.initVis = function() {
    var vis = this;

    vis.margin = { top: 40, right: 40, bottom: 40, left: 40 };

    vis.width = screen.width/1.1 - vis.margin.left - vis.margin.right;
    vis.height = screen.width/4 - vis.margin.top - vis.margin.bottom;

    //  SVG drawing area
    vis.svg = d3.select("#"+vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .attr("id", "timeline-drawing-space")
        .append("g")
        .attr("id", "timeline")
        .attr("transform", "translate(" + vis.margin.left + "," + (-18 + vis.margin.top )+ ")");

    vis.bounds = document.getElementById("timeline-drawing-space").getBoundingClientRect();
    vis.innerBounds = document.getElementById("timeline-drawing-space").firstElementChild.getBoundingClientRect();

    
    // Positioning other elements relatively to the timeline. TODO: Move this out to social-media.js
    positionRelativeToTimeline(vis);

    
    // Scales
    vis.x = d3.time.scale()
        .range([0, vis.width])
        .domain([dateFormat("01-01-1997"), dateFormat("01-01-2015")]);

    vis.r = d3.scale.linear()
        .range([0, vis.height/2.4])
        .domain([0,d3.max(vis.data, function(d){return d.Current_size})]);


    // Axis
    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom")
        .outerTickSize(0);

    vis.svg.append("g")
        .attr("class","x-axis")
        .attr("transform","translate(0,"+(vis.height/2.0 + vis.margin.top)+")");


    // Main information box
    vis.title = vis.svg.append("g")
        .append("text")
        .attr("id","title")
        .attr("y", 0)
        .attr("x", vis.width/2.0)
        .attr("text-anchor", "middle")
        .text("Social media");

    
    // Sub title
    vis.subtitle = vis.svg.append("g")
        .append("text")
        .attr("id", "sub-title")
        .attr("y", .091*vis.bounds.height)
        .attr("x", vis.width / 2.0)
        .attr("text-anchor", "middle")
        .text("Social networks / Chat Applications / All");

    
    // Legend circles
    /*
    vis.svg.selectAll("legendCircles")
        .data([{"color": "#0d2e67", "cx": 4, "cy": .23*vis.bounds.height},
            {"color": "#a31313", "cx": 4, "cy": .16*vis.bounds.height}])
        .enter()
        .append("circle")
        .attr("r", 6)
        .attr("cx", function(d) { return d.cx })
        .attr("cy", function(d) { return d.cy })
        .attr("fill", function(d) { return d.color });
    */

    // Add rectangles for choosing social media category
    var rectHeight = 25;
    var yPosition = 12;

    vis.rectSocialNetwork = vis.svg.append("rect")
        .attr("x", (vis.width / 2.0) - 130)
        .attr("y", yPosition)
        .attr("class", "category-rect")
        .attr("id", "network")
        .attr("width", 108)
        .attr("height", rectHeight)
        .on("click", function() {
            vis.moveChosen(this);
        });

    vis.rectSocialMsg = vis.svg.append("rect")
        .attr("x", (vis.width / 2.0) - 21)
        .attr("y", yPosition)
        .attr("class", "category-rect")
        .attr("id", "msg")
        .attr("width", 118.5)
        .attr("height", rectHeight)
        .on("click", function() {
            vis.moveChosen(this);
        });

    vis.rectAll = vis.svg.append("rect")
        .attr("x", (vis.width / 2.0) + 101)
        .attr("y", yPosition)
        .attr("class", "category-rect")
        .attr("id", "all")
        .attr("width", 27)
        .attr("height", rectHeight)
        .on("click", function() {
            vis.moveChosen(this);
        });

    vis.rectBoundary = vis.svg.append("rect")
        .attr("x", (vis.width / 2.0) - 130)
        .attr("y", yPosition)
        .attr("id", "boundary-rect")
        .attr("width", 258)
        .attr("height", 25);

    vis.rectChosenCategory = vis.svg.append("rect")
        .attr("x", (vis.width / 2.0) + 101)
        .attr("y", yPosition)
        .attr("id", "chosen-rect")
        .attr("width", 27)
        .attr("height", rectHeight);

    
    // Shows all platforms by default
    vis.chosenCategory = "all";

    
    // Platform information textbox
    vis.platformName = $("#platformName");
    vis.platformReleaseDate = $("#platformDate");
    vis.platformUsers = $("#platformUsers");
    vis.platformAbout = $("#platformAbout");

    
    // Sets default text
    vis.setSocialMediaText();

    // Wrangle data
    vis.wrangleData();
};


Timeline.prototype.wrangleData = function() {
    var vis = this;

    // Wrangles data depending on if the user have chosen "Social Networks", "Chat Applications" or "All" (default)
    switch (vis.chosenCategory) {
        case "network":
            vis.wrangledData = vis.data.filter(function(d) {
                return d.Msg == false;
            });
            break;
        case "msg":
            vis.wrangledData = vis.data.filter(function(d) {
                return d.Msg == true;
            });
            break;
        default:
            vis.wrangledData = vis.data;
    }

    vis.updateVis();
};


Timeline.prototype.updateVis = function() {
    var vis = this;

    // Add axis
    vis.svg.select(".x-axis").call(vis.xAxis);

    // Create circles
    var circle = vis.svg.selectAll(".lineCircle")
        .data(vis.wrangledData);

    circle.enter()
        .append("circle")
        .attr("class", "lineCircle");

    circle.transition()
        .attr("id", function(d) { return d.Platform.concat("-circle")
        })
        .attr("cx", function(d) { return vis.x(d.Date)})
        .attr("cy", vis.height/2.0 + vis.margin.top)
        .attr("r", function(d) {return vis.r(d.Current_size)})
        .attr("fill", function(d) {
            if (d.Msg){
                return "#0d2e67";
            }
            return "#a31313";
        })
        .attr("opacity",.5);

    // Hovering actions
    circle.on("mouseover", function(d) {
        vis.hoverAction(d, this);
    });
    circle.on("mouseout", function(d) {
        vis.hoverOutAction();
    });
    
    circle.exit()
        .remove();
};

// Function for moving the rectangle selecting "Social Networks", "Chat Applications" or "All"
Timeline.prototype.moveChosen = function(target) {
    var vis = this;
    target = d3.select(target);
    vis.rectChosenCategory.transition().duration(transitionTime)
        .attr("x", target.attr("x"))
        .attr("width", target.attr("width"));

    vis.chosenCategory = target.attr("id");
    vis.wrangleData();
}

Timeline.prototype.hoverAction = function(d, circle) {
    var vis = this;

    d3.selectAll(".lineCircle").transition().duration(transitionTime).attr("opacity", 0.1);
    d3.select(circle).transition().duration(transitionTime).attr("opacity", 0.7);

    vis.platformReleaseDate.html("Release date: " + dateToString(d.Date));
    vis.platformUsers.html("Monthly active users: " + d.Current_size + " million");
    vis.platformAbout.html(d.About);

    var htmlString = d.Platform;
    if ((d.Symbol.length == 0) && (d.Platform != "yy")) {
        htmlString = htmlString.concat(" <img src=\"../data/social-media/".concat(d.Platform.replace(/\s/g, '')) + ".svg\"" +
            "id=\"" + (d.Platform.replace(/\s/g, '')) + "Svg\"   class=\"svg svg-img\"></img>");
    } else {
        htmlString = htmlString.concat(" <i class=\"fa ".concat(d.Symbol).concat("\"></i>"));
    }

    vis.platformName.html( htmlString);
    if ((d.Symbol.length == 0) && (d.Platform != "yy")) {
        swapSvg();
    }
}

Timeline.prototype.hoverOutAction = function() {
    var vis = this;

    d3.selectAll(".lineCircle").transition().duration(transitionTime).attr("opacity",.5);
    vis.setSocialMediaText();
}


/* Helper function that removes an svg image loaded from file and replacing it with a generated image.
   This new image looks exactly like the old one, but it's modifiable, which makes it possible to change
   the color of it. */
function swapSvg() {

    jQuery('img.svg-img').each(function(){

        var $img = jQuery(this);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');

        jQuery.get(imgURL, function(data) {
            // Get the SVG tag, ignore the rest
            var $svg = jQuery(data).find('svg');

            // Add replaced image's ID to the new SVG
            if(typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }

            // Add replaced image's classes to the new SVG
            if(typeof imgClass !== 'undefined') {
                $svg = $svg.attr('class', imgClass+' replaced-svg');
            }

            // Remove any invalid XML tags as per http://validator.w3.org
            $svg = $svg.removeAttr('xmlns:a');

            // Replace image with new SVG
            $img.replaceWith($svg);

        }, "xml");
    });
}

// Function changing the text under the timeline to some general information text about social media
Timeline.prototype.setSocialMediaText = function(){
    var vis = this;
    vis.platformName.html("Social media and internet usage");
    vis.platformAbout.html("" + vis.descriptionText.Text);
    vis.platformUsers.html("");
    vis.platformReleaseDate.html("");
}


/* Function that position other elements on the page relatively to the timeline.
   TODO: This function should be refactored and moved to social-media.js
 */
function positionRelativeToTimeline(vis) {
    
    // Variables used for positioning
    var timeLineSvg = document.getElementById("timeline-drawing-space").firstElementChild.getBoundingClientRect();
    var navLine = document.getElementById("nav-line");
    var navLineStyle = navLine.currentStyle || window.getComputedStyle(navLine);
    var navBarHeight = document.getElementById("social-media-navbar").clientHeight;
    var marginNavLine = parseInt(navLineStyle.marginBottom.slice(0,-2));
    
    
    // Positioning of the platform information text
    var e = document.getElementById("platformInformationText");
    e.style.left = "" + ((screen.width - vis.bounds.width)/2.0 + vis.margin.left) + "px";
    e.style.width = (vis.bounds.width / 3.0) + "px";


    // Positioning of the bar chart
    var barChart = document.getElementById("social-media-bar-chart");
    var foo = ((vis.bounds.width / 2.0) - vis.margin.right - barChart.getBoundingClientRect().width) / 2.0;
    barChart.style.left = (foo + (screen.width/2.0)) + "px";
    

    // Positioning of the timeline legends
    var legendTable = document.getElementById("legendTable");
    legendTable.style.top = (navBarHeight + .18*vis.bounds.height + marginNavLine) + "px";
    legendTable.style.left = (timeLineSvg.left - 9) + "px";


    // Positioning of the timeline help text
    var helpText = document.getElementById("helpText");
    helpText.style.left = timeLineSvg.left + "px";
    helpText.style.top = (navBarHeight + marginNavLine + .12*vis.bounds.height) + "px";


    // Positioning of the flag table
    var flagTable = document.getElementById("flagTable");
    var barChartBounds = parseFloat(barChart.style.left.slice(0,-2)) + barChart.clientWidth + 25;
    flagTable.style.left = barChartBounds + "px";
    flagTable.style.top = 30 + "px";
}


// Helper for formatting a date to a string on the following format: Month(name) dd.yyyy
function dateToString(date) {
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return "" + monthNames[date.getMonth()] + " " + date.getDay() + "." + " " + date.getFullYear();
}