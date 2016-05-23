var app = angular.module('odin.databaseControllers', []);

app.factory('model', function($resource) {
    return $resource();
});


function DatabaseListController($scope, $location, rest, $rootScope, Flash) {

    Flash.clear();
    $scope.modelName = "Database";
    $scope.type = "databases";
    var model = rest().get({
        type: $scope.type ,params:"sort=createdAt DESC"
    });
    $scope.data = model;
    $scope.delete = function(model) {
        rest().delete({
            type: $scope.type,
            id: model.id
        }, function(resp) {
            $scope.data = rest().get({
                type: $scope.type ,params:"sort=createdAt DESC"
            });
        });

    };

    $scope.edit = function(model) {
        var url = '/'+$scope.type+'/' + model.id + "/edit";
        $location.path(url);
    }


    $scope.view = function(model) {
        var url = '/'+$scope.type+'/' + model.id + "/view";
        $location.path(url);
    }
}

function DatabaseViewController($scope, Flash, rest, $routeParams, $location) {

    Flash.clear();
    $scope.modelName = "Database";
    $scope.type = "databases";
    $scope.model = rest().findOne({
        id: $routeParams.id,
        type: $scope.type 
    });

    $scope.edit = function(model) {
        var url = '/'+$scope.type+'/' + model.id + "/edit";
        $location.path(url);
    }
}

function DatabaseCreateController($scope, rest, model, Flash,$location) {

    Flash.clear();
    $scope.modelName = "Database";
    $scope.type = "databases";
    $scope.model = new model();
    $scope.add = function(isValid) {
        if (isValid) {
            rest().save({
                type: $scope.type
            }, $scope.model,function (resp){
                var url = '/'+$scope.type+'/' + resp.data.id + "/edit";
                $location.path(url);
            });
        }
    };
}

function DatabaseEditController($scope, Flash, rest, $routeParams, model) {


    Flash.clear();
    $scope.modelName = "Database";
    $scope.type = "databases";;
    
    $scope.model = new model();
    $scope.update = function(isValid) {
        if (isValid) {
            rest().update({
                type: $scope.type,
                id: $scope.model.id
            }, $scope.model);
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