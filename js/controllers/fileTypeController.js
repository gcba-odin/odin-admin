var app = angular.module('odin.filetypeControllers', []);

app.factory('model', function($resource) {
    return $resource();
});

function FileTypeListController($scope, $location, rest, $rootScope, Flash, Alertify, modelService) {

    modelService.initService("File Type", "filetypes", $scope);

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

function FileTypeViewController($scope, Flash, rest, $routeParams, $location, modelService) {
    modelService.initService("File Type", "filetypes", $scope);

    modelService.findOne($routeParams, $scope);


    $scope.edit = function(model) {
        modelService.edit($scope, model);

    }
}

function FileTypeCreateController($scope, $http, rest, model, Flash, $location, modelService, Alertify, usSpinnerService) {
    modelService.initService("File Type", "filetypes", $scope);

    $http.get('config/mimetypes.json').success(function(data) {
        $scope.mimetypes = Object.keys(data);
    });

    $scope.model = new model();
    $scope.add = function(isValid) {
        usSpinnerService.spin('spinner');
        if (isValid) {
            rest().save({
                type: $scope.type
            }, $scope.model, function(resp) {
                usSpinnerService.stop('spinner');
                var url = '/' + $scope.type + '/' + resp.data.id + "/view";
                $location.path(url);
            }, function(error) {
                usSpinnerService.stop('spinner');
                if(error.data.data && error.data.data.name) {
                    Alertify.alert('El tipo de archivo que quiere guardar ya existe.');
                } else {
                    Alertify.alert('Hubo un error al crear el tipo de archivo.');
                }
            });
        }
    };
}

function FileTypeEditController($scope, $http, Flash, rest, $routeParams, model, $location, modelService, Alertify, usSpinnerService) {
    modelService.initService("File Type", "filetypes", $scope);

    $http.get('config/mimetypes.json').success(function(data) {
        $scope.mimetypes = Object.keys(data);
    });

    $scope.model = new model();
    $scope.update = function(isValid) {
        usSpinnerService.spin('spinner');
        if (isValid) {
            rest().update({
                type: $scope.type,
                id: $scope.model.id
            }, $scope.model, function(resp) {
                usSpinnerService.stop('spinner');
                var url = '/' + $scope.type + '/' + resp.data.id + "/view";
                $location.path(url);
            }, function(error) {
                usSpinnerService.stop('spinner');
                if(error.data.data && error.data.data.name) {
                    Alertify.alert('El tipo de archivo que quiere guardar ya existe.');
                } else {
                    Alertify.alert('Hubo un error al crear el tipo de archivo.');
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