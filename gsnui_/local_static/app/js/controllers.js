
var phonecatApp = angular.module('phonecatApp', ['ngMap']);


phonecatApp.controller('PhoneListCtrl', function ($scope, $http) {
  $http.get('http://localhost:8000/ajax/sensors/').success(function(data) {
    $scope.phones = data.features;
  });

$scope.orderProp = 'name_vs';
});

