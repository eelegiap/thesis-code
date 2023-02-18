class TextPanel {

    constructor(poemData,authorData) {
        this.data = poemData
        this.authorData = authorData
        this.initVis()
    }

    initVis() {
        let vis = this;

        var d = choose(this.data)
        this.updateVis(d)

    }
    wrangleData(id) {
        let vis = this;
        var thisPoem = this.data.find(d => d.UniqueIndex == id)

        this.updateVis(thisPoem)

    }

    /*
    * The drawing function - should use the D3 update sequence (enter, update, exit)
    * */

    updateVis(thisPoem) {
        let vis = this;


        var authorInfo = this.authorData[this.authorData.map(d => d.Author).indexOf(thisPoem.Author)]

        d3.select('#poemTxt').html('')
        d3.select('#poemMeta').html('')
        d3.select('#poemMeta').html(function () {
            var color = 'black'
            if (thisPoem['Before or after'] == 'Before') {
                color = 'blue'
            } else {
                color = 'red'
            }

            var date = thisPoem['Date posted'] != 'None' ? ` (${parseDate(new Date(thisPoem['Date posted']))})` : ''

            return `<span style='color:${color}'>${thisPoem['Before or after']}${date}:</span>
                    <b>${thisPoem.Author}</b>, <i>${thisPoem.Source}</i>
                    <br>Author birthplace: ${authorInfo.City}, ${authorInfo.Country}`
        })

        var input = d3.select('#form1').property('value')

        var forHTML = thisPoem.Text.replaceAll('\n', '<br>')


        var lineHTMLs = []
        thisPoem.nlpInfo.forEach(function (line, i) {
            var lineHTML = line.lineTxt
            line.lemmas.forEach(function (lem, j) {
                if (lem == input) {
                    var span = thisPoem.nlpInfo[i].spans[j]
                    var token = thisPoem.nlpInfo[i].texts[j]
                    lineHTML = [lineHTML.slice(0, span.start), `<mark>${token}</mark>`, lineHTML.slice(span.end)].join('');
                }
            })
            if (thisPoem.Source.includes('ROAR')) {
                if (!(/^[\*]+$/.test(lineHTML.replaceAll(' ', '')))) {
                    // check if bold
                    var regexBold = /\*\*([^*]+)\*\*/i
                    var matchesBold = lineHTML.match(regexBold)
                    if (matchesBold != null && matchesBold.length > 0) {
                        lineHTML = `<b>${matchesBold.pop()}</b>`
                        console.log(lineHTML)
                    } else {
                        // check if italic
                        var regexItalic = /\*([^*]+)\*/i;
                        var matchesItalic = lineHTML.match(regexItalic)
                        if (matchesItalic != null && matchesItalic.length > 0) {
                            lineHTML = `<i>${matchesItalic.pop()}</i>`
                            console.log(lineHTML)
                        }
                    }
                }
            }
            lineHTMLs.push(lineHTML)
        })
        forHTML = lineHTMLs.join('<br>')

        d3.select('#poemTxt').html(forHTML)

    }

}