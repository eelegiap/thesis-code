var margin = { top: 10, right: 30, bottom: 40, left: 50 },
width = $('#scatterdiv').width() - margin.left - margin.right,
height = 700 - margin.top - margin.bottom;

const colors = ['limegreen', 'BlueViolet']

function fill(n) {
    return colors[n]
}

var models = [
    'distiluse-base-multilingual-cased-v1',
    'paraphrase-multilingual-MiniLM-L12-v2',
    'all-distilroberta-v1',
    'all-MiniLM-L6-v2',
    'paraphrase-multilingual-mpnet-base-v2',
    'multi-qa-MiniLM-L6-cos-v1',
    'msmarco-MiniLM-L6-cos-v5',
]
var sources =         ['No War Poetry',
'metajournal',
'ROAR',
'Facebook',
    'Personal Telegram']

    // Usually you have a color scale in your chart already
var colorSource = d3.scaleOrdinal()
.domain(sources)
.range(d3.schemeCategory10);

// coloring button
d3.select("#modelSelect")
    .selectAll('myOptions')
    .data(models)
    .enter()
    .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button

var coloringOptions = ['Pre vs. Post', 'Source']
d3.select("#colorSelect")
    .selectAll('myOptions')
    .data(coloringOptions)
    .enter()
    .append('option')
    .text(function (d) { return d; }) // text showed in the menu
    .attr("value", function (d) { return d; }) // corresponding value returned by the button


var selectedModel = 'paraphrase-multilingual-MiniLM-L12-v2'
d3.select('#modelSelect').property('value', selectedModel);

drawScatter(selectedModel)

d3.select("#modelSelect").on("change", function (d) {
    var selectedModel = d3.select(this).property("value")
    drawScatter(selectedModel)
})


d3.select("#colorSelect").on("change", function (d) {
    var selectedOption = d3.select(this).property("value")
    if (selectedOption == 'Pre vs. Post') {
        d3.selectAll('.legend').remove()
        d3.select('svg').append("circle").attr('class', 'before legend').attr("cx", width - 100).attr("cy", 30).attr("r", 6).style("fill", colors[0])
        d3.select('svg').append("circle").attr('class', 'after legend').attr("cx", width - 100).attr("cy", 60).attr("r", 6).style("fill", colors[1])
        d3.select('svg').append("text").attr('class', 'before legend').attr("x", width - 80).attr("y", 33).text("Pre-invasion").style("font-size", "15px").style('fill',colors[0])
        d3.select('svg').append("text").attr('class', 'after legend').attr("x", width - 80).attr("y", 63).text("Post-invasion").style("font-size", "15px").style('fill',colors[1])

        d3.selectAll('.dot').transition().style("fill", d => fill(d.label))
    }
    if (selectedOption == 'Source') {
        console.log('source')

        d3.selectAll('.legend').remove()
        // Add one dot in the legend for each name.
        d3.select('svg').selectAll("legenddots")
            .data(sources)
            .enter()
            .append("circle")
            .attr('class','legend')
            .attr("cx", width - 100)
            .attr("cy", function (d, i) { return 30 + i * 30 }) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("r", 6)
            .style("fill", function (d) { return colorSource(d) })

        // Add one dot in the legend for each name.
        d3.select('svg').selectAll("legendlabels")
            .data(sources)
            .enter()
            .append("text")
            .attr('class','legend')
            .attr("x", width - 80)
            .attr("y", function (d, i) { return 30 + i * 30 }) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function (d) { return colorSource(d) })
            .text(function (d) { return d })
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle")

        d3.selectAll('.dot').transition().style('fill', d => colorSource(d.info.Source))
    }
})

function drawScatter(selectedModel) {

    console.log(selectedModel)
    d3.select('#colorSelect').property('value', 'Pre vs. Post');

    $('#scatter').empty()

    // append the svg object to the body of the page
    var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")")

    //Read the data
    d3.json(`cleanermodels/${selectedModel}_9-24_800_each_v2.json`, function (data) {
    // d3.json(`models/${selectedModel}_9-24_800_each.json`, function (data) {
        // console.log(jsonData)
        // var model = 'paraphrase-multilingual-MiniLM-L12-v2'
        // var data = jsonData[model]
        d3.select('#model').html('distiluse-base-multilingual-cased-v1')

        // Add X axis
        var x = d3.scaleLinear()
            .domain([d3.min(data.map(d => d.ux)) - .5, d3.max(data.map(d => d.ux)) + .5])
            .range([0, width])
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSize(-height * 1.3).ticks(10))
            .select(".domain").remove()

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([d3.min(data.map(d => d.uy)) - .5, d3.max(data.map(d => d.uy)) + .5])
            .range([height, 0])
            .nice()
        svg.append("g")
            .call(d3.axisLeft(y).tickSize(-width * 1.3).ticks(7))
            .select(".domain").remove()

        // Customization
        svg.selectAll(".tick line").attr("stroke", "#EBEBEB")

        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", height + margin.top + 20)
            .text("x");

        // Y axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20)
            .attr("x", -margin.top)
            .text("y")

        // Add dots
        var dots = svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr('class', function (d) {
                return ['before dot', 'after dot'][d.label]
            })
            .attr("cx", function (d) { return x(d.ux); })
            .attr("cy", function (d) { return y(d.uy); })
            .attr("r", 5)
            .style("fill", d => fill(d.label))
            .style('opacity', .4)

        dots.on('mouseover', function () {
            d3.select(this).transition(300).attr('r', 9)
            d3.select(this).transition(350).style('stroke', 'black')
        }).on('click', function (d) {
            d3.select('#author').text(d.info.Author)
            d3.select('#boa').text(`(${d.info['Before or after']} invasion)`)
            d3.select('#text').html(d.info.Text.replaceAll('\n', '<br>'))
        }).on('mouseout', function () {
            d3.select(this).transition(300).attr('r', 5)
            d3.select(this).transition(350).style('stroke', 'white')
        })

        svg.append("circle").attr('class', 'before legend').attr("cx", width - 100).attr("cy", 30).attr("r", 6).style("fill", colors[0])
        svg.append("circle").attr('class', 'after legend').attr("cx", width - 100).attr("cy", 60).attr("r", 6).style("fill", colors[1])
        svg.append("text").attr('class', 'before legend').attr("x", width - 80).attr("y", 33).text("Pre-invasion").style("font-size", "15px").style('fill',colors[0])
        svg.append("text").attr('class', 'after legend').attr("x", width - 80).attr("y", 63).text("Post-invasion").style("font-size", "15px").style('fill',colors[1])

        d3.selectAll('.before').on('mouseover', function () {
            d3.selectAll('.before').transition().style('opacity', .8)
            d3.selectAll('.after').transition().style('opacity', .05)
        }).on('mouseout', function () {
            d3.selectAll('.before').transition().style('opacity', .4)
            d3.selectAll('.after').transition().style('opacity', .4)
        })
        d3.selectAll('.after').on('mouseover', function () {
            d3.selectAll('.after').transition().style('opacity', .8)
            d3.selectAll('.before').transition().style('opacity', .05)
        }).on('mouseout', function () {
            d3.selectAll('.after').transition().style('opacity', .4)
            d3.selectAll('.before').transition().style('opacity', .4)
        })

    })
}