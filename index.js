// GLOBAL VARIABLES //

let lng = 0;
let lat = 0;
let area = 0;
let country = "";
let capital = "";
let countryCodeIso3 = "";
let countryCodeIso2 = "";
let bounds;
let geoJsonBorder;
let userLng = 0;
let userLat = 0;

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

// GEOLOCATION

  mymap.locate({setView: true, maxZoom: 5.5});

  function onLocationFound(e) {

    let radius = e.accuracy;

    L.marker(e.latlng).addTo(mymap)

    L.circle(e.latlng, radius).addTo(mymap); 

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
              //getExchangeRate();
              //getCurrencyName();
              getCovidData();
              getCountryBorders();
              getWeather()
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
  "Light (click for weather)": otm,
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

function setWikiInfo(result) {
  $("#wikiTitle").html(" " + result["wikiData"][0]["title"]);
  $("#wikiSummary").html(" " + result["wikiData"][0]["summary"]);
  $("#wikiFeature").html(" " + result["wikiData"][0]["feature"]);
  $("#wikiDistance").html(" " + result["wikiData"][0]["distance"]);
  $("#wikiUrl").html(" " + result["wikiData"][0]["wikipediaUrl"]);
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
            //getExchangeRate();
            //getCurrencyName();
            getCovidData();
            getCountryBorders();
            getWeather()
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
            //getExchangeRate();
            //getCurrencyName();
            getCovidData();
            getCountryBorders();
            getWeather()
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
        duration: 2.5,
        maxZoom: 5.5,
      });
      
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert(`Error in CountryBorders: ${textStatus} ${errorThrown} ${jqXHR}`);
    },
  });
}

// GET WIKIPEDIA DATA

/*function getWiki(e) {
  $.ajax({
    url: "php/getWiki.php",
    type: "POST",
    dataType: "json",
    data: {
      lat: e["latlng"]["lat"],
      lng: e["latlng"]["lng"],
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

mymap.on("click", getWiki); */

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
      alert(`Error in getWeather: ${textStatus} ${errorThrown} ${jqXHR}`);
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



