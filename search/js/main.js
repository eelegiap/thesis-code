let promises = [
    d3.json("data/poems_2023-01-06.json")
];

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );



// initMainPage
function initMainPage(allDataArray) {
    let poemData = allDataArray[0];
    myText = new TextPanel(poemData);
    // change_level("wordlevel")
}

function updateResults(){
    var input = d3.select('#form1').property('value')
    myText.wrangleData(input);
}