// GLOBAL VARIABLES //

let lng = 0;
let lat = 0;
let area = 0;
let country = "";
let capital = "";
let north = "";
let south = "";
let east = "";
let west = "";
let countryCodeIso3 = "";
let countryCodeIso2 = "";
let bounds;
let geoJsonBorder;
let userLng = 0;
let userLat = 0;
let cityLat = 0;
let cityLng = 0;
let e_markerGroup;
let w_markerGroup;

// Vars Exchange Rate

let currencyCode = "";
let currencyName = "";
let currencyBase = "";
let currencyTimestamp = 0;
let exchangeRate = 0;
let roundedExchangeRate = 0;

///////////////////////////

// POLYGON STYLING

const polyStyle = {
  weight: 2,
  color: "#05716c",
  opacity: 1,
  fillColor: "#1fbfb8",
  fillOpacity: 0.3,
};

///////////////////////////

// BASE MAP CONFIGURATION

const mymap = L.map("mapid", {
  minZoom: 3,
  maxZoom: 15
}).setView([53.330873, -4.921875], 3);

L.control.scale().addTo(mymap);

const url =
    "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
  attr =
    'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  otm = new L.TileLayer(url, {
    attribution: attr,
  });

///////////////////////////

  mymap.locate({setView: false, maxZoom: 3}); 


  function onLocationFound(e) {

    // GET USER COUNTRY INFO 

    $.ajax({
      url: "php/getCountryCode.php",
      type: "POST",
      dataType: "json",
      data: {
        lat: e["latlng"]["lat"],
        lng: e["latlng"]["lng"],
      },
      success: function (result) {
        console.log(result);
        $.ajax({
          url: "php/getCountryInfo.php",
          type: "POST",
          dataType: "json",
          data: {
            country: result["data"],
            lang: "en",
          },
          success: function (result) {
            console.log(result);
            if (result.status.code == 200) {
              setCountryInfo(result);
              getExchangeRate();
              getCurrencyName();
              getCovidData();
              getCountryBorders();
              getWeather();
              getImages();
              setCovidGraph(result);
            }
          },
          error: function (jqXHR, textStatus, errorThrown) {
            alert(`${textStatus} error in user country info`);
          },
        });
      },
      error: function (jqXHR, textStatus, errorThrown) {
        alert(`${textStatus} error in country info`);
      },
    });
}
  mymap.on("locationfound", onLocationFound);

  function onLocationError(e) {
    alert(e.message);
}

  mymap.on("locationerror", onLocationError); 


  /////////////////////////// 


  // GOOGLE MAPS API LAYERS

  const ggl = new L.Google("SATELLITE");

  const ggl2 = new L.Google("TERRAIN");

  const ggl3 = new L.Google("ROADMAP");

  // TIMEZONES OVERLAY //

  const timeZones = new L.LayerGroup();

  L.timezones.bindPopup(function (layer) {
    return L.Browser.ie? layer.feature.properties.time_zone : new Date().toLocaleString("en-GB", {timeZone:layer.feature.properties.tz_name1st, timeZoneName:"short"});
  }).addTo(timeZones);

  // WEATHER MAP OVERLAYS

  const pressureMap = new L.LayerGroup();

  const pressureMapUrl = "https://tile.openweathermap.org/map/pressure_new/{z}/{x}/{y}.png?appid=36e6a7c2681f29437c9062534508e485";

  const pressure = new L.TileLayer(pressureMapUrl, {
    attribution: attr,
  }).addTo(pressureMap);

  const precipitationMap = new L.LayerGroup();

  const precipitationMapUrl = "https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=36e6a7c2681f29437c9062534508e485";

  const precipitation = new L.TileLayer(precipitationMapUrl, {
    attribution: attr,
  }).addTo(precipitationMap);

  const tempMap = new L.LayerGroup();

  const tempMapUrl = "https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=36e6a7c2681f29437c9062534508e485";

  const temp = new L.TileLayer(tempMapUrl, {
    attribution: attr,
  }).addTo(tempMap);

  // LAYER/OVERLAYS CONFIGURATION //

const baseLayers = {
  "Light": otm,
  Satellite: ggl,
  Terrain: ggl2,
  Roadmap: ggl3,
};

