(function () {
  'use strict';

  var marginWhole = {top: 10, right: 10, bottom: 10, left: 10},
      sizeWhole = 640 - marginWhole.left - marginWhole.right;

  // Create the svg area
  var svg = d3.select("#my_dataviz")
    .append("svg")
      .attr("width", sizeWhole  + marginWhole.left + marginWhole.right)
      .attr("height", sizeWhole  + marginWhole.top + marginWhole.bottom)
    .append("g")
      .attr("transform", "translate(" + marginWhole.left + "," + marginWhole.top + ")");


  d3.csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/iris.csv", function(data) {

    // What are the numeric variables in this dataset? How many do I have
    var allVar = ["Sepal_Length", "Sepal_Width", "Petal_Length", "Petal_Width"];
    var numVar = allVar.length;

    // Now I can compute the size of a single chart
    mar = 20;
    size = sizeWhole / numVar;


    // ----------------- //
    // Scales
    // ----------------- //

    // Create a scale: gives the position of each pair each variable
    var position = d3.scalePoint()
      .domain(allVar)
      .range([0, sizeWhole-size]);

    // Color scale: give me a specie name, I return a color
    var color = d3.scaleOrdinal()
      .domain(["setosa", "versicolor", "virginica" ])
      .range([ "#402D54", "#D18975", "#8FD175"]);


    // ------------------------------- //
    // Add charts
    // ------------------------------- //
    for (i in allVar){
      for (j in allVar){

        // Get current variable name
        var var1 = allVar[i];
        var var2 = allVar[j];

        // If var1 == var2 i'm on the diagonal, I skip that
        if (var1 === var2) { continue; }

        // Add X Scale of each graph
        xextent = d3.extent(data, function(d) { return +d[var1] });
        var x = d3.scaleLinear()
          .domain(xextent).nice()
          .range([ 0, size-2*mar ]);

        // Add Y Scale of each graph
        yextent = d3.extent(data, function(d) { return +d[var2] });
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
            .attr("fill", function(d){ return color(d.Species)});
      }
    }


    // ------------------------------- //
    // Add histograms = diagonal
    // ------------------------------- //
    for (i in allVar){
      for (j in allVar){

        // variable names
        var var1 = allVar[i];
        var var2 = allVar[j];

        // If var1 == var2 i'm on the diagonal, otherwisee I skip
        if (i != j) { continue; }

        // create X Scale
        xextent = d3.extent(data, function(d) { return +d[var1] });
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
               .attr("stroke", "white");
      }
    }


  });

}());

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBtYXJnaW5XaG9sZSA9IHt0b3A6IDEwLCByaWdodDogMTAsIGJvdHRvbTogMTAsIGxlZnQ6IDEwfSxcbiAgICBzaXplV2hvbGUgPSA2NDAgLSBtYXJnaW5XaG9sZS5sZWZ0IC0gbWFyZ2luV2hvbGUucmlnaHRcblxuLy8gQ3JlYXRlIHRoZSBzdmcgYXJlYVxudmFyIHN2ZyA9IGQzLnNlbGVjdChcIiNteV9kYXRhdml6XCIpXG4gIC5hcHBlbmQoXCJzdmdcIilcbiAgICAuYXR0cihcIndpZHRoXCIsIHNpemVXaG9sZSAgKyBtYXJnaW5XaG9sZS5sZWZ0ICsgbWFyZ2luV2hvbGUucmlnaHQpXG4gICAgLmF0dHIoXCJoZWlnaHRcIiwgc2l6ZVdob2xlICArIG1hcmdpbldob2xlLnRvcCArIG1hcmdpbldob2xlLmJvdHRvbSlcbiAgLmFwcGVuZChcImdcIilcbiAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIG1hcmdpbldob2xlLmxlZnQgKyBcIixcIiArIG1hcmdpbldob2xlLnRvcCArIFwiKVwiKTtcblxuXG5kMy5jc3YoXCJodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vaG9sdHp5L0QzLWdyYXBoLWdhbGxlcnkvbWFzdGVyL0RBVEEvaXJpcy5jc3ZcIiwgZnVuY3Rpb24oZGF0YSkge1xuXG4gIC8vIFdoYXQgYXJlIHRoZSBudW1lcmljIHZhcmlhYmxlcyBpbiB0aGlzIGRhdGFzZXQ/IEhvdyBtYW55IGRvIEkgaGF2ZVxuICB2YXIgYWxsVmFyID0gW1wiU2VwYWxfTGVuZ3RoXCIsIFwiU2VwYWxfV2lkdGhcIiwgXCJQZXRhbF9MZW5ndGhcIiwgXCJQZXRhbF9XaWR0aFwiXVxuICB2YXIgbnVtVmFyID0gYWxsVmFyLmxlbmd0aFxuXG4gIC8vIE5vdyBJIGNhbiBjb21wdXRlIHRoZSBzaXplIG9mIGEgc2luZ2xlIGNoYXJ0XG4gIG1hciA9IDIwXG4gIHNpemUgPSBzaXplV2hvbGUgLyBudW1WYXJcblxuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tIC8vXG4gIC8vIFNjYWxlc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4gIC8vIENyZWF0ZSBhIHNjYWxlOiBnaXZlcyB0aGUgcG9zaXRpb24gb2YgZWFjaCBwYWlyIGVhY2ggdmFyaWFibGVcbiAgdmFyIHBvc2l0aW9uID0gZDMuc2NhbGVQb2ludCgpXG4gICAgLmRvbWFpbihhbGxWYXIpXG4gICAgLnJhbmdlKFswLCBzaXplV2hvbGUtc2l6ZV0pXG5cbiAgLy8gQ29sb3Igc2NhbGU6IGdpdmUgbWUgYSBzcGVjaWUgbmFtZSwgSSByZXR1cm4gYSBjb2xvclxuICB2YXIgY29sb3IgPSBkMy5zY2FsZU9yZGluYWwoKVxuICAgIC5kb21haW4oW1wic2V0b3NhXCIsIFwidmVyc2ljb2xvclwiLCBcInZpcmdpbmljYVwiIF0pXG4gICAgLnJhbmdlKFsgXCIjNDAyRDU0XCIsIFwiI0QxODk3NVwiLCBcIiM4RkQxNzVcIl0pXG5cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG4gIC8vIEFkZCBjaGFydHNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuICBmb3IgKGkgaW4gYWxsVmFyKXtcbiAgICBmb3IgKGogaW4gYWxsVmFyKXtcblxuICAgICAgLy8gR2V0IGN1cnJlbnQgdmFyaWFibGUgbmFtZVxuICAgICAgdmFyIHZhcjEgPSBhbGxWYXJbaV1cbiAgICAgIHZhciB2YXIyID0gYWxsVmFyW2pdXG5cbiAgICAgIC8vIElmIHZhcjEgPT0gdmFyMiBpJ20gb24gdGhlIGRpYWdvbmFsLCBJIHNraXAgdGhhdFxuICAgICAgaWYgKHZhcjEgPT09IHZhcjIpIHsgY29udGludWU7IH1cblxuICAgICAgLy8gQWRkIFggU2NhbGUgb2YgZWFjaCBncmFwaFxuICAgICAgeGV4dGVudCA9IGQzLmV4dGVudChkYXRhLCBmdW5jdGlvbihkKSB7IHJldHVybiArZFt2YXIxXSB9KVxuICAgICAgdmFyIHggPSBkMy5zY2FsZUxpbmVhcigpXG4gICAgICAgIC5kb21haW4oeGV4dGVudCkubmljZSgpXG4gICAgICAgIC5yYW5nZShbIDAsIHNpemUtMiptYXIgXSk7XG5cbiAgICAgIC8vIEFkZCBZIFNjYWxlIG9mIGVhY2ggZ3JhcGhcbiAgICAgIHlleHRlbnQgPSBkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkgeyByZXR1cm4gK2RbdmFyMl0gfSlcbiAgICAgIHZhciB5ID0gZDMuc2NhbGVMaW5lYXIoKVxuICAgICAgICAuZG9tYWluKHlleHRlbnQpLm5pY2UoKVxuICAgICAgICAucmFuZ2UoWyBzaXplLTIqbWFyLCAwIF0pO1xuXG4gICAgICAvLyBBZGQgYSAnZycgYXQgdGhlIHJpZ2h0IHBvc2l0aW9uXG4gICAgICB2YXIgdG1wID0gc3ZnXG4gICAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIChwb3NpdGlvbih2YXIxKSttYXIpICsgXCIsXCIgKyAocG9zaXRpb24odmFyMikrbWFyKSArIFwiKVwiKTtcblxuICAgICAgLy8gQWRkIFggYW5kIFkgYXhpcyBpbiB0bXBcbiAgICAgIHRtcC5hcHBlbmQoXCJnXCIpXG4gICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgMCArIFwiLFwiICsgKHNpemUtbWFyKjIpICsgXCIpXCIpXG4gICAgICAgIC5jYWxsKGQzLmF4aXNCb3R0b20oeCkudGlja3MoMykpO1xuICAgICAgdG1wLmFwcGVuZChcImdcIilcbiAgICAgICAgLmNhbGwoZDMuYXhpc0xlZnQoeSkudGlja3MoMykpO1xuXG4gICAgICAvLyBBZGQgY2lyY2xlXG4gICAgICB0bXBcbiAgICAgICAgLnNlbGVjdEFsbChcIm15Q2lyY2xlc1wiKVxuICAgICAgICAuZGF0YShkYXRhKVxuICAgICAgICAuZW50ZXIoKVxuICAgICAgICAuYXBwZW5kKFwiY2lyY2xlXCIpXG4gICAgICAgICAgLmF0dHIoXCJjeFwiLCBmdW5jdGlvbihkKXsgcmV0dXJuIHgoK2RbdmFyMV0pIH0pXG4gICAgICAgICAgLmF0dHIoXCJjeVwiLCBmdW5jdGlvbihkKXsgcmV0dXJuIHkoK2RbdmFyMl0pIH0pXG4gICAgICAgICAgLmF0dHIoXCJyXCIsIDMpXG4gICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIGZ1bmN0aW9uKGQpeyByZXR1cm4gY29sb3IoZC5TcGVjaWVzKX0pXG4gICAgfVxuICB9XG5cblxuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG4gIC8vIEFkZCBoaXN0b2dyYW1zID0gZGlhZ29uYWxcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuICBmb3IgKGkgaW4gYWxsVmFyKXtcbiAgICBmb3IgKGogaW4gYWxsVmFyKXtcblxuICAgICAgLy8gdmFyaWFibGUgbmFtZXNcbiAgICAgIHZhciB2YXIxID0gYWxsVmFyW2ldXG4gICAgICB2YXIgdmFyMiA9IGFsbFZhcltqXVxuXG4gICAgICAvLyBJZiB2YXIxID09IHZhcjIgaSdtIG9uIHRoZSBkaWFnb25hbCwgb3RoZXJ3aXNlZSBJIHNraXBcbiAgICAgIGlmIChpICE9IGopIHsgY29udGludWU7IH1cblxuICAgICAgLy8gY3JlYXRlIFggU2NhbGVcbiAgICAgIHhleHRlbnQgPSBkMy5leHRlbnQoZGF0YSwgZnVuY3Rpb24oZCkgeyByZXR1cm4gK2RbdmFyMV0gfSlcbiAgICAgIHZhciB4ID0gZDMuc2NhbGVMaW5lYXIoKVxuICAgICAgICAuZG9tYWluKHhleHRlbnQpLm5pY2UoKVxuICAgICAgICAucmFuZ2UoWyAwLCBzaXplLTIqbWFyIF0pO1xuXG4gICAgICAvLyBBZGQgYSAnZycgYXQgdGhlIHJpZ2h0IHBvc2l0aW9uXG4gICAgICB2YXIgdG1wID0gc3ZnXG4gICAgICAgIC5hcHBlbmQoJ2cnKVxuICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArIChwb3NpdGlvbih2YXIxKSttYXIpICsgXCIsXCIgKyAocG9zaXRpb24odmFyMikrbWFyKSArIFwiKVwiKTtcblxuICAgICAgLy8gQWRkIHggYXhpc1xuICAgICAgdG1wLmFwcGVuZChcImdcIilcbiAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgXCJ0cmFuc2xhdGUoXCIgKyAwICsgXCIsXCIgKyAoc2l6ZS1tYXIqMikgKyBcIilcIilcbiAgICAgICAgLmNhbGwoZDMuYXhpc0JvdHRvbSh4KS50aWNrcygzKSk7XG4gICAgICBcbiAgICAgXG4gICAgICAvLyBzZXQgdGhlIHBhcmFtZXRlcnMgZm9yIHRoZSBoaXN0b2dyYW1cbiAgICAgICB2YXIgaGlzdG9ncmFtID0gZDMuaGlzdG9ncmFtKClcbiAgICAgICAgICAgLnZhbHVlKGZ1bmN0aW9uKGQpIHsgcmV0dXJuICtkW3ZhcjFdOyB9KSAgIC8vIEkgbmVlZCB0byBnaXZlIHRoZSB2ZWN0b3Igb2YgdmFsdWVcbiAgICAgICAgICAgLmRvbWFpbih4LmRvbWFpbigpKSAgLy8gdGhlbiB0aGUgZG9tYWluIG9mIHRoZSBncmFwaGljXG4gICAgICAgICAgIC50aHJlc2hvbGRzKHgudGlja3MoMTUpKTsgLy8gdGhlbiB0aGUgbnVtYmVycyBvZiBiaW5zXG5cbiAgICAgICAvLyBBbmQgYXBwbHkgdGhpcyBmdW5jdGlvbiB0byBkYXRhIHRvIGdldCB0aGUgYmluc1xuICAgICAgIHZhciBiaW5zID0gaGlzdG9ncmFtKGRhdGEpO1xuXG4gICAgICAgLy8gWSBheGlzOiBzY2FsZSBhbmQgZHJhdzpcbiAgICAgICB2YXIgeSA9IGQzLnNjYWxlTGluZWFyKClcbiAgICAgICAgICAgIC5yYW5nZShbIHNpemUtMiptYXIsIDAgXSlcbiAgICAgICAgICAgIC5kb21haW4oWzAsIGQzLm1heChiaW5zLCBmdW5jdGlvbihkKSB7IHJldHVybiBkLmxlbmd0aDsgfSldKTsgICAvLyBkMy5oaXN0IGhhcyB0byBiZSBjYWxsZWQgYmVmb3JlIHRoZSBZIGF4aXMgb2J2aW91c2x5XG5cdFx0XHRcdFxuICAgICAgIHRtcC5hcHBlbmQoXCJnXCIpXG4gICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIFwidHJhbnNsYXRlKFwiICsgKHNpemUtbWFyKjIpLTEwICsgXCIsXCIgKyAwICsgXCIpXCIpXG4gICAgICAgIC5jYWxsKGQzLmF4aXNMZWZ0KHkpLnRpY2tzKDMpKTtcblxuICAgICAgIC8vIGFwcGVuZCB0aGUgYmFyIHJlY3RhbmdsZXMgdG8gdGhlIHN2ZyBlbGVtZW50XG4gICAgICAgdG1wLmFwcGVuZCgnZycpXG4gICAgICAgICAgLnNlbGVjdEFsbChcInJlY3RcIilcbiAgICAgICAgICAuZGF0YShiaW5zKVxuICAgICAgICAgIC5lbnRlcigpXG4gICAgICAgICAgLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgICAgICAuYXR0cihcInhcIiwgMSlcbiAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBmdW5jdGlvbihkKSB7IHJldHVybiBcInRyYW5zbGF0ZShcIiArIHgoZC54MCkgKyBcIixcIiArIHkoZC5sZW5ndGgpICsgXCIpXCI7IH0pXG4gICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCBmdW5jdGlvbihkKSB7IHJldHVybiB4KGQueDEpIC0geChkLngwKSAgOyB9KVxuICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGZ1bmN0aW9uKGQpIHsgcmV0dXJuIChzaXplLTIqbWFyKSAtIHkoZC5sZW5ndGgpOyB9KVxuICAgICAgICAgICAgIC5zdHlsZShcImZpbGxcIiwgXCIjYjhiOGI4XCIpXG4gICAgICAgICAgICAgLmF0dHIoXCJzdHJva2VcIiwgXCJ3aGl0ZVwiKVxuICAgIH1cbiAgfVxuXG5cbn0pXG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0VBQUEsSUFBSSxXQUFXLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxFQUFFLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFB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