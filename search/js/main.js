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
    myText.wrangleData(1569)
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