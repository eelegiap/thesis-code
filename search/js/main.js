let parseDate = d3.timeFormat("%b %d, %Y");

let promises = [
    d3.json("data/poems_2023-02-23).json"),
    d3.json("data/Thesis_Authors16.json")
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );


let input = 'родина'
// initMainPage
function initMainPage(data) {
    let poemData = data[0];
    let authorData = data[1];
    mySearchResults = new SearchResults(poemData,input,authorData)
    myText = new TextPanel(poemData,authorData);
    const q = window.location.href.split('=')[1]
    myText.wrangleData(+q)
    // change_level("wordlevel")
}

function updateResults(){
    var input = d3.select('#form1').property('value')
    console.log(input)
    mySearchResults.wrangleData(input);
}

d3.select('#search').on('click', function() {
    updateResults()
})


function choose(choices) {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
}

// var dataOptions = ['Keywords','Authors']
// d3.select("#dropdown")
// .selectAll('myOptions')
// .data(dataOptions)
// .enter()
// .append('option')
// .text(function (d) { return d; }) // text showed in the menu
// .attr("value", function (d) { return d; })

// d3.select("#dropdown").on("change", function (d) {
// var selected = d3.select(this).property("value")
// if (selected == 'Keywords') {
// } else {

// }
// })