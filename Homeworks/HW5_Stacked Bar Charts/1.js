// set the dimensions and margins of the graph
const margin = { top: 80, right: 20, bottom: 50, left: 120 };
const width = 450 - margin.left - margin.right;
const height = 350 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#viz_container")
    .append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", "0 0 450 350")
    .attr("preserveAspectRatio", "xMinYMin")
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// parse the Data
d3.csv("https://raw.githubusercontent.com/GDS-ODSSS/unhcr-dataviz-platform/master/data/comparison/bar_stacked_d3.csv", function (d, i, columns) {
    for (i = 1, t = 0; i < columns.length; ++i) t += d[columns[i]] = +d[columns[i]];
    d.total = t;
    return d;
    country_origin: d.country_origin;
    ASY: +d.ASY;
    REF: +d.REF;
    VDA: +d.VDA
}).then(function (data) {
    console.log("data:", data)

    // list of value keys
    const typeKeys = data.columns.slice(1);

    // sort data in descending order by total value
    data.sort((a, b) => b.total - a.total);

    // stack the data
    const stack = d3.stack()
        .keys(typeKeys)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone)
    const stackedData = stack(data)

    // X scale and Axis
    const formater = d3.format(".1s")
    const xScale = d3.scaleLinear()
        .domain([0, 7000000])
        .range([0, width])
    svg
        .append('g')
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale).ticks(7).tickSize(0).tickPadding(6).tickFormat(formater))
        .call(d => d.select(".domain").remove());

    // Y scale and Axis
    const yScale = d3.scaleBand()
        .domain(data.map(d => d.country_origin))
        .range([0, height])
        .padding(.2);
    svg
        .append('g')
        .call(d3.axisLeft(yScale).tickSize(0).tickPadding(8));

    // color palette
    const color = d3.scaleOrdinal()
        .domain(typeKeys)
        .range(['#0072BC', '#18375F', '#EF4A60'])

    // set vertical grid line
    const GridLine = function () { return d3.axisBottom().scale(xScale) };
    svg
        .append("g")
        .attr("class", "grid")
        .call(GridLine()
            .tickSize(height, 0, 0)
            .tickFormat("")
            .ticks(8)
        );

    // create a tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("id", "chart")
        .attr("class", "tooltip");

    // tooltip events
    const mouseover = function (d) {
        tooltip
            .style("opacity", .8)
        d3.select(this)
            .style("opacity", .5)
    }
    const mousemove = function (event, d) {
        const formater = d3.format(",")
        tooltip
            .html(formater(d[1]))
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX + 10 + "px");
    }
    const mouseleave = function (d) {
        tooltip
            .style("opacity", 0)
        d3.select(this)
            .style("opacity", 1)
    }

    // create bars
    svg.append("g")
        .selectAll("g")
        .data(stackedData)
        .join("g")
        .attr("fill", d => color(d.key))
        .selectAll("rect")
        .data(d => d)
        .join("rect")
        .attr("x", d => xScale(d[0]))
        .attr("y", d => yScale(d.data.country_origin))
        .attr("width", d => xScale(d[1]) - xScale(d[0]))
        .attr("height", yScale.bandwidth())
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)

    // set title
    svg
        .append("text")
        .attr("class", "chart-title")
        .attr("x", -(margin.left) * 0.8)
        .attr("y", -(margin.top) / 1.5)
        .attr("text-anchor", "start")
        .text("Resettlement by UNHCR and others | 2010-2020")

    // set Y axis label
    svg
        .append("text")
        .attr("class", "chart-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom / 2)
        .attr("text-anchor", "middle")
        .text("Number of people (millions)")

    // set source
    svg
        .append("text")
        .attr("class", "chart-source")
        .attr("x", -(margin.left) * 0.8)
        .attr("y", height + margin.bottom * 0.7)
        .attr("text-anchor", "start")
        .text("Source: UNHCR Refugee Data Finder")

    // set copyright
    svg
        .append("text")
        .attr("class", "copyright")
        .attr("x", -(margin.left) * 0.8)
        .attr("y", height + margin.bottom * 0.9)
        .attr("text-anchor", "start")
        .text("©UNHCR, The UN Refugee Agency")

    //set legend
    svg
        .append("rect")
        .attr("x", -(margin.left) * 0.8)
        .attr("y", -(margin.top / 2))
        .attr("width", 13)
        .attr("height", 13)
        .style("fill", "#0072BC")
    svg
        .append("text")
        .attr("class", "legend")
        .attr("x", -(margin.left) * 0.8 + 20)
        .attr("y", -(margin.top / 2.7))
        .text("Refugees")
    svg
        .append("rect")
        .attr("x", 0)
        .attr("y", -(margin.top / 2))
        .attr("width", 13)
        .attr("height", 13)
        .style("fill", "#18375F")
    svg
        .append("text")
        .attr("class", "legend")
        .attr("x", 20)
        .attr("y", -(margin.top / 2.7))
        .text("Asylum-seekers")
    svg
        .append("rect")
        .attr("x", 120)
        .attr("y", -(margin.top / 2))
        .attr("width", 13)
        .attr("height", 13)
        .style("fill", "#EF4A60")
    svg
        .append("text")
        .attr("class", "legend")
        .attr("x", 140)
        .attr("y", -(margin.top / 2.7))
        .text("Venezuelans displaced abroad")
})