var marginWhole = {top: 10, right: 10, bottom: 10, left: 10},
    sizeWhole = 640 - marginWhole.left - marginWhole.right

// Create the svg area
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", sizeWhole  + marginWhole.left + marginWhole.right)
    .attr("height", sizeWhole  + marginWhole.top + marginWhole.bottom)
  .append("g")
    .attr("transform", "translate(" + marginWhole.left + "," + marginWhole.top + ")");


d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv", function(data) {

  // What are the numeric variables in this dataset? How many do I have
  var allVar = ["Sepal_Length", "Sepal_Width", "Petal_Length", "Petal_Width"]
  var numVar = allVar.length

  // Now I can compute the size of a single chart
  mar = 20
  size = sizeWhole / numVar


  // ----------------- //
  // Scales
  // ----------------- //

  // Create a scale: gives the position of each pair each variable
  var position = d3.scalePoint()
    .domain(allVar)
    .range([0, sizeWhole-size])

  // Color scale: give me a specie name, I return a color
  var color = d3.scaleOrdinal()
    .domain(["setosa", "versicolor", "virginica" ])
    .range([ "#402D54", "#D18975", "#8FD175"])


  // ------------------------------- //
  // Add charts
  // ------------------------------- //
  for (i in allVar){
    for (j in allVar){

      // Get current variable name
      var var1 = allVar[i]
      var var2 = allVar[j]

      // If var1 == var2 i'm on the diagonal, I skip that
      if (var1 === var2) { continue; }

      // Add X Scale of each graph
      xextent = d3.extent(data, function(d) { return +d[var1] })
      var x = d3.scaleLinear()
        .domain(xextent).nice()
        .range([ 0, size-2*mar ]);

      // Add Y Scale of each graph
      yextent = d3.extent(data, function(d) { return +d[var2] })
      var y = d3.scaleLinear()
        .domain(yextent).nice()
        .range([ size-2*mar, 0 ]);

      // Add a 'g' at the right position
      var tmp = svg
        .append('g')
        .attr("transform", "translate(" + (position(var1)+mar) + "," + (position(var2)+mar) + ")");

      // Add X and Y axis in tmp
      tmp.append("g")
        .attr("transform", "translate(" + 0 + "," + (size-mar*2) + ")")
        .call(d3.axisBottom(x).ticks(3));
      tmp.append("g")
        .call(d3.axisLeft(y).ticks(3));

      // Add circle
      tmp
        .selectAll("myCircles")
        .data(data)
        .enter()
        .append("circle")
          .attr("cx", function(d){ return x(+d[var1]) })
          .attr("cy", function(d){ return y(+d[var2]) })
          .attr("r", 3)
          .attr("fill", function(d){ return color(d.Species)})
    }
  }


  // ------------------------------- //
  // Add histograms = diagonal
  // ------------------------------- //
  for (i in allVar){
    for (j in allVar){

      // variable names
      var var1 = allVar[i]
      var var2 = allVar[j]

      // If var1 == var2 i'm on the diagonal, otherwisee I skip
      if (i != j) { continue; }

      // create X Scale
      xextent = d3.extent(data, function(d) { return +d[var1] })
      var x = d3.scaleLinear()
        .domain(xextent).nice()
        .range([ 0, size-2*mar ]);

      // Add a 'g' at the right position
      var tmp = svg
        .append('g')
        .attr("transform", "translate(" + (position(var1)+mar) + "," + (position(var2)+mar) + ")");

      // Add x axis
      tmp.append("g")
        .attr("transform", "translate(" + 0 + "," + (size-mar*2) + ")")
        .call(d3.axisBottom(x).ticks(3));
      
     
      // set the parameters for the histogram
       var histogram = d3.histogram()
           .value(function(d) { return +d[var1]; })   // I need to give the vector of value
           .domain(x.domain())  // then the domain of the graphic
           .thresholds(x.ticks(15)); // then the numbers of bins

       // And apply this function to data to get the bins
       var bins = histogram(data);

       // Y axis: scale and draw:
       var y = d3.scaleLinear()
            .range([ size-2*mar, 0 ])
            .domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
				
       tmp.append("g")
        .attr("transform", "translate(" + (size-mar*2)-10 + "," + 0 + ")")
        .call(d3.axisLeft(y).ticks(3));

       // append the bar rectangles to the svg element
       tmp.append('g')
          .selectAll("rect")
          .data(bins)
          .enter()
          .append("rect")
             .attr("x", 1)
             .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; })
             .attr("width", function(d) { return x(d.x1) - x(d.x0)  ; })
             .attr("height", function(d) { return (size-2*mar) - y(d.length); })
             .style("fill", "#b8b8b8")
             .attr("stroke", "white")
    }
  }


})
