var app = angular.module('odin.statusControllers', []);

app.factory('model', function($resource) {
    return $resource();
});

function StatusListController($scope, $location, rest, $rootScope, Flash, Alertify, modelService) {

    modelService.initService("Status", "statuses", $scope);

    $scope.confirmDelete = function(item) {
        modelService.confirmDelete(item);
    }

    $scope.deleteModel = function(model) {
        modelService.delete($scope, model);
    };

    $scope.edit = function(model) {
        modelService.edit($scope, model);
    }

    $scope.view = function(model) {
        modelService.view($scope, model);
    }

    modelService.loadAll($scope);
}

function StatusViewController($scope, Flash, rest, $routeParams, $location, modelService) {
    modelService.initService("Status", "statuses", $scope);

    modelService.findOne($routeParams, $scope);

    $scope.edit = function(model) {
        var url = '/' + $scope.type + '/' + model.id + "/edit";
        $location.path(url);
    }
}

function StatusCreateController($scope, rest, model, Flash, $location, modelService, Alertify) {

    modelService.initService("Status", "statuses", $scope);


    $scope.model = new model();
    $scope.add = function(isValid) {
        if (isValid) {
            rest().save({
                type: $scope.type
            }, $scope.model, function(resp) {
                var url = '/' + $scope.type;
                $location.path(url);
            }, function(error) {
                if (!!error.data.links.name[0]) {
                    Alertify.alert('El estado que quiere guardar ya existe.');
                } else {
                    Alertify.alert('Hubo un error al crear el estado.');
                }
            });
        }
    };
}

function StatusEditController($scope, Flash, rest, $routeParams, model, $location, modelService, Alertify) {
    modelService.initService("Status", "statuses", $scope);


    $scope.model = new model();
    $scope.update = function(isValid) {
        if (isValid) {
            rest().update({
                type: $scope.type,
                id: $scope.model.id
            }, $scope.model, function(resp) {
                var url = '/' + $scope.type;
                $location.path(url);
            }, function(error) {
                if (!!error.data.links.name[0]) {
                    Alertify.alert('El estado que quiere guardar ya existe.');
                } else {
                    Alertify.alert('Hubo un error al crear el estado.');
                }
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