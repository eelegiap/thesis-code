class SearchResults {

    constructor(poemData, input, authorData) {
        this.data = poemData
        this.input = input
        this.authorData = authorData
        this.initVis()
    }

    initVis() {
        let vis = this;
        d3.select('#form1').property('value', this.input)
        const textBox = document.getElementById('form1');
        textBox.focus();
        textBox.select();
        var dropdownVal = d3.select('#dropdown').property("value")
        this.wrangleData(this.input, dropdownVal)
    }

    wrangleData(input, dropdownVal) {
        let vis = this;
        
        if (dropdownVal == 'keyword') {
            input = input.toLowerCase()
            var forms = new Set()
            var dataByInput = vis.data.filter(function (d) {
                if (!input) {
                    return false
                }
                var textByLine = d.Text.split('\n')
                var inputFound = false
                d['lineInfo'] = []
                d.nlpInfo.forEach(function (line, i) {
                    line.lemmas.forEach(function (lem, j) {
                        if (lem.toLowerCase() == input) {
                            d['lineInfo'].push(
                                {
                                    'lineIdx': i,
                                    'lineTxt': textByLine[i],
                                    'lineToken': line.texts[j],
                                    'tokenSpan': line.spans[j]
                                })
                            forms.add(line.texts[j])
                            inputFound = true
                        }
                    })
                })
                return inputFound
            })
            dataByInput = dataByInput.sort((a, b) => a.Author.split(' ')[1] > b.Author.split(' ')[1])
        } else {
            var dataByInput = vis.data.filter(function (d) {
                if (!input) {
                    return false
                }
                return d.Author == input
            })
        }
        console.log(dataByInput)
        vis.updateVis(dataByInput);

    }

    /* * 
    The drawing function - should use the D3 update sequence (enter, update, exit)
    * */

    updateVis(data) {

        let vis = this;
        var input = d3.select('#form1').property('value')
        var dropdownVal = d3.select('#dropdown').property("value")

        d3.selectAll("#results *").remove();
        d3.select('#resultCt').html('')
        d3.select('#resultCt').html(`${data.length} poems containing ${input}. 
                ${data.filter(d => d['Before or after'] == 'Before').length} from before invasion, ${data.filter(d => d['Before or after'] == 'After').length} from after invasion.`)

        
        var author2info = new Object()
        var birthplaceCts = new Object()
        this.authorData.map(function (d) { birthplaceCts[d.Country] = 0; author2info[d.Author] = d })

        data.map(function (d) {
            if (author2info[d.Author]) {
                birthplaceCts[author2info[d.Author].Country] += 1
            }
        })

        var resultsByPoem = d3.select('#results').selectAll('.poemResult')
            .data(data)
            .enter()
            .append('div')
            .attr('class', 'poemResult')
            .attr('id', d => 'id' + d.UniqueIndex)
            .html(function (d) {
                var color = '#2a9d8f'
                if (d['Before or after'] == 'Before') {
                    color = '#118ab2'
                } else {
                    color = '#ef476f'
                }
                var city; var country
                var aInfo = author2info[d.Author]
                if (!aInfo) {
                    city = 'N/A'; country = 'N/A'
                } else {
                    city = aInfo.City; country = aInfo.Country;
                }

                var date = d['Date posted'] != 'None' ? ` (${parseDate(new Date(d['Date posted']))})` : ''
                return `<span style='font-size: 12px'><span style='color:${color}'>${d['Before or after']}${date}:</span>
                        <b>${d.Author}</b>, <i>${d.Source}</i> (${city}, ${country}) [${d.UniqueIndex}]</span>`
            })

        resultsByPoem.each(function (p) {
            var thisPoem = d3.select(this)
            if (dropdownVal == 'keyword') {
                p.lineInfo.forEach(function (l) {
                    var htmlText = l.lineTxt.slice(0, 75)
                    htmlText = htmlText.replaceAll(l.lineToken, `<mark>${l.lineToken}</mark>`)
                    thisPoem
                        .append('p')
                        .attr('id', p.UniqueIndex)
                        .attr('class', 'result')
                        .html(`<span style='font-size: 14px'>... </span>${htmlText}
                            <span style='font-size: 14px'> ...</span>`)
                })
            } else {
                thisPoem
                    .append('p')
                    .attr('id', p.UniqueIndex)
                    .attr('class', 'result')
                    .html(function(d) {
                    var htmlLines = d.Text.split('\n')
                    var goodHtmlLines = []
                    htmlLines.forEach(function(line) {
                        var newLine = line.replaceAll('*','').replaceAll(' ','')
                        if (!['',' ','\n'].includes(newLine)) {
                            goodHtmlLines.push(line.slice(0,100))
                        }
                    })
                    var htmlText = goodHtmlLines.slice(0,1).join('<br>')
                    return `<span style='font-size: 14px'></span>${htmlText}
                        <span style='font-size: 14px'> ...</span>`
                })
            }

        })

        d3.selectAll('.poemResult').on('click', function () {
            var uniqueID = d3.select(this).attr('id').replaceAll('id', '')
            window.history.pushState('object or string', 'Title', `/thesis-code/search/?q=${uniqueID}`)
            myText.wrangleData(uniqueID)
        }).on('mouseover', function () {
            d3.select(this).transition().style('background-color', 'rgba(176, 196, 222, 0.302)')
        }).on('mouseout', function () {
            d3.select(this).transition().style('background-color', 'transparent')
        })
    }

}