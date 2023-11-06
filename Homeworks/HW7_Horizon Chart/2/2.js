const data_path = "../air-pollution.csv"

d3.csv(data_path).then(function (data) { 
    console.log("data:", data)

    // add an event listener for the change event
    const radioButtons = document.querySelectorAll('input[name="type"]');
    for (const radioButton of radioButtons) {
        radioButton.addEventListener('change', showSelected);
    }

    function showSelected(e) {
        // console.log(e);
        if (this.checked) {
            render(this.value)
        }
    }
    
    function render(type) {
        var data_2 = aggregate(data, type)
        console.log("data_2:", data_2)

        var data_3 = [].concat(...data_2);
        console.log("data_3:", data_3)

        HorizonTSChart()(document.getElementById('horizon-chart'))
            .data(data_3)
            .series('series')
        // .yAggregation([fn([numbers])])
        // .yNormalize(true);
    }

    render("SO2");
});

roundTo = function (num, decimal) { return Math.round((num + Number.EPSILON) * Math.pow(10, decimal)) / Math.pow(10, decimal); }

function aggregate(data, type) {
    var sums = data.reduce(function (acc, obj) {
        var date = obj["Measurement date"].split(" ")[0];
        var station = obj["Station code"];
        if (!acc[date]) {
            acc[date] = {};
        }
        if (!acc[date][station]) {
            acc[date][station] = { sum: 0, count: 0 };
        }
        acc[date][station].sum += +obj[type];
        acc[date][station].count++;
        return acc;
    }, Object.create(null));

    return Object.keys(sums).map(function (date) {
        // console.log("sums:", sums)
        // console.log("sums[date]:", sums[date])
        return Object.keys(sums[date]).map(function (station) {
            // console.log("date:", date)
            // console.log("station:", station)
            return {
                "ts": new Date(date),
                "series": station,
                "val": roundTo(sums[date][station].sum / sums[date][station].count, 4),
            };
        });
    });
}

