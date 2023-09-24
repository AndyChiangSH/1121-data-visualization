//Read the data
d3.csv("./iris.csv", function (data) {
    // console.log(data.slice(0, -1))
    data = data.slice(0, -1)

    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 30, bottom: 40, left: 50 },
        width = 520 - margin.left - margin.right,
        height = 520 - margin.top - margin.bottom;

    let x_label = "sepal length"
    let y_label = "sepal width"

    function scatter() {
        // clean svg
        d3.select("#my_dataviz").select('svg').remove()

        // append the svg object to the body of the page
        var svg = d3.select("#my_dataviz")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        // Add the grey background that makes ggplot2 famous
        svg.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("height", height)
            .attr("width", height)
            .style("fill", "white")

        // 找出 X 和 Y 的最大值&最小值
        let x_max = 0
        let y_max = 0
        let x_min = 100
        let y_min = 100
        for(let i = 0; i < data.length; i++) {
            if(data[i][x_label] > x_max) {
                x_max = data[i][x_label]
            }
            if(data[i][y_label] > y_max) {
                y_max = data[i][y_label]
            }
            if(data[i][x_label] < x_min) {
                x_min = data[i][x_label]
            }
            if(data[i][y_label] < y_min) {
                y_min = data[i][y_label]
            }
        }
        // console.log(x_max, y_max)
        
        // Add X axis
        var x = d3.scaleLinear()
            .domain([Math.floor(x_min), Math.ceil(x_max)])
            .range([0, width])
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSize(-height * 1.3).ticks(10))
            .select(".domain").remove()
    
        // Add Y axis
        var y = d3.scaleLinear()
            .domain([Math.floor(y_min), Math.ceil(y_max)])
            .range([height, 0])
            .nice()
        svg.append("g")
            .call(d3.axisLeft(y).tickSize(-width * 1.3).ticks(7))
            .select(".domain").remove()
    
        // Customization
        // svg.selectAll(".tick line").attr("stroke", "white")
    
        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width / 2 + margin.left)
            .attr("y", height + margin.top + 20)
            .text(x_label);
        
        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width + margin.left - 20)
            .attr("y", height + margin.top + 20)
            .text("X axis");
    
        // Y axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20)
            .attr("x", -margin.top - height / 2 + 20)
            .text(y_label)

        // Y axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20)
            .attr("x", -margin.top + 20)
            .text("Y axis")
    
        // Color scale: give me a specie name, I return a color
        var color = d3.scaleOrdinal()
            .domain(["Iris-setosa", "Iris-versicolor", "Iris-virginica"])
            .range(["#ff000080", "#00ff0080", "#0000ff80"])

        // Add legend:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", 10)
            .text("setosa")
            .style("fill", "#ff000080")
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", 25)
            .text("versicolor")
            .style("fill", "#00ff0080")
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", 40)
            .text("virginica")
            .style("fill", "#0000ff80")
    
        // Add dots
        svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return x(d[x_label]); })
            .attr("cy", function (d) { return y(d[y_label]); })
            .attr("r", 5)
            .style("fill", function (d) { return color(d["class"]) })
    }

    // add an event listener for the change event
    const radioButtons = document.querySelectorAll('input[name="X_axis"], input[name="Y_axis"]');
    for(const radioButton of radioButtons){
        radioButton.addEventListener('change', showSelected);
    }

    function showSelected(e) {
        // console.log(e);
        if (this.checked) {
            if(this.name == "X_axis") {
                x_label = this.value
                scatter()
            }
            if(this.name == "Y_axis") {
                y_label = this.value
                scatter()
            }
            // console.log("x_label:", x_label);
            // console.log("y_label:", y_label);
        }
    }

    scatter();
})



