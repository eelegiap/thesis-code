function drawChart(result, iod) {

    $('#output0').empty();
    $('#output1').empty();
    $('#output2').empty();
    $("#graph").empty();
    $('#slider-step').empty();
    $('.timing').text(' ')
    $('#error').css('display', 'none')
    $('.hide').css('display', 'none')

    $('.hide').css('display', 'block')

    $('#title').text('Most similar word forms to ')

    var pos = d3.select('#dropdown select').property("value")

    $('#graph-title').text(`2-D Representation of ${pos} in corpus which experienced a/n ${iod}`)
    $('#graph-descript').text('Pan rectangle on graph to zoom in. Double-click to zoom out. Adjust slider to show and hide forms on graph.')
    $('#header1').css('display', 'block')
    $('#header2').css('display', 'block')


    $("#graph").empty();

    var startvectorsbert = []
    var startvectorsnavec = []
    var labels = []
    var result = result[iod]
    result.forEach(function (elt) {
        startvectorsbert.push(elt.bertvector)
        startvectorsnavec.push(elt.navecvector)
        // labels.push(`${elt.word}`)
        // labels.push(`${elt.translatedword.toLowerCase()}`)
        // labels.push(`${elt.word} (${elt.translatedword.toLowerCase()})`)
         labels.push(`${elt.translatedword.toLowerCase()} (${elt.word})`)
    })

    // var vectors = PCA.getEigenVectors(startvectorsbert);
    // var adData = PCA.computeAdjustedData(startvectorsbert, vectors[0], vectors[1])
    // var betterDatabert = adData.formattedAdjustedData

    var vectors = PCA.getEigenVectors(startvectorsnavec);
    var adData = PCA.computeAdjustedData(startvectorsnavec, vectors[0], vectors[1])
    var betterDatanavec = adData.formattedAdjustedData

    // function runTSNE(dists) {
    //     var opt = {}
    //     opt.epsilon = 10; // epsilon is learning rate (10 = default)
    //     opt.perplexity = 30; // roughly how many neighbors each point influences (30 = default)
    //     opt.dim = 2; // dimensionality of the embedding (2 = default)

    //     var tsne = new tsnejs.tSNE(opt); // create a tSNE instance

    //     // initialize data. Here we have 3 points and some example pairwise dissimilarities

    //     tsne.initDataDist(dists);
    //     console.log('initialized TSNE')
    //     for (var k = 0; k < 500; k++) {
    //         tsne.step(); // every time you call this, solution gets better
    //     }

    //     var Y = tsne.getSolution(); // Y is an array of 2-D points that you can plot

    //     return Y
    // }
    // var betterDatabert = runTSNE(startvectorsbert)
    // var betterDatanavec = runTSNE(startvectorsnavec)
    // console.log(betterDatabert)
    // console.log(betterDatanavec)

    var betterData = [[], []]
    for (let i = 0; i < result.length; i++) {
        // betterData[0].push((betterDatabert[i][0] + 0 * betterDatanavec[i][0]) / 1)
        // betterData[1].push((betterDatabert[i][1] + 0 * betterDatanavec[i][1]) / 1)
        betterData[0].push((betterDatanavec[0][i]))
        betterData[1].push((betterDatanavec[1][i]))
    }

    var data = []
    for (var i = 0; i < result.length; i++) {
        if (betterData[0][i] === undefined) {
            break;
        }
        data.push({
            'x': betterData[0][i],
            'y': betterData[1][i],
        })
    }
    console.log('length', data.length)
    // max and min for graph
    var xvals = data.map(function (pair) { return pair.x })
    var yvals = data.map(function (pair) { return pair.y })

    var xMax = xvals.reduce(function (a, b) { return Math.max(a, b); });
    var xMin = xvals.reduce(function (a, b) { return Math.min(a, b); });
    var yMax = yvals.reduce(function (a, b) { return Math.max(a, b); });
    var yMin = yvals.reduce(function (a, b) { return Math.min(a, b); });

    var margin = { top: 20, right: 10, bottom: 30, left: 30 };
    width = $(window).width() - margin.left - margin.right, height = $(window).height() - margin.top - margin.bottom;

    var tooltip = d3.select("#graph").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var x = d3.scaleLinear()
        .domain([xMin - .15, xMax + 1.5])
        .range([0, width])

    var y = d3.scaleLinear()
        .domain([yMin - .15, yMax + .5])
        .range([height, 0]);

    var xAxis = d3.axisBottom(x).ticks(12),
        yAxis = d3.axisLeft(y).ticks(12 * height / width);

    var brush = d3.brush().extent([[0, 0], [width, height]]).on("end", brushended),
        idleTimeout,
        idleDelay = 350;

    var svg = d3.select("#graph").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var clip = svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0);

    var scatter = svg.append("g")
        .attr("id", "scatterplot")
        .attr("clip-path", "url(#clip)");

    var node = scatter.selectAll(".dot")
        .data(data)
        .enter()
        .append('g')
        .attr('class', function (d, i) { return result[i].pos })

    circle = node.append("circle")
        .attr("class", `dot`)
        .attr("r", 4)
        .attr("cx", function (d) { return x(d.x); })
        .attr("cy", function (d) { return y(d.y); })
        .attr("opacity", function (d, i) {
            return .8;
        })
        .attr('id', function (d, i) { "circle" + (i + 1) })
        .style("fill", function (d, i) {
            if (iod == 'increase') {
                return "#50C878";
            } else {
                return 'tomato'
            }
            
        });

    label = node
        .append('text')
        .attr("x", function (d) { return x(d.x) + 7; })
        .attr("y", function (d) { return y(d.y) + 7; })
        .attr('id', function (d, i) { "label" + (i + 1) })
        .attr('opacity', .75)
        .text(function (d, i) { return labels[i] })

    d3.selectAll('#dropdown').on('change', function () {
        var pos = d3.select('#dropdown select').property("value")
        node.each(function () {
            var thisDot = d3.select(this)
            if (pos == 'All POS') {
                thisDot.transition().attr('display', 'show')
            } else {
                console.log(thisDot.attr('class'))
                if (thisDot.classed(pos)) {
                    thisDot.transition().attr('display', 'show')
                } else {
                    thisDot.transition().attr('display', 'none')
                }
            }
        })
    })

    // x axis
    svg.append("g")
        .attr("class", "x axis")
        .attr('id', "axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("text")
        .style("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - 8)
    // .text("X Label");

    // y axis
    svg.append("g")
        .attr("class", "y axis")
        .attr('id', "axis--y")
        .call(yAxis);

    d3.selectAll('.axis').selectAll("text").remove();

    // svg.append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("y", 6)
    //     .attr("dy", "1em")
    //     .style("text-anchor", "end")
    // .text("Y Label");

    scatter.append("g")
        .attr("class", "brush")
        .call(brush);

    function brushended() {
        var s = d3.event.selection;
        if (!s) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
            x.domain([xMin - .15, xMax + 1.5])
            y.domain([yMin - .15, yMax + .5])
        } else {

            x.domain([s[0][0], s[1][0]].map(x.invert, x));
            y.domain([s[1][1], s[0][1]].map(y.invert, y));
            scatter.select(".brush").call(brush.move, null);
        }
        d3.selectAll('.axis').selectAll("text").remove();
        zoom();
    }

    function idled() {
        idleTimeout = null;
    }

    function zoom() {
        var t = scatter.transition().duration(750);
        svg.select("#axis--x").transition(t).call(xAxis);
        svg.select("#axis--y").transition(t).call(yAxis);
        scatter.selectAll("circle").transition(t)
            .attr("cx", function (d) { return x(d.x); })
            .attr("cy", function (d) { return y(d.y); });
        label.transition(t)
            .attr("x", function (d) { return x(d.x) + 7; })
            .attr("y", function (d) { return y(d.y) + 7; })
        d3.selectAll('.axis').selectAll("text").remove();
    }

}


