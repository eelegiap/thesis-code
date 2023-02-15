function draw(dataType) {

    d3.selectAll('svg').remove()
    d3.selectAll('.tableRemove').remove()


    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 30, bottom: 30, left: 50 },
        width = 1200 - margin.left - margin.right,
        height = 750 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#scatterplot")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    // const utcParse = d3.utcParse("%m-%d-%Y");

    //Read the data
    var path2data;
    if (dataType == 'lemmas') {
        path2data = 'frequencyData2-3_1.json'
        d3.selectAll('.keywords').style('display', 'none')
    } else {
        path2data = 'mddata/shakenSynsetMeanDiff1-9.json'
        d3.selectAll('.keywords').style('display', 'block')
    }

    d3.json(path2data, function (data) {
        if (dataType == 'synsets') {
            data.map(d => d.keyword = d.label)
        }
        // numerical filters
        data = data.filter(d => !(d.info.Before * d.info.After == 0))
        data = data.filter(d => d.info.stats.pvalue < .05)
        // keyword filters
        data = data.filter(d => /[а-яА-ЯЁё]/.test(d.keyword) && !d.keyword.includes('_'))
        var irrelevantWords = ['авторский', 'блог', 'личный', 'источник','автор']
        data = data.filter(d => !irrelevantWords.includes(d.keyword))
        data.map(function (d) {
            d.s_x = (Math.log(d.info.Before) + Math.log(d.info.After)) / 2
            d.s_y = Math.log(d.info.After) - Math.log(d.info.Before)

            d.info.timesDifference = Math.round(d.info.After/d.info.Before * 100) / 100 
        })
        console.log('length of data:',data.length)

        // Add X axis
        var minX = d3.min(data.map(d => d.s_x)); var maxX = d3.max(data.map(d => d.s_x))
        var minY = d3.min(data.map(d => d.s_y)); var maxY = d3.max(data.map(d => d.s_y))
        var x = d3.scaleLinear()
            .domain([minX - .1, maxX + .1])
            .range([0, width]);

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([minY - .1, maxY + .1])
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
        var radius = 3
        groups.append("circle")
            .attr("cx", function (d) { return x(d.s_x) })
            .attr("cy", function (d) { return y(d.s_y) })
            .attr("r", radius)
            .style('opacity', .5)
            .style("fill", function (d) {
                if (d.info.stats.pvalue < .05) {
                    if (Math.sign(d.info.After - d.info.Before) == 1) {
                        morefreq.push(d)
                        return '#90EE90'
                    } else {
                        lessfreq.push(d)
                        return 'tomato'
                    }
                }
            })

        var labelFS = 13
        groups.append("text").text(d => d.keyword)
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

        //  percentage formatting
        const pct = d3.format(".2%")
        // morefreq = morefreq.sort(function (a, b) { return a.info.stats.pvalue > b.info.stats.pvalue })
        // lessfreq = lessfreq.sort(function (a, b) { return a.info.stats.pvalue > b.info.stats.pvalue })
        morefreq = morefreq.sort(function (a, b) { return (b.info.timesDifference > a.info.timesDifference) })
        lessfreq = lessfreq.sort(function (a, b) { return (b.info.timesDifference < a.info.timesDifference) })
        // morefreq = morefreq.sort(function (a, b) { return (a.info.After/a.info.Beforе) < (b.info.After/b.info.Before) })
        // lessfreq = lessfreq.sort(function (a, b) { return a.info.Before - a.info.After < b.info.Before - b.info.After })

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

        tabulate('morefreq', morefreq, ['keyword', 'Before', 'After', 'timesDifference'])
        tabulate('lessfreq', lessfreq, ['keyword', 'Before', 'After', 'timesDifference'])

        function tabulate(id, data, columns) {
            var table = d3.select(`#${id}`).append('table')
            var thead = table.append('thead')
            var tbody = table.append('tbody');

            // append the header row
            thead.append('tr')
                .selectAll('th')
                .data(columns).enter()
                .append('th')
                .text(function (column) { return column; });

            // create a row for each object in the data
            var rows = tbody.selectAll('tr')
                .data(data)
                .enter()
                .append('tr');

            // create a cell in each row for each column
            var cells = rows.selectAll('td')
                .data(function (row) {
                    return columns.map(function (column) {
                        if (column == 'keyword') {
                            return { column: column, value: row[column] };
                        } else if (['Before', 'After'].includes(column)) {
                            return { column: column, value: pct(row.info[column]) };
                        } else {
                            return { column: column, value: row.info[column] };
                        }
                    });
                })
                .enter()
                .append('td')
                .text(function (d) { return d.value; });

            return table;
        }
    })
}

$(document).ready(function () {

    var dataOptions = ['Individual Lemmas', 'Synonym Sets',]

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
            draw('synsets')
        }
    })

    draw('lemmas')
});