function draw_chart(data, i, recData) {
    d3.selectAll('.tooltip').remove()
    // Define the div for the tooltip
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


    var keywords = Object.keys(data).sort(function(a,b) { return data[a].length < data[b].length})
    var keyword = keywords[i]
    d3.select('#keyword').attr('class', 'keyword' + i).text(keyword)

    $('#chart').empty()

    // set the dimensions and margins of the graph
    const margin = { top: 10, right: 30, bottom: 30, left: 60 },
        width = 660 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    var data = data[keyword]

    // Add X axis
    const x = d3.scaleLinear()
        .domain([d3.min(data.map(d => d.x)), d3.max(data.map(d => d.x))])
        .range([0, width]);

    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

    // Add Y axis
    const y = d3.scaleLinear()
        .domain([d3.min(data.map(d => d.y)), d3.max(data.map(d => d.y))])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add dots
    var dots = svg.append('g')
        .selectAll("dot")
        .data(data)
        .join("circle")
        .attr("cx", function (d) { return x(d.x); })
        .attr("cy", function (d) { return y(d.y); })
        .attr("r", 5.5)
        .attr('stroke', 'darkgray')
        // .attr('stroke','#69b3a2')
        .style('fill', function (d) {
            var rec = recData.find(obj => {
                return obj['UniqueIndex'] === d.d.recID
            })
            var period = rec['Before or after']
            if (period == 'Before') {
                return 'limegreen'
            } return 'blueviolet'
        })
        .style('opacity',.5)
    // .style("fill", "lightgray")

    dots.on('mouseover', function (d) {
        // console.log(d.target.__data__.d.text)
        tooltip.transition()
            .duration(200)
            .style("opacity", .9);
        tooltip.html(`${d.target.__data__.d.text}`)
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");
    }).on('mouseout', function () {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
    }).on('click', function(d) {
        var copyText = `${d.target.__data__.d.text}`
        copyToClipboard(copyText)
        console.log(copyText)
    })
    // })

    function copyToClipboard(textToCopy) {
        // navigator clipboard api needs a secure context (https)
        if (navigator.clipboard && window.isSecureContext) {
            // navigator clipboard api method'
            return navigator.clipboard.writeText(textToCopy);
        } else {
            // text area method
            let textArea = document.createElement("textarea");
            textArea.value = textToCopy;
            // make the textarea out of viewport
            textArea.style.position = "fixed";
            textArea.style.left = "-999999px";
            textArea.style.top = "-999999px";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            return new Promise((res, rej) => {
                // here the magic happens
                document.execCommand('copy') ? res() : rej();
                textArea.remove();
            });
        }
    }
    
}
function draw_batch(i) {
    
    // keywordData2-9_PCA2TSNE_avg-False_TSNEonly-False_${i}.json
    d3.json(`embedData/onlyTSNEperplexity5/keywordData2-9_TSNE_avg-False_TSNEonly-True_${i}.json`).then(function (data) {
        d3.json('Full_Poem_Dataset_2-3.json').then(function (recData) {
            // var i = Object.keys(data).indexOf('рука')
            var i = 0
            draw_chart(data, i, recData)
            d3.select('#prevbutton').on('click', function () {
                var curridx = +d3.select('#keyword').attr('class').replaceAll('keyword', '')
                if (curridx == 0) {
                    curridx = Object.keys(data).length
                }
                draw_chart(data, curridx - 1, recData)
            })
            d3.select('#nextbutton').on('click', function () {
                var curridx = +d3.select('#keyword').attr('class').replaceAll('keyword', '')
                if (curridx == Object.keys(data).length - 1) {
                    curridx = -1
                }
                draw_chart(data, curridx + 1, recData)
            })
        })
    })
}

$(document).ready(function () {
    console.log('ready to go')
    var batches = [0,1,2,3,4,5,6,7,8,9,10,11,12]
    // var batches = [0,1,2]
    
    var dropdown = d3.select("#dropdown")
        .append('select')

    // add the options to the button
    dropdown // Add a button
        .selectAll('options')
        .data(batches)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d }) // corresponding value returned by the button
    dropdown.property('value', 0);

    dropdown.on('change', function() {
        var b_i = d3.select(this).property("value")
        console.log(b_i)
        draw_batch(b_i)
    })
    

    draw_batch(0)
})