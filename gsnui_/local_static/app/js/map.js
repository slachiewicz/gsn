// This example adds a search box to a map, using the Google Place Autocomplete
// feature. People can enter geographical searches. The search box will return a
// pick list containing a mix of places and predicted search terms.
  
  
  var map = new google.maps.Map(document.getElementById('map-canvas'), {
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

function initialize() {

//Creating variables
  var jsonObject = null;
  var markerCluster = null;
  var markers = [];
  var latitude = 41.5013;
  var longitude = -87.4105;
  var displayText;
  var displayDetail;

  

// Focus on NYC by default
  var defaultBounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(41.5513, -87.4605),
      new google.maps.LatLng(41.4513, -86.4605));
  map.fitBounds(defaultBounds);


  

  /*var json = (function () { 
            var json = null; 
            $.ajax({ 
                'async': false, 
                'global': false, 
                'url': "http://137.116.214.6:8080/location/38.405172/-101.198570", 
                'dataType': "json", 
                'success': function (data) {
                     json = data; 

                 }
            });

            return json;
        })();
  


  obj = JSON.parse(json);*/
  /*map.data.loadGeoJson('http://137.116.214.6:8080/location/38.405172/-101.198570'); */
  map.data.loadGeoJson('http://localhost:8000/ajax/sensors/'); 

  map.data.addListener('click', function(event) {
    console.log(event.feature.getProperty("name"));
    console.log(event.feature.getProperty("bar"));
    console.log(event.feature.getProperty("temperature"));

    

    $("#span1").text(event.feature.getProperty("name"));
    $("#span2").text(displayDetail);
    $("#span3").text(event.feature.getProperty("temperature").toString());

  });
  
  
  /*map.data.setStyle(styleFeature);*/

//We load the GeoJSON manually and assign it to the variable jsonObject. We then iterate over every single feature to create map markers.
//The resulting marker array is then used as input for cluster analysis, and we set the map bounds as the bounding rectangle of the whole feature collection.

  /*function processJSON(obj) {
    jsonObject = obj;
    for (var i = 0, feature; feature = jsonObject.features[i]; i++) {
      if (feature.geometry) {
        var marker = new google.maps.Marker({
          fid: i,
          position: new google.maps.LatLng(
            feature.geometry.coordinates[1], 
            feature.geometry.coordinates[0]
          )
        });
        bounds.extend(marker.position)
        markers.push(marker);
        google.maps.event.addListener(marker, 'click', function(e) {
          var feature = jsonObject.features[this.fid];
          var infoHtml = "\x3Ch4>" + feature.id + "\x3C/h4>\x3Cul>";
          for (var name in feature.properties) {
            if (feature.properties.hasOwnProperty(name)) {
              infoHtml = infoHtml + "\x3Cli>\x3Cstrong>" + name + "\x3C/strong>: " + feature.properties[name] + "\x3C/li>";
            }
          }
          infoHtml = infoHtml + "\x3C/ul>";
          infowindow.setContent(infoHtml);
          infowindow.open(googleMap, this);
        });
      }
    }
    markerCluster = new MarkerClusterer(googleMap, markers);
    googleMap.fitBounds(bounds);
  }*/


  // ==== CODE FOR THE SEARCH BOX ==== 

  // Create the search box and link it to the UI element.
  var input = /** @type {HTMLInputElement} */(
      document.getElementById('pac-input'));
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  var searchBox = new google.maps.places.SearchBox(
    /** @type {HTMLInputElement} */(input));

  // Listen for the event fired when the user selects an item from the
  // pick list. Retrieve the matching places for that item.
  google.maps.event.addListener(searchBox, 'places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }
    for (var i = 0, marker; marker = markers[i]; i++) {
      marker.setMap(null);
    }



  markers = [];
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0, place; place = places[i]; i++) {
      var image = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      var marker = new google.maps.Marker({
        map: map,
        icon: image,
        title: place.name,
        position: place.geometry.location
      });

      markers.push(marker);

      latitude = place.geometry.location.lat();
      longitude = place.geometry.location.lng();
      console.log(latitude);
      console.log(longitude);
        
      map.data.forEach(function(feature) {
        //If you want, check here for some constraints.
        map.data.remove(feature);

        });

      map.data.loadGeoJson('http://137.116.214.6:8080/location/41.5013/-87.410'); 


      bounds.extend(place.geometry.location);
    }

    map.fitBounds(bounds);
  });


  


  // Bias the SearchBox results towards places that are within the bounds of the
  // current map's viewport.
  google.maps.event.addListener(map, 'bounds_changed', function() {
    var bounds = map.getBounds();
    searchBox.setBounds(bounds);
  });
}

  // ==== CODE FOR THE SEARCH BOX - END ==== 


