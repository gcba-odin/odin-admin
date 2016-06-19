var app = angular.module('odin.databaseControllers', []);

app.factory('model', function($resource) {
    return $resource();
});


function DatabaseListController($scope, $location, rest, $rootScope, Flash,Alertify,modelService) {

 modelService.initService("Database","databases",$scope);

    $scope.confirmDelete=function (item){
        modelService.confirmDelete(item);
    }

    $scope.deleteModel = function(model) {
        modelService.delete($scope,model);
    };

    $scope.edit = function(model) {
        modelService.edit($scope,model);
    }

    $scope.view = function(model) {
        modelService.view($scope,model);
    }

    modelService.loadAll($scope); 
}

function DatabaseViewController($scope, Flash, rest, $routeParams, $location,modelService) {

 modelService.initService("Database","databases",$scope);

    modelService.findOne($routeParams,$scope);


    $scope.edit = function(model) {
        modelService.edit($scope,model);
    }
}

function DatabaseCreateController($scope, rest, model, Flash,$location,modelService) {

 modelService.initService("Database","databases",$scope);

    $scope.model = new model();
    $scope.add = function(isValid) {
        if (isValid) {
            rest().save({
                type: $scope.type
            }, $scope.model,function (resp){
                var url = '/'+$scope.type;
                $location.path(url);
            });
        }
    };
}

function DatabaseEditController($scope, Flash, rest, $routeParams, model,$location,modelService) {

 modelService.initService("Database","databases",$scope);

    
    $scope.model = new model();
    $scope.update = function(isValid) {
        if (isValid) {
            rest().update({
                type: $scope.type,
                id: $scope.model.id
            }, $scope.model,function (resp){
                var url = '/'+$scope.type;
                $location.path(url);
            });
        }
    };

    $scope.load = function() {
        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type
        });
    };

    $scope.load();
}