const overlays = {
  "Timezones (click for time)": timeZones,
  Temperature: tempMap,
  Precipitation: precipitationMap,
  "Air Pressure": pressureMap
    };

let layersControl = L.control.layers(baseLayers, overlays, { collapsed: true });

layersControl.addTo(mymap);

mymap.addLayer(otm);

///////////////////////////

//SET COUNTRY INFO FUNCTION
function setCountryInfo(result) {
  countryCodeIso3 = result["data"][0]["isoAlpha3"];
  countryCodeIso2 = result["data"][0]["countryCode"];
  currencyCode = result["data"][0]["currencyCode"];
  country = result["data"][0]["countryName"];
  capital = result["data"][0]["capital"];
  north = result["data"][0]["north"];
  south = result["data"][0]["south"];
  east = result["data"][0]["east"];
  west = result["data"][0]["west"];


  // UPDATE HTML COUNTRY INFO
  $("#flag").attr(
    "src",
    "https://www.countryflags.io/" +
      countryCodeIso2.toLowerCase() +
      "/shiny/64.png"
  );
  $("#flag2").attr(
    "src",
    "https://www.countryflags.io/" +
      countryCodeIso2.toLowerCase() +
      "/shiny/64.png"
  );
  $("#country").html(" " + country);
  $("#countryCode").html(" " + countryCodeIso3);
  $("#continent").html(" " + result["data"][0]["continentName"]);
  $("#capital").html(" " + capital);
  $("#population").html(" " + result["data"][0]["population"]);
  $("#languages").html(" " + result["data"][0]["languages"]);

  document.getElementById("selectCountry").value = countryCodeIso2;
}

function setCurrencyInfo() {
  $("#currencyName").html(" " + currencyName);
  $("#currencyCode").html(" " + currencyCode);
  $("#exchangeRate").html(" " + roundedExchangeRate);
  $("#base").html(" " + currencyBase);
  $("#timestamp").html(" " + currencyTimestamp);
  $("#source").html(" Open Exchange Rates");
}

function setCovidData(covidObject) {
  $("#country").html(" " + country);
  $("#newTotalCases").html(" " + covidObject.NewConfirmed);
  $("#totalCases").html(" " + covidObject.TotalConfirmed);
  $("#covidDeathNew").html(" " + covidObject.NewDeaths);
  $("#covidDeathTotal").html(" " + covidObject.TotalDeaths);
  $("#covidDate").html(" " + covidObject.Date);
}

function setImages(result) {

  let url0 = result['hits'][0]['largeImageURL'].toString();
  let url1 = result['hits'][1]['largeImageURL'].toString();
  let url2 = result['hits'][2]['largeImageURL'].toString();
  let url3 = result['hits'][3]['largeImageURL'].toString();
  let url4 = result['hits'][4]['largeImageURL'].toString();
  let url5 = result['hits'][5]['largeImageURL'].toString();

  document.getElementById("image0").style.backgroundImage = 'url(' + url0 + ')';
  document.getElementById("image1").style.backgroundImage = 'url(' + url1 + ')';
  document.getElementById("image2").style.backgroundImage = 'url(' + url2 + ')';
  document.getElementById("image3").style.backgroundImage = 'url(' + url3 + ')';
  document.getElementById("image4").style.backgroundImage = 'url(' + url4 + ')';
  document.getElementById("image5").style.backgroundImage = 'url(' + url5 + ')';
}

