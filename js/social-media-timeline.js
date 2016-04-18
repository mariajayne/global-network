/**
 * Created by MagnusMoan on 04/04/16.
 */


var transitionTime = 370;

Timeline = function(_parentElement,_data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.chosenCategory = "all";
    this.clicked = false;
    this.clickedElement = null;

    this.initVis();
};


Timeline.prototype.initVis = function() {
    var vis = this;

    vis.margin = { top: 30, right: 40, bottom: 30, left: 40 };

    vis.width = 1400 - vis.margin.left - vis.margin.right,
    vis.height = 400 - vis.margin.top - vis.margin.bottom;

    //  SVG drawing area
    vis.svg = d3.select("#"+vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .attr("id", "timeline-drawing-space")
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Variables used to position the different platform information tooltips
    vis.platformInfoX = +$("#social-media-col").css("width").slice(0,-2) -
        +$("#timeline-drawing-space").css("width").slice(0,-2);
    vis.platformInfoX = (vis.platformInfoX / 2.0) + +$("#social-media-col").css("padding-left").slice(0,-2)
        + vis.margin.left;

    // Scales
    vis.x = d3.time.scale()
        .range([0, vis.width])
        .domain([dateFormat("01-01-1997"), dateFormat("01-01-2015")]);

    vis.r = d3.scale.linear()
        .range([0, 150])
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

    // Under title
    vis.subtitle = vis.svg.append("g")
        .append("text")
        .attr("id", "sub-title")
        .attr("y", 30)
        .attr("x", vis.width / 2.0)
        .attr("text-anchor", "middle")
        .text("Social networks / Chat Applications / All");


    // Add rectangles for choosing social media category
    var rectHeight = 25;
    var yPosition = 12;

    vis.rectSocialNetwork = vis.svg.append("rect")
        .attr("x", (vis.width / 2.0) - 132)
        .attr("y", yPosition)
        .attr("class", "category-rect")
        .attr("id", "network")
        .attr("width", 100)
        .attr("height", rectHeight)
        .on("click", function() {
            vis.moveChosen(this);
        });

    vis.rectSocialMsg = vis.svg.append("rect")
        .attr("x", (vis.width / 2.0) - 18)
        .attr("y", yPosition)
        .attr("class", "category-rect")
        .attr("id", "msg")
        .attr("width", 113)
        .attr("height", rectHeight)
        .on("click", function() {
            vis.moveChosen(this);
        });

    vis.rectAll = vis.svg.append("rect")
        .attr("x", (vis.width / 2.0) + 109)
        .attr("y", yPosition)
        .attr("class", "category-rect")
        .attr("id", "all")
        .attr("width", 23)
        .attr("height", rectHeight)
        .on("click", function() {
            vis.moveChosen(this);
        });

    vis.rectBoundary = vis.svg.append("rect")
        .attr("x", (vis.width / 2.0) - 133)
        .attr("y", yPosition)
        .attr("id", "boundary-rect")
        .attr("width", 265)
        .attr("height", rectHeight);

    vis.rectChosenCategory = vis.svg.append("rect")
        .attr("x", (vis.width / 2.0) + 109)
        .attr("y", yPosition)
        .attr("id", "chosen-rect")
        .attr("width", 23)
        .attr("height", rectHeight);

    // Social media icons

    vis.platformIcons = $("#platform-icons");
    vis.platformIcons.html("");
    var noFontSymbol = "";

    vis.data.forEach(function(platform) {
        if (platform.Symbol == 0) {
            noFontSymbol = noFontSymbol.concat("<img src=\"../data/social-media/".concat(platform.Platform.replace(/\s/g, ''))
                + ".svg\" type=\"image/svg.xml\" class=\"platform-icon\" style=\"height:15px;width:15px;" +
                "padding-right:30px;\"></img>");
        } else {
            platformIcon = " <p " +
                "class=\"fa ".concat(platform.Symbol).concat("\"></p>");
            var oldhtml = vis.platformIcons.html();
            vis.platformIcons.html(oldhtml + platformIcon);
        }

    });



    // Platform information textbox
    vis.platformName = $("#platformName");
    vis.platformReleaseDate = $("#platformDate");
    vis.platformUsers = $("#platformUsers");
    vis.platformAbout = $("#platformAbout");

    vis.wrangleData();
};


Timeline.prototype.wrangleData = function() {
    var vis = this;

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
    var circle = vis.svg.selectAll("circle")
        .data(vis.wrangledData);

    circle.enter()
        .append("circle")
        .attr("class", "circle");

    circle.transition()
        .attr("cx", function(d) { return vis.x(d.Date)})
        .attr("cy", vis.height/2.0 + vis.margin.top)
        .attr("r", function(d) {return vis.r(d.Current_size)})
        .attr("fill", "white")
        .attr("opacity",.5);

    // Hovering actions
    circle.on("mouseover", function(d) {
        if (!vis.clicked) {
            vis.hoverAction(d, this);
        }

    });
    circle.on("mouseout", function(d) {
        if (!vis.clicked) {
            d3.selectAll(".circle").transition().duration(transitionTime).attr("opacity",.5);
            //vis.platformInfo.html("");
        }
    });

    circle.on("click", function(d) {
        if(vis.clickedElement != d.Platform) {
            vis.clicked = true;
            vis.clickedElement = d.Platform;
        } else {
            vis.clicked = false;
        }
        vis.hoverAction(d, this);
        selectPlatform(d.Platform);
    });


    circle.exit()
        .remove();
};

function dateToString(date) {
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return "" + monthNames[date.getMonth()] + " " + date.getDay() + "." + " " + date.getFullYear();
}
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

    d3.selectAll(".circle").transition().duration(transitionTime).attr("opacity", 0.1);
    d3.select(circle).transition().duration(transitionTime).attr("opacity", 0.7);


    vis.platformReleaseDate.html("Release date: " + dateToString(d.Date));
    vis.platformUsers.html("Monthly active users: " + d.Current_size + " million");
    vis.platformAbout.html(d.About);

    var htmlString = d.Platform;
    if (d.Symbol.length == 0) {
        htmlString = htmlString.concat(" <img src=\"../data/social-media/".concat(d.Platform.replace(/\s/g, '')) + ".svg\"" +
            " type=\"image/svg.xml\" class=\"svg-img\" style=\"height:15px;width:15px;\"></img>");
    } else {
        htmlString = htmlString.concat(" <i class=\"fa ".concat(d.Symbol).concat("\"></i>"));
    }
    vis.platformName.html( htmlString);

    /*var x = vis.platformInfoX + vis.x(d.Date);

    vis.platformInfo.css("left", x);
    vis.platformInfo.css("margin-top", vis.height + vis.margin.top + vis.margin.bottom);

    var htmlString = "Platform: " + d.Platform;
    if (d.Symbol.length == 0) {
        htmlString = htmlString.concat(" <img src=\"../data/social-media/".concat(d.Platform.replace(/\s/g, '')) + ".svg\"" +
            " type=\"image/svg.xml\" class=\"svg-img\" style=\"height:15px;width:15px;\"></img>");
    } else {
        htmlString = htmlString.concat(" <i class=\"fa ".concat(d.Symbol).concat("\"></i>"));
    }
    vis.platformInfo.html(htmlString + "<br> Release date: " + dateToString(d.Date)
        + "<br> Monthly active users: " + d.Current_size + " million");
    x -= (+vis.platformInfo.css("width").slice(0,-2))/2.0;
    vis.platformInfo.css("left", x);*/

}