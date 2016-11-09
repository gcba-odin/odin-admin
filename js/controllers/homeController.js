var app = angular.module('odin.homeControllers', []);

app.factory('model', function($resource) {
    return $resource();
});


function controllerHome($scope,rest){
    $scope.modelName = "Log";
    $scope.type = "logs";
   $scope.logs = rest().get({
        type: $scope.type ,params:"orderBy=createdAt&sort=DESC"
    });

    $scope.usersCount = rest().count({
        type: "users"
    });
    $scope.filesCount = rest().count({
        type: "files"
    });
    $scope.datasetsCount = rest().count({
        type: "datasets"
    });
    $scope.organizationsCount = rest().count({
        type: "organizations"
    });

      $scope.setClassLog= function(value){
        if(value=="create"){
            return "bg-success";
        }else if(value=="update"){
            return "bg-warning";
        }else{
            return "bg-danger";
        }
    }
}