function setWeather(weatherArr) {

  //Day1
  $("#w_date").html(weatherArr["weatherData"][0]["valid_date"])
  let icon = weatherArr["weatherData"][0]["weather"]["icon"];
  let icon_url= 'https://www.weatherbit.io/static/img/icons/' + icon + '.png';
  $("#icon").attr("src", icon_url);
  $("#w_icon").html(icon_url);
  $("#w_description").html(weatherArr["weatherData"][0]["weather"]["description"]);
  $("#w_temp").html(weatherArr["weatherData"][0]["temp"] + '°C');

    //Day2
    $("#w_date1").html(weatherArr["weatherData"][1]["valid_date"])
    let icon1 = weatherArr["weatherData"][1]["weather"]["icon"];
    let icon_url1= 'https://www.weatherbit.io/static/img/icons/' + icon1 + '.png';
    $("#icon1").attr("src", icon_url1);
    $("#w_description1").html(weatherArr["weatherData"][1]["weather"]["description"]);
    $("#w_temp1").html(weatherArr["weatherData"][1]["temp"] + '°C');

  //Day3
  $("#w_date2").html(weatherArr["weatherData"][2]["valid_date"])
  let icon2 = weatherArr["weatherData"][2]["weather"]["icon"];
  let icon_url2= 'https://www.weatherbit.io/static/img/icons/' + icon2 + '.png';
  $("#icon2").attr("src", icon_url2);
  $("#w_description2").html(weatherArr["weatherData"][2]["weather"]["description"]);
  $("#w_temp2").html(weatherArr["weatherData"][2]["temp"] + '°C');

    //Day4
    $("#w_date3").html(weatherArr["weatherData"][3]["valid_date"])
    let icon3 = weatherArr["weatherData"][3]["weather"]["icon"];
    let icon_url3= 'https://www.weatherbit.io/static/img/icons/' + icon3 + '.png';
    $("#icon3").attr("src", icon_url3);
    $("#w_description3").html(weatherArr["weatherData"][3]["weather"]["description"]);
    $("#w_temp3").html(weatherArr["weatherData"][3]["temp"] + '°C');

  //Day5
  $("#w_date4").html(weatherArr["weatherData"][4]["valid_date"])
  let icon4 = weatherArr["weatherData"][4]["weather"]["icon"];
  let icon_url4= 'https://www.weatherbit.io/static/img/icons/' + icon4 + '.png';
  $("#icon4").attr("src", icon_url4);
  $("#w_description4").html(weatherArr["weatherData"][4]["weather"]["description"]);
  $("#w_temp4").html(weatherArr["weatherData"][4]["temp"] + '°C');

  $("#capital2").html(" " + capital);
}

function setEarthquakes(result) {

const e_icon = L.icon({
  iconUrl: 'media/svg/earthquake.svg',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -25]
})

if(e_markerGroup != undefined){
  mymap.removeLayer(e_markerGroup);
}

  e_markerGroup = L.layerGroup().addTo(mymap);

let e_marker0 = L.marker([result["earthquakeData"][0]["lat"], result["earthquakeData"][0]["lng"]], {icon: e_icon}).addTo(e_markerGroup);
let e_marker1 = L.marker([result["earthquakeData"][1]["lat"], result["earthquakeData"][1]["lng"]], {icon: e_icon}).addTo(e_markerGroup);
let e_marker2 = L.marker([result["earthquakeData"][2]["lat"], result["earthquakeData"][2]["lng"]], {icon: e_icon}).addTo(e_markerGroup);

e_marker0.on('click', function(){
  this.bindPopup();
  this._popup.setContent(
    "<h6>Earthquake</h6>" + 
    "Magnitude: " + result["earthquakeData"][0]["magnitude"] + " ML<br>" +
    "Depth: " + result["earthquakeData"][0]["depth"] + " KM<br>" +
    "Datetime: " + result["earthquakeData"][0]["datetime"]
    );
})

e_marker1.on('click', function(){
  this.bindPopup();
  this._popup.setContent(
    "<h6>Earthquake</h6>" + 
    "Magnitude: " + result["earthquakeData"][1]["magnitude"] + " ML<br>" +
    "Depth: " + result["earthquakeData"][1]["depth"] + " KM<br>" +
    "Datetime: " + result["earthquakeData"][1]["datetime"]
    );
})

e_marker2.on('click', function(){
  this.bindPopup();
  this._popup.setContent(
    "<h6>Earthquake</h6>" + 
    "Magnitude: " + result["earthquakeData"][2]["magnitude"] + " ML <br>" +
    "Depth: " + result["earthquakeData"][2]["depth"] + " KM<br>" +
    "Datetime: " + result["earthquakeData"][2]["datetime"]
    );
})

};

