// Dimension of the whole chart. Only one size since it has to be square
const marginWhole = { top: 10, right: 10, bottom: 10, left: 10 },
	sizeWhole = 640 - marginWhole.left - marginWhole.right

// Create the svg area
const svg = d3.select("#my_dataviz")
	.append("svg")
	.attr("width", sizeWhole + marginWhole.left + marginWhole.right)
	.attr("height", sizeWhole + marginWhole.top + marginWhole.bottom)
	.append("g")
	.attr("transform", `translate(${marginWhole.left},${marginWhole.top})`);

const data_path = "./iris.csv"

d3.csv(data_path).then(function (data) {
	data.splice(150, 1);
	console.log("data:", data)

	// What are the numeric variables in this dataset? How many do I have
	const allVar = ["sepal length", "sepal width", "petal length", "petal width"]
	const numVar = allVar.length

	// Now I can compute the size of a single chart
	mar = 20
	size = sizeWhole / numVar


	// ----------------- //
	// Scales
	// ----------------- //

	// Create a scale: gives the position of each pair each variable
	const position = d3.scalePoint()
		.domain(allVar)
		.range([0, sizeWhole - size])

	// Color scale: give me a specie name, I return a color
	const color = d3.scaleOrdinal()
		.domain(["setosa", "versicolor", "virginica"])
		.range(["#ff000080", "#00ff0080", "#0000ff80"])


	// Render charts
	for (i in allVar) {
		for (j in allVar) {

			// Get current variable name
			let var1 = allVar[i]
			let var2 = allVar[j]

			// Add histograms = diagonal
			if (var1 === var2) {
				// create X Scale
				xextent = d3.extent(data, function (d) { return +d[var1] })
				const x = d3.scaleLinear()
					.domain(xextent).nice()
					.range([0, size - 2 * mar]);

				// Add a 'g' at the right position
				const tmp = svg
					.append('g')
					.attr("transform", `translate(${position(var1) + mar},${position(var2) + mar})`);

				// Add x axis
				tmp.append("g")
					.attr("transform", `translate(0,${size - mar * 2})`)
					.call(d3.axisBottom(x).ticks(3));

				// set the parameters for the histogram
				const histogram = d3.histogram()
					.value(function (d) { return +d[var1]; })   // I need to give the vector of value
					.domain(x.domain())  // then the domain of the graphic
					.thresholds(x.ticks(15)); // then the numbers of bins

				// And apply this function to data to get the bins
				const bins = histogram(data);

				// Y axis: scale and draw:
				const y = d3.scaleLinear()
					.range([size - 2 * mar, 0])
					.domain([0, d3.max(bins, function (d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously

				// append the bar rectangles to the svg element
				tmp.append('g')
					.selectAll("rect")
					.data(bins)
					.join("rect")
					.attr("x", 1)
					.attr("transform", d => `translate(${x(d.x0)},${y(d.length) - 1})`)
					.attr("width", function (d) { return x(d.x1) - x(d.x0); })
					.attr("height", function (d) { return (size - 2 * mar) - y(d.length); })
					.style("fill", "#b8b8b8")
					.attr("stroke", "white")

				// append ladel of each attribute
				tmp.append("text")
					.text(var1)
					.attr("text-anchor", "middle")
					.attr("x", (size / 2) - mar)
					.style("fill", "#000000")
					.style("font-size", 12)
			}
			// Add charts = other else
			else {
				// Add X Scale of each graph
				xextent = d3.extent(data, function (d) { return +d[var1] })
				const x = d3.scaleLinear()
					.domain(xextent).nice()
					.range([0, size - 2 * mar]);

				// Add Y Scale of each graph
				yextent = d3.extent(data, function (d) { return +d[var2] })
				const y = d3.scaleLinear()
					.domain(yextent).nice()
					.range([size - 2 * mar, 0]);

				// Add a 'g' at the right position
				const tmp = svg
					.append('g')
					.attr("transform", `translate(${position(var1) + mar},${position(var2) + mar})`)

				// Add X and Y axis in tmp
				tmp.append("g")
					.attr("transform", `translate(0,${size - mar * 2})`)
					.call(d3.axisBottom(x).ticks(3));
				tmp.append("g")
					.call(d3.axisLeft(y).ticks(3));

				// Add circle
				tmp.selectAll("myCircles")
					.data(data)
					.join("circle")
					.attr("cx", function (d) { return x(+d[var1]) })
					.attr("cy", function (d) { return y(+d[var2]) })
					.attr("r", 3)
					.attr("fill", function (d) { return color(d.class) })
			}
		}
	}
})