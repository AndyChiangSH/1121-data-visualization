(function (d3$1) {
    'use strict';

    const svg = d3$1.select('svg');
    const width = +svg.attr('width');
    const height = +svg.attr('height');

    const column = ['sepal length', 'sepal width', 'petal length', 'petal width'];

    const colorr = {
        'Iris-setosa': '#ff6969',
        'Iris-versicolor': '#ffd769',
        'Iris-virginica': '#69ffa7'
    };

    const render = data => {

        const margin = { top: 115, right: 250, bottom: 84, left: 120 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);

        const x = d3$1.scalePoint()
            .domain(column)
            .range([0, innerWidth]);

        const y = d3$1.scaleLinear()
            .domain([0, 8])
            .range([innerHeight, 0]);

        const axisY = d3$1.axisLeft().scale(y)
            .tickPadding(5)
            .tickSize(5);

        const createline = d =>
            d3$1.line()(column.map(p => [x(p), y(d[p])]));

        //data
        const pathh = g.selectAll('path').data(data).enter()
            .append('path')
            .attr('d', d => createline(d))
            .attr('stroke', d => colorr[d.class])
            .attr('fill', 'none')
            .attr('opacity', 0.2)
            .attr('stroke-width', 3);


        //line
        const axiss = g.selectAll('.axes').data(column).enter()
            .append('g')
            .attr('class', 'axes')
            .each(function (d) { d3$1.select(this).call(axisY); })
            .attr('transform', d => 'translate(' + x(d) + ',0)')
            .append('text')
            .attr('fill', 'black')
            .attr('transform', `translate(0,${innerHeight})`)
            .attr('y', 30)
            .attr('text-anchor', 'middle')
            .attr('font-size', '2em')
            .text(d => d);

        // class text
        g.append('text')
            .attr('class', 'title')
            .attr('x', innerWidth / 2 - 320)
            .attr('y', -40)
            .attr('font-size', '3em')
            .attr('font-family', 'sans-serif')
            .text('Iris Parallel Coordinate Plot');

        g.append('text')
            .attr('x', 620)
            .attr('y', 125)
            .attr('font-size', '1.5em')
            .attr('font-family', 'sans-serif')
            .text('Classes');

        //setosa
        g.append('circle')
            .attr('cx', 630)
            .attr('cy', 145)
            .attr('r', 5)
            .style('fill', colorr['Iris-setosa']);

        g.append('text')
            .attr('x', 645)
            .attr('y', 152.5)
            .attr('font-size', '1.5em')
            .attr('font-family', 'sans-serif')
            .text('setosa');

        //versicolor
        g.append('circle')
            .attr('cx', 630)
            .attr('cy', 175)
            .attr('r', 5)
            .style('fill', colorr['Iris-versicolor']);

        g.append('text')
            .attr('x', 645)
            .attr('y', 182.5)
            .attr('font-size', '1.5em')
            .attr('font-family', 'sans-serif')
            .text('versicolor');

        //virginica
        g.append('circle')
            .attr('cx', 630)
            .attr('cy', 205)
            .attr('r', 5)
            .style('fill', colorr['Iris-virginica']);

        g.append('text')
            .attr('x', 645)
            .attr('y', 212.5)
            .attr('font-size', '1.5em')
            .attr('font-family', 'sans-serif')
            .text('virginica');


    };



    // Read Dataset
    d3.csv('./iris.csv').then(data => {
        data.forEach(d => {
            d['sepal length'] = +d['sepal length'];
            d['sepal width'] = +d['sepal width'];
            d['petalLength'] = +d['petal length'];
            d['petalWidth'] = +d['petal width'];
        });
        render(data);
    });

}(d3));