function setWikiInfo(result) {
  const w_icon = L.icon({
    iconUrl: 'media/svg/wiki.svg',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -25]
  })

  if(w_markerGroup != undefined){
    mymap.removeLayer(w_markerGroup);
  }
  
    w_markerGroup = L.layerGroup().addTo(mymap);
  
  let w_marker0 = L.marker([result["wikiData"][0]["lat"], result["wikiData"][0]["lng"]], {icon: w_icon}).addTo(w_markerGroup);
  let w_marker1 = L.marker([result["wikiData"][1]["lat"], result["wikiData"][1]["lng"]], {icon: w_icon}).addTo(w_markerGroup);
  let w_marker2 = L.marker([result["wikiData"][2]["lat"], result["wikiData"][2]["lng"]], {icon: w_icon}).addTo(w_markerGroup);
  let w_marker3 = L.marker([result["wikiData"][3]["lat"], result["wikiData"][3]["lng"]], {icon: w_icon}).addTo(w_markerGroup);
  let w_marker4 = L.marker([result["wikiData"][4]["lat"], result["wikiData"][4]["lng"]], {icon: w_icon}).addTo(w_markerGroup);

  w_marker0.on('click', function(){
    this.bindPopup();
    this._popup.setContent(
      "<h6>" + result["wikiData"][0]["title"] + "</h6><br>" +
      result["wikiData"][0]["summary"] + "<br><br>" +
      "url: " + result["wikiData"][0]["wikipediaUrl"]
      );
  })

  w_marker1.on('click', function(){
    this.bindPopup();
    this._popup.setContent(
      "<h6>" + result["wikiData"][1]["title"] + "</h6><br>" +
      result["wikiData"][1]["summary"] + "<br><br>" +
      "url: " + result["wikiData"][1]["wikipediaUrl"]
      );
  })

  w_marker2.on('click', function(){
    this.bindPopup();
    this._popup.setContent(
      "<h6>" + result["wikiData"][2]["title"] + "</h6><br>" +
      result["wikiData"][2]["summary"] + "<br><br>" +
      "url: " + result["wikiData"][2]["wikipediaUrl"]
      );
  })

  w_marker3.on('click', function(){
    this.bindPopup();
    this._popup.setContent(
      "<h6>" + result["wikiData"][3]["title"] + "</h6><br>" +
      result["wikiData"][3]["summary"] + "<br><br>" +
      "url: " + result["wikiData"][3]["wikipediaUrl"]
      );
  })

  w_marker4.on('click', function(){
    this.bindPopup();
    this._popup.setContent(
      "<h6>" + result["wikiData"][4]["title"] + "</h6><br>" +
      result["wikiData"][4]["summary"] + "<br><br>" +
      "url: " + result["wikiData"][4]["wikipediaUrl"]
      );
  })
  
}

/*function setPointsOfInterest(result) {
  const p_icon = L.icon({
    iconUrl: 'media/svg/poi.svg',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -25]
  })
  
  let p_marker0 = L.marker([result["poiData"][0]["lat"], result["poiData"][0]["lng"]], {icon: p_icon}).addTo(mymap);
  let p_marker1 = L.marker([result["poiData"][1]["lat"], result["poiData"][1]["lng"]], {icon: p_icon}).addTo(mymap);

  p_marker0.on('click', function(){
    this.bindPopup();
    this._popup.setContent(
      "<h6>" + result["poiData"][0]["name"] + "</h6><br>" +
      result["poiData"][0]["typeClass"] + "<br><br>" +
      result["poiData"][0]["typeName"]
      );
  })

  p_marker1.on('click', function(){
    this.bindPopup();
    this._popup.setContent(
      "<h6>" + result["poiData"][1]["name"] + "</h6><br>" +
      result["poiData"][1]["typeClass"] + "<br><br>" +
      result["poiData"][1]["typeName"]
      );
  })
} */

// SELECT COUNTRY FROM DROP-DOWN MENU

$('#selectCountry').change(function(){
  $.ajax({
      url: "php/getCountryInfo.php",
      type: "POST",
      dataType: "json",
      data: {
          country: $("#selectCountry").val(),
          lang: "en"
      },
      success: function(result){
          console.log(result);
          if(result.status.code == 200){
            setCountryInfo(result);
            getExchangeRate();
            getCurrencyName();
            getCovidData();
            getCountryBorders();
            getWeather()
            getImages();
            setCovidGraph(result);
          }
      },
      error: function(jqXHR, textStatus, errorThrown){
          alert(`${textStatus} error in country info`);
      }
  });
});


// HANDLES MAP CLICK EVENT

