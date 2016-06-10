var app = angular.module('odin.homeControllers', []);

app.factory('model', function($resource) {
    return $resource();
});

 
function controllerHome($scope,rest){
    $scope.modelName = "Log";
    $scope.type = "logs";
    var logs = rest().get({
        type: $scope.type ,params:"sort=createdAt DESC"
    });
    $scope.logs = logs;

      $scope.setClassLog= function(value){
        console.log(value);

        if(value=="create"){
            return "label-success";
        }else if(value=="update"){
            return "label-warning";
        }else{
            return "label-danger";
        }
    }
}