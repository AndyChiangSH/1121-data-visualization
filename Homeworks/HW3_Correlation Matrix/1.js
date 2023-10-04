// Graph dimension
const margin = { top: 20, right: 20, bottom: 20, left: 20 },
    width = 430 - margin.left - margin.right,
    height = 430 - margin.top - margin.bottom

// Create the svg area
const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);


d3.text("./abalone.data").then(function (data) {
    // console.log("data", data)
    var rows = data.split("\n");
    console.log("rows", rows)

    var features = ["Length", "Diameter", "Height", "Whole weight", "Shucked weight", "Viscera weight", "Shell weight", "Rings"]
    var data_M = [];
    var data_F = [];
    var data_I = [];

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

    console.log("data_M", data_M)
    console.log("data_F", data_F)
    console.log("data_I", data_I)

    render_cm(data_M)

    function render_cm(data) {
        const matrix = math.transpose(data);
        let cm = math.zeros(matrix.length, matrix.length);

        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix.length; j++) {
                const corr = math.corr(matrix[i], matrix[j]);
                cm.set([i, j], corr);
            }
        }

        cm = cm.toArray();
        console.log("cm", cm)

        // Going from wide to long format
        // cm.forEach(function (d) {
        //     let x = d[""];
        //     delete d[""];
        //     for (prop in d) {
        //         let y = prop,
        //             value = d[prop];
        //         cm.push({
        //             x: x,
        //             y: y,
        //             value: +value
        //         });
        //     }
        // });

        let cm2 = [];
        for (let i = 0; i < cm.length; i++) {
            for (let j = 0; j < cm[i].length; j++) {
                cm2.push({
                    x: features[i],
                    y: features[j],
                    value: +cm[i][j]
                });
            }
        }
        console.log("cm2", cm2)
        

        // List of all variables and number of them
        const domain = Array.from(new Set(cm2.map(function (d) { return d.x })))
        const num = Math.sqrt(cm2.length)

        // Create a color scale
        const color = d3.scaleLinear()
            .domain([-1, 0, 1])
            .range(["#B22222", "#fff", "#000080"]);

        // Create a size scale for bubbles on top right. Watch out: must be a rootscale!
        const size = d3.scaleSqrt()
            .domain([0, 1])
            .range([0, 9]);

        // X scale
        const x = d3.scalePoint()
            .range([0, width])
            .domain(domain)

        // Y scale
        const y = d3.scalePoint()
            .range([0, height])
            .domain(domain)

        // Create one 'g' element for each cell of the correlogram
        const cor = svg.selectAll(".cor")
            .data(cm2)
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
            .style("font-size", 11)
            .style("text-align", "center")
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