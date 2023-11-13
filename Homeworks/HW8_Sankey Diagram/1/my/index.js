import {
  select,
  csv,
  text,
  scaleLinear,
  scalePoint,
  scaleOrdinal,
  schemeCategory10,
  extent,
  axisBottom,
  axisLeft,
} from 'd3';
import { dropdownMenu } from './dropdownMenu';

const svg = select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

const margin = {
  top: 50,
  right: 50,
  bottom: 50,
  left: 50,
};

const daigramWidth =
  width - margin.left - margin.right;
const daigramHeight =
  height - margin.top - margin.bottom;

// Set the sankey diagram properties
var sankey = d3
  .sankey()
  .nodeWidth(10)
  .nodePadding(2)
  .size([daigramWidth, daigramHeight]);
//.nodeAlign(d3.sankeyLeft());

var path = sankey.link();

const render = (graph) => {
  svg.attr(
    'transform',
    'translate(' +
      margin.left +
      ',' +
      margin.top +
      ')'
  );
  //console.log(graph);
  var nodeMap = {};
  graph.nodes.forEach(function (x) {
    nodeMap[x.name] = x;
  });
  graph.links = graph.links.map(function (x) {
    return {
      source: nodeMap[x.source],
      target: nodeMap[x.target],
      value: x.value,
    };
  });
  //console.log(graph);
  sankey
    .nodes(graph.nodes)
    .links(graph.links)
    .layout(32);
  
  const linkGroups = {};
  graph.links.forEach((link) => {
    const key = link.source.name + '-' + link.target.name;
    if (!linkGroups[key]) {
      linkGroups[key] = [];
    }
    linkGroups[key].push(link);
  });

  // Add the link groups
  const band = svg.append('g').selectAll('.band')
    .data(Object.values(linkGroups))
    .enter().append('g')
    .attr('class', 'band');

  // Add the links within each group
  const link = band.selectAll('.link')
    .data((d) => d)
    .enter().append('path')
    .attr('class', 'link')
    .attr('transform', function () {
      return `translate(${margin.left},${margin.top})`;
    })
    .attr('d', path)
    .style('stroke-width', function (d) {
      return Math.max(1, d.dy);
    })
    .sort(function (a, b) {
      return b.dy - a.dy;
    });

  // Add the link titles
  link.append('title').text(function (d) {
    return d.source.name + ' → ' + d.target.name+', count: '+d.value;
  });

  // add in the links
  /*
  var link = svg
    .append('g')
    .selectAll('.link')
    .data(graph.links)
    .enter()
    .append('path')
    .attr('class', 'link')
    .attr('transform', function () {
      return `translate(${margin.left},${margin.top})`;
    })
    .attr('d', path)
    .style('stroke-width', function (d) {
      return Math.max(1, d.dy);
    })
    .sort(function (a, b) {
      return b.dy - a.dy;
    });

  // add the link titles
  link.append('title').text(function (d) {
    return d.source.name + ' → ' + d.target.name;
  });*/

  const colorScales = {
    buying: [
      '#cc00cc',
      '#ff00ff',
      '#ff66ff',
      '#ff99ff',
    ],
    maintenance: [
      '#3333ff',
      '#3366ff',
      '#6699ff',
      '#99ccff',
    ],
    doors: [
      '#66ffff',
      '#33cccc',
      '#006699',
      '#003366',
    ],
    persons: ['#99ff66', '#66ff33', '#009900'],
    'luggage boot': [
      '#ffcc66',
      '#ffcc00',
      '#ff9900',
    ],
    safety: ['#ff6600', '#ff3300', '#993300'],
  };

  svg
    .selectAll('.attribute-title')
    .data(graph.nodes.filter((d) => d.cid === 0))
    .enter()
    .append('text')
    .attr('class', 'attribute-title')
    .attr('x', function (d) {
      return margin.left + d.x;
    })
    .attr('y', 30)
    .attr('text-anchor', 'middle')
    .text(function (d) {
      return d.name.split('-')[0];
    });

  // add in the nodes
  var node = svg
    .append('g')
    .selectAll('.node')
    .data(graph.nodes)
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', function (d) {
      return `translate(${
        margin.left + d.x
      },${margin.top + d.y})`;
    })
    .call(
      d3
        .drag()
        .subject(function (d) {
          return d;
        })
        .on('start', function () {
          this.parentNode.appendChild(this);
        })
        .on('drag', dragmove)
    );

  // add the rectangles for the nodes
  node
    .append('rect')
    .attr('height', function (d) {
      return d.dy;
    })
    .attr('width', sankey.nodeWidth())
    .style('fill', function (d) {
      const colorScale =
        colorScales[d.name.split('-')[0]];
      return (d.color = colorScale[d.cid]);
    })
    .style('stroke', function (d) {
      return d3.rgb(d.color).darker(2);
    })
    .append('title')
    .text(function (d) {
      return d.name;
    });

  // add in the title for the nodes
  node
    .append('text')
    .attr('x', -6)
    .attr('y', function (d) {
      return d.dy / 2;
    })
    .attr('dy', '.35em')
    .attr('text-anchor', 'end')
    .attr('transform', null)
    .text(function (d) {
      return d.label.split('-')[1];
    })
    .filter(function (d) {
      return d.x < width / 2;
    })
    .attr('x', 6 + sankey.nodeWidth())
    .attr('text-anchor', 'start');

  // the function for moving the nodes
  function dragmove(d) {
    d3.select(this).attr(
      'transform',
      `translate(${margin.left + d.x},${
        margin.top +
        (d.y = Math.max(
          0,
          Math.min(height - d.dy, d3.event.y)
        ))
      })`
    );
    sankey.relayout();
    link.attr('d', path);
  }
};

text('car.data').then(function (r) {
  console.log(r)
  var loadedData =
    'buying,maintenance,doors,persons,luggage boot,safety\n' +
    r;
  var data = d3.csvParse(loadedData);

  const transformData = (d) => {
    const nodesById = {};
    const linksMap = {};
   // const links = [];
    const column = d.columns;
    const columnLength = column.length;
    const n = columnLength;
    const rowLength = d.length;

    d.forEach((row) => {
      for (var i = 0; i < n - 1; i++) {
        const source =
          column[i] + '-' + row[column[i]];
        const target =
          column[i + 1] +
          '-' +
          row[column[i + 1]];

        if (target === '' || target === '-') {
          break;
        }
        //
        const linkKey = source + '->' + target;
        
        if (!linksMap[linkKey]) {
          linksMap[linkKey] = {
            source: source,
            target: target,
            value: 0,
          };
        }

        linksMap[linkKey].value += 1;
        //
        const link = {
          source: source,
          target: target,
          value: 1,
        };
        //links.push(link);
        nodesById[source] = true;
        nodesById[target] = true;
      }
    });
    const nodes = Object.keys(nodesById).map(
      (id) => ({
        name: id,
        label: id.substr(0, 20),
      })
    );
    const links = Object.values(linksMap);

    return { nodes: nodes, links: links };
  };
  const transformedData = transformData(data);
  //console.log(transformedData);

  render(transformedData);
})