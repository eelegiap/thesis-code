function draw(dataType) {

    d3.selectAll('svg').remove()

    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 30, bottom: 30, left: 50 },
        width = 1250 - margin.left - margin.right,
        height = 700 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#scatterplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    const utcParse = d3.utcParse("%m-%d-%Y");

    //Read the data
    d3.json(`../data/${dataType}/frequencydatabypoem.json`, function (data) {

        data = data.filter(d => d.lemma.length > 1)
        var SD;
        if (dataType == 'notPEN') {
            SD = 1.6252581880775219
        } else {
        SD = 2.0943217455517074
        }

        // Add X axis
        var minX = d3.min(data.map(d => d.s_x)); var maxX = d3.max(data.map(d => d.s_x))
        var minY = d3.min(data.map(d => d.s_y)); var maxY = d3.max(data.map(d => d.s_y))
        var x = d3.scaleLinear()
            .domain([minX - 1, maxX + 1])
            .range([0, width]);

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([minY - 1, maxY + 1])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        const xAxisGrid = d3.axisTop(x).tickSize(height).tickFormat('')
        const yAxisGrid = d3.axisRight(y).tickSize(width).tickFormat('')

        // Create grids.
        svg.append('g')
            .attr('class', 'grid')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxisGrid);

        svg.append('g')
            .attr('class', 'grid')
            .call(yAxisGrid);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));

        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height - 6)
            .attr('dx', '-1em')
            .text("Mean (of logs)");

        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", 6)
            .attr("dy", "1em")
            .attr('dx', '-1em')
            .attr("transform", "rotate(-90)")
            .text("Difference (2022 vs. 2014)");

        // Add dots
        var groups = svg
            .selectAll("dot")
            .data(data)
            .enter()
            .append('g')
            .attr('class', 'group')

        // find more and less significant words
        var morefreq = []
        var lessfreq = []
        var radius = 3
        groups.append("circle")
            .attr("cx", function (d) { return x(d.s_x); })
            .attr("cy", function (d) { return y(d.s_y); })
            .attr("r", radius)
            .style('opacity', .5)
            .style("fill", function (d) {
                if (d.s_y > SD) {
                    morefreq.push(d)
                    return '#90EE90'
                } else if (d.s_y < -SD) {
                    lessfreq.push(d)
                    return 'tomato'
                } else {
                    return 'black'
                }
            })

        morefreq = morefreq.sort(function (a, b) { return a.ct2022 < b.ct2022 })
        morefreq.unshift('N/A')
        var morerows = d3.select('#morefreq').selectAll("tr")
            .data(morefreq)
            .enter()
            .append("tr");
        morerows
            .append("td")
            .text(d => d.lemma)
        morerows
            .append("td")
            .text(d => d.ct2014)
            .style('color', 'tomato')
        morerows
            .append("td")
            .text(d => d.ct2022)
            .style('color', 'green')

        lessfreq = lessfreq.sort(function (a, b) { return a.ct2014 < b.ct2014 })
        lessfreq.unshift('N/A')
        var lessrows = d3.select('#lessfreq').selectAll("tr")
            .data(lessfreq)
            .enter()
            .append("tr");
        lessrows
            .append("td")
            .text(d => d.lemma)
        lessrows
            .append("td")
            .text(d => d.ct2014)
            .style('color', 'green')
        lessrows
            .append("td")
            .text(d => d.ct2022)
            .style('color', 'tomato')


        var labelFS = 13
        groups.append("text").text(d => d.lemma)
            .attr('class', 'dotLabel')
            .attr("x", function (d) {
                return x(d.s_x)
            })
            .attr("y", function (d) {
                return y(d.s_y)
            })
            .attr('dx', '.5em')
            .style('opacity', .75)
            .style('font-size', `${labelFS}px`)

        groups.on("mouseover", function (d) {
            d3.select(this).select('circle').transition().attr('r', 7)
            d3.select(this).select('.dotLabel').transition().style('font-size', `15px`)
        })
            .on("mouseout", function (d) {
                d3.select(this).select('circle').transition().attr('r', radius)
                d3.select(this).select('.dotLabel').transition().style('font-size', `${labelFS}px`)
            })

        // SD line
        svg.append('line')
            .style("stroke", "red")  // colour the line
            .style('stroke-width', 1.5)
            .attr('class', 'dashed')
            .attr("x1", 0)     // x position of the first end of the line
            .attr("y1", y(SD))      // y position of the first end of the line
            .attr("x2", width)     // x position of the second end of the line
            .attr("y2", y(SD))

        svg.append('line')
            .style("stroke", "red")
            .style('stroke-width', 1.5)
            .attr('class', 'dashed')
            .attr("x1", 0)
            .attr("y1", y(-SD))
            .attr("x2", width)
            .attr("y2", y(-SD));

        // SD labels
        svg.append('text')
            .attr('x', width - 10)
            .attr('y', y(SD) - 10)
            .style('fill', 'red')
            .attr('text-anchor', 'end')
            .text(`+ 1.96 SD`)

        svg.append('text')
            .attr('x', width - 10)
            .attr('y', y(-SD) + 20)
            .style('fill', 'red')
            .attr('text-anchor', 'end')
            .text(`- 1.96 SD`)

    })
}

$(document).ready(function () {
    console.log("ready!");
    draw('notPEN')
    $('#toggle').change(function () {
        console.log($(this).prop('checked'))
        if ($(this).prop('checked')) {
            draw('notPEN')
        } else {
            draw('PEN')
        }
    })
});