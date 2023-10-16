const data_path = "./iris.csv"

var size = 200;
var padding = 30;

var x = d3.scaleLinear()
    .range([padding / 2, size - padding / 2]);

var y = d3.scaleLinear()
    .range([size - padding / 2, padding / 2]);

var xAxis = d3.axisBottom()
    .scale(x)
    .ticks(6).tickFormat("");

var yAxis = d3.axisLeft()
    .scale(y)
    .ticks(6).tickFormat("");

    // Color scale: give me a specie name, I return a color
    // const color = d3.scaleOrdinal(d3.schemeCategory10);
const color = d3.scaleOrdinal()
    .domain(["setosa", "versicolor", "virginica"])
    .range(["#ff0000", "#00ff00", "#0000ff"])
const features = ["sepal length", "sepal width", "petal length", "petal width"]

d3.csv(data_path, function (error, data) {
    if (error) throw error;
    
    data.splice(150, 1);

    var domainByTrait = {},
        traits = d3.keys(data[0]).filter(function (d) { return d !== "class"; }),
        n = traits.length;

    traits.forEach(function (trait) {
        domainByTrait[trait] = d3.extent(data, function (d) { return d[trait]; });
    });

    xAxis.tickSize(size * n);
    yAxis.tickSize(-size * n);

    var brush = d3.brush()
        .on("start", brushstart)
        .on("brush", brushmove)
        .on("end", brushend)
        .extent([[15, 15], [size-15, size-15]]);

    var svg = d3.select("#my_dataviz").append("svg")
        .attr("width", size * n + padding)
        .attr("height", size * n + padding)
        .append("g")
        .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

    var cell = svg.selectAll(".cell")
        .data(cross(traits, traits))
        .enter().append("g")
        .attr("class", "cell")
        .attr("transform", function (d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
        .each(plot);

    cell.call(brush);

    function plot(p) {
        var cell = d3.select(this);

        x.domain(domainByTrait[p.x]);
        y.domain(domainByTrait[p.y]);

        var position = d3.scalePoint()
            .domain(features)
            .range([0, 1])

        if (p.x != p.y) {
            // Add a 'g' at the right position
            var tmp = cell
                .append('g')
                .attr("transform", `translate(${position(p.x) + padding / 2},${position(p.y) + padding / 2})`);
            
            tmp.append("rect")
                .attr("class", "frame")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", size - padding)
                .attr("height", size - padding);

            var xextent = d3.extent(data, function (d) { return +d[p.x] })
            var x1 = d3.scaleLinear()
                .domain(xextent)
                .range([padding / 2, size - padding / 2]);

            // Add Y Scale of each graph
            var yextent = d3.extent(data, function (d) { return +d[p.y] })
            var y1 = d3.scaleLinear()
                .domain(yextent)
                .range([size - padding / 2, padding / 2]);

            // Add X and Y axis in tmp
            tmp.append("g")
                .attr("transform", `translate(${-padding / 2}, ${size - padding})`)
                .call(d3.axisBottom().scale(x1).ticks(6));
            tmp.append("g")
                .attr("transform", `translate(0, ${-padding / 2})`)
                .call(d3.axisLeft().scale(y1).ticks(6));

            cell.selectAll("circle")
                .data(data)
                .enter().append("circle")
                .attr("cx", function (d) { return x(d[p.x]); })
                .attr("cy", function (d) { return y(d[p.y]); })
                .attr("r", 4)
                .style("fill", function (d) { return color(d.class); });
        }
        else {
            // Add a 'g' at the right position
            var tmp = cell
                .append('g')
                .attr("transform", `translate(${position(p.x) + padding / 2},${position(p.y) + padding / 2})`);

            // X axis
            var xextent = d3.extent(data, function (d) { return +d[p.x] })
            var x2 = d3.scaleLinear()
                .domain(xextent).nice()
                .range([0, size - padding]);

            // set the parameters for the histogram
            var histogram = d3.histogram()
                .value(function (d) { return +d[p.x]; })   // I need to give the vector of value
                .domain(x2.domain())  // then the domain of the graphic
                .thresholds(x2.ticks(15)); // then the numbers of bins

            // And apply this function to data to get the bins
            var bins = histogram(data);

            // Y axis: scale and draw:
            var y2 = d3.scaleLinear()
                .range([size - padding, 0])
                .domain([0, d3.max(bins, function (d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously

            // append the bar rectangles to the svg element
            tmp.append('g').attr("transform", `translate(${0}, ${0})`)
                .selectAll("rect")
                .data(bins)
                .enter()
                .append("rect")
                .attr("x", 1)
                .attr("transform", function (d) { return "translate(" + x2(d.x0) + "," + y2(d.length) + ")"; })
                .attr("width", function (d) { return x2(d.x1) - x2(d.x0); })
                .attr("height", function (d) { return (size - padding) - y2(d.length); })
                .style("fill", "#7f7f7f")
                .attr("stroke", "white")
            
            // append ladel of each attribute
            tmp.append("text")
                .text(p.x)
                .attr("text-anchor", "middle")
                .attr("x", size/2 - padding/2)
                .attr("y", padding/2)
                .style("fill", "#000000")
                .style("font-size", 12)
            
            tmp.append("rect")
                .attr("class", "frame")
                .attr("x", 0)
                .attr("y", 0)
                .attr("width", size - padding)
                .attr("height", size - padding);
            
            // Add X and Y axis in tmp
            tmp.append("g")
                .attr("transform", `translate(${0}, ${size - padding})`)
                .call(d3.axisBottom().scale(x2).ticks(6));
            tmp.append("g")
                .attr("transform", `translate(0, ${0})`)
                .call(d3.axisLeft().scale(y2).ticks(6));
        }
    }

    // Add legend:
    svg.append("circle")
        .attr("cx", (size * n) / 2 - 130)
        .attr("cy", -3)
        .attr("r", 4)
        .style("fill", "#ff0000");
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", (size * n)/2 - 100)
        .attr("y", 0)
        .text("setosa")
        .style("fill", "#ff0000")
    svg.append("circle")
        .attr("cx", (size * n) / 2 - 40)
        .attr("cy", -3)
        .attr("r", 4)
        .style("fill", "#00ff00");
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", (size * n) / 2)
        .attr("y", 0)
        .text("versicolor")
        .style("fill", "#00ff00")
    svg.append("circle")
        .attr("cx", (size * n) / 2 + 65)
        .attr("cy", -3)
        .attr("r", 4)
        .style("fill", "#0000ff");
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("x", (size * n) / 2 + 100)
        .attr("y", 0)
        .text("virginica")
        .style("fill", "#0000ff")

    var brushCell;

    // Clear the previously-active brush, if any.
    function brushstart(p) {
        if (brushCell !== this) {
            d3.select(brushCell).call(brush.move, null);
            brushCell = this;
            x.domain(domainByTrait[p.x]);
            y.domain(domainByTrait[p.y]);
        }
    }

    // Highlight the selected circles.
    function brushmove(p) {
        var e = d3.brushSelection(this);
        svg.selectAll("circle").classed("hidden", function (d) {
            if (!e) {
                return false;
            }
            else {
                if (p.x == p.y) {
                    return false;
                }
                else {
                    return (
                        e[0][0] > x(+d[p.x]) || x(+d[p.x]) > e[1][0]
                        || e[0][1] > y(+d[p.y]) || y(+d[p.y]) > e[1][1]
                    );
                }
            }
        });
    }

    // If the brush is empty, select all circles.
    function brushend() {
        var e = d3.brushSelection(this);
        if (e === null) svg.selectAll(".hidden").classed("hidden", false);
    }
});

function cross(a, b) {
    var c = [], n = a.length, m = b.length, i, j;
    for (i = -1; ++i < n;) {
        for (j = -1; ++j < m;) {
            c.push({ x: a[i], i: i, y: b[j], j: j });
        }
    }
    return c;
}