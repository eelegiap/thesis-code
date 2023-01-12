let parseDate = d3.timeFormat("%b %d, %Y");

let promises = [
    d3.json("data/poems_2023-01-11_3.json")
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );


let input = 'язык'
// initMainPage
function initMainPage(data) {
    let poemData = data[0];
    mySearchResults = new SearchResults(poemData,input)
    myText = new TextPanel(poemData);
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