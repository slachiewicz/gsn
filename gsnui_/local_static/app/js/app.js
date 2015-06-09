// app.js
var routerApp = angular.module('routerApp', ['ui.router', 'uiGmapgoogle-maps', 'ui.bootstrap', 'highcharts-ng']);


var topFive = [];
var myHTML = null;
var coordinate = null;


var sensor1GraphData = [];
var sensor2GraphData = [];
var sensor3GraphData = [];
var sensor4GraphData = [];
var sensor5GraphData = [];

var sensor1GraphName = null;
var sensor2GraphName = null;
var sensor3GraphName = null;
var sensor4GraphName = null;
var sensor5GraphName = null;



/*function refreshShopCart() {

    document.getElementById("top1").innerHTML = topFive[0];
    document.getElementById("top2").innerHTML = topFive[1];
    document.getElementById("top3").innerHTML = topFive[2];
    document.getElementById("top4").innerHTML = topFive[3];
    document.getElementById("top5").innerHTML = topFive[4];

}*/
function addToSensorArray (valueInput2) {

                   topFive.push(valueInput2);
                   alert("Your dashboard:   " +  "1. "+topFive[0]+ "  2. "+topFive[1]+"  3. "+topFive[2]+ "  4. "+topFive[3]+ "  5. "+topFive[4]);
                   console.log("Top 5 "+ topFive);
                    
            }


routerApp.config(function($stateProvider, $urlRouterProvider) {
    
    $urlRouterProvider.otherwise('/home');
    
    $stateProvider

    
    .state('home', {
        url: '/home',
        templateUrl: 'partial-home.html'
    })

    
    .state('filtering', {
        url: '/filtering',
        templateUrl: 'partial-filter-list.html'

    })
        
    
    .state('map', {
        url: '/map',
        templateUrl: 'partial-map.html'       
        
    })

    .state('dashboard', {
        url: '/dashboard',
        templateUrl: 'partial-dashboard.html'
    })

    .state('graph', {
        url: '/graph',
        templateUrl: 'partial-graph.html'
    })

    ;

    

});

routerApp.directive('myMap', function() {


    var infowindow = new google.maps.InfoWindow();
    // directive link function
    var link = function(scope, element, attrs) {
        var map, infoWindow;
        var markers = [];
        
        // map config
        var mapOptions = {
            center: new google.maps.LatLng(46.5, 8.5),
            zoom: 8,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scrollwheel: true
        };

        
        
        
        
        // init the map
        function initMap() {
            if (map === void 0) {
                map = new google.maps.Map(element[0], mapOptions);
                map.data.loadGeoJson('http://localhost:8000/ajax/sensors/');
            }


            map.data.addListener('click', function(event) {
                      myHTML = event.feature.getProperty("vs_name");
                      coordinate = event.feature.getGeometry().get(); 
                  infowindow.setContent("<div style='width:190px; height:110px; text-align: center;'>"+"<div class='row'> Name: "+myHTML+"</div><div class='row'>Coordinates: "+coordinate+"</div><div class='row'><br></div><button class='btn btn-default' type='button' onclick='addToSensorArray(myHTML)'>Add to dashboard</button></div>");
                      infowindow.setPosition(event.feature.getGeometry().get());
                  infowindow.setOptions({pixelOffset: new google.maps.Size(0,-30)});
                      infowindow.open(map);
            }); 



        }    
        
        
        
        // show the map 
        initMap();
        
        // Create the search box and link it to the UI element.
          var input = /** @type {HTMLInputElement} */(
              document.getElementById('pac-input'));
          map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

          
            };
    
    return {
        restrict: 'A',
        template: '<div id="gmaps"></div>',
        replace: true,
        link: link
    };
});




routerApp.service("sensorService", function ($http, $q){

    var defered = $q.defer();
    $http.get('http://localhost:8000/ajax/sensors/').then(function(data) {
    
        defered.resolve(data);
    });

    this.getSensors = function () {

        return defered.promise;
    }
});






