// set the dimensions and margins of the graph
const margin = { top: 80, right: 20, bottom: 50, left: 300 };
const width = 1500 - margin.left - margin.right;
const height = 20000 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", "1500px")
    .attr("height", "20000px")
    // .attr("viewBox", "0 0 450 5000")
    .attr("preserveAspectRatio", "xMinYMin")
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

const data_path = "TIMES_WorldUniversityRankings_2024.csv"
const keys = ["scores_teaching", "scores_research", "scores_citations", "scores_industry_income", "scores_international_outlook"];
const color = d3.scaleOrdinal(["#4e79a7", "#f28e2c", "#e15759", "#76b7b2", "#59a14f"]);

// parse the Data
d3.csv(data_path).then(function (data) {
    // console.log("data:", data)
    
    // console.log("keys:", keys)

    new_data = []
    for (let i = 0; i < data.length; i++) {
        if (data[i]["rank"] != "Reporter") {
            new_data.push({
                "name": data[i]["name"],
                "scores_overall": +data[i]["scores_overall"].split("–")[0],
                "scores_teaching": +data[i]["scores_teaching"],
                "scores_research": +data[i]["scores_research"],
                "scores_citations": +data[i]["scores_citations"],
                "scores_industry_income": +data[i]["scores_industry_income"],
                "scores_international_outlook": +data[i]["scores_international_outlook"],
            })
        }
    }
    
    function sort_data(data, sort_by, sort_order) {
        if (sort_order == "descending") {
            data.sort((a, b) => b[sort_by] - a[sort_by]);
        }
        else {
            data.sort((a, b) => a[sort_by] - b[sort_by]);
        }
        return data
    }
    
    function render_stacked_bar_charts(data) {
        svg.selectAll('*').remove();

        // stack the new_data
        const stack = d3.stack()
            .keys(keys)
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone)
        const stackedData = stack(data)

        // X scale and Axis
        const formater = d3.format(".1s")
        const xScale = d3.scaleLinear()
            .domain([0, 500])
            .range([0, width])

        // Y scale and Axis
        const yScale = d3.scaleBand()
            .domain(data.map(d => d.name))
            .range([0, height])
            .padding(.2);

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
            tooltip
                .html((d[1] - d[0]).toFixed(1))
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
            .attr("y", d => yScale(d.data.name))
            .attr("width", d => xScale(d[1]) - xScale(d[0]))
            .attr("height", yScale.bandwidth())
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
        
        // set X and Y axis
        svg
            .append('g')
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).ticks(7).tickSize(0).tickPadding(6).tickFormat(formater))
            .call(d => d.select(".domain").remove());
        svg
            .append('g')
            .call(d3.axisLeft(yScale).tickSize(0).tickPadding(8));

        // set Y axis label
        svg
            .append("text")
            .attr("class", "chart-label")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom / 2)
            .attr("text-anchor", "middle")
            .text("Score (0~100)")
        
        // set title
        svg.append("text")
            .attr("class", "chart-title")
            .attr("x", -(margin.left) * 0.8)
            .attr("y", -(margin.top) / 1.5)
            .attr("text-anchor", "start")
            .text("Times World University Rankings 2024")

        //set legend
        svg.append("rect")
            .attr("x", -(margin.left) * 0.8)
            .attr("y", -(margin.top / 2))
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", "#4e79a7")
        svg.append("text")
            .attr("class", "legend")
            .attr("x", -(margin.left) * 0.8 + 20)
            .attr("y", -(margin.top / 2.5))
            .text("teaching")
        svg.append("rect")
            .attr("x", -(margin.left) * 0.8 + 100)
            .attr("y", -(margin.top / 2))
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", "#f28e2c")
        svg.append("text")
            .attr("class", "legend")
            .attr("x", -(margin.left) * 0.8 + 120)
            .attr("y", -(margin.top / 2.5))
            .text("research")
        svg.append("rect")
            .attr("x", -(margin.left) * 0.8 + 200)
            .attr("y", -(margin.top / 2))
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", "#e15759")
        svg.append("text")
            .attr("class", "legend")
            .attr("x", -(margin.left) * 0.8 + 220)
            .attr("y", -(margin.top / 2.5))
            .text("citations")
        svg.append("rect")
            .attr("x", -(margin.left) * 0.8 + 300)
            .attr("y", -(margin.top / 2))
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", "#76b7b2")
        svg.append("text")
            .attr("class", "legend")
            .attr("x", -(margin.left) * 0.8 + 320)
            .attr("y", -(margin.top / 2.5))
            .text("industry income")
        svg.append("rect")
            .attr("x", -(margin.left) * 0.8 + 400)
            .attr("y", -(margin.top / 2))
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", "#59a14f")
        svg.append("text")
            .attr("class", "legend")
            .attr("x", -(margin.left) * 0.8 + 420)
            .attr("y", -(margin.top / 2.5))
            .text("international outlook")
    }

    function onclick_button() {
        // console.log("onclick_button()!")
        let sort_by = document.querySelector("#sort-by").value
        let sort_order = document.querySelector("#sort-order").value

        // sort data
        let sorted_data = sort_data(new_data, sort_by, sort_order)
        // console.log("new_data:", new_data)
        // console.log("sorted_data:", sorted_data)

        // render stacked bar charts
        render_stacked_bar_charts(sorted_data)
    }

    const sort_button = document.querySelector("#sort-button");
    sort_button.addEventListener("click", onclick_button);

    onclick_button();
})