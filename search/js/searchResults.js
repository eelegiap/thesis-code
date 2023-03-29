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

        this.wrangleData()
    }

    wrangleData() {
        console.log('input at begin',input)
        var input = d3.select('#form1').property('value')
        if (input == '' || input == undefined) {
            input = d3.select('#thisauthor').text()
        }
        var dropdownVal = d3.select('#dropdown').property("value")
        
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
            // dataByInput = dataByInput.sort((a, b) => a.Author.split(' ')[1] > b.Author.split(' ')[1])
            
        } else {
            console.log('input', input)
            var dataByInput = vis.data.filter(function (d) {
                if (!input) {
                    return false
                }
                if (input.split(' ').length == 1) {
                    if (d.Author.split(' ').length>1) {
                    return d.Author.split(' ')[1].toLowerCase().trim() == input.toLowerCase().trim()
                }
                }
                return d.Author.toLowerCase().trim() == input.toLowerCase().trim()
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
        console.log('thisinput',input)
        d3.selectAll("#results *").remove();
        d3.select('#resultCt').html('')
        var searchSubtitle = ''
        if (dropdownVal == 'keyword') {
            searchSubtitle = 'containing'
        } else {
            if (input == '') {
                input = d3.select('#thisauthor').text()
            }
            searchSubtitle = 'written by'
        }
        d3.select('#resultCt').html(`${data.length} poems ${searchSubtitle} ${input}. 
                ${data.filter(d => d['Before or after'] == 'Before').length} from before invasion, ${data.filter(d => d['Before or after'] == 'After').length} from after invasion.`)

        
        var author2info = new Object()
        var birthplaceCts = new Object()
        this.authorData.map(function (d) { birthplaceCts[d.Country] = 0; author2info[d.Author] = d })

        data.map(function (d) {
            if (author2info[d.Author]) {
                birthplaceCts[author2info[d.Author].Country] += 1
            }
        })

        var dateObj = {
            'No War Poetry': 1650578403721,
            'ROAR V2': 1656109878113,
            'ROAR V3': 1661380278113,
            
        }
        data.map(function (d) {
            if (Object.keys(dateObj).includes(d.Source)) {
                d.date = dateObj[d.Source]
            }
             else {
                d.date = d['Date posted']
            }
            if (['None','','N/A'].includes(d.date)) {
                if (d['Before or after'] == 'Before') {
                    d.date = 1645654419000
                } else {
                    d.date = 1645827219000
                }
            }

            
            //  d.dateStr = `${parseDate(new Date(d.date))}`
        })
        
        data = data.sort((a, b) => a.date - b.date);


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
                
                var date = ` (${parseDate(new Date(d.date))})`
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