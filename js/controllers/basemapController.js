var app = angular.module('odin.basemapsControllers', []);


function BasemapListController($scope, modelService) {
    modelService.initService("Basemap", "basemaps", $scope);

    $scope.confirmDelete = function(item) {
        modelService.confirmDelete(item);
    };

    $scope.deleteModel = function(model) {
        modelService.delete($scope, model);
    };

    $scope.edit = function(model) {
        modelService.edit($scope, model);
    };

    $scope.view = function(model) {
        modelService.view($scope, model);
    };

    modelService.loadAll($scope);

    $scope.activeClass = function(activeClass) {
        modelService.activeClass(activeClass);

    };
}

function BasemapViewController($scope, modelService, $routeParams, rest, $location, $sce) {
    modelService.initService("Basemap", "basemaps", $scope);

    $scope.model = rest().findOne({
        id: $routeParams.id,
        type: $scope.type
    });

    $scope.edit = function(model) {
        var url = '/' + $scope.type + '/' + model.id + "/edit";
        $location.path(url);
    };

    $scope.getHtml = function(html) {
        return $sce.trustAsHtml(html);
    };
}

function BasemapCreateController($scope, modelService, rest, $location, model, $sce, $routeParams, Alertify, usSpinnerService) {

    modelService.initService("Basemap", "basemaps", $scope);

    $scope.model = new model();

    $scope.add = function(model) {
        usSpinnerService.spin('spinner');

console.log($scope.model);

        if (model) {
            rest().save({
                type: $scope.type
            }, $scope.model, function(resp) {
                usSpinnerService.stop('spinner');
                if (resp.data.id) {
                    var url = '/' + $scope.type + '/' + resp.data.id + '/view';
                } else {
                    var url = '/' + $scope.type;
                }
                $location.path(url);
            }, function(error) {
                usSpinnerService.stop('spinner');
            });
        } else {
            usSpinnerService.stop('spinner');
            Alertify.alert('Hay datos incompletos.');
        }
    };

    $scope.getHtml = function(html) {
        return $sce.trustAsHtml(html);
    };

}


function BasemapEditController($scope, modelService, $routeParams, $sce, rest, $location, model, Alertify, usSpinnerService) {
    modelService.initService("Basemap", "basemaps", $scope);

    $scope.model = new model();

    $scope.update = function(model) {

        usSpinnerService.spin('spinner');

        if (model) {
            rest().update({
                type: $scope.type,
                id: $scope.model.id
            }, $scope.model, function(resp) {
                usSpinnerService.stop('spinner');
                if (resp.data.id) {
                    var url = '/' + $scope.type + '/' + resp.data.id + '/view';
                } else {
                    var url = '/' + $scope.type;
                }
                $location.path(url);
            }, function(error) {
                usSpinnerService.stop('spinner');
            });
        } else {
            usSpinnerService.stop('spinner');
            Alertify.alert('Hay datos incompletos.');
        }
    };


    $scope.load = function() {
        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type,
        });
    };

    $scope.load();

    $scope.getHtml = function(html) {
        return $sce.trustAsHtml(html);
    };
}