function onMapClick(e) {
  
  $.ajax({
    url: "php/getCountryCode.php",
    type: "POST",
    dataType: "json",
    data: {
      lat: e["latlng"]["lat"],
      lng: e["latlng"]["lng"],
    },
    success: function (result) {
      
      console.log(result);
      $.ajax({
        url: "php/getCountryInfo.php",
        type: "POST",
        dataType: "json",
        data: {
          country: result["data"],
          lang: "en",
        },
        success: function (result) {
          
          console.log(result);
          if (result.status.code == 200) {
            setCountryInfo(result);
            getExchangeRate();
            getCurrencyName();
            getCovidData();
            getCountryBorders();
            getWeather()
            getImages();
            setCovidGraph(result);
          }
        },
        error: function (jqXHR, textStatus, errorThrown) {
          alert(`Please select a country!`);
        },
      });
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert(`${textStatus} error in country info`);
    },
  });
}

mymap.on("click", onMapClick);

// GET GEOJSON COUNTRY BORDERS

function getCountryBorders() {
  $.ajax({
    url: "php/getCountryBorders.php",
    type: "POST",
    dataType: "json",
    success: function (result) {
      console.log(result);
      let countryBorderArr = result.data;
      let countryBorderObj = countryBorderArr.find(
        (country) => country.properties.iso_a3 === countryCodeIso3
      );

      if(bounds != undefined){
        mymap.removeLayer(bounds);
      }
      bounds = L.geoJSON(countryBorderObj, { style: polyStyle }).addTo(mymap);
      mymap.flyToBounds(bounds.getBounds(), {
        animate: true,
        duration: 2,
        maxZoom: 5.5,
      })

      getEarthquakes();
      getWiki();
      //getCityInfo();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert(`Error in CountryBorders: ${textStatus} ${errorThrown} ${jqXHR}`);
    },
  });
}

// GET WIKIPEDIA DATA

function getWiki() {
  $.ajax({
    url: "php/getWiki.php",
    type: "POST",
    dataType: "json",
    data: {
      north: north,
      south: south,
      east: east,
      west: west
    },
    success: function (result) {
      console.log(result);
      setWikiInfo(result);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert(`${textStatus} error in getWiki`);
    },
  });
} 

// GET EXCHANGE RATE DATA

function getExchangeRate() {
  $.ajax({
    url: "php/getExchangeRate.php",
    type: "POST",
    dataType: "json",
    data: {
      currency: currencyCode,
    },
    success: function (result) {
      console.log(result);
      let exchangeRatesObject = result.currencyExchangeRates.rates;
      exchangeRate = exchangeRatesObject[currencyCode];
      roundedExchangeRate = Math.round(exchangeRate * 100) / 10;
      currencyBase = result.currencyExchangeRates.base;
      currencyTimestamp = result.currencyExchangeRates.timestamp;
      setCurrencyInfo();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert(`Error in getExchangeRate: ${textStatus} ${errorThrown} ${jqXHR}`);
    },
  });
}

// GET CURRENCY NAMES

function getCurrencyName() {
  $.ajax({
    url: "php/getCurrencies.php",
    type: "POST",
    dataType: "json",
    data: {
      currency: currencyCode,
    },
    success: function (result) {
      console.log(result);
      let currencyNameObject = result.currencyName;
      currencyName = currencyNameObject[currencyCode];
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert(`Error in getCurrencyName: ${textStatus} ${errorThrown} ${jqXHR}`);
    },
  });
}

// GET COVID DATA

function getCovidData() {
  $.ajax({
    url: "php/getCovidData.php",
    type: "POST",
    dataType: "json",
    success: function (result) {
      console.log(result);
      let covidArray = result.covidData;
      let covidObject = covidArray.find(
        (country) => country.CountryCode === countryCodeIso2
      );
      setCovidData(covidObject);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert(`Error in getExchangeRate: ${textStatus} ${errorThrown} ${jqXHR}`);
    },
  });
}

// GET WEATHER FORECAST

function getWeather() {
  $.ajax({
    url: "php/getWeather.php",
    type: "POST",
    dataType: "json",
    data: {
      city: capital,
      country: countryCodeIso2,
    },
    success: function (weatherArr) {
      console.log(weatherArr);
      setWeather(weatherArr);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(`Error in getWeather: ${textStatus} ${errorThrown} ${jqXHR}`);
      alert('Weather data unavailable!');
    },
  });
}

