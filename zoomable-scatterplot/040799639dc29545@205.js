// https://observablehq.com/@d3/zoomable-scatterplot@205
function _1(md){return(
md`# Zoomable Scatterplot

The scatterplot allows zooming using the mouse or touch.`
)}

function _reset(html){return(
html`<button>Reset`
)}

function _chart(d3,width,height,data,x,y,z,xAxis,yAxis,grid)
{
  const zoom = d3.zoom()
      .scaleExtent([0.5, 32])
      .on("zoom", zoomed);

  const svg = d3.create("svg")
      .attr("viewBox", [0, 0, width, height]);

  const gGrid = svg.append("g");

  const gDot = svg.append("g")
      .attr("fill", "none")
      .attr("stroke-linecap", "round");

  gDot.selectAll("path")
    .data(data)
    .join("path")
      .attr("d", d => `M${x(d[0])},${y(d[1])}h0`)
      .attr("stroke", d => z(d[2]));

  const gx = svg.append("g");

  const gy = svg.append("g");

  svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

  function zoomed({transform}) {
    const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
    const zy = transform.rescaleY(y).interpolate(d3.interpolateRound);
    gDot.attr("transform", transform).attr("stroke-width", 5 / transform.k);
    gx.call(xAxis, zx);
    gy.call(yAxis, zy);
    gGrid.call(grid, zx, zy);
  }

  return Object.assign(svg.node(), {
    reset() {
      svg.transition()
          .duration(750)
          .call(zoom.transform, d3.zoomIdentity);
    }
  });
}


function _4(reset,chart){return(
reset, chart.reset()
)}

function _data(d3)
{
  const random = d3.randomNormal(0, 0.2);
  const sqrt3 = Math.sqrt(3);
  return [].concat(
    Array.from({length: 300}, () => [random() + sqrt3, random() + 1, 0]),
    Array.from({length: 300}, () => [random() - sqrt3, random() + 1, 1]),
    Array.from({length: 300}, () => [random(), random() - 1, 2])
  );
}


function _x(d3,width){return(
d3.scaleLinear()
    .domain([-4.5, 4.5])
    .range([0, width])
)}

function _y(d3,k,height){return(
d3.scaleLinear()
    .domain([-4.5 * k, 4.5 * k])
    .range([height, 0])
)}

function _z(d3,data){return(
d3.scaleOrdinal()
    .domain(data.map(d => d[2]))
    .range(d3.schemeCategory10)
)}

function _xAxis(height,d3){return(
(g, x) => g
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisTop(x).ticks(12))
    .call(g => g.select(".domain").attr("display", "none"))
)}

function _yAxis(d3,k){return(
(g, y) => g
    .call(d3.axisRight(y).ticks(12 * k))
    .call(g => g.select(".domain").attr("display", "none"))
)}

function _grid(height,k,width){return(
(g, x, y) => g
    .attr("stroke", "currentColor")
    .attr("stroke-opacity", 0.1)
    .call(g => g
      .selectAll(".x")
      .data(x.ticks(12))
      .join(
        enter => enter.append("line").attr("class", "x").attr("y2", height),
        update => update,
        exit => exit.remove()
      )
        .attr("x1", d => 0.5 + x(d))
        .attr("x2", d => 0.5 + x(d)))
    .call(g => g
      .selectAll(".y")
      .data(y.ticks(12 * k))
      .join(
        enter => enter.append("line").attr("class", "y").attr("x2", width),
        update => update,
        exit => exit.remove()
      )
        .attr("y1", d => 0.5 + y(d))
        .attr("y2", d => 0.5 + y(d)))
)}

function _k(height,width){return(
height / width
)}

function _height(){return(
600
)}

function _d3(require){return(
require("d3@6")
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("viewof reset")).define("viewof reset", ["html"], _reset);
  main.variable(observer("reset")).define("reset", ["Generators", "viewof reset"], (G, _) => G.input(_));
  main.variable(observer("chart")).define("chart", ["d3","width","height","data","x","y","z","xAxis","yAxis","grid"], _chart);
  main.variable(observer()).define(["reset","chart"], _4);
  main.variable(observer("data")).define("data", ["d3"], _data);
  main.variable(observer("x")).define("x", ["d3","width"], _x);
  main.variable(observer("y")).define("y", ["d3","k","height"], _y);
  main.variable(observer("z")).define("z", ["d3","data"], _z);
  main.variable(observer("xAxis")).define("xAxis", ["height","d3"], _xAxis);
  main.variable(observer("yAxis")).define("yAxis", ["d3","k"], _yAxis);
  main.variable(observer("grid")).define("grid", ["height","k","width"], _grid);
  main.variable(observer("k")).define("k", ["height","width"], _k);
  main.variable(observer("height")).define("height", _height);
  main.variable(observer("d3")).define("d3", ["require"], _d3);
  return main;
}
