// DATETIME

function display_c() {
  const refresh = 1000; // Refresh rate in milli seconds
  mytime = setTimeout("display_ct()", refresh);
}

function display_ct() {
  const x = new Date();
  let x1 = x.getHours() + ":" + x.getMinutes();
  document.getElementById("ct").innerHTML = x1;
  display_c();
}

// GLOBAL VARIABLES //

let lng = 0;
let lat = 0;
let area = 0;
let country = "";
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
  minZoom: 2,
  maxZoom: 15
}).setView([53.330873, -4.921875], 2);

L.control.scale().addTo(mymap);

const url =
    "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
  attr =
    'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  otm = new L.TileLayer(url, {
    attribution: attr,
  });

  // GEOLOCATION

  mymap.locate({setView: true, maxZoom: 3});

  function onLocationFound(e) {

    let radius = e.accuracy;

    L.marker(e.latlng).addTo(mymap)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();

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
              getExchangeRate();
              getCurrencyName();
              getCovidData();
              getCountryBorders();
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

//SET COUNTRY INFO FUNCTION
function setCountryInfo(result) {
  countryCodeIso3 = result["data"][0]["isoAlpha3"];
  countryCodeIso2 = result["data"][0]["countryCode"];
  currencyCode = result["data"][0]["currencyCode"];
  country = result["data"][0]["countryName"];

  // UPDATE HTML COUNTRY INFO
  $("#flag").attr(
    "src",
    "https://www.countryflags.io/" +
      countryCodeIso2.toLowerCase() +
      "/shiny/64.png"
  );
  $("#country").html(" " + country);
  $("#countryCode").html(" " + countryCodeIso3);
  $("#continent").html(" " + result["data"][0]["continentName"]);
  $("#capital").html(" " + result["data"][0]["capital"]);
  $("#population").html(" " + result["data"][0]["population"]);
  $("#languages").html(" " + result["data"][0]["languages"]);
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
  $("#newTotalCases").html(" " + covidObject.NewConfirmed);
  $("#totalCases").html(" " + covidObject.TotalConfirmed);
  $("#covidDeathNew").html(" " + covidObject.NewDeaths);
  $("#covidDeathTotal").html(" " + covidObject.TotalDeaths);
  $("#covidDate").html(" " + covidObject.Date);
  $("#covidSource").html(" JHU Database");

  // COVID DATA GRAPH(OurWorldInData)
  let iFrameLink = "https://ourworldindata.org/grapher/total-deaths-covid-19?country=" + countryCodeIso3;
  document.getElementById('graph').src = iFrameLink;
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
            getExchangeRate();
            getCurrencyName();
            getCovidData();
            getCountryBorders();
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
        duration: 1,
      });
      
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert(`Error in CountryBorders: ${textStatus} ${errorThrown} ${jqXHR}`);
    },
  });
}

// GET WIKIPEDIA DATA

function getWiki(e) {
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

mymap.on("click", getWiki);

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

// GET WEATHER DATA ONCLICK & POP-UP - ALTERNATIVE API METHOD

let popup = L.popup();

//popup function
function onMapClickWeather(e) {
  mymap.fitBounds(e.target.getBounds());

  popup.setLatLng(e.latlng).openOn(mymap);

  //getting json function
  $(document).ready(function () {
    $.ajax({
      url:
        "https://api.openweathermap.org/data/2.5/weather?lat=" +
        e.latlng.lat +
        "&lon=" +
        e.latlng.lng +
        "&appid=36e6a7c2681f29437c9062534508e485",
      dataType: "json",
      success: function (data) {
        // storing json data in variables
        weatherstationname = data.name; // Name of Weatherstation
        weathertime = data.dt; // Time of weatherdata (UTC)
        temperature = data.main.temp; // Kelvin
        temperature_min = data.main.temp_min; // Kelvin
        temperature_max = data.main.temp_max; // Kelvin
        windspeed = data.wind.speed; // Meter per second
        cloudcoverage = data.clouds.all; // Cloudcoverage in %
        weatherconditionstring = data.weather[0].main; // Weatheartype
        weatherconditiondescription = data.weather[0].description; // Weatherdescription
        weatherconditionicon = data.weather[0].icon; // ID of weathericon

        // Converting Unix UTC Time
        let utctimecalc = new Date(weathertime * 1000);
        let months = [
          "01",
          "02",
          "03",
          "04",
          "05",
          "06",
          "07",
          "08",
          "09",
          "10",
          "11",
          "12",
        ];
        let year = utctimecalc.getFullYear();
        let month = months[utctimecalc.getMonth()];
        let date = utctimecalc.getDate();
        let hour = utctimecalc.getHours();
        let min = utctimecalc.getMinutes();
        let sec = utctimecalc.getSeconds();
        let time =
          date + "." + month + "." + year + " " + hour + ":" + min + " Uhr";

        // recalculating
        var weathercondtioniconhtml =
          "http://openweathermap.org/img/w/" + weatherconditionicon + ".png";
        let weathertimenormal = time; // reallocate time var....
        let temperaturecelsius = Math.round((temperature - 273) * 100) / 100; // Converting Kelvin to Celsius
        let windspeedknots = Math.round(windspeed * 1.94 * 100) / 100; // Windspeed from m/s in Knots; Round to 2 decimals
        let windspeedkmh = Math.round(windspeed * 3.6 * 100) / 100; // Windspeed from m/s in km/h; Round to 2 decimals


        //Popup with content
        const fontsizesmall = 1;
        popup.setContent(
            "<img src=" +
            weathercondtioniconhtml +
            "><br>" +
            weatherconditionstring +
            ": " +
            weatherconditiondescription +
            "<br>Temperature: " +
            temperaturecelsius +
            "<br>Cloudcoverage: " +
            cloudcoverage +
            "%<br>Windspeed: " +
            windspeedkmh +
            "<br><br><font size=" +
            fontsizesmall +
            "Source: openweathermap.org<br>Measure time: " +
            weathertimenormal +
            "<br>Weatherstation: " +
            weatherstationname
        );
      },
      error: function () {
        alert("error receiving wind data from openweathermap");
      },
    });
  });
  //getting json function ends here

  //popupfunction ends here
}

//popup
mymap.on("click", onMapClickWeather);