/*end google code*/



//Not working (to re focus the map on the initzil position by clicking on the button)
function setMyPosition(){

//var map = new google.maps.Map(document.getElementById('map-canvas'));

if (navigator.geolocation)
  var watchId = navigator.geolocation.watchPosition(successCallback,
                            null,
                            {enableHighAccuracy:true});
else
  alert("Your browser can't display your current location");   
 
function successCallback(position){
  map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude), 13);
  
  var myPos = new google.maps.Marker({
    position: new google.maps.LatLng(new google.maps.LatLng(position.coords.latitude, position.coords.longitude)),
    map: map,
    animation: google.maps.Animation.DROP,
    title: 'You\'re here ! '
  });
}

  console.log('currentPosBTN_pushed');

}






    /*function setMarkers(center, radius, map) {
        var json = (function () { 
            var json = null; 
            $.ajax({ 
                'async': false, 
                'global': false, 
                'url': "http://137.116.214.6:8080/location/"+position.coords.latitude+"/"+position.coords.longitude, 
                'dataType': "json", 
                'success': function (data) {
                     json = data; 

                 }
            });

            return json;
        })();

        var circle = new google.maps.Circle({
                strokeColor: '#000000',
                strokeOpacity: 0.25,
                strokeWeight: 1.0,
                fillColor: '#ffffff',
                fillOpacity: 0.1,
                clickable: false,
                map: map,
                center: center,
                radius: radius
            });
        var bounds = circle.getBounds();

        //loop between each of the json elements
        for (var i = 0, length = json.length; i < length; i++) {
            var data = json[i],
            latLng = new google.maps.LatLng(data.lat, data.lng); 


            if(bounds.contains(latLng)) {
                // Creating a marker and putting it on the map
                var marker = new google.maps.Marker({
                    position: latLng,
                    map: map,
                    icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                    title: data.name
                });
                infoBox(map, marker, data);
            }
        }

        circle.bindTo('center', marker, 'position');
    }*/





    /*function infoBox(map, marker, data) {
        var infoWindow = new google.maps.InfoWindow();
        // Attaching a click event to the current marker
        google.maps.event.addListener(marker, "click", function(e) {
            infoWindow.setContent(data.content);
            infoWindow.open(map, marker);
        });

        // Creating a closure to retain the correct data 
        // Note how I pass the current data in the loop into the closure (marker, data)
        (function(marker, data) {
          // Attaching a click event to the current marker
          google.maps.event.addListener(marker, "click", function(e) {
            infoWindow.setContent(data.content);
            infoWindow.open(map, marker);
          });
        })(marker, data);
    }*/

//FILTER FUNCTIONS
    function setAll() { 

        function styleFeature(feature) {

          var showRow = true;

          return {
            visible: showRow
          };

        }
        
        map.data.setStyle(styleFeature);

    }

    function setSport() { 

        function styleFeature(feature) {

          var showRow = true;
            if (feature.getProperty('sport') == "None") {
              showRow = false;
            }

          return {
            visible: showRow
          };

        }
        
        map.data.setStyle(styleFeature);

    }


    function setNightlife() { 

        function styleFeature(feature) {

          var showRow = true;
            if (feature.getProperty('nightlife') == "None") {
              showRow = false;
            }

          return {
            visible: showRow
          };

        }
        
        map.data.setStyle(styleFeature);

    }

    function setTourism() { 

        function styleFeature(feature) {

          var showRow = true;
            if (feature.getProperty('tourism') == "None") {
              showRow = false;
            }

          return {
            visible: showRow
          };

        }
        
        map.data.setStyle(styleFeature);

    }

    function setCultural() { 

        function styleFeature(feature) {

          var showRow = true;
            if (feature.getProperty('cultural') == "None") {
              showRow = false;
            }

          return {
            visible: showRow
          };

        }
        
        map.data.setStyle(styleFeature);

    }

    function setParks() { 

        function styleFeature(feature) {

          var showRow = true;
            if (feature.getProperty('parks') == "None") {
              showRow = false;
            }

          return {
            visible: showRow
          };

        }
        
        map.data.setStyle(styleFeature);

    }

    function setLeisure() { 

        function styleFeature(feature) {

          var showRow = true;
            if (feature.getProperty('leisure') == "None") {
              showRow = false;
            }

          return {
            visible: showRow
          };

        }
        
        map.data.setStyle(styleFeature);

    }






google.maps.event.addDomListener(window, 'load', initialize);