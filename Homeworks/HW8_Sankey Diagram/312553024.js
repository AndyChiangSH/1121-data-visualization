d3.sankey = function () {
    var sankey = {},
        nodeWidth = 24,
        nodePadding = 8,
        size = [1, 1],
        nodes = [],
        links = [],
        attributeOrder = [];

    sankey.nodeWidth = function (_) {
        if (!arguments.length) return nodeWidth;
        nodeWidth = +_;
        return sankey;
    };

    sankey.nodePadding = function (_) {
        if (!arguments.length) return nodePadding;
        nodePadding = +_;
        return sankey;
    };

    sankey.nodes = function (_) {
        if (!arguments.length) return nodes;
        nodes = _;
        return sankey;
    };

    sankey.links = function (_) {
        if (!arguments.length) return links;
        links = _;
        return sankey;
    };

    sankey.size = function (_) {
        if (!arguments.length) return size;
        size = _;
        return sankey;
    };

    sankey.layout = function (iterations) {
        computeNodeLinks();
        computeNodeValues();
        computeNodeBreadths();
        computeNodeDepths(iterations);
        computeLinkDepths();
        computeColorID();
        return sankey;
    };

    sankey.relayout = function () {
        computeLinkDepths();
        return sankey;
    };

    sankey.link = function () {
        var curvature = 0.5;

        function link(d) {
            var x0 = d.source.x + d.source.dx,
                x1 = d.target.x,
                xi = d3.interpolateNumber(x0, x1),
                x2 = xi(curvature),
                x3 = xi(1 - curvature),
                y0 = d.source.y + d.sy + d.dy / 2,
                y1 = d.target.y + d.ty + d.dy / 2;
            return (
                'M' +
                x0 +
                ',' +
                y0 +
                'C' +
                x2 +
                ',' +
                y0 +
                ' ' +
                x3 +
                ',' +
                y1 +
                ' ' +
                x1 +
                ',' +
                y1
            );
        }

        link.curvature = function (_) {
            if (!arguments.length) return curvature;
            curvature = +_;
            return link;
        };

        return link;
    };

    // Populate the sourceLinks and targetLinks for each node.
    // Also, if the source and target are not objects, assume they are indices.
    function computeNodeLinks() {
        nodes.forEach(function (node) {
            node.sourceLinks = [];
            node.targetLinks = [];
        });
        links.forEach(function (link) {
            var source = link.source,
                target = link.target;
            if (typeof source === 'number')
                source = link.source = nodes[link.source];
            if (typeof target === 'number')
                target = link.target = nodes[link.target];
            source.sourceLinks.push(link);
            target.targetLinks.push(link);
        });
    }

    // Compute the value (size) of each node by summing the associated links.
    function computeNodeValues() {
        nodes.forEach(function (node) {
            node.value = Math.max(
                d3.sum(node.sourceLinks, value),
                d3.sum(node.targetLinks, value)
            );
        });
    }

    // Iteratively assign the breadth (x-position) for each node.
    // Nodes are assigned the maximum breadth of incoming neighbors plus one;
    // nodes with no incoming links are assigned breadth zero, while
    // nodes with no outgoing links are assigned the maximum breadth.
    function computeNodeBreadths() {
        attributeOrder = [
            'buying',
            'maintenance',
            'doors',
            'persons',
            'luggage boot',
            'safety',
        ];

        // Iterate through each attribute in the order
        attributeOrder.forEach(function (
            attribute,
            i
        ) {
            // Set the x-position (breadth) for each value node corresponding to the attribute
            var nodesForAttribute = nodes.filter(
                function (node) {
                    return node.name.startsWith(attribute);
                }
            );

            nodesForAttribute.forEach(function (node) {
                node.x = i;
                node.dx = nodeWidth;
            });
        });

        // Move sinks to the rightmost position
        moveSinksRight(attributeOrder.length);

        // Scale node breadths
        scaleNodeBreadths(
            (size[0] - nodeWidth) /
            (attributeOrder.length - 1)
        );
        /*
        var remainingNodes = nodes,
            nextNodes,
            x = 0;
    
        while (remainingNodes.length) {
          nextNodes = [];
          remainingNodes.forEach(function(node) {
            node.x = x;
            node.dx = nodeWidth;
            node.sourceLinks.forEach(function(link) {
              nextNodes.push(link.target);
            });
          });
          remainingNodes = nextNodes;
          ++x;
        }
    
        //
        moveSinksRight(x);
        scaleNodeBreadths((size[0] - nodeWidth) / (x - 1));
        */
    }

    function moveSourcesRight() {
        nodes.forEach(function (node) {
            if (!node.targetLinks.length) {
                node.x =
                    d3.min(node.sourceLinks, function (d) {
                        return d.target.x;
                    }) - 1;
            }
        });
    }

    function moveSinksRight(x) {
        nodes.forEach(function (node) {
            if (!node.sourceLinks.length) {
                node.x = x - 1;
            }
        });
    }

    function scaleNodeBreadths(kx) {
        nodes.forEach(function (node) {
            node.x *= kx;
        });
    }

    function computeNodeDepths(iterations) {
        var nodesByBreadth = d3
            .nest()
            .key(function (d) {
                return d.x;
            })
            .sortKeys(d3.ascending)
            .entries(nodes)
            .map(function (d) {
                return d.values;
            });

        //
        initializeNodeDepth();
        resolveCollisions();
        for (
            var alpha = 1;
            iterations > 0;
            --iterations
        ) {
            relaxRightToLeft((alpha *= 0.99));
            resolveCollisions();
            relaxLeftToRight(alpha);
            resolveCollisions();
        }

        function initializeNodeDepth() {
            var ky = d3.min(
                nodesByBreadth,
                function (nodes) {
                    return (
                        (size[1] -
                            (nodes.length - 1) * nodePadding) /
                        d3.sum(nodes, value)
                    );
                }
            );

            nodesByBreadth.forEach(function (nodes) {
                nodes.forEach(function (node, i) {
                    node.y = i;
                    node.dy = node.value * ky;
                });
            });

            links.forEach(function (link) {
                link.dy = link.value * ky;
            });
        }

        function relaxLeftToRight(alpha) {
            nodesByBreadth.forEach(function (
                nodes,
                breadth
            ) {
                nodes.forEach(function (node) {
                    if (node.targetLinks.length) {
                        var y =
                            d3.sum(
                                node.targetLinks,
                                weightedSource
                            ) / d3.sum(node.targetLinks, value);
                        node.y += (y - center(node)) * alpha;
                    }
                });
            });

            function weightedSource(link) {
                return center(link.source) * link.value;
            }
        }

        function relaxRightToLeft(alpha) {
            nodesByBreadth
                .slice()
                .reverse()
                .forEach(function (nodes) {
                    nodes.forEach(function (node) {
                        if (node.sourceLinks.length) {
                            var y =
                                d3.sum(
                                    node.sourceLinks,
                                    weightedTarget
                                ) /
                                d3.sum(node.sourceLinks, value);
                            node.y +=
                                (y - center(node)) * alpha;
                        }
                    });
                });

            function weightedTarget(link) {
                return center(link.target) * link.value;
            }
        }

        function resolveCollisions() {
            nodesByBreadth.forEach(function (nodes) {
                var node,
                    dy,
                    y0 = 0,
                    n = nodes.length,
                    i;

                // Push any overlapping nodes down.
                nodes.sort(ascendingDepth);
                for (i = 0; i < n; ++i) {
                    node = nodes[i];
                    dy = y0 - node.y;
                    if (dy > 0) node.y += dy;
                    y0 = node.y + node.dy + nodePadding;
                }

                // If the bottommost node goes outside the bounds, push it back up.
                dy = y0 - nodePadding - size[1];
                if (dy > 0) {
                    y0 = node.y -= dy;

                    // Push any overlapping nodes back up.
                    for (i = n - 2; i >= 0; --i) {
                        node = nodes[i];
                        dy =
                            node.y + node.dy + nodePadding - y0;
                        if (dy > 0) node.y -= dy;
                        y0 = node.y;
                    }
                }
            });
        }

        function ascendingDepth(a, b) {
            return a.y - b.y;
        }
    }

    function computeLinkDepths() {
        nodes.forEach(function (node) {
            node.sourceLinks.sort(ascendingTargetDepth);
            node.targetLinks.sort(ascendingSourceDepth);
        });
        nodes.forEach(function (node) {
            var sy = 0,
                ty = 0;
            node.sourceLinks.forEach(function (link) {
                link.sy = sy;
                sy += link.dy;
            });
            node.targetLinks.forEach(function (link) {
                link.ty = ty;
                ty += link.dy;
            });
        });

        function ascendingSourceDepth(a, b) {
            return a.source.y - b.source.y;
        }

        function ascendingTargetDepth(a, b) {
            return a.target.y - b.target.y;
        }
    }

    function computeColorID() {
        attributeOrder.forEach(function (attribute) {
            var nodesForAttribute = nodes.filter(
                function (node) {
                    return node.name.startsWith(attribute);
                }
            );

            // Sort nodes based on their y values
            nodesForAttribute.sort((a, b) => a.y - b.y);
            nodesForAttribute.forEach((node, index) => {
                node.cid = index;
            });
        });
    }

    function center(node) {
        return node.y + node.dy / 2;
    }

    function value(link) {
        return link.value;
    }

    return sankey;
};

