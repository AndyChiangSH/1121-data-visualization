const data_path = "./iris.csv"

d3.csv(data_path).then(function (data) {

    // Size parameters.
    var size = 150,
        padding = 20;

    // Color scale.
    var color = d3.scale.ordinal().range([
        "rgb(50%, 0%, 0%)",
        "rgb(0%, 50%, 0%)",
        "rgb(0%, 0%, 50%)"
    ]);

    // Position scales.
    var position = {};
    data.traits.forEach(function (trait) {
        function value(d) { return d[trait]; }
        position[trait] = d3.scale.linear()
            .domain([d3.min(data.values, value), d3.max(data.values, value)])
            .range([padding / 2, size - padding / 2]);
    });

    // Root panel.
    var svg = d3.select("#my_dataviz")
        .append("svg:svg")
        .attr("width", size * data.traits.length)
        .attr("height", size * data.traits.length);

    // One column per trait.
    var column = svg.selectAll("g")
        .data(data.traits)
        .enter().append("svg:g")
        .attr("transform", function (d, i) { return "translate(" + i * size + ",0)"; });

    // One row per trait.
    var row = column.selectAll("g")
        .data(cross(data.traits))
        .enter().append("svg:g")
        .attr("transform", function (d, i) { return "translate(0," + i * size + ")"; });

    // X-ticks. TODO Cross the trait into the tick data?
    row.selectAll("line.x")
        .data(function (d) { return position[d.x].ticks(5).map(position[d.x]); })
        .enter().append("svg:line")
        .attr("class", "x")
        .attr("x1", function (d) { return d; })
        .attr("x2", function (d) { return d; })
        .attr("y1", padding / 2)
        .attr("y2", size - padding / 2);

    // Y-ticks. TODO Cross the trait into the tick data?
    row.selectAll("line.y")
        .data(function (d) { return position[d.y].ticks(5).map(position[d.y]); })
        .enter().append("svg:line")
        .attr("class", "y")
        .attr("x1", padding / 2)
        .attr("x2", size - padding / 2)
        .attr("y1", function (d) { return d; })
        .attr("y2", function (d) { return d; });

    // Frame.
    row.append("svg:rect")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .attr("height", size - padding)
        .style("fill", "none")
        .style("stroke", "#aaa")
        .style("stroke-width", 1.5)
        .attr("pointer-events", "all")
        .on("mousedown", mousedown);

    // Dot plot.
    var dot = row.selectAll("circle")
        .data(cross(data.values))
        .enter().append("svg:circle")
        .attr("cx", function (d) { return position[d.x.x](d.y[d.x.x]); })
        .attr("cy", function (d) { return size - position[d.x.y](d.y[d.x.y]); })
        .attr("r", 3)
        .style("fill", function (d) { return color(d.y.species); })
        .style("fill-opacity", .5)
        .attr("pointer-events", "none");

    d3.select(window)
        .on("mousemove", mousemove)
        .on("mouseup", mouseup);

    var rect, x0, x1, count;

    function mousedown() {
        x0 = d3.svg.mouse(this);
        count = 0;

        rect = d3.select(this.parentNode)
            .append("svg:rect")
            .style("fill", "#999")
            .style("fill-opacity", .5);

        d3.event.preventDefault();
    }

    function mousemove() {
        if (!rect) return;
        x1 = d3.svg.mouse(rect.node());

        x1[0] = Math.max(padding / 2, Math.min(size - padding / 2, x1[0]));
        x1[1] = Math.max(padding / 2, Math.min(size - padding / 2, x1[1]));

        var minx = Math.min(x0[0], x1[0]),
            maxx = Math.max(x0[0], x1[0]),
            miny = Math.min(x0[1], x1[1]),
            maxy = Math.max(x0[1], x1[1]);

        rect
            .attr("x", minx - .5)
            .attr("y", miny - .5)
            .attr("width", maxx - minx + 1)
            .attr("height", maxy - miny + 1);

        var v = rect.node().__data__,
            x = position[v.x],
            y = position[v.y],
            mins = x.invert(minx),
            maxs = x.invert(maxx),
            mint = y.invert(size - maxy),
            maxt = y.invert(size - miny);

        count = 0;
        svg.selectAll("circle")
            .style("fill", function (d) {
                return mins <= d.y[v.x] && maxs >= d.y[v.x]
                    && mint <= d.y[v.y] && maxt >= d.y[v.y]
                    ? (count++, color(d.y.species))
                    : "#ccc";
            });
    }

    function mouseup() {
        if (!rect) return;
        rect.remove();
        rect = null;

        if (!count) svg.selectAll("circle")
            .style("fill", function (d) {
                return color(d.y.species);
            });
    }

});

function cross(a) {
    return function (d) {
        var c = [];
        for (var i = 0, n = a.length; i < n; i++) c.push({ x: d, y: a[i] });
        return c;
    };
}