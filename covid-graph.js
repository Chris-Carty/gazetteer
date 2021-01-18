var covidstatus = [
    {title: 'Death Toll', slug: 'deaths', backgroundColor: '#ffcf9f', borderColor: '#ff9f40'}, 
    {title: 'Recoveries', slug: 'recovered', backgroundColor: '#a4dfdf', borderColor: '#4bc0c0'},
    {title: 'Confirmed Infections', slug: 'confirmed', backgroundColor: '#ffb0c1', borderColor: '#ff6384'}
];

var store = localStorage;
var getStore = 'belgium';

var mychart = myChart();
countryData(getStore, covidstatus, mychart);

$('#country').on('change', function() {
    store.setItem('myCountry', $(this).val());
    window.location.reload();
});

function countryData(country, status, chart) {
    getLabelData(chart);
    status.forEach(function(item, index) {
        getCountryData(item.slug, country, chart, index);
    });
}

function getLabelData(chart) {
    axios.get('https://api.covid19api.com/total/country/italy/status/confirmed').then(function(response) {
        chart.data.labels = formatData(response.data, 'label');
        chart.update();
    })
}

function getCountryData(status, country, chart, index) {
    axios.get('https://api.covid19api.com/total/country/'+country+'/status/'+status).then(function(response) {
        chart.data.datasets[index].data = formatData(response.data, 'data');
        chart.update();
    }).catch(function(error) {
        console.log(error);
    });
}

function formatData(data, type) {
    var list = [];
    data.forEach(function(item) {
        if(type == 'data') {
            list.push(item.Cases);
        } else if(type == 'label') {
            list.push(new Date(item.Date).getDate());
        }
    });
    return list.slice(data.length - 34, data.length);
}

function myChart() {
    var myBasicChart = new Chart('myChart', {
        type: 'line',
        data: {
            labels: [],
            datasets: dataSets(covidstatus)
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'COVID-19 by Country'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: true,
                }],
                yAxes: [{
                    display: true,
                }]
            }
        }
    });
    return myBasicChart;
}

function dataSets(data) {
    var sets = [];
    data.forEach(function(item) {
        sets.push({
            label: item.title,
            data: [],
            backgroundColor: item.backgroundColor,
            borderColor: item.borderColor,
            borderWidth: 3,
            fill: true
        });
    });
    return sets;
}