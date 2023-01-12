class TextPanel {

    constructor(poemData) {
        this.data = poemData
        this.initVis()
    }

    initVis() {
        let vis = this;

        var d = choose(this.data)
        this.updateVis(d)
        // d3.select('#poemTxt').html(d.Text.replaceAll('\n', '<br>'))

        // d3.select('#poemMeta').html(function() {
        //     var color = 'black'
        //     if (d['Before or after'] == 'Before') {
        //         color = 'blue'
        //     } else {
        //         color = 'red'
        //     }
            
        //     var date = d['Date posted'] != 'None' ? ` (${parseDate(new Date (d['Date posted']))})` : ''

        //     return `<span style='color:${color}'>${d['Before or after']}${date}:</span>
        //             <b>${d.Author}</b>, <i>${d.Source}</i>`
        // })

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
        d3.select('#poemTxt').html('')

        d3.select('#poemMeta').html('')

        d3.select('#poemMeta').html(function() {
            var color = 'black'
            if (thisPoem['Before or after'] == 'Before') {
                color = 'blue'
            } else {
                color = 'red'
            }
            
            var date = thisPoem['Date posted'] != 'None' ? ` (${parseDate(new Date (thisPoem['Date posted']))})` : ''

            return `<span style='color:${color}'>${thisPoem['Before or after']}${date}:</span>
                    <b>${thisPoem.Author}</b>, <i>${thisPoem.Source}</i>`
        })

        var input = d3.select('#form1').property('value')

        var forHTML = thisPoem.Text.replaceAll('\n', '<br>')

        var lineHTMLs = []
        thisPoem.nlpInfo.forEach(function(line, i) {
            var lineHTML = line.lineTxt
            line.lemmas.forEach(function(lem, j) {
                if (lem == input) {
                    var span = thisPoem.nlpInfo[i].spans[j]
                    var token = thisPoem.nlpInfo[i].texts[j]
                    lineHTML = [lineHTML.slice(0, span.start), `<mark>${token}</mark>`, lineHTML.slice(span.end)].join('');
                }
            })
            lineHTMLs.push(lineHTML)
        })
        forHTML = lineHTMLs.join('<br>')

        d3.select('#poemTxt').html(forHTML)

    }

}