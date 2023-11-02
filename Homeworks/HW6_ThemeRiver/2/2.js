// set the dimensions and margins of the graph
const margin = { top: 20, right: 30, bottom: 0, left: 10 },
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        `translate(${margin.left}, ${margin.top})`);

// Parse the Data
d3.csv("../ma_lga_12345.csv").then(function (data) {
    console.log("data:", data)

    var data_1 = {}
    for (let i = 0; i < data.length; i++) {
        if (!(data[i]["saledate"] in data_1)) {
            data_1[data[i]["saledate"]] = {
                "house with 2 bedrooms": 0,
                "house with 3 bedrooms": 0,
                "house with 4 bedrooms": 0,
                "house with 5 bedrooms": 0,
                "unit with 1 bedrooms": 0,
                "unit with 2 bedrooms": 0,
                "unit with 3 bedrooms": 0,
            }
        }
        class_str = data[i]["type"] + " with " + data[i]["bedrooms"] + " bedrooms"
        data_1[data[i]["saledate"]][class_str] = +data[i]["MA"]
    }
    console.log("data_1:", data_1)

    var data_2 = []
    for (const [key, value] of Object.entries(data_1)) {
        value["date"] = moment(key, "DD/MM/YYYY").toDate();
        data_2.push(value)
    }
    console.log("data_2:", data_2)
    
    data_2.sort(function (a, b) {
        return a["date"] - b["date"];
    });
    data = data_2
    console.log("data:", data)

    // List of groups = header of the csv files
    const keys = Object.keys(data[0]).slice(0, -1)
    console.log("keys:", keys)

    // Add X axis
    const x = d3.scaleLinear()
        .domain(d3.extent(data, function (d) { return d["date"]; }))
        .range([0, width]);
    svg.append("g")
        .attr("transform", `translate(0, ${height * 0.8})`)
        .call(d3.axisBottom(x).tickSize(-height * .7).tickValues([2007, 2011, 2015, 2019]))
        .select(".domain").remove()
    // Customization
    svg.selectAll(".tick line").attr("stroke", "#b8b8b8")

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - 30)
        .text("Date");

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([-3000000, 3000000])
        .range([height, 0]);

    // color palette
    const color = d3.scaleOrdinal()
        .domain(keys)
        .range(d3.schemeDark2);

    //stack the data?
    const stackedData = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .keys(keys)
        (data)

    // create a tooltip
    const Tooltip = svg
        .append("text")
        .attr("x", 0)
        .attr("y", 0)
        .style("opacity", 0)
        .style("font-size", 17)

    // Three function that change the tooltip when user hover / move / leave a cell
    const mouseover = function (event, d) {
        Tooltip.style("opacity", 1)
        d3.selectAll(".myArea").style("opacity", .2)
        d3.select(this)
            .style("stroke", "black")
            .style("opacity", 1)
    }
    const mousemove = function (event, d, i) {
        grp = d.key
        Tooltip.text(grp)
    }
    const mouseleave = function (event, d) {
        Tooltip.style("opacity", 0)
        d3.selectAll(".myArea").style("opacity", 1).style("stroke", "none")
    }

    // Area generator
    const area = d3.area()
        .x(function (d) { return x(d.data["date"]); })
        .y0(function (d) { return y(d[0]); })
        .y1(function (d) { return y(d[1]); })

    // Show the areas
    svg
        .selectAll("mylayers")
        .data(stackedData)
        .join("path")
        .attr("class", "myArea")
        .style("fill", function (d) { return color(d.key); })
        .attr("d", area)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)
})