routerApp.controller('DetailsCtrl', function ($scope, $http) {

    $scope.addValueFunc = function (valueInput) {

                   detailName =  valueInput;
            console.log("ime vrednosti "+valueInput);
            };

    $scope.addToSensorArray = function (valueInput2) {

                   topFive.push(valueInput2);
                   console.log("Top 5 "+ topFive);
                    
            }



            
            console.log("ime detalja "+ detailName);


    $http.get(
      'http://localhost:8000/ajax/sensors/'+detailName+'/?from=2015-04-14T08:30:04&to=2015-04-15T00:00:00'
    ).success(function(data){
      $scope.details = data.features; 
    })

/*
  var promise = detailsService.getSensors();
  promise.then(function(data) {

    $scope.details = data.data.features;
    console.log($scope.details);

  });*/

$scope.orderProp = 'name_vs';
});

routerApp.controller('DashboardCtrl', function ($scope, sensorService, $http) {


//Define variables for each sensor, preparing them for graph. Reordering JSON data.
    

    $scope.item1;
    $scope.item2;
    $scope.item3;
    $scope.item4;
    $scope.item5;

    
    $http.get(
      'http://localhost:8000/ajax/sensors/'
    ).success(function(data){
      $scope.sensors = data.features; 
      
    })

    $scope.fiveSensors = [];

    $scope.loadSensors = function () {

            //First sensor, loading and preparing data for graph. Adding data to arrays (scope objects) which will be used later.
            for( i= 0; i < $scope.sensors.length; ++i){
                if ($scope.sensors[i].properties.vs_name == topFive[0]){

                        $http.get(
                              "http://localhost:8000/ajax/sensors/"+topFive[0]+"/data?from=2015-04-14T08:30:04&to=2015-04-15T00:00:00"
                            ).success(function(data){
                              $scope.item1 = data.properties;
                              console.log("Prvi u nizu: "+$scope.item1.values[0][0]);
                              $scope.fiveSensors.push($scope.item1);
                              sensor1GraphName = $scope.item1.vs_name;
                            })

                    
                }
            }

            


            for( i= 0; i < $scope.sensors.length; ++i){
                        if ($scope.sensors[i].properties.vs_name == topFive[1]){
                            $scope.fiveSensors.push($scope.sensors[i]);

                            $http.get(
                              "http://localhost:8000/ajax/sensors/"+topFive[1]+"/data?from=2015-04-14T08:30:04&to=2015-04-15T00:00:00"
                            ).success(function(data){
                              $scope.item2 = data.properties;
                              console.log("Drugi u nizu: "+$scope.item2.values[0][0]);
                              $scope.fiveSensors.push($scope.item2);
                              sensor2GraphName = $scope.item2.vs_name;
                            })
                            
                        }
                    }

            for( i= 0; i < $scope.sensors.length; ++i){
                        if ($scope.sensors[i].properties.vs_name == topFive[2]){
                            $scope.fiveSensors.push($scope.sensors[i]);

                            $http.get(
                              "http://localhost:8000/ajax/sensors/"+topFive[2]+"/data?from=2015-04-14T08:30:04&to=2015-04-15T00:00:00"
                            ).success(function(data){
                              $scope.item3 = data.properties;
                              console.log("Treci u nizu: "+$scope.item3.values[0][0]);
                              $scope.fiveSensors.push($scope.item3);
                              sensor3GraphName = $scope.item3.vs_name;
                            })
                            
                        }
                    }

            for( i= 0; i < $scope.sensors.length; ++i){
                        if ($scope.sensors[i].properties.vs_name == topFive[3]){
                            $scope.fiveSensors.push($scope.sensors[i]);

                            $http.get(
                              "http://localhost:8000/ajax/sensors/"+topFive[3]+"/data?from=2015-04-14T08:30:04&to=2015-04-15T00:00:00"
                            ).success(function(data){
                              $scope.item4 = data.properties;
                              console.log("Prvi u nizu: "+$scope.item4.values[0][0]);
                              $scope.fiveSensors.push($scope.item4);
                              sensor4GraphName = $scope.item4.vs_name;
                            })
                            
                        }
                    }

            for( i= 0; i < $scope.sensors.length; ++i){
                        if ($scope.sensors[i].properties.vs_name == topFive[4]){
                            $scope.fiveSensors.push($scope.sensors[i]);

                            $http.get(
                              "http://localhost:8000/ajax/sensors/"+topFive[4]+"/data?from=2015-04-14T08:30:04&to=2015-04-15T00:00:00"
                            ).success(function(data){
                              $scope.item5 = data.properties;
                              console.log("Prvi u nizu: "+$scope.item5.values[0][0]);
                              $scope.fiveSensors.push($scope.item5);
                              sensor5GraphName = $scope.item5.vs_name;
                            })
                            
                        }
                    }


    }

    $scope.JSONToCSVConvertor = function() {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    
    
    var array = typeof $scope.item1 != 'object' ? JSON.parse($scope.item1) : $scope.item1;
    var str = '';
     
    for (var i = 0; i < array.length; i++) {
        var line = '';
        for (var index in array[i]) {
            if(line != '') line += ','
         
            line += array[i][index];
        }
 
        str += line + '\r\n';
    }
 
    if (navigator.appName != 'Microsoft Internet Explorer')
    {
        window.open('data:text/csv;charset=utf-8,' + escape(str));
    }
    else
    {
        var popup = window.open('','csv','');
        popup.document.body.innerHTML = '<pre>' + str + '</pre>';
    }  
    }

    //Properties setting from dashboard to graph

    $scope.setTimestamps_1 = function () {
        for( i = 0; i < $scope.item1.values.length; i++){
        sensor1GraphData.push($scope.item1.values[i][0]);
        }
        document.getElementById("firstLabel").value = "Selected timestamps";
    }
    $scope.setVw_1 = function () {
        for( i = 0; i < $scope.item1.values.length; i++){
        sensor1GraphData.push($scope.item1.values[i][1]);
        }
        document.getElementById("firstLabel").value = "Selected vw";
    }
    $scope.setVw_max_1 = function () {
        for( i = 0; i < $scope.item1.values.length; i++){
        sensor1GraphData.push($scope.item1.values[i][2]);
        }
        document.getElementById("firstLabel").value = "Selected vw_max";
    }
    $scope.setDw_1 = function () {
        for( i = 0; i < $scope.item1.values.length; i++){
        sensor1GraphData.push($scope.item1.values[i][3]);
        }
        document.getElementById("firstLabel").value = "Selected dw";
    }
    $scope.setTa_1 = function () {
        for( i = 0; i < $scope.item1.values.length; i++){
        sensor1GraphData.push($scope.item1.values[i][4]);
        }
        document.getElementById("firstLabel").value = "Selected ta";
    }
    $scope.setTimestamps_2 = function () {
        for( i = 0; i < $scope.item2.values.length; i++){
        sensor2GraphData.push($scope.item2.values[i][0]);
        }
        document.getElementById("secondLabel").value = "Selected timestamps";
    }
    $scope.setVw_2 = function () {
        for( i = 0; i < $scope.item2.values.length; i++){
        sensor2GraphData.push($scope.item2.values[i][1]);
        }
        document.getElementById("secondLabel").value = "Selected vw";
    }
    $scope.setVw_max_2 = function () {
        for( i = 0; i < $scope.item2.values.length; i++){
        sensor2GraphData.push($scope.item2.values[i][2]);
        }
        document.getElementById("secondLabel").value = "Selected vw_max";
    }
    $scope.setDw_2 = function () {
        for( i = 0; i < $scope.item2.values.length; i++){
        sensor2GraphData.push($scope.item2.values[i][3]);
        }
        document.getElementById("secondLabel").value = "Selected dw";
    }
    $scope.setTa_2 = function () {
        for( i = 0; i < $scope.item2.values.length; i++){
        sensor2GraphData.push($scope.item2.values[i][4]);
        }
        document.getElementById("secondLabel").value = "Selected ta";
    }
    $scope.setTimestamps_3 = function () {
        for( i = 0; i < $scope.item3.values.length; i++){
        sensor3GraphData.push($scope.item3.values[i][0]);
        }
        document.getElementById("thirdLabel").value = "Selected timestamps";
    }
    $scope.setVw_3 = function () {
        for( i = 0; i < $scope.item3.values.length; i++){
        sensor3GraphData.push($scope.item3.values[i][1]);
        }
        document.getElementById("thirdLabel").value = "Selected vw";
    }
    $scope.setVw_max_3 = function () {
        for( i = 0; i < $scope.item3.values.length; i++){
        sensor3GraphData.push($scope.item3.values[i][2]);
        }
        document.getElementById("thirdLabel").value = "Selected vw_max";
    }
    $scope.setDw_3 = function () {
        for( i = 0; i < $scope.item3.values.length; i++){
        sensor3GraphData.push($scope.item3.values[i][3]);
        }
        document.getElementById("thirdLabel").value = "Selected dw";
    }
    $scope.setTa_3 = function () {
        for( i = 0; i < $scope.item3.values.length; i++){
        sensor3GraphData.push($scope.item3.values[i][4]);
        }
        document.getElementById("thirdLabel").value = "Selected ta";
    }
    $scope.setTimestamps_4 = function () {
        for( i = 0; i < $scope.item4.values.length; i++){
        sensor4GraphData.push($scope.item4.values[i][0]);
        }
        document.getElementById("fourthLabel").value = "Selected timestamps";
    }
    $scope.setVw_4 = function () {
        for( i = 0; i < $scope.item4.values.length; i++){
        sensor4GraphData.push($scope.item4.values[i][1]);
        }
        document.getElementById("fourthLabel").value = "Selected vw";
    }
    $scope.setVw_max_4 = function () {
        for( i = 0; i < $scope.item4.values.length; i++){
        sensor4GraphData.push($scope.item4.values[i][2]);
        }
        document.getElementById("fourthLabel").value = "Selected vw_max";
    }
    $scope.setDw_4 = function () {
        for( i = 0; i < $scope.item2.values.length; i++){
        sensor4GraphData.push($scope.item4.values[i][3]);
        }
        document.getElementById("fourthLabel").value = "Selected dw";
    }
    $scope.setTa_4 = function () {
        for( i = 0; i < $scope.item4.values.length; i++){
        sensor4GraphData.push($scope.item4.values[i][4]);
        }
        document.getElementById("fourthLabel").value = "Selected ta";
    }
    $scope.setTimestamps_5 = function () {
        for( i = 0; i < $scope.item5.values.length; i++){
        sensor5GraphData.push($scope.item5.values[i][0]);
        }
        document.getElementById("fifthLabel").value = "Selected timestamps";
    }
    $scope.setVw_5 = function () {
        for( i = 0; i < $scope.item5.values.length; i++){
        sensor5GraphData.push($scope.item5.values[i][1]);
        }
        document.getElementById("fifthLabel").value = "Selected vw";
    }
    $scope.setVw_max_5 = function () {
        for( i = 0; i < $scope.item5.values.length; i++){
        sensor5GraphData.push($scope.item5.values[i][2]);
        }
        document.getElementById("fifthLabel").value = "Selected vw_max";
    }
    $scope.setDw_5 = function () {
        for( i = 0; i < $scope.item5.values.length; i++){
        sensor5GraphData.push($scope.item5.values[i][3]);
        }
        document.getElementById("fifthLabel").value = "Selected dw";
    }
    $scope.setTa_5 = function () {
        for( i = 0; i < $scope.item5.values.length; i++){
        sensor5GraphData.push($scope.item5.values[i][4]);
        }
        document.getElementById("fifthLabel").value = "Selected ta";
    }





   


});


