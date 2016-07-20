var app = angular.module('odin.mapsControllers', []);

function MapViewController($scope, rest) {
  //
  // angular.extend($scope, {
  //       japan: {
  //           lat: 37.26,
  //           lng: 138.86,
  //           zoom: 4
  //       },
  //       defaults: {
  //           scrollWheelZoom: false
  //       }
  //   });

    // Get the countries geojson data from a JSON
    // $http.get("examples/json/JPN.geo.json").success(function(data, status) {
    //     angular.extend($scope, {
    //         geojson: {
    //             data: data,
    //             style: {
    //                 fillColor: "green",
    //                 weight: 2,
    //                 opacity: 1,
    //                 color: 'white',
    //                 dashArray: '3',
    //                 fillOpacity: 0.7
    //             }
    //         }
    //     });
    // });
}

function MapAddController($scope) {

  // $scope.load = function() {
  //     $scope.model = rest().findOne({
  //         id: $routeParams.id,
  //         type: $scope.type,
  //         params: "include=tags"
  //     }, function() {
  //       $scope.mapFile.latitudeOptions = $scope.model.name; //TODO: asignar las opciones de lat y long en base a los datos del archivo
  //       $scope.mapFile.longitudeOptions = $scope.model.name;
  //     });
  // };
  //
  // $scope.load();

}


function MapListController($scope) {}
function MapEditController($scope) {}
