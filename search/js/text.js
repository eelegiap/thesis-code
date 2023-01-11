class TextPanel {

    constructor(poemData) {
        this.data = poemData
        this.initVis()
    }

    initVis() {
        let vis = this;

        // set the dimensions and margins of the graph
        var margin = { top: 30, right: 30, bottom: 70, left: 60 },
            width = 400 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        d3.select('#poemTxt').html(choose(this.data).Text.replaceAll('\n', '<br>'))
        // d3.select('#srcsent' + i)
        //     .selectAll('span')
        //     .data(tokens)
        //     .enter()
        //     .append('span')
        //     .attr('id', function (d, j) {
        //         return 'srcsent' + i + 'span' + j
        //     })
        //     .attr('class', 'token')
        //     .append('mark')
        //     .attr('id', function (d, j) {
        //         return 'srcsent' + i + 'token' + j
        //     })
        //     .html(function (d, j) {
        //         return spacenospace(tokens, d, j, "src")
        //     })
        //     .style('background-color', 'white')
        d3.select('#search').on('click', function() {
            updateResults()
        })

    }
    wrangleData(input) {
        let vis = this;

        input = input.toLowerCase()

        console.log(input)
        
        var dataByInput = vis.data.filter(function(d) {
            var text = String(d.Text)
            if (!input) {
                return false
            }
            else if (text.toLowerCase().includes(input)) {
                d['lineInfo'] = []
                // find the line it occurs in 
                text.split('\n').forEach(function(l,i) {
                    if (l.toLowerCase().includes(input)) {
                        d['lineInfo'].push(
                            {'lineIdx' : i, 'lineTxt' : l}
                            )
                    }
                })
                return true
            }
            return false
        })
        console.log('Results length:',dataByInput.length)
        console.log('Rand example:',choose(dataByInput))
        vis.updateVis(dataByInput.slice(0,5), input);

    }

    /*
    * The drawing function - should use the D3 update sequence (enter, update, exit)
    * */

    updateVis(data, input) {

        let vis = this;

        // Exit data
        // vis.svg.selectAll(".label-text").remove();
        d3.selectAll(".result").remove();

        console.log('data',data.length)
        var resultsByPoem = d3.select('#results').selectAll('.poemResult')
            .data(data)
            .enter()
            .append('div')
            .attr('class','poemResult')
            .attr('id',d => d.UniqueIndex)

        resultsByPoem.each(function(p) {
            var thisPoem = d3.select(this)
            p.lineInfo.forEach(function(l) {
                var htmlText = l.lineTxt.slice(0,75)
                thisPoem
                .append('p')
                .append('a')
                .attr('id',p.UniqueIndex)
                .attr('class','result')
                .html(`<span style='font-size: 14px'>... </span>${htmlText}
                        <span style='font-size: 14px'> ...</span>`)
            })
        })



        // vis.x.domain([0, 100])

        // // set the parameters for the histogram
        // vis.histogram = d3.histogram()
        //     .value(function (d) { return d; })   // I need to give the vector of value
        //     .domain(vis.x.domain())  // then the domain of the graphic
        //     .thresholds(vis.x.ticks(20)); // then the numbers of bins

        // // And apply this function to data to get the bins
        // vis.bins = vis.histogram(vis.data);

        // // update y domain
        // vis.y.domain([0, d3.max(vis.bins, function (d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously


        // // // (2) Draw rectangles
        // vis.rects = vis.svg.selectAll("rect")
        //     .data(vis.bins)
        //     .join("rect")
        //     .attr("x", 1)
        //     .attr("transform", function (d) { return `translate(${vis.x(d.x0)} , ${vis.y(d.length)})` })
        //     .attr("width", function (d) { return vis.x(d.x1) - vis.x(d.x0) - 1 })
        //     .attr("height", function (d) { return vis.height - vis.y(d.length); })
        //     .attr("fill", "#69b3a2")

        // vis.rects.on("mouseover", function (event, d) {


        //     d3.select(this).transition().duration(200).attr('fill', '#00cccc')
        //     vis.tooltipH.transition()
        //         .duration(200)
        //         .style("opacity", .9);

        //     vis.tooltipH.html(`${d.length} sentences of length ${d3.min(d)}-${d3.max(d)}`)
        //         .style("left", (event.pageX + 10) + "px")
        //         .style("top", (event.pageY - 10) + "px");
        // })
        //     .on("mouseout", function (d) {
        //         d3.select(this).transition().duration(200).attr('fill', '#69b3a2')

        //         vis.tooltipH.transition()
        //             .duration(500)
        //             .style("opacity", 0);
        //     });


        // // mouseover color 00cccc
        // // // (4) Update the y-axis
        // vis.svg.select(".y-axis")
        //     .transition()
        //     .duration(800)
        //     .call(d3.axisLeft(vis.y))


        // // // (5) Update the x-axis
        // vis.svg.select(".x-axis")
        //     .attr("transform", "translate(0," + vis.height + ")")
        //     .transition()
        //     .duration(800)
        //     .call(d3.axisBottom(vis.x))
    }

}

function choose(choices) {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
}