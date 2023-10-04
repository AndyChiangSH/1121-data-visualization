d3.select("body").append("div").attr("class", "tip").style("display", "none");

d3.text("./abalone.data", function (error, data) {
    console.log("data", data)
    var features = ["Length", "Diameter", "Height", "Whole weight", "Shucked weight", "Viscera weight", "Shell weight", "Rings"]
    var data_M = [];
    var data_F = [];
    var data_I = [];

    var rows = data.split("\n");
    console.log("rows", rows)

    for (var i = 0; i < rows.length; i++) {
        var cols = rows[i].split(",");
        var obj = {};
        
        for (var j = 0; j < 8; j++) {
            obj[features[j]] = +cols[j+1];
        }

        if (cols[0] == "M") {
            data_M.push(obj);
        }
        if (cols[0] == "F") {
            data_F.push(obj);
        }
        if (cols[0] == "I") {
            data_I.push(obj);
        }
    }

    console.log("data_M", data_M)
    console.log("data_F", data_F)
    console.log("data_I", data_I)

    var margin = { top: 20, bottom: 1, left: 20, right: 1 };
    var padding = .1;

    var dim = 700;
    var width = dim - margin.left - margin.right
    var height = dim - margin.top - margin.bottom;

    render_legend()

    render_cm(data_M, features, "#grid_M")
    render_cm(data_F, features, "#grid_F")
    render_cm(data_I, features, "#grid_I")


    function render_legend() {
        // legend scale
        var legend_top = 15;
        var legend_height = 15;

        var legend_svg = d3.select("#legend").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", legend_height + legend_top)
            .append("g")
            .attr("transform", "translate(" + margin.left + ", " + legend_top + ")");

        var defs = legend_svg.append("defs");

        var gradient = defs.append("linearGradient")
            .attr("id", "linear-gradient");

        var stops = [{ offset: 0, color: "tomato", value: -1 }, { offset: .5, color: "white", value: 0 }, { offset: 1, color: "steelblue", value: 1 }];

        gradient.selectAll("stop")
            .data(stops)
            .enter().append("stop")
            .attr("offset", function (d) { return (100 * d.offset) + "%"; })
            .attr("stop-color", function (d) { return d.color; });

        legend_svg.append("rect")
            .attr("width", width)
            .attr("height", legend_height)
            .style("fill", "url(#linear-gradient)");

        legend_svg.selectAll("text")
            .data(stops)
            .enter().append("text")
            .attr("x", function (d) { return width * d.offset; })
            .attr("dy", -3)
            .style("text-anchor", function (d, i) { return i == 0 ? "start" : i == 1 ? "middle" : "end"; })
            .text(function (d, i) { return d.value.toFixed(2) + (i == 2 ? ">" : ""); })
    }
    
    function render_cm(data, features, grid_id) {
        var corr = jz.arr.correlationMatrix(data, features);
        console.log("corr", corr)

        var grid = data2grid.grid(corr);
        var rows = d3.max(grid, function (d) { return d.row; });

        var svg = d3.select(grid_id).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

        var x = d3.scaleBand()
            .range([0, width])
            .paddingInner(padding)
            .domain(d3.range(1, rows + 1));

        var y = d3.scaleBand()
            .range([0, height])
            .paddingInner(padding)
            .domain(d3.range(1, rows + 1));

        var c = chroma.scale(["tomato", "white", "steelblue"])
            .domain([-1, 0, 1]);

        var x_axis = d3.axisTop(y).tickFormat(function (d, i) { return features[i]; });
        var y_axis = d3.axisLeft(x).tickFormat(function (d, i) { return features[i]; });

        svg.append("g")
            .attr("class", "x axis")
            .call(x_axis);

        svg.append("g")
            .attr("class", "y axis")
            .call(y_axis);

        svg.selectAll("rect")
            .data(grid, function (d) { return d.column_a + d.column_b; })
            .enter().append("rect")
            .attr("x", function (d) { return x(d.column); })
            .attr("y", function (d) { return y(d.row); })
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", function (d) { return c(d.correlation); })
            .style("opacity", 1e-6)
            .transition()
            .style("opacity", 1);

        svg.selectAll("rect")

        d3.selectAll("rect")
            .on("mouseover", function (d) {

                d3.select(this).classed("selected", true);

                d3.select(".tip")
                    .style("display", "block")
                    .html(d.column_x + ", " + d.column_y + ": " + d.correlation.toFixed(2));

                var row_pos = y(d.row);
                var col_pos = x(d.column);
                var tip_pos = d3.select(".tip").node().getBoundingClientRect();
                var tip_width = tip_pos.width;
                var tip_height = tip_pos.height;
                var grid_pos = d3.select(grid_id).node().getBoundingClientRect();
                var grid_left = grid_pos.left;
                var grid_top = grid_pos.top;

                var left = grid_left + col_pos + margin.left + (x.bandwidth() / 2) - (tip_width / 2);
                var top = grid_top + row_pos + margin.top - tip_height - 5;

                d3.select(".tip")
                    .style("left", left + "px")
                    .style("top", top + "px");

                d3.select(".x.axis .tick:nth-of-type(" + d.column + ") text").classed("selected", true);
                d3.select(".y.axis .tick:nth-of-type(" + d.row + ") text").classed("selected", true);
                d3.select(".x.axis .tick:nth-of-type(" + d.column + ") line").classed("selected", true);
                d3.select(".y.axis .tick:nth-of-type(" + d.row + ") line").classed("selected", true);

            })
            .on("mouseout", function () {
                d3.selectAll("rect").classed("selected", false);
                d3.select(".tip").style("display", "none");
                d3.selectAll(".axis .tick text").classed("selected", false);
                d3.selectAll(".axis .tick line").classed("selected", false);
            });
    }
})

