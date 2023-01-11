// https://github.com/d3/d3-scale-chromatic#schemeRdBu

function draw(dataType) {
    d3.selectAll('.toRemove').remove('')

    // Define the div for the tooltip
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip toRemove")
        .style("opacity", 0);

    d3.selectAll('svg').remove()

    var width = screen.width,
        height = screen.height * 1;

    var color = d3.scale.category20();
    // var origLinkOpacity = .6
    var initFS = '14px'

    var force = d3.layout.force()
        .charge(-10)
        .linkDistance(175)
        .size([width, height]);


    var initialThreshold = 20
    var lower = initialThreshold - 15
    var upper = initialThreshold + 15
    var x = d3.scale.linear()
        .domain([lower, upper])
        .range([400, 100])
        .clamp(true);

    var brush = d3.svg.brush()
        .y(x)
        .extent([0, 0]);

    var svg = d3.select("body").append("svg")
        .attr('id', 'svg')
        .attr("width", width)
        .attr("height", height)

    // var svgPosition = document.getElementById("svg");
    var div = d3.select('body')
        .append('div')
        .attr('id', 'infoBox')
        .attr("class", "fixedDiv toRemove")
    div.html("<b>Excerpts with word pair:</b>")
        .style('top', `${svg.node().getBoundingClientRect().top + 25}px`)
        .style('left', '15px')

    var links_g = svg.append("g");

    var nodes_g = svg.append("g");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + (width - 200) + ",0)")
        .call(d3.svg.axis()
            .scale(x)
            .orient("left")
            .tickFormat(function (d) { return d; })
            .tickSize(0)
            .tickPadding(12))
        .select(".domain")
        .select(function () { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "halo");

    var slider = svg.append("g")
        .attr("class", "slider")
        .call(brush);

    slider.selectAll(".extent,.resize")
        .remove();

    var handle = slider.append("circle")
        .attr("class", "handle")
        .attr("transform", "translate(" + (width - 200) + ",0)")
        .attr("r", 5);

    svg.append("text")
        .attr("x", width - 195)
        .attr("y", 80)
        .attr("text-anchor", "end")
        .attr("font-size", "12px")
        .style("opacity", 0.75)
        .text("co-occurrence threshold")

    d3.json(`wordnet_2_lines_all_stops_21.json`, function (error, graph) {

        d3.json(`label2lines_21.json`, function (label2lines) {

            graph.links.forEach(function (d, i) { d.i = i; });

            function brushed() {
                var value = brush.extent()[0];

                if (d3.event.sourceEvent) {
                    value = x.invert(d3.mouse(this)[1]);
                    brush.extent([value, value]);
                }
                handle.attr("cy", x(value));
                var threshold = value;

                var thresholded_links = graph.links.filter(function (d) { return (d.linkCt > threshold); });

                force
                    .links(thresholded_links);

                var link = links_g.selectAll(".link")
                    .data(thresholded_links, function (d) { return d.i; });

                link.enter().append("line")
                    .attr("class", "link")
                    // .attr('id', d => `link_${d.i}`)
                    .style('stroke', '#999')
                    .style('stroke-opacity', .6)
                    .style("stroke-width", '7px')
                    //  function (d) { return calcWidth(d.authorCt.length) })
                // return d.linkCt/10 })

                link.exit().remove();

                link.on('mouseover', function (d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`Link: <b>${d.source.id} and ${d.target.id}</b><br>Co-occurrences: <b>${d.linkCt}</b><br>Authors: <b>${d.authorCt.join(', ')}</b>`)
                        .style("left", (d3.event.pageX + 20) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                }).on('mouseout', function () {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                }).on('click', function (d) {
                    var label = `${d.source.id}AND${d.target.id}`
                    var labelData = label2lines[label]
                    d3.select('#infoBox').html(`<b>Excerpts with ${d.source.id} and ${d.target.id}:</b>`)
                    d3.select('#infoBox').selectAll('p').remove()
                    d3.select('#infoBox').selectAll('excerpt')
                        .data(labelData)
                        .enter()
                        .append('p')
                        .html(f => f.excerpt.replaceAll('\n', '<br>') +
                            ` <a href='${f.url}' target='_blank' class='excerptURL'>(${f.author})</a>`)
                })

                force.on("tick", function () {
                    link.attr("x1", function (d) { return d.source.x; })
                        .attr("y1", function (d) { return d.source.y; })
                        .attr("x2", function (d) { return d.target.x; })
                        .attr("y2", function (d) { return d.target.y; });

                    node.attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; });
                    // .attr("cx", function (d) { return d.x; })
                    // .attr("cy", function (d) { return d.y; });
                });
                force.start();

                // get thresholded nodes
                var validIDs = []
                thresholded_links.forEach(function (tl) {
                    var sourceID = tl.source.id
                    var targetID = tl.target.id
                    validIDs.push(sourceID)
                    validIDs.push(targetID)
                })
                // go through all nodes, remove if not connected to thresholded link
                d3.selectAll('.node').each(function (n) {
                    var thisNode = d3.select(this)
                    var nodeID = thisNode.attr('id')
                    if (!validIDs.includes(nodeID)) {
                        // console.log('bad node:', nodeID)
                        thisNode.transition(200).style('opacity', 0)
                        thisNode.classed('hide', true)
                    } else {
                        thisNode.transition(200).style('opacity', 1)
                        thisNode.transition(250).style('pointer-events', 'all')
                        thisNode.classed('hide', false)
                    }
                })
                filterGraph()
            }

            // draw force graph
            force
                .nodes(graph.nodes);

            var node = nodes_g.selectAll(".node")
                .data(graph.nodes)
                .enter()
                .append("g")
                .attr("class", "node")
                .attr('id', d => d.id)
                .each(function (d) {
                    d3.select(this)
                        .append("circle")
                        .attr("r", function (d) {
                            return d.totalinstances/25
                        })
                        .style("fill", function (d) {
                            return 'rgba(145, 187, 247, 0.788)'
                        })
                    d3.select(this)
                        .append("text").text(d.id)
                        .attr('class', 'label')
                        .attr("dy", 5 + 10)
                        .style("text-anchor", "middle")
                        .style('font-size', initFS)
                })
                .call(force.drag);


            d3.select('#currentFS').text(initFS)
            d3.selectAll('.node').on('mouseover', function (d, i) {
                var nodeID = d.id
                var connectedIDs = new Set()
                connectedIDs.add(nodeID)
                // highlight/unhighlight links
                d3.selectAll('.link').each(function (l) {
                    var thisLink = d3.select(this)
                    var sourceID = l.source.id
                    var targetID = l.target.id
                    if (nodeID == sourceID || nodeID == targetID) {
                        thisLink.transition().style('stroke-opacity', .6)
                        connectedIDs.add(sourceID)
                        connectedIDs.add(targetID)
                    } else {
                        thisLink.transition().style('stroke-opacity', .1)
                    }
                })
                // highlight/unhighlight circle and text
                d3.selectAll('.node').each(function () {
                    var thisNode = d3.select(this)
                    var thisNodeID = d3.select(this).attr('id')
                    var thisNodeClasses = thisNode.attr('class')
                    if (connectedIDs.has(thisNodeID)) {
                        if (!thisNodeClasses.includes('hide')) {
                            thisNode.transition().style('opacity', 1)
                        }
                    } else {
                        thisNode.transition().style('opacity', .1)
                    }
                })
            }).on('mouseout', function () {
                    d3.selectAll('.link').transition().style('stroke-opacity', .6)
                    d3.selectAll('.node').transition().style('opacity', 1)
            })

            brush.on("brush", brushed);

            slider
                .call(brush.extent([initialThreshold, initialThreshold]))
                .call(brush.event);

            // font size
            d3.selectAll('.fontsize').on('click', function () {
                var id = d3.select(this).attr('id')
                var fontSize = roundHalf(parseFloat(d3.selectAll('.label').style('font-size').replaceAll('px', '')))
                if (id == 'dfs') {
                    fontSize = fontSize - 2
                    d3.selectAll('.label').transition().style('font-size', `${fontSize}px`)
                } else {
                    fontSize = fontSize + 2
                    d3.selectAll('.label').transition().style('font-size', `${fontSize}px`)
                }
                d3.select('#currentFS').text(fontSize + 'px')
            })

        });
    });

    // show subgraph on text search
    d3.select('#search').on('click', function () {
        if (d3.select('#search').classed('reset')) {
            d3.select('#search').classed('reset', false).text('Search')

            d3.select('#input').style('display', 'inline-block').property('value', '')
            d3.select('#query').text('Search for subgraph:')
            resetGraph()
        } else {
            resetGraph()
            d3.select('#search').classed('reset', true).text('Reset')
            d3.select('#input').style('display', 'none')
            filterGraph()
        }
    })
}

