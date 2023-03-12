var margin = { top: 80, right: 80, bottom: 10, left: 100 },
  width = 800,
  height = 800;

// Define the div for the tooltip
var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip toRemove")
  .style("opacity", 0);

var x = d3.scaleBand().range([0, width]),
  z = d3.scaleLinear().domain([0, 4]).clamp(true),
  c = d3.scaleOrdinal(d3.schemeCategory10);

var svg = d3.select("#matrix")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .style("margin-left", margin.left + "px")
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
d3.json("../averageTSNE/categories.json").then(function (cats) {
  d3.json("../../allLinkData3-3_3.json").then(function (jsondata) {
    // d3.json(`../../${dataType}-label2lines_2-21.json`, function (label2lines) {

    var goodIndices = []
    var newNodes = []
    var old2new = new Object()

    // var keyword = 'язык'
    // var keywordID = jsondata.nodes.map(d => d.id).indexOf(keyword)

    // var keywords = 'Винница, Буча, Ирпень, Киев, Москва, Мариуполь, Одесса, Крым, Луганск, Донецк, Днепр, Запорожье, Львов, Харьков, Херсон, Симферополь, Петербург, чернигов, Черновцы, житомир, Полтава, Николаев, Гостомель, Краматорск'.split(', ').map(d => d.toLowerCase())
    // var keywords = 'блядь нахуй хуйня хуй ёбаный мат'.split(' ')
    // var keywords = ['язык']
    // var keywords = ['чехов','булгаков','пушкин','толстой','достоевский']
    // var keywords = ['навальный','путин','будущее','прошлое']
    // var keywords = cats["homeland"].concat(cats['history and memory']).concat(cats['languages, nationalities, ethnicities']).concat(cats['borders and boundaries']).concat(cats['body and the human condition'])
    // var keywords = ['совесть','виноватый','грустный', 'вина','надежда','счастливый','счастье','родный','безумный','сложный']
    // keywords = keywords.concat(cats['body and the human condition']).concat(cats['war and violence']).concat(cats['history and memory'])
    // var keywords = ['язык','русский','земля','страна','петь','песня','голос','лицо','глаза','рот','губа']
    // var keywords = ['совесть','стыд','зло','страх','боль','мир','смерть','язык','надежда',
    // 'честь','ложь','предмет','память','воспонимание','шум','опыт','письмо','природа','тишина','свет','новость','лента']
    // var keywords = ['ненависть','ненавидеть','любить','любовь','зло','добро','жизнь','смерть'] for big feelings
    var keywords = ['ненависть','ненавидеть','любить','любовь','зло','добро','жизнь','смерть','тьма','свет','живой','смертный']
    var keywordIDs = []
    jsondata.nodes.forEach(function (d, i) {
      if (keywords.includes(d.id)) {
        return keywordIDs.push(i)
      }
    })


    var posDict = new Object()
    jsondata.nodes.map(function (d, i) { posDict[i] = d.pos })

    var thresh = 4
    // var acceptablePOS = ['NOUN','ADJ','VERB']
    var acceptablePOS = ['NOUN', 'ADP', 'PROPN', 'ADJ', 'DET', 'SCONJ', 'VERB', 'ADV', 'PRON', 'CCONJ', 'PART', 'AUX', 'NUM', 'INTJ']
    // var acceptablePOS = ['NOUN',]
    // find those nodes connected to links which have the keyword and have links greater than some amount
    jsondata.links.forEach(function (d) {
      // if (keywordIDs.includes(d.source) || keywordIDs.includes(d.target)) {
        if (keywordIDs.includes(d.source) && keywordIDs.includes(d.target)) {
        // if (true) {
        if (acceptablePOS.includes(posDict[d.source]) && acceptablePOS.includes(posDict[d.target])) {
          if (d.linkCtBefore > thresh || d.linkCtAfter > thresh) {
            goodIndices.push(d.source)
            goodIndices.push(d.target)
          }
        }
      }
    })

    var ctr = 0
    jsondata.nodes.forEach(function (d, i) {
      // if (['русский', 'российский', 'родина', 'страна', 'язык', 'родный', 'рот', 'слово', 'петь', 'говорить', 'сказать', 'знать'].includes(d.id)) {
      // SOMETHING?
      if (goodIndices.includes(i)) {
        // goodIndices.push(i)

        old2new[i] = ctr
        newNodes.push(d)
        ctr += 1
      }
    })

    var matrix = [],
      nodes = newNodes,
      n = nodes.length;

    // Compute index per node.
    nodes.forEach(function (node, i) {
      node.index = i;
      node.count = 0;
      node.name = node.id
      matrix[i] = d3.range(n).map(function (j) { return { x: j, y: i, z: 0 }; });
    });

    // Convert links to matrix; count character occurrences.
    var dataLinks = jsondata.links.filter(d => goodIndices.includes(d.source) && goodIndices.includes(d.target))
    var values = []
    dataLinks.map(function (d) {
      // reassign numbers
      d.source = old2new[d.source]
      d.target = old2new[d.target]
      if (d.linkCtBefore > d.linkCtAfter) {
        d.value = ((d.linkCtBefore + 1) - (d.linkCtAfter + 1)) / (d.linkCtAfter + 1)
        d.which = 'Before'
      } else {
        d.value = ((d.linkCtAfter + 1) - (d.linkCtBefore + 1)) / (d.linkCtBefore + 1)
        d.which = 'After'
      }

      values.push(d.value)
    })

    console.log(quantile(values, .05), quantile(values, .95))

    dataLinks.forEach(function (link, i) {
      matrix[link.source][link.target].z = link.value;
      matrix[link.target][link.source].z = link.value;
      matrix[link.source][link.source].z = 0;
      matrix[link.target][link.target].z = 0;
      matrix[link.target][link.source]['index'] = i
      matrix[link.source][link.target]['index'] = i
      matrix[link.target][link.source]['which'] = link.which
      matrix[link.source][link.target]['which'] = link.which
      nodes[link.source].count += link.value;
      nodes[link.target].count += link.value;
    });

    // Precompute the orders.
    var orders = {
      name: d3.range(n).sort(function (a, b) { return d3.ascending(nodes[a].name, nodes[b].name); }),
      count: d3.range(n).sort(function (a, b) { return nodes[b].count - nodes[a].count; }),
      // group: d3.range(n).sort(function (a, b) { return nodes[b].group - nodes[a].group; })
    };

    // The default sort order.
    x.domain(orders.count);

    svg.append("rect")
      .attr("class", "background")
      .attr("width", width)
      .attr("height", height);

    var row = svg.selectAll(".row")
      .data(matrix)
      .enter().append("g")
      .attr("class", "row")
      .attr("transform", function (d, i) { return "translate(0," + x(i) + ")"; })
      .each(row);

    row.append("line")
      .attr("x2", width);

    row.append("text")
      .attr("x", -6)
      .attr("y", x.bandwidth() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "end")
      .text(function (d, i) { return nodes[i].name; });

    var column = svg.selectAll(".column")
      .data(matrix)
      .enter().append("g")
      .attr("class", "column")
      .attr("transform", function (d, i) { return "translate(" + x(i) + ")rotate(-90)"; });

    column.append("line")
      .attr("x1", -width);

    column.append("text")
      .attr("x", 6)
      .attr("y", x.bandwidth() / 2)
      .attr("dy", ".32em")
      .attr("text-anchor", "start")
      .text(function (d, i) { return nodes[i].name; });

    function row(row) {
      var cell = d3.select(this).selectAll(".cell")
        .data(row.filter(function (d) { return d.z; }))
        .enter().append("rect")
        .attr("class", "cell")
        .attr("x", function (d) { return x(d.x); })
        .attr("width", x.bandwidth())
        .attr("height", x.bandwidth())
        .style("fill-opacity", function (d) { return z(Math.abs(d.z)) })
        .style("fill", function (d) {
          // if (nodes[d.x].group == nodes[d.y].group) {
          if (d.which == 'Before') {
            return 'tomato'
          } else {
            return '#00A36C'
          }
        })
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on('click', d => click(d))
    }

    function mouseover(p) {
      d3.selectAll(".row text").classed("active", function (d, i) { return i == p.y; });
      d3.selectAll(".column text").classed("active", function (d, i) { return i == p.x; });
      d3.select(this).transition(100).style('fill', '#3599dd').on("end", revertColor);
      function revertColor() {
        d3.select(this).transition(800).style("fill", function (d) {
          // if (nodes[d.x].group == nodes[d.y].group) {
          if (d.which == 'Before') {
            return 'tomato'
          } else {
            return '#00A36C'
          }
        })
      }
      // tooltip
      var d = dataLinks[p.index]
      var allAuthors = Array.from(new Set(d.authors.Before.concat(d.authors.After)))
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(`Link: <b>${d.sourceLemma} and ${d.targetLemma}</b><br>
                  Co-occurrences Before: <b>${d.linkCtBefore}</b><br>
                  Co-occurrences After: <b>${d.linkCtAfter}</b><br>
                  AuthorCt (${allAuthors.length}): <b>${allAuthors.join(', ')}</b>`)
        .style("left", (d3.event.pageX + 20) + "px")
        .style("top", (d3.event.pageY - 28) + "px");

    }

    function mouseout() {
      d3.selectAll("text").classed("active", false);
      // tooltip
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    }
    function click(datum) {
      var d = dataLinks[datum.index]
      console.log(d)
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
    }

    d3.select("#order").on("change", function () {
      // clearTimeout(timeout);
      order(this.value);
    });

    function order(value) {
      x.domain(orders[value]);

      var t = svg.transition().duration(2500);

      t.selectAll(".row")
        .delay(function (d, i) { return x(i) * 4; })
        .attr("transform", function (d, i) { return "translate(0," + x(i) + ")"; })
        .selectAll(".cell")
        .delay(function (d) { return x(d.x) * 4; })
        .attr("x", function (d) { return x(d.x); });

      t.selectAll(".column")
        .delay(function (d, i) { return x(i) * 4; })
        .attr("transform", function (d, i) { return "translate(" + x(i) + ")rotate(-90)"; });
    }

    // var timeout = setTimeout(function () {
    //   order("name");
    //   d3.select("#order").property("selectedIndex", 2).node().focus();
    // }, 5000);
  })
});

const asc = arr => arr.sort((a, b) => a - b);
const sum = arr => arr.reduce((a, b) => a + b, 0);
const mean = arr => sum(arr) / arr.length;

const quantile = (arr, q) => {
  const sorted = asc(arr);
  const pos = (sorted.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sorted[base + 1] !== undefined) {
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  } else {
    return sorted[base];
  }
}