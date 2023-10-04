// Graph dimension
const margin = { top: 20, right: 20, bottom: 20, left: 20 },
    width = 600 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom

const data_path = "./abalone.data"

d3.text(data_path).then(function (data) {
    // console.log("data", data)
    
    var features = ["Length", "Diameter", "Height", "Whole weight", "Shucked weight", "Viscera weight", "Shell weight", "Rings"]
    var data_M = [];
    var data_F = [];
    var data_I = [];
    
    var rows = data.split("\n");
    for (var i = 0; i < rows.length; i++) {
        var cols = rows[i].split(",");

        var list = [];
        for (var j = 0; j < 8; j++) {
            list.push(+cols[j + 1])
        }

        if (cols[0] == "M") {
            data_M.push(list);
        }
        if (cols[0] == "F") {
            data_F.push(list);
        }
        if (cols[0] == "I") {
            data_I.push(list);
        }
    }

    // console.log("data_M", data_M)
    // console.log("data_F", data_F)
    // console.log("data_I", data_I)

    cm_M = correlation_matrix(data_M)
    cm_F = correlation_matrix(data_F)
    cm_I = correlation_matrix(data_I)

    render_legend()
    render_cm(cm_M)

    // add an event listener for the change event
    const radioButtons = document.querySelectorAll('input[name="sex"]');
    for (const radioButton of radioButtons) {
        radioButton.addEventListener('change', showSelected);
    }

    function showSelected(e) {
        // console.log(e);
        if (this.checked) {
            if (this.value == "male") {
                render_cm(cm_M)
            }
            if (this.value == "female") {
                render_cm(cm_F)
            }
            if (this.value == "infant") {
                render_cm(cm_I)
            }
        }
    }

    function correlation_matrix(data) {
        const matrix = math.transpose(data);
        // let cm = math.zeros(matrix.length, matrix.length);
        let cm = []

        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix.length; j++) {
                let corr = math.corr(matrix[i], matrix[j]);
                // cm.set([i, j], corr);
                cm.push({
                    x: features[i],
                    y: features[j],
                    value: +corr
                });

            }
        }
        // console.log("cm", cm)

        return cm
    }

    function render_legend() {
        // legend scale
        var legend_top = 15;
        var legend_height = 15;

        var legend_svg = d3.selectAll(".legend").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", legend_height + legend_top + 20)
            .append("g")
            .attr("transform", "translate(" + margin.left + ", " + legend_top + ")");

        var defs = legend_svg.append("defs");

        var gradient = defs.append("linearGradient")
            .attr("id", "linear-gradient");

        var stops = [{ offset: 0, color: "#B22222", value: -1 }, { offset: .5, color: "#ffffff", value: 0 }, {
            offset: 1, color: "#000080", value: 1 }];

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
            .text(function (d, i) { return d.value.toFixed(2); })
    }

    function render_cm(cm) {
        // clean svg
        d3.select("#cm").select('svg').remove()

        // List of all variables and number of them
        const domain = Array.from(new Set(cm.map(function (d) { return d.x })))
        const num = Math.sqrt(cm.length)

        // Create a color scale
        const color = d3.scaleLinear()
            .domain([-1, 0, 1])
            .range(["#B22222", "#ffffff", "#000080"]);

        // Create a size scale for bubbles on top right. Watch out: must be a rootscale!
        const size = d3.scaleSqrt()
            .domain([0, 1])
            .range([0, 15]);

        // X scale
        const x = d3.scalePoint()
            .range([0, width])
            .domain(domain)

        // Y scale
        const y = d3.scalePoint()
            .range([0, height])
            .domain(domain)
        
        // Create the svg area
        const svg = d3.select("#cm")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Create one 'g' element for each cell of the correlogram
        const cor = svg.selectAll(".cor")
            .data(cm)
            .join("g")
            .attr("class", "cor")
            .attr("transform", function (d) {
                return `translate(${x(d.x)}, ${y(d.y)})`
            });

        // Low left part + Diagonal: Add the text with specific color
        cor.filter(function (d) {
            const ypos = domain.indexOf(d.y);
            const xpos = domain.indexOf(d.x);
            return xpos <= ypos;
        })
            .append("text")
            .attr("y", 5)
            .text(function (d) {
                if (d.x === d.y) {
                    return d.x;
                } else {
                    return d.value.toFixed(2);
                }
            })
            .style("font-size", 15)
            // .style("text-align", "center")
            .attr("text-anchor", "middle")
            .style("fill", function (d) {
                if (d.x === d.y) {
                    return "#000";
                } else {
                    return color(d.value);
                }
            });


        // Up right part: add circles
        cor.filter(function (d) {
            const ypos = domain.indexOf(d.y);
            const xpos = domain.indexOf(d.x);
            return xpos > ypos;
        })
            .append("circle")
            .attr("r", function (d) { return size(Math.abs(d.value)) })
            .style("fill", function (d) {
                if (d.x === d.y) {
                    return "#000";
                } else {
                    return color(d.value);
                }
            })
            .style("opacity", 0.8)
    }
})