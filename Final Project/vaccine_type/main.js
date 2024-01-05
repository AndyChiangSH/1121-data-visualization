// Load data
d3.csv('accumulated_vaccinations.csv').then(function (data) {
    // Parse date strings into JavaScript Date objects
    var parseDate = d3.timeParse('%Y-%m-%d');
    data.forEach(function (d) {
        d.Day = parseDate(d.Day);
    });

    // Extract vaccine names from the columns
    var vaccines = data.columns.slice(1);

    // Reverse the order of vaccines so that the lesser dose is at the bottom
    vaccines.reverse();

    // Set up a custom color scale for each vaccine
    var colorScale = d3.scaleOrdinal()
        .domain(vaccines)
        .range(['#1f78b4', '#33a02c', '#e31a1c', '#ff7f00', '#6a3d9a', '#b15928', '#a6cee3', '#b2df8a', '#fb9a99', '#fdbf6f', '#cab2d6', '#ffff99', '#8da0cb', '#ed6e43']);
    // Define the order of vaccines for the tooltip
    var vaccineOrder = ["Pfizer/BioNTech", "Moderna", "Oxford/AstraZeneca", "Johnson&Johnson", "Sputnik V", "Sinovac", "Sinopharm/Beijing", "CanSino", "Novavax", "Covaxin", "Medicago", "Sanofi/GSK", "SKYCovione", "Valneva"];

    // Set up the stack generator with reversed keys
    var stack = d3.stack()
        .keys(vaccines)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetNone);

    // Set up the scales
    var margin = { top: 20, right: 100, bottom: 80, left: 100 };
    var width = 900 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    // Adjust the x-axis scale
    var x = d3.scaleTime()
        .domain(d3.extent(data, function (d) { return d.Day; }))
        .range([0, width]);

    // Adjust the y-axis scale
    var y = d3.scaleLinear()
        .domain([0, d3.max(stack(data), function (d) { return d3.max(d, function (d) { return d[1]; }); })])
        .range([height, 0]);

    // Set up the area generator with a combination of linear and cardinal interpolation
    var area = d3.area()
        .x(function (d) { return x(d.data.Day); })
        .y0(function (d) { return y(d[0]); })
        .y1(function (d) { return y(d[1]); })
        .curve(d3.curveLinear);

    // Create the SVG element for the main chart
    var svg = d3.select('#chart').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Create the tooltip element
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Add the areas to the main SVG with transitions and tooltip interactions
    svg.selectAll('path')
        .data(stack(data))
        .enter().append('path')
        .attr('class', 'area')
        .style('fill', function (d) { return colorScale(d.key); })
        .attr('d', area)
        .on('mouseover', function (d, i, nodes) {
            var currentDate = d3.mouse(nodes[i])[0]; // Get the x-coordinate of the mouse pointer
            var invertedDate = x.invert(currentDate); // Convert the x-coordinate to the corresponding date

            // Filter the data based on the selected date
            var filteredData = data.filter(function (day) {
                return day.Day.getTime() <= invertedDate.getTime();
            });

            // Define the custom order for vaccines
            var customVaccineOrder = [
                'Pfizer/BioNTech',
                'Moderna',
                'Oxford/AstraZeneca',
                'Johnson&Johnson',
                'Sputnik V',
                'Sinovac',
                'Sinopharm/Beijing',
                'CanSino',
                'Novavax',
                'Covaxin',
                'Medicago',
                'Sanofi/GSK',
                'SKYCovione',
                'Valneva'
            ];

            // Display the information in the tooltip
            var tooltipHTML = '<strong>Date: ' + d3.timeFormat('%Y-%m-%d')(invertedDate) + '</strong><br>';
            vaccineOrder.forEach(function (vaccine) {
                var totalDoses = filteredData[filteredData.length - 1][vaccine];
                tooltipHTML += '<br>' + vaccine + ': ' + formatNumber(totalDoses);
            });

            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(tooltipHTML)
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })

        .on('mouseout', function () {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .transition()
        .duration(1000)
        .attr('opacity', 1);

    // Add the x-axis to the main SVG with transitions
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x))
        .selectAll('text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '.15em')
        .attr('transform', 'rotate(-25)')
        .transition()
        .duration(1000);

    // Add the y-axis to the main SVG with transitions
    svg.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y).tickFormat(d3.format(".1s")))
        .selectAll('text')
        .transition()
        .duration(1000);

    // Add a slider
    var slider = d3.sliderHorizontal()
        .min(d3.min(data, function (d) { return d.Day; }))
        .max(d3.max(data, function (d) { return d.Day; }))
        .width(width)
        .tickFormat(d3.timeFormat('%Y-%m-%d'))
        .on('onchange', val => updateChart(val));

    svg.append('g')
        .attr('transform', 'translate(0,' + (height + 40) + ')')
        .call(slider);

    // Set the default value for the slider
    slider.value(parseDate('2023-11-16'));

    // Function to update the chart based on the selected date
    function updateChart(selectedDate) {
        // Filter the data based on the selected date
        var filteredData = data.filter(function (d) {
            return d.Day.getTime() <= selectedDate.getTime();
        });

        // Update the x domain
        x.domain(d3.extent(filteredData, function (d) { return d.Day; }));

        // Update the x-axis with transitions
        svg.select('.axis')
            .transition()
            .duration(1000)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '.15em')
            .attr('transform', 'rotate(-25)');

        // Update the areas
        svg.selectAll('.area')
            .data(stack(filteredData))
            .attr('d', area);
    }

    // Create a separate SVG element for the legend
    var legendSvg = d3.select('#legend-svg').append('svg')
        .attr('width', 150)
        .attr('height', 200)
        .append('g')
        .attr('transform', 'translate(0,0)');

    // Add a legend with transitions to the separate SVG element
    var legend = legendSvg.selectAll('.legend')
        .data(vaccines)
        .enter().append('g')
        .attr('class', 'legend')
        .attr('transform', function (d, i) { return 'translate(0,' + (vaccines.length - i - 1) * 15 + ')'; })
        .style('opacity', 1)
        .on('mouseover', function (d) {
            highlightGroup(d);
        })
        .on('mouseout', function () {
            removeHighlight();
        });

    legend.append('rect')
        .attr('x', 0)
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', function (d) { return colorScale(d); })
        .transition()
        .duration(1000)
        .style('opacity', 1);

    legend.append('text')
        .attr('x', 16)
        .attr('y', 6)
        .attr('dy', '.35em')
        .style('text-anchor', 'start')
        .text(function (d) { return d; })
        .transition()
        .duration(1000)
        .style('opacity', 1);

    // Apply styles to the legend text
    legend.selectAll('text')
        .style('font-size', '12px')
        .style('fill', '#333');

    // Function to highlight a group in the chart and show the tooltip
    function highlightGroup(group, event) {
        svg.selectAll('.area')
            .filter(function (d) { return d.key !== group; })
            .transition()
            .duration(200)
            .style('opacity', 0.2);

        // Show the tooltip
        var tooltipText = group + ' Vaccination';
        showTooltip(event, tooltipText);
    }

    // Function to remove the highlight from the chart and hide the tooltip
    function removeHighlight() {
        svg.selectAll('.area')
            .transition()
            .duration(200)
            .style('opacity', 1);

        // Hide the tooltip
        hideTooltip();
    }

    // Function to show the tooltip at the specified position with the given text
    function showTooltip(event, text) {
        var tooltip = d3.select('.tooltip-container')
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');

        tooltip.select('.tooltip')
            .text(text)
            .style('opacity', 1);
    }

    // Function to format
    function formatNumber(number) {
        var suffixes = ["", " thousand", " million", " billion", " trillion"];
        var suffixIndex = 0;
        while (number >= 1000) {
            number /= 1000;
            suffixIndex++;
        }
        return d3.format(".2f")(number) + suffixes[suffixIndex];
    }
    // Function to hide the tooltip
    function hideTooltip() {
        d3.select('.tooltip-container')
            .style('opacity', 0);
    }

});
