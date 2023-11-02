// Check breakpoint
function breakCalc(x){
  x <= 480 ? y = 'xs' : y = 'md';
  return y;
}

var breakpoint = breakCalc($(window).width());

$(window).resize(function(){
  var breakpoint = breakCalc($(window).width());
})

// change the height of the chart depending on the breakpoint
function breakHeight(bp){
  bp == 'xs' ? y = 250 : y = 500;
  return y;
}

// function to group by multiple properties in underscore.js
_.groupByMulti = function (obj, values, context) {
    if (!values.length)
        return obj;
    var byFirst = _.groupBy(obj, values[0], context),
        rest = values.slice(1);
    for (var prop in byFirst) {
        byFirst[prop] = _.groupByMulti(byFirst[prop], rest, context);
    }
    return byFirst;
};

// function to decide whether to pluralize the word "award" in the tooltip
function awardPlural(x){
  x == 1 ? y = 'award' : y = 'awards';
  return y;
}

// funciton to determine the century of the datapoint when displaying the tooltip
function century(x){
  x<100 ? y = '19'+x : y = '20'+(x.toString().substring(1));
  return y;
}

// function to ensure the tip doesn't hang off the side
function tipX(x){
  var winWidth = $(window).width();
  var tipWidth = $('.tip').width();
  if (breakpoint == 'xs'){
    x > winWidth - tipWidth - 20 ? y = x-tipWidth : y = x;
  } else {
    x > winWidth - tipWidth - 30 ? y = x-45-tipWidth : y = x+10;
  }
  return y;
}