// GET EARTHQUAKES

function getEarthquakes() {
  $.ajax({
    url: "php/getEarthquakes.php",
    type: "POST",
    dataType: "json",
    data: {
      north: north,
      south: south,
      east: east,
      west: west
    },
    success: function (result) {
      console.log(result);
      setEarthquakes(result);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(`Error in getEarthquakes: ${textStatus} ${errorThrown} ${jqXHR}`);
      alert('Earthquake data unavailable!')
    },
  });
}

/*function getCityInfo() {
  $.ajax({
    url: "php/getCityInfo.php",
    type: "POST",
    dataType: "json",
    data: {
      city: capital,
      ISO_A2: countryCodeIso2
    },
    success: function (result) {
      console.log(result);
      cityLat = result["cityData"][0]["geometry"]["lat"];
      cityLng = result["cityData"][0]["geometry"]["lng"];
      getPointsOfInterest();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log(`${textStatus} error in getCityInfo`);
    },
  });
} 

function getPointsOfInterest() {
  $.ajax({
    url: "php/getPointsofInt.php",
    type: "POST",
    dataType: "json",
    data: {
      lat: cityLat,
      lng: cityLng
    },
    success: function (result) {
      console.log(result);
      setPointsOfInterest(result);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert(`Error in getPOIs: ${textStatus} ${errorThrown} ${jqXHR}`);
    },
  });
} */

function getImages() {
  $.ajax({
    url: "php/getImages.php",
    type: "POST",
    dataType: "json",
    data: {
      country: country
    },
    success: function (result) {
      console.log(result);
      setImages(result);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert(`Error in getImages: ${textStatus} ${errorThrown} ${jqXHR}`);
    },
  });
}

// BUTTONS

function showLocation() {
  var info = document.getElementById('info')
  var visibility = info.style.visibility;
  info.style.visibility = visibility == 'hidden' ? 'visible' : 'hidden';
}

function closeInfo() {
  showLocation()
}

function showCurrency() {
  var info = document.getElementById('info2')
  var visibility = info.style.visibility;
  info.style.visibility = visibility == 'hidden' ? 'visible' : 'hidden';
}

function closeInfo2() {
  showCurrency()
}

function showCovid() {
  var info = document.getElementById('info3')
  var visibility = info.style.visibility;
  info.style.visibility = visibility == 'hidden' ? 'visible' : 'hidden';
}

function closeInfo3() {
  showCovid()
}

function showGraph() {
  var info = document.getElementById('info4')
  var visibility = info.style.visibility;
  info.style.visibility = visibility == 'hidden' ? 'visible' : 'hidden';
}

function closeInfo4() {
  showGraph()
}

function showWiki() {
  var info = document.getElementById('info5')
  var visibility = info.style.visibility;
  info.style.visibility = visibility == 'hidden' ? 'visible' : 'hidden';
}

function closeInfo5() {
  showWiki()
}

function showImages() {
  var info = document.getElementById('info6')
  var visibility = info.style.visibility;
  info.style.visibility = visibility == 'hidden' ? 'visible' : 'hidden';
}

function closeInfo6() {
  showImages()
}

// COVID GRAPH 

let covidstatus = [
  {title: 'Death Toll', slug: 'deaths', backgroundColor: '#ffcf9f', borderColor: '#ff9f40'}, 
  {title: 'Recoveries', slug: 'recovered', backgroundColor: '#a4dfdf', borderColor: '#4bc0c0'},
  {title: 'Confirmed Infections', slug: 'confirmed', backgroundColor: '#ffb0c1', borderColor: '#ff6384'}
];

let mychart = myChart();

function setCovidGraph(result) {
  let countryCovid = result["data"][0]["countryName"];
  countryData(countryCovid, covidstatus, mychart);
};

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
  let list = [];
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
  let myBasicChart = new Chart('myChart', {
      type: 'line',
      data: {
          labels: [],
          datasets: dataSets(covidstatus)
      },
      options: {
    responsive: true,
    title: {
      display: true,
      text: 'COVID-19 Time Series Graph (Last 30 Days)'
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
  let sets = [];
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