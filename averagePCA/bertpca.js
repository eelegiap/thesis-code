function drawChart(result) {

    // $('#output0').empty();
    // $('#output1').empty();
    // $('#output2').empty();
    $("#graph").empty();
    $('#slider-step').empty();
    $('.timing').text(' ')
    $('#error').css('display', 'none')
    $('.hide').css('display', 'none')

    $('.hide').css('display', 'block')

    $('#title').text('Most similar word forms to ')

    // var pos = d3.select('#dropdown select').property("value")

    // $('#graph-title').text(`2-D Representation of ${pos} in corpus which experienced a/n ${iod}`)
    $('#graph-descript').text('Pan rectangle on graph to zoom in. Double-click to zoom out. Adjust slider to show and hide forms on graph.')
    $('#header1').css('display', 'block')
    $('#header2').css('display', 'block')


    $("#graph").empty();

    var startvectors = []
    var labels = []
    console.log('result length:', result.length)
    result.forEach(function (elt) {
        startvectors.push(elt.vector)
        labels.push(`${elt.word}`)
        // labels.push(`${elt.translatedword.toLowerCase()}`)
        // labels.push(`${elt.word} (${elt.translatedword.toLowerCase()})`)
    })

    console.log('calculating PCA...')
    var vectors = PCA.getEigenVectors(startvectors);
    var adData = PCA.computeAdjustedData(startvectors, vectors[0], vectors[1])
    var betterData = adData.formattedAdjustedData

    if (true) {
        // cosine sim
        var wordSet = new Set()
        var vecObj = new Object()
        result.forEach(function (elt) {
            var wordRoot = elt.word.split('_')[0]
            var BOA = elt.word.split('_')[1]
            if (vecObj[wordRoot] == undefined) {
                vecObj[wordRoot] = new Object()
            }
            vecObj[wordRoot][BOA] = elt.vector
            wordSet.add(wordRoot)
        })

        console.log('calculating cosim')
        var cosimList = []
        wordSet.forEach(function (w) {
            cosimList.push({ 'word': w, 'cosim': cosinesim(vecObj[w]['Before'], vecObj[w]['After']) })
        })
        var sortedCosim = cosimList.sort(function (a, b) { return a.cosim > b.cosim })
        console.log('sorted cosim list:', sortedCosim)
        d3.select('#output0').text(sortedCosim.slice(100,200).map(d => d.word).join(' '))
        d3.select('#output1').text(sortedCosim.slice(-200,-100).map(d => d.word).join(' '))
    }


    var data = []
    for (var i = 0; i < startvectors.length; i++) {
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
    width = 1200 - margin.left - margin.right, height = 600 - margin.top - margin.bottom;

    var tooltip = d3.select("#graph").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var x = d3.scaleLinear()
        .domain([xMin - .25, xMax + 1.5])
        .range([0, width])

    var y = d3.scaleLinear()
        .domain([yMin - .25, yMax + .25])
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
        .attr('id', function (d, i) { return result[i].word })
        .attr('class', function (d, i) { return result[i].pos })

    circle = node.append("circle")
        .attr("class", `dot`)
        .attr("r", 4)
        .attr("cx", function (d) { return x(d.x); })
        .attr("cy", function (d) { return y(d.y); })
        .attr("opacity", function (d, i) {
            return .5;
        })
        .attr('id', function (d, i) { "circle" + (i + 1) })
        .style("fill", function (d, i) {
            if (labels[i].includes('Before')) {
                return "red";
            } else {
                return 'blue'
            }

        });

    label = node
        .append('text')
        .attr("x", function (d) { return x(d.x) + 7; })
        .attr("y", function (d) { return y(d.y) + 7; })
        .attr('id', function (d, i) { "label" + (i + 1) })
        .attr('opacity', .75)
        .text(function (d, i) { return labels[i] })


    // var linedata = data.map(function(d) {
    //     return {'x1' : }
    // })
    var lines = false
    if (lines) {
        var lineObj = new Object()
        node.each(function (d) {
            var wordRoot = d3.select(this).attr('id').split('_')[0]
            var BOA = d3.select(this).attr('id').split('_')[1]
            if (lineObj[wordRoot] == undefined) {
                lineObj[wordRoot] = new Object()
                lineObj[wordRoot]['Before'] = new Object()
                lineObj[wordRoot]['After'] = new Object()
            }

            lineObj[wordRoot][BOA]['x'] = d.x
            lineObj[wordRoot][BOA]['y'] = d.y
        })

        var lineData = []
        Object.keys(lineObj).forEach(function (w) {
            lineData.push({
                'word': w,
                'data': lineObj[w]
            })
        })
        var lines = scatter.selectAll(".line")
            .data(lineData)
            .enter()
            .append("line")
            .attr("stroke", "blue")
            .attr("stroke-width", 2)

        lines
            .attr("x1", function (d) { return x(+d.data.Before.x) })
            .attr("x2", function (d) { return x(+d.data.After.x); })
            .attr("y1", function (d) { return y(+d.data.Before.y); })
            .attr("y2", function (d) { return y(+d.data.After.y); });
    }

    // .attr("marker-end", "url(#arrow)");

    // d3.selectAll('#dropdown').on('change', function () {
    //     var pos = d3.select('#dropdown select').property("value")
    //     node.each(function () {
    //         var thisDot = d3.select(this)
    //         if (pos == 'All POS') {
    //             thisDot.transition().attr('display', 'show')
    //         } else {
    //             console.log(thisDot.attr('class'))
    //             if (thisDot.classed(pos)) {
    //                 thisDot.transition().attr('display', 'show')
    //             } else {
    //                 thisDot.transition().attr('display', 'none')
    //             }
    //         }
    //     })
    // })

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

    scatter.append("g")
        .attr("class", "brush")
        .call(brush);

    function brushended() {
        var s = d3.event.selection;
        if (!s) {
            if (!idleTimeout) return idleTimeout = setTimeout(idled, idleDelay);
            x.domain([xMin - .25, xMax + 1.5])
            y.domain([yMin - .25, yMax + .25])
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
        if (lines) {
            lines.transition(t)
                .attr("x1", function (d) { return x(+d.data.Before.x) })
                .attr("x2", function (d) { return x(+d.data.After.x); })
                .attr("y1", function (d) { return y(+d.data.Before.y); })
                .attr("y2", function (d) { return y(+d.data.After.y); });
        }


        d3.selectAll('.axis').selectAll("text").remove();
    }
    function cosinesim(A, B) {
        var dotproduct = 0;
        var mA = 0;
        var mB = 0;
        for (i = 0; i < A.length; i++) {
            dotproduct += (A[i] * B[i]);
            mA += (A[i] * A[i]);
            mB += (B[i] * B[i]);
        }
        mA = Math.sqrt(mA);
        mB = Math.sqrt(mB);
        var similarity = (dotproduct) / ((mA) * (mB))
        return similarity;
    }
}

$(document).ready(function () {
    d3.json("../../files2big/before-after-average-BERT.json").then(function (result) {
        result = result.filter(d => d.word.includes('Before') || d.word.includes('After'))
        // result = result.filter(d => d.word.includes('After'))
        // var randomWords = new Set(getRandomSubarray(result.map(d => d.word.split('_')[0]), 100))
        // newresult = result.filter(d => randomWords.has(d.word.split('_')[0]))

        drawChart(result)

        // d3.csv("notableWords.csv", function (data) {
        //     var changedWords = data.different.trim().split(' ')
        //     var sameWords = data.same.trim().split(' ')
        //     result = result.filter(d => changedWords.includes(d.word.split('_')[0]))
        //     drawChart(result)
        // })
    })
    // function getRandomSubarray(arr, size) {
    //     var shuffled = arr.slice(0), i = arr.length, temp, index;
    //     while (i--) {
    //         index = Math.floor((i + 1) * Math.random());
    //         temp = shuffled[index];
    //         shuffled[index] = shuffled[i];
    //         shuffled[i] = temp;
    //     }
    //     return shuffled.slice(0, size);
    // }
});