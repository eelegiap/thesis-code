function draw_chart(data, i, recData) {
    d3.selectAll('.tooltip').remove()
    // Define the div for the tooltip
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


    var keywords = Object.keys(data)
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
                return 'blueviolet'
            } return 'limegreen'
        })
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
    });
    // })
}


$(document).ready(function () {
    d3.json('perplexity50/keywordData2-2_batch_p_6.json').then(function (data) {
        d3.json('Full_Poem_Dataset_2-3.json').then(function (recData) {
            // var i = Object.keys(data).indexOf('рука')
            var i = 0
            draw_chart(data, i, recData)
            d3.select('#prevbutton').on('click', function () {
                var curridx = +d3.select('#keyword').attr('class').replaceAll('keyword', '')
                draw_chart(data, curridx - 1, recData)
            })
            d3.select('#nextbutton').on('click', function () {
                var curridx = +d3.select('#keyword').attr('class').replaceAll('keyword', '')
                draw_chart(data, curridx + 1, recData)
            })
        })
    })
})