// function to create the chart
function chart(column, filterBy, groupBy) {

  // basic chart dimensions
  var margin = {top: 20, right: 1, bottom: 30, left: 0};
  var width = $('.chart-wrapper').width() - margin.left - margin.right;
  var height = breakHeight(breakpoint) - margin.top - margin.bottom;

  // chart top used for placing the tooltip
  var chartTop = $('.chart.'+groupBy+'.'+filterBy).offset().top;

  // tooltip
  var tooltip = d3.select("body")
      .append("div")
      .attr("class", "tip")
      .style("position", "absolute")
      .style("z-index", "20")
      .style("visibility", "hidden")
      .style("top", 40+chartTop+"px");

  // scales:
  // x is a time scale, for the horizontal axis
  // y is a linear (quantitative) scale, for the vertical axis
  // z is in ordinal scale, to determine the colors (see var colorrange, below)
  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height-10, 0]);

  // color range provided by colorbrewer
  // i just added a bunch of grays at the end so that the categories grouped as other all appear gray.
  // there's definitely a better way to do this

  var colorrange = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854','#ffd92f','#e5c494','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3','#b3b3b3'];

  var z = d3.scale.ordinal()
      .range(colorrange);

  // the x-axis. note that the ticks are years, and we'll show every 5 years
  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(d3.timeYears, 5);

  // stacked layout. the order is reversed to get the largest value on top
  // if you change the order to inside-out, the streams get all mixed up and look cool
  // but the graph is harder to read. reversed order ensures that the streams are in the
  // same order as the legend, which improves readability in lieu of directly labelling
  // the streams (which is another programming challenge entirely)
  var stack = d3.layout.stack()
      .offset("silhouette")
      .order("reverse")
      .values(function(d) { return d.values; })
      .x(function(d) { return d.date; })
      .y(function(d) { return d.value; });

  var nest = d3.nest()
      .key(function(d) { return d.key; });

  // there are some ways other than "basis" to interpolate the area between data points
  // for example, you can use "cardinal", which makes the streams a little more wiggly.
  // the drawback with that approach is that if you have years where there is no data,
  // you won't see a flat line across the center of the chart. instead, it will look all bumpy.
  // ultimately, "cardinal" interpolation is more likely to give an inaccurate represenation of the data,
  // which is anyway a danger with any type of interpolation, including "basis"
  var area = d3.svg.area()
      .interpolate("basis")
      .x(function(d) { return x(d.date); })
      .y0(function(d) { return y(d.y0)-.2; }) // -.2 to create a little space between the layers
      .y1(function(d) { return y(d.y0 + d.y)+.2; }); // +.2, likewise

  var svg = d3.select(".chart."+groupBy+'.'+filterBy).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // generate a legend
  function legend(layers){

    // generate the legend title
    function titler(filter,group){

      if (group == 'place') {
        if (filter == 'india'){
          return "State";
        } else {
          return "Country";
        }
      }

    }

    $('.chart.'+groupBy+'.'+filterBy).prepend('<div class="legend"><div class="title">'+titler(filterBy,groupBy)+'</div></div>');
    $('.legend').hide();
    var legend = []
    layers.forEach(function(d,i){
      var obj = {};
      if (i<7){
        obj.key = d.key;
        obj.color = colorrange[i];
        legend.push(obj);
      }
    });

    // others
    if (layers.length>7){legend.push({key: "Other",color: "#b3b3b3"});}

    legend.forEach(function(d,i){
      $('.chart.'+groupBy+'.'+filterBy+' .legend').append('<div class="item"><div class="swatch" style="background: '+d.color+'"></div>'+d.key+'</div>');
    });

    $('.legend').fadeIn();

  }// end legend function

  // parse the data
  function parse(data){

    // this filters and groups the data
    // based on the filters provided in the .chart div (see the html file)
    var filter;
    var searchObj = {};
    searchObj[column] = filterBy;

    if (column=="none"){
      filter=data;
    } else {
      filter = _.where(data,searchObj);
    }

    var categories = _.chain(filter)
        .countBy(groupBy)
        .pairs()
        .sortBy(1).reverse()
        .pluck(0)
        .value();

    var sort = _.sortBy(filter,categories);

    // group by
    var group = _.groupByMulti(sort, ['year', groupBy])

    var newData = [];

    // it is necessary to add an extra year to the data (as well as duplicate the data for the final year)
    // so that the chart does not get cut off on the right side
    for (var i = 1954;i<2018;i++){

      var currYear = group[i];

      // no data for a year
      if (currYear == undefined) {
        currYear = {};
      }

      categories.forEach(function(area){

        var obj = {};
        if (currYear[area] == undefined){
          // if the year does not have any in a particular category
          obj.key = area;
          obj.value = 0;
          obj.date = moment(i.toString())._d;
        } else {
          obj.key = currYear[area][0][groupBy];
          obj.value = currYear[area].length;
          obj.date = moment(currYear[area][0].year)._d;
        }

        newData.push(obj);
      });

    }

    console.log("newData:", newData)
    data = newData;// you could just return newData, but this way seems cleaner to me
    return data;
  }

  // now we call the data, as the rest of the code is dependent upon data
  d3.csv("awards.csv", function(data) {

    // parse the data (see parsing function, above)
    data = parse(data);
    
    // generate our layers
    console.log("nest.entries(data):", nest.entries(data))
    var layers = stack(nest.entries(data));
    console.log("layers:", layers)

    // our legend is based on our layers
    legend(layers);

    // set the domains
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain([0, d3.max(data, function(d) { return d.y0 + d.y; })]);

    // and now we're on to the data joins and appending
    svg.selectAll(".layer")
        .data(layers)
      .enter().append("path")
        .attr("class", "layer")
        .attr("d", function(d) { return area(d.values); })
        .style("fill", function(d, i) { return z(i); });

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // abbreviate axis tick text on small screens
    if (breakpoint == 'xs') {

      $('.x.axis text').each(function(){
        var curTxt = $(this).text();
        var newTxt = "'"+curTxt.substr(2);
        $(this).text(newTxt);
      });

    }

    // user interaction with the layers
    svg.selectAll(".layer")
      .attr("opacity", 1)
      .on("mouseover", function(d, i) {
        svg.selectAll(".layer").transition()
          .duration(100)
          .attr("opacity", function(d, j) {
            return j != i ? 0.6 : 1;
      })})
      .on("mousemove", function(d, i) {

        var color = d3.select(this).style('fill'); // need to know the color in order to generate the swatch

        mouse = d3.mouse(this);
        mousex = mouse[0];
        var invertedx = x.invert(mousex);
        var xDate = century(invertedx.getYear());
        d.values.forEach(function(f){
          var year = (f.date.toString()).split(' ')[3];
          if (xDate == year){
              tooltip
                .style("left", tipX(mousex) +"px")
                .html( "<div class='year'>" + year + "</div><div class='key'><div style='background:" + color + "' class='swatch'>&nbsp;</div>" + f.key + "</div><div class='value'>" + f.value + " " + awardPlural((f.value)) + "</div>" )
                .style("visibility", "visible");
          }
        });
      })
      .on("mouseout", function(d, i) {
        svg.selectAll(".layer").transition()
          .duration(100)
          .attr("opacity", '1');
        tooltip.style("visibility", "hidden");
    });

    // vertical line to help orient the user while exploring the streams
    var vertical = d3.select(".chart."+groupBy+'.'+filterBy)
          .append("div")
          .attr("class", "remove")
          .style("position", "absolute")
          .style("z-index", "19")
          .style("width", "2px")
          .style("height", "460px")
          .style("top", "10px")
          .style("bottom", "30px")
          .style("left", "0px")
          .style("background", "#fcfcfc");

    d3.select(".chart."+groupBy+'.'+filterBy)
        .on("mousemove", function(){
           mousex = d3.mouse(this);
           mousex = mousex[0] + 5;
           vertical.style("left", mousex + "px" )})
        .on("mouseover", function(){
           mousex = d3.mouse(this);
           mousex = mousex[0] + 5;
           vertical.style("left", mousex + "px")});

    // Add 'curtain' rectangle to hide entire graph
    var curtain = svg.append('rect')
     .attr('x', -1 * width)
     .attr('y', -1 * height)
     .attr('height', height)
     .attr('width', width)
     .attr('class', 'curtain')
     .attr('transform', 'rotate(180)')
     .style('fill', '#fcfcfc')

    // Create a shared transition for anything we're animating
    var t = svg.transition()
     .delay(100)
     .duration(1500)
     .ease('exp')
     .each('end', function() {
       d3.select('line.guide')
         .transition()
         .style('opacity', 0)
         .remove()
     });

    t.select('rect.curtain')
      .attr('width', 0);
    t.select('line.guide')
      .attr('transform', 'translate(' + width + ', 0)');

  });

}

// get the various arguments from the chart div attributes
// if you're making one chart, this approach is unnecessary
// however, for several stream graphs on one page, this approach is useful
// it allows you to decide how to query the data in the html by assigning various
// attributes to the chart div.
var column = $('.chart').attr("column");
var groupBy = $('.chart').attr("groupBy");
var filterBy = $('.chart').attr("filterBy");
$('.chart').addClass(groupBy).addClass(filterBy);
chart(column,filterBy,groupBy);