routerApp.controller('GraphCtrl', function ($scope){


   $scope.chartTypes = [
    {"id": "line", "title": "Line"},
    {"id": "spline", "title": "Smooth line"},
    {"id": "area", "title": "Area"},
    {"id": "areaspline", "title": "Smooth area"},
    {"id": "column", "title": "Column"},
    {"id": "bar", "title": "Bar"},
    {"id": "pie", "title": "Pie"},
    {"id": "scatter", "title": "Scatter"}
  ];

  $scope.dashStyles = [
    {"id": "Solid", "title": "Solid"},
    {"id": "ShortDash", "title": "ShortDash"},
    {"id": "ShortDot", "title": "ShortDot"},
    {"id": "ShortDashDot", "title": "ShortDashDot"},
    {"id": "ShortDashDotDot", "title": "ShortDashDotDot"},
    {"id": "Dot", "title": "Dot"},
    {"id": "Dash", "title": "Dash"},
    {"id": "LongDash", "title": "LongDash"},
    {"id": "DashDot", "title": "DashDot"},
    {"id": "LongDashDot", "title": "LongDashDot"},
    {"id": "LongDashDotDot", "title": "LongDashDotDot"}
  ];

  $scope.chartSeries = [
    {"name": sensor1GraphName, "data": sensor1GraphData},
    {"name": sensor2GraphName, "data": sensor2GraphData, connectNulls: true},
    {"name": sensor3GraphName, "data": sensor3GraphData, type: "column"},
    {"name": sensor4GraphName, "data": sensor4GraphData, type: "column"}
  ];

  $scope.chartStack = [
    {"id": '', "title": "No"},
    {"id": "normal", "title": "Normal"},
    {"id": "percent", "title": "Percent"}
  ];

  $scope.addPoints = function () {
    var seriesArray = $scope.chartConfig.series;
    var rndIdx = Math.floor(Math.random() * seriesArray.length);
    seriesArray[rndIdx].data = seriesArray[rndIdx].data.concat([1, 10, 20])
  };

  $scope.addSeries = function () {
    var rnd = []
    for (var i = 0; i < 10; i++) {
      rnd.push(Math.floor(Math.random() * 20) + 1)
    }
    $scope.chartConfig.series.push({
      data: rnd
    })
  }

  $scope.removeRandomSeries = function () {
    var seriesArray = $scope.chartConfig.series;
    var rndIdx = Math.floor(Math.random() * seriesArray.length);
    seriesArray.splice(rndIdx, 1)
  }

  $scope.removeSeries = function (id) {
    var seriesArray = $scope.chartConfig.series;
    seriesArray.splice(id, 1)
  }

  $scope.toggleHighCharts = function () {
    this.chartConfig.useHighStocks = !this.chartConfig.useHighStocks
  }

  $scope.replaceAllSeries = function () {
    var data = [
      { name: "first", data: [10] },
      { name: "second", data: [3] },
      { name: "third", data: [13] }
    ];
    $scope.chartConfig.series = data;
  };

  $scope.chartConfig = {
    options: {
      chart: {
        type: 'areaspline'
      },
      plotOptions: {
        series: {
          stacking: ''
        }
      }
    },
    series: $scope.chartSeries,
    title: {
      text: 'Sensor chart'
    },
    credits: {
      enabled: true
    },
    loading: false,
    size: {}
  }

  $scope.reflow = function () {
    $scope.$broadcast('highchartsng.reflow');
  };






});



