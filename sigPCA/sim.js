// Modified function to retain POS filter state when switching increase/decrease
function drawChart(result, iod, pos) {
  $("#output0").empty();
  $("#output1").empty();
  $("#output2").empty();
  $("#graph").empty();
  $("#slider-step").empty();
  $(".timing").text(" ");
  $("#error").css("display", "none");
  $(".hide").css("display", "none");

  $(".hide").css("display", "block");

  $("#title").text("Most similar word forms to ");

  if (!pos) {
    pos = d3.select("#dropdown select").property("value");
  }
  d3.select("#dropdown select").property("value", pos);

  $("#graph-title").text(
    `2-D Representation of ${pos} in corpus which experienced a/n ${iod}`
  );
  $("#graph-descript").text(
    "Pan rectangle on graph to zoom in. Double-click to zoom out. Adjust slider to show and hide forms on graph."
  );
  $("#header1").css("display", "block");
  $("#header2").css("display", "block");

  var startvectorsnavec = [];
  var labels = [];
  var result = result[iod];
  result.forEach(function (elt) {
    startvectorsnavec.push(elt.navecvector);
    labels.push(`${elt.translatedword.toLowerCase()} (${elt.word})`);
  });

  var vectors = PCA.getEigenVectors(startvectorsnavec);
  var adData = PCA.computeAdjustedData(
    startvectorsnavec,
    vectors[0],
    vectors[1]
  );
  var betterDatanavec = adData.formattedAdjustedData;

  var betterData = [[], []];
  for (let i = 0; i < result.length; i++) {
    betterData[0].push(betterDatanavec[0][i]);
    betterData[1].push(betterDatanavec[1][i]);
  }

  var data = [];
  for (var i = 0; i < result.length; i++) {
    if (betterData[0][i] === undefined) break;
    data.push({ x: betterData[0][i], y: betterData[1][i] });
  }

  var xvals = data.map((d) => d.x);
  var yvals = data.map((d) => d.y);
  var xMax = Math.max(...xvals),
    xMin = Math.min(...xvals);
  var yMax = Math.max(...yvals),
    yMin = Math.min(...yvals);

  var margin = { top: 20, right: 10, bottom: 30, left: 30 };
  var width = $(window).width() - margin.left - margin.right;
  var height = $(window).height() - margin.top - margin.bottom;

  var x = d3
    .scaleLinear()
    .domain([xMin - 0.15, xMax + 1.5])
    .range([0, width]);
  var y = d3
    .scaleLinear()
    .domain([yMin - 0.15, yMax + 0.5])
    .range([height, 0]);
  var xAxis = d3.axisBottom(x).ticks(12);
  var yAxis = d3.axisLeft(y).ticks((12 * height) / width);

  var svg = d3
    .select("#graph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  svg
    .append("defs")
    .append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

  var scatter = svg
    .append("g")
    .attr("id", "scatterplot")
    .attr("clip-path", "url(#clip)");

  var node = scatter
    .selectAll(".dot")
    .data(data)
    .enter()
    .append("g")
    .attr("class", (d, i) => result[i].pos);

  node
    .append("circle")
    .attr("class", "dot")
    .attr("r", 4)
    .attr("cx", (d) => x(d.x))
    .attr("cy", (d) => y(d.y))
    .style("fill", iod === "increase" ? "#50C878" : "tomato")
    .attr("opacity", 0.8);

  node
    .append("text")
    .attr("x", (d) => x(d.x) + 7)
    .attr("y", (d) => y(d.y) + 7)
    .attr("opacity", 0.75)
    .text((d, i) => labels[i]);

  // Apply current POS filter immediately
  node.each(function () {
    const dot = d3.select(this);
    dot.attr(
      "display",
      pos === "All POS" || dot.classed(pos) ? "show" : "none"
    );
  });

  d3.select("#dropdown select").on("change", function () {
    const pos = d3.select(this).property("value");
    node.each(function () {
      const dot = d3.select(this);
      dot.attr(
        "display",
        pos === "All POS" || dot.classed(pos) ? "show" : "none"
      );
    });
  });

  svg
    .append("g")
    .attr("class", "x axis")
    .attr("id", "axis--x")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis);

  svg.append("g").attr("class", "y axis").attr("id", "axis--y").call(yAxis);

  scatter
    .append("g")
    .attr("class", "brush")
    .call(
      d3
        .brush()
        .extent([
          [0, 0],
          [width, height],
        ])
        .on("end", function () {
          const s = d3.event.selection;
          if (!s) return;
          x.domain([s[0][0], s[1][0]].map(x.invert));
          y.domain([s[1][1], s[0][1]].map(y.invert));
          scatter.select(".brush").call(d3.brush().move, null);
          zoom();
        })
    );

  function zoom() {
    const t = scatter.transition().duration(750);
    svg.select("#axis--x").transition(t).call(xAxis);
    svg.select("#axis--y").transition(t).call(yAxis);
    scatter
      .selectAll("circle")
      .transition(t)
      .attr("cx", (d) => x(d.x))
      .attr("cy", (d) => y(d.y));
  }
}

$(document).ready(function () {
  d3.json("sigMeanDiffVecsTranslated4.json").then(function (result) {
    var data = { increase: [], decrease: [] };
    Object.keys(result).forEach((iod) => {
      Object.keys(result[iod]).forEach((pos) => {
        result[iod][pos].forEach((d) => {
          d.pos = pos;
          data[iod].push(d);
        });
      });
    });

    d3.select("#ioddropdown")
      .append("select")
      .selectAll("option")
      .data(["increase", "decrease"])
      .enter()
      .append("option")
      .text((d) => d)
      .attr("value", (d) => d);

    const partsOfSpeech = [
      "All POS",
      "ADJ",
      "ADP",
      "ADV",
      "AUX",
      "CCONJ",
      "DET",
      "NOUN",
      "NUM",
      "PART",
      "PRON",
      "PROPN",
      "SCONJ",
      "VERB",
    ];

    d3.select("#dropdown")
      .append("select")
      .selectAll("option")
      .data(partsOfSpeech)
      .enter()
      .append("option")
      .text((d) => d)
      .attr("value", (d) => d);

    d3.select("#ioddropdown select").on("change", function () {
      const iod = d3.select(this).property("value");
      const pos = d3.select("#dropdown select").property("value");
      $("#graph").empty();
      drawChart(data, iod, pos);
    });

    drawChart(data, "increase", "All POS");
  });
});
