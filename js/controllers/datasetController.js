var app = angular.module('odin.DatasetControllers', []);

app.factory('model', function($resource) {
    return $resource();
});
    var modelName = "Dataset";
    var type = "datasets";
 
function DatasetListController($scope, $location, rest, $rootScope, Flash) {

    Flash.clear();
    $scope.modelName = modelName;
    $scope.type = type;

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

function DatasetViewController($scope, Flash, rest, $routeParams, $location) {

    Flash.clear();
    $scope.modelName = modelName;
    $scope.type = type;

    $scope.model = rest().findOne({
        id: $routeParams.id,
        type: $scope.type 
    });

    $scope.edit = function(model) {
        var url = '/'+$scope.type+'/' + model.id + "/edit";
        $location.path(url);
    }
}

function DatasetCreateController($scope, rest, model, Flash,$location) {

    Flash.clear();
    $scope.modelName = modelName;
    $scope.type = type;

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

function DatasetEditController($scope, Flash, rest, $routeParams, model) {

    Flash.clear();
    $scope.modelName = modelName;
    $scope.type = type;

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