routerApp.controller('DemoCtrl', function ($scope, $filter, sensorService, $modal, $log) {
        

        //Controller part

        var sortingOrder = 'vs_name';
        // init
        $scope.sortingOrder = sortingOrder;
        $scope.reverse = false;
        $scope.filteredItems = [];
        $scope.groupedItems = [];
        $scope.itemsPerPage = 5;
        $scope.pagedItems = [];
        $scope.currentPage = 0;
        /*$scope.items = [];*/
        

        var promise = sensorService.getSensors();
          promise.then(function(data) {

            $scope.sensors = data.data.features;
            /*$scope.items = data.data.features;*/
            

          });

        //Modal part

        

          $scope.animationsEnabled = true;

          $scope.open = function (element) {

            for( i= 0; i < $scope.sensors.length; ++i){
                if ($scope.sensors[i].properties.vs_name == element){
                    $scope.first = $scope.sensors[i];

                    console.log("Sensor: "+$scope.sensors[i].properties.vs_name);
                    
                }
            }
            
           

            var modalInstance = $modal.open({
              animation: $scope.animationsEnabled,
              templateUrl: 'myModalContent.html',
              controller: 'ModalInstanceCtrl',
              resolve: {
                items: function () {
                  console.log("Prva tura: "+$scope.first);
                  return $scope.first;

                }
              }
            });

            modalInstance.result.then(function (selectedItem) {
              $scope.selected = selectedItem;
            }, function () {
              $log.info('Modal dismissed at: ' + new Date());
            });
          };

          $scope.toggleAnimation = function () {
            $scope.animationsEnabled = !$scope.animationsEnabled;
          };


});




routerApp.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

  $scope.items = items;
  
  $scope.selected = {
    item: $scope.items[0]
  };


  $scope.ok = function (element) {
    topFive.push(element);
    alert("Your dashboard:   " +  "1. "+topFive[0]+ "  2. "+topFive[1]+"  3. "+topFive[2]+ "  4. "+topFive[3]+ "  5. "+topFive[4]);
    $modalInstance.close($scope.selected.item);
    console.log("Top five: "+ topFive);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});

//DemoCtrl.$inject = ['$scope', '$filter'];


