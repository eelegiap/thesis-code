function draw(dataType) {

    d3.selectAll('svg').remove()
    d3.selectAll('.tableRemove').remove()


    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 30, bottom: 30, left: 50 },
        width = 1450 - margin.left - margin.right,
        height = 1000 - margin.top - margin.bottom;

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
    var path2data;
    if (dataType == 'lemmas') {
        path2data = 'mddata/shakenLogData10-16.json'
        d3.selectAll('.keywords').style('display','none')
    } else {
        path2data = 'mddata/shakenSynsetMeanDiff10-20.json'
        d3.selectAll('.keywords').style('display','block')
    }

    d3.json(path2data, function (data) {
        // var lowerThresh = -4.092195306328719
        // var upperThresh = -3.190916638805563
        var SD = 1.8
        var threshold = '5%'

        // length of lemma
        // data = data.filter(d => d.lemma.length > 1)
        // number of examples total
        data = data.filter(d => ((d.before + d.after) >= 10))
        // get rid of outliers
        // data = data.filter(d => d.s_y > SD || d.s_y < -1*SD)

        // Add X axis
        var minX = d3.min(data.map(d => d.s_x)); var maxX = d3.max(data.map(d => d.s_x))
        var minY = d3.min(data.map(d => d.s_y)); var maxY = d3.max(data.map(d => d.s_y))
        var x = d3.scaleLinear()
            .domain([0, maxX + 1])
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
            .text("Mean (of before and after)");

        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", 6)
            .attr("dy", "1em")
            .attr('dx', '-1em')
            .attr("transform", "rotate(-90)")
            .text("Difference (After - Before)");

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
        var inmiddle = []

        var radius = 3

        groups.append("circle")
            .attr("cx", function (d) { return x(d.s_x) })
            .attr("cy", function (d) { return y(d.s_y) })
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
                    inmiddle.push(d)
                    return 'black'
                }
            })

        morefreq = morefreq.sort(function (a, b) { return a.after < b.after })
        morefreq.unshift('N/A')
        var morerows = d3.select('#morefreq').selectAll("tr")
            .data(morefreq)
            .enter()
            .append("tr")
            .attr('class', 'tableRemove')
        morerows
            .append("td")
            .attr('class', 'table')
            .text(d => d.translatedLabel)
        morerows
            .append("td")
            .text(d => d.before)
            .style('color', 'tomato')
        morerows
            .append("td")
            .text(d => d.after)
            .style('color', 'green')
        if (dataType == 'synset') {
            morerows
                .append("td")
                .text(function (d) { return Object.keys(d.synsetTokens).join(', ') })
        }

        lessfreq = lessfreq.sort(function (a, b) { return a.before < b.before })
        lessfreq.unshift('N/A')
        var lessrows = d3.select('#lessfreq').selectAll("tr")
            .data(lessfreq)
            .enter()
            .append("tr");
        lessrows
            .append("td")
            .text(d => d.translatedLabel)
        lessrows
            .append("td")
            .text(d => d.before)
            .style('color', 'green')
        lessrows
            .append("td")
            .text(d => d.after)
            .style('color', 'tomato')
        if (dataType == 'synset') {
            lessrows
                .append("td")
                .text(function (d) { Object.keys(d.synsetTokens).join(', ') })
        }

        var labelFS = 13
        groups.append("text").text(d => d.translatedLabel)
            .attr('class', 'dotLabel')
            .attr("x", function (d) {
                return x(d.s_x)
            })
            .attr("y", function (d) {
                return y(d.s_y)
            })
            .attr('dx', '.5em')
            .style('opacity', .5)
            .style('font-size', `${labelFS}px`)

        groups.on("mouseover", function (d) {
            d3.select(this).select('circle').transition().attr('r', 7)
            d3.select(this).select('.dotLabel').transition(200).style('font-size', `15px`)
            d3.selectAll('.dotLabel').transition().style('opacity', .1)
            d3.select(this).select('.dotLabel').transition(250).style('opacity', 1)
        })
            .on("mouseout", function (d) {
                d3.select(this).select('circle').transition().attr('r', radius)
                d3.select(this).select('.dotLabel').transition(200).style('font-size', `${labelFS}px`)
                d3.select(this).select('.dotLabel').transition(250).style('opacity', .5)
                d3.selectAll('.dotLabel').transition().style('opacity', .5)
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
            .text(`upper ${threshold} threshold (based on randomized data)`)

        svg.append('text')
            .attr('x', width - 10)
            .attr('y', y(-SD) + 20)
            .style('fill', 'red')
            .attr('text-anchor', 'end')
            .text(`lower ${threshold} threshold (based on randomized data)`)

    })
}

$(document).ready(function () {

    var dataOptions = ['Synonym Sets','Individual Lemmas']

    d3.select("#selectData")
        .selectAll('myOptions')
        .data(dataOptions)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; })

    d3.select("#selectData").on("change", function (d) {
        var selected = d3.select(this).property("value")
        if (selected == 'Individual Lemmas') {
            draw('lemmas')
        } else {
            draw('synset')
        }
    })

    draw('synset')
});