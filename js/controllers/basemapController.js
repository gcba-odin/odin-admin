var app = angular.module('odin.basemapsControllers', []);


function BasemapListController($scope, modelService) {
    modelService.initService("Basemap", "basemaps", $scope);
    
    $scope.filtersView = [{
            name: 'Autor',
            model: 'users',
            key: 'username',
            modelInput: 'createdBy',
            multiple: true
        }];
    
    var filtersGet = ['maps'];

    $scope.inactiveModel = function(item) {
        modelService.deactivate(item, $scope, filtersGet);
    }

    $scope.activeModel = function(item) {
        modelService.restore($scope, item, filtersGet);
    };
    
    $scope.confirmDelete = function(item) {
        modelService.confirmDelete(item, {}, filtersGet);
    };

    $scope.edit = function(model) {
        modelService.edit($scope, model);
    };

    $scope.view = function(model) {
        modelService.view($scope, model);
    };

    $scope.activeClass = function(activeClass) {
        modelService.activeClass(activeClass);

    };
    
    $scope.limit = 2;

    $scope.q = "&include=maps&skip=0&limit=" + $scope.limit;

    modelService.loadAll($scope);

    $scope.paging = function(event, page, pageSize, total) {
        var skip = (page - 1) * $scope.limit;
        $scope.q = "&include=maps&skip=" + skip + "&limit=" + $scope.limit;
        modelService.loadAll($scope);
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
                if(error.data.data && error.data.data.name) {
                    Alertify.alert('El nombre del basemap ya existe.');
                } else {
                    Alertify.alert('Ha ocurrido un error al crear el basemap.');
                }
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
                if(error.data.data && error.data.data.name) {
                    Alertify.alert('El nombre del basemap ya existe.');
                } else {
                    Alertify.alert('Ha ocurrido un error al editar el basemap.');
                }
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