function filterGraph() {
    var input = d3.select('#input').property('value')
    if (input == '') {
        resetGraph()
    } else {
        d3.select('#query').text(`Showing subgraph for ${input}`)
        resetGraph()

        // get connected words
        var connectedLemmas = new Set()
        var relevantLinkIDs = new Set()

        d3.selectAll('.link').each(function (d) {
            if (d.sourceLemma == input || d.targetLemma == input) {
                connectedLemmas.add(d.sourceLemma)
                connectedLemmas.add(d.targetLemma)
                relevantLinkIDs.add(d.i)
            }
        })
        // hide irrelevant nodes
        d3.selectAll('.node').each(function (n) {
            if (!connectedLemmas.has(n.id)) {
                d3.select(this).transition().style('display', 'none')
            } 
        })
        d3.selectAll('.link').each(function (d) {
            // show link if link is in relevantIDs
            if (!relevantLinkIDs.has(d.i) && (!connectedLemmas.has(d.sourceLemma) || !connectedLemmas.has(d.targetLemma))) {
                d3.select(this).transition().style('display', 'none')
            }
        })

        // SHOW THE OTHER NODES!
    }
}
function resetGraph() {
    d3.selectAll('.node').transition().style('display', 'block')
    d3.selectAll('.link').transition().style('display', 'block')
}
function roundHalf(num) {
    return Math.round(num * 2) / 2;
}

function calcWidth(numAuthors) {
    return numAuthors/5
}


$(document).ready(function () {
    console.log("ready!");
    draw()

    $('.anytoggle').change(function () {
        drawCorrectNet()
    })
    
    function drawCorrectNet() {
        var whichData = ($('#toggle').prop('checked')) ? 'notPEN' : 'PEN'
        var whichLang = $('#lang').prop('checked') ? 'Ukrainian' : 'Russian'
        draw(whichData, whichLang)
    }
});