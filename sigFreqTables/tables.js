function draw(data, pos) {

    d3.selectAll('.tableRemove').remove()
    const pct = d3.format(".2%")
    // numerical filters
    // data = data.filter(d => !(d.info.Before * d.info.After == 0))
    data = data.filter(d => d.info.stats.pvalue < .05)
    // keyword filters
    data = data.filter(d => /[а-яА-ЯЁё]/.test(d.keyword) && !d.keyword.includes('_'))
    var irrelevantWords = ['авторский', 'блог', 'личный', 'источник', 'автор']
    data = data.filter(d => !irrelevantWords.includes(d.keyword))
    data.map(function (d) {
        d.info.timesDifference = Math.round(d.info.After / d.info.Before * 100) / 100
    })
    if (pos != 'All POS') {
        data = data.filter(d => d.pos == pos)
    }

    var lessfreq = data.filter(d => d.info.Before > d.info.After)
    var morefreq = data.filter(d => d.info.Before < d.info.After)
    morefreq = morefreq.sort(function (a, b) { return (b.info.timesDifference > a.info.timesDifference) })
    lessfreq = lessfreq.sort(function (a, b) { return (b.info.timesDifference < a.info.timesDifference) })

    tabulate('morefreq', morefreq, ['keyword', 'translation', 'pos', 'Before', 'After', 'timesDifference'])
    tabulate('lessfreq', lessfreq, ['keyword', 'translation', 'pos', 'Before', 'After', 'timesDifference'])

    function tabulate(id, data, columns) {
        var table = d3.select(`#${id}`).append('table').classed('tableRemove', true)
        var thead = table.append('thead')
        var tbody = table.append('tbody');

        // append the header row
        thead.append('tr')
            .selectAll('th')
            .data(columns).enter()
            .append('th')
            .text(function (column) { return column; });

        // create a row for each object in the data
        var rows = tbody.selectAll('tr')
            .data(data)
            .enter()
            .append('tr')
            .attr('class', d => d.pos + ' tableRow')

        // create a cell in each row for each column
        var cells = rows.selectAll('td')
            .data(function (row) {
                return columns.map(function (column) {
                    if (column == 'keyword') {
                        return { column: column, value: row[column] };
                    } else if (['pos','translation'].includes(column)) {
                        return { column: column, value: row[column] };
                    }
                    else if (['Before', 'After'].includes(column)) {
                        return { column: column, value: pct(row.info[column]) };
                    } else {
                        return { column: column, value: row.info[column] };
                    }
                });
            })
            .enter()
            .append('td')
            .text(function (d) { return d.value; });

        return table;
    }

}

$(document).ready(function () {
    d3.json('frequencyData3-1.json', function (data) {
        d3.json('translations.json', function (tdata) {
            data.map(d => d.translation = tdata[d.keyword] ? tdata[d.keyword].toLowerCase() : '')
            console.log(data)
            draw(data, 'All POS')

            var partsOfSpeech = new Set()
            data.map(d => partsOfSpeech.add(d.pos))
            var dataOptions = Array.from(partsOfSpeech)
            dataOptions.unshift('All POS')
            var dropdown = d3.select("#selectData")
                .selectAll('myOptions')
                .data(dataOptions)
                .enter()
                .append('option')
                .text(function (d) { return d; }) // text showed in the menu
                .attr("value", function (d) { return d; })
            // dropdown.property('value', 'All POS');

            d3.select("#selectData").on("change", function (d) {
                var selected = d3.select(this).property("value")
                draw(data, selected)
            })
        })
    })
});