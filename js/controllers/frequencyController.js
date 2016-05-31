var app = angular.module('odin.frequencyControllers', []);

app.factory('model', function($resource) {
    return $resource();
});

function FrequencyListController($scope, $location, rest, $rootScope, Flash) {

Flash.clear();
$scope.modelName = "Frequency";
$scope.type = "updatefrequencies"; 

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
        var url = '/frequencies/' + model.id + "/edit";
        $location.path(url);
    }


    $scope.view = function(model) {
        var url = '/frequencies/' + model.id + "/view";
        $location.path(url);
    }
}

function FrequencyViewController($scope, Flash, rest, $routeParams, $location) {
Flash.clear();
$scope.modelName = "Frequency";
$scope.type = "updatefrequencies"; 
    $scope.model = rest().findOne({
        id: $routeParams.id,
        type: $scope.type 
    });

    $scope.edit = function(model) {
        var url = '/'+$scope.type+'/' + model.id + "/edit";
        $location.path(url);
    }
}

function FrequencyCreateController($scope, rest, model, Flash,$location) {
Flash.clear();
$scope.modelName = "Frequency";
$scope.type = "updatefrequencies"; 

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

function FrequencyEditController($scope, Flash, rest, $routeParams, model,$location) {
Flash.clear();
$scope.modelName = "Frequency";
$scope.type = "updatefrequencies"; 

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