$(document).ready(function () {
    d3.json("sigMeanDiffVecsTranslated4.json").then(function (result) {
        var data = { 'increase': [], 'decrease': [] }
        // make into one JSON

        Object.keys(result).forEach(function (iod) {
            Object.keys(result[iod]).forEach(function (pos) {
                result[iod][pos].forEach(function (d) {
                    d['pos'] = pos;
                    data[iod].push(d)
                })
            })
        })

        var ioddropdown = d3.select("#ioddropdown")
            .attr('class', 'dropdown')
            .append('select')
        ioddropdown // Add a button
            .selectAll('options')
            .data(['increase', 'decrease'])
            .enter()
            .append('option')
            .text(function (d) { return d; }) // text showed in the menu
            .attr("value", function (d) { return d }) // corresponding value returned by the button
        ioddropdown.property('value', 'increase');

        var partsOfSpeech = ['All POS', 'ADJ',
            'ADP',
            'ADV',
            'AUX',
            'CCONJ',
            'DET',
            'NOUN',
            'NUM',
            'PART',
            'PRON',
            'PROPN',
            'SCONJ',
            'VERB']

        var dropdown = d3.select("#dropdown")
            .attr('class', 'dropdown')
            .append('select')
        // add the options to the button
        dropdown // Add a button
            .selectAll('options')
            .data(partsOfSpeech)
            .enter()
            .append('option')
            .text(function (d) { return d; }) // text showed in the menu
            .attr("value", function (d) { return d }) // corresponding value returned by the button
        dropdown.property('value', 'All POS');

        d3.selectAll('#ioddropdown').on('change', function () {
            var iod = d3.select('#ioddropdown select').property("value")
            $("#graph").empty();
            drawChart(data, iod)
        })

        drawChart(data, 'increase')
    })

});