(function (d3$1) {
    'use strict';

    const svg = d3$1.select('#sankey-diagram');

    const width = +svg.attr('width');
    const height = +svg.attr('height');

    const margin = {
        top: 50,
        right: 50,
        bottom: 150,
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
        // svg.attr(
        //     'transform',
        //     'translate(' +
        //     margin.left +
        //     ',' +
        //     margin.top +
        //     ')'
        // );
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
            return d.source.name + ' → ' + d.target.name + ': ' + d.value;
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
            "buying": ['hsl(0, 100%, 80%)', 'hsl(0, 100%, 70%)', 'hsl(0, 100%, 60%)', 'hsl(0, 100%, 50%)'],
            "maintenance": ['hsl(30, 100%, 80%)', 'hsl(30, 100%, 70%)', 'hsl(30, 100%, 60%)', 'hsl(30, 100%, 50%)'],
            "doors": ['hsl(60, 100%, 80%)', 'hsl(60, 100%, 70%)', 'hsl(60, 100%, 60%)', 'hsl(60, 100%, 50%)'],
            "persons": ['hsl(120, 100%, 70%)', 'hsl(120, 100%, 60%)', 'hsl(120, 100%, 50%)'],
            'luggage boot': ['hsl(180, 100%, 70%)', 'hsl(180, 100%, 60%)', 'hsl(180, 100%, 50%)'],
            "safety": ['hsl(240, 100%, 70%)', 'hsl(240, 100%, 60%)', 'hsl(240, 100%, 50%)'],
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
                return `translate(${margin.left + d.x
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
                `translate(${margin.left + d.x},${margin.top +
                (d.y = Math.max(
                    0, Math.min(daigramHeight, d3.event.y)
                ))
                })`
            );
            sankey.relayout();
            link.attr('d', path);
        }
    };

    const data_path = "car.data"
    // const data_path = "http://vis.lab.djosix.com:2023/data/car.data"

    d3$1.text(data_path).then(function (r) {
        // console.log(r);
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
    });

}(d3));