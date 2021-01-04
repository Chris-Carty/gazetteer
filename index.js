// PRELOADER

$(window).on("load", function () {
  if ($("#preloader").length) {
    $("#preloader")
      .delay(100)
      .fadeOut("slow", function () {
        $(this).remove();
      });
  }
});

// DATETIME

function display_c() {
  var refresh = 1000; // Refresh rate in milli seconds
  mytime = setTimeout("display_ct()", refresh);
}

function display_ct() {
  var x = new Date();
  var x1 = x.getMonth() + 1 + "/" + x.getDate() + "/" + x.getYear();
  x1 = x1 + " - " + x.getHours() + ":" + x.getMinutes() + ":" + x.getSeconds();
  document.getElementById("ct").innerHTML = x1;
  display_c();
}

// MAP CONFIGURATION

var mymap = L.map("mapid").setView([53.330873, -4.921875], 0);

var ggl = new L.Google("SATELLITE");

var url =
    "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png",
  attr =
    'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  otm = new L.TileLayer(url, {
    attribution: attr,
    /*subdomains:"1234"*/
  });

var baseLayers = {
  Light: otm,
  Satellite: ggl,
};

var layersControl = L.control.layers(baseLayers, null, { collapsed: false });

layersControl.addTo(mymap);

mymap.addLayer(otm);

// ADD COUNTRY BORDERS

countriesLayer = L.geoJson(countries, {
  style: countriesStyle,
  onEachFeature: countriesOnEachFeature,
}).addTo(mymap);

// COUNTRY BORDER STYLE FUNCTION

/*function highlightFeature(e) {
  let layer = e.target;
  layer.setStyle({
    fillColor: "#1fbfb8",
    weight: 3,
    opacity: 1,
    color: "#05716c",
    fillOpacity: 0.4,
  });

  if (!L.Browser.ie && !L.Browser.opera) {
    layer.bringToFront();
  }
} */

/*function resetHighlight(e) {
  countriesLayer.resetStyle(e.target);
} */

// VARIABLES

let countriesLayer;
let popup = L.popup();

// OM MAP CLICK FUNCTION

function onClick(e) {
  let layer = e.target;
  layer.setStyle({
    fillColor: "#1fbfb8",
    weight: 3,
    opacity: 1,
    color: "#05716c",
    fillOpacity: 0.4,
  });

  if (!L.Browser.ie && !L.Browser.opera) {
    layer.bringToFront();
  }

  mymap.fitBounds(e.target.getBounds());
  /*
  popup
    .setLatLng(e.latlng)
    .setContent("You clicked the map at " + e.latlng.toString())
    .openOn(mymap); */
}

function countriesOnEachFeature(feature, layer) {
  layer.on({
    click: onClick,
  });
}

// COUNTRY BORDER STYLE FUNCTION (USE FOR COVID COLORS)

function countriesStyle(feature) {
  return {
    fillColor: "#31a8ff",
    weight: 2,
    opacity: 0,
    color: "001e36",
    fillOpacity: 0,
  };
}
/*


// VARIABLES TO UPDATE

var lng = 0;
var lat = 0;
var area = 0;
var country = "";
var capital = "";
var currency = "";
var locationMarker;
var bounds;

 
// COUNTRY INFORMATION

function setCountryInfo(result) {
 /*showInfoBtn();
  $('#continent').html(result['data'][0]['continent']);
  capital = result['data'][0]['capital'];
  currency = result['data'][0]['currencyCode'];
  country = result['data'][0]['isoAlpha3'];
  setCountry(result['data'][0]['countryName'])
  $('#capital').html(capital);
  $('#languages').html(result['data'][0]['languages']);
  $('#population').html(formatPopulation(result['data'][0]['population']));
  lng = (result['data'][0]['north'] + result['data'][0]['south']) / 2;
  lat = (result['data'][0]['east'] + result['data'][0]['west']) / 2;
  $('#area').html(`${formatArea(result['data'][0]['areaInSqKm'])} km<sup>2</sup>`);
  getGeoJson();
  callGeolocation(lng, lat);  

}

*/

/*

//HANDLES COUNTRY SELECTION EVENT

$("#selectCountry").change(function () {
  $.ajax({
    url: "../PHP/getCountryInfo.php",
    type: "POST",
    dataType: "json",
    data: {
      country: $("#selectCountry").val(),
    },
    success: function (result) {
      console.log(result);

      if (result.status.name == "ok") {
        setCountryInfo(result);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      alert(`${textStatus} error in country info`);
    },
  });
});


*/

/*

// info modal button trigger handler
$('#infoModal').on('shown.bs.modal', function () {
  $('#myInput').trigger('focus');
});

function callGeolocation(lng, lat) {
  $.ajax({
      url: "libraries/php/getGeolocation.php",
      type: 'POST',
      dataType: 'json',
      data: {
          q: (lng).toString() + ',' + (lat).toString(),
          lang: 'en'
      },
      success: function(result){

          console.log(result);

          if(result.status.code == 200){
              $('#currency').html(currency);
              getWeatherData();
              getExchangeRateData();
              getISSData();
          }
      },
      error: function(jqXHR, textStatus, errorThrown){
          alert(`${textStatus} error in geolocation`);
      }
  });
}


*/
