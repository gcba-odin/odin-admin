var app = angular.module('odin.filetypeControllers', []);

app.factory('model', function($resource) {
    return $resource();
});

function FileTypeListController($scope, $location, rest, $rootScope, Flash, Alertify, modelService, configs, usSpinnerService) {
    usSpinnerService.spin('spinner');
    modelService.initService("File Type", "filetypes", $scope);
    
    $scope.parameters = {
        skip: 0,
        limit: 20,
        conditions: ''
    };
    
    $scope.filtersView = [{
            name: 'Autor',
            model: 'users',
            key: 'username',
            modelInput: 'createdBy',
            multiple: true
        }];
    
     var filtersGet = ['files'];

    $scope.inactiveModel = function(item) {
        modelService.deactivateList(item, $scope, filtersGet);
    }

    $scope.activeModel = function(item) {
        modelService.restoreList($scope, item, filtersGet);
    };
    
    $scope.confirmDelete = function(item) {
        modelService.confirmDelete(item, {}, filtersGet);
    };

    $scope.edit = function(model) {
        modelService.edit($scope, model);
    }

    $scope.view = function(model) {
        modelService.view($scope, model);
    }
    
    $scope.config_key = 'adminPagination';
    ////factory configs
    configs.findKey($scope, function (resp) {
        if (!!resp.data[0] && !!resp.data[0].value) {
            $scope.parameters.limit = resp.data[0].value;
        }
        
        $scope.q = "&include=files&skip=" + $scope.parameters.skip + "&limit=" + $scope.parameters.limit;

        modelService.loadAll($scope, function(resp) {
            usSpinnerService.stop('spinner');
            if(!resp) {
                modelService.reloadPage();
            }
        });
    });

    $scope.paging = function(event, page, pageSize, total) {
        usSpinnerService.spin('spinner');
        $scope.parameters.skip = (page - 1) * $scope.parameters.limit;
        $scope.q = "&include=files&skip=" + $scope.parameters.skip + "&limit=" + $scope.parameters.limit;
        if(!!$scope.parameters.conditions) {
            $scope.q += $scope.parameters.conditions;
        }
        modelService.loadAll($scope, function(resp) {
            usSpinnerService.stop('spinner');
            if(!resp) {
                modelService.reloadPage();
            }
        });
    };
}

function FileTypeViewController($scope, Flash, rest, $routeParams, $location, modelService, $sce, usSpinnerService) {
    usSpinnerService.spin('spinner');
    modelService.initService("File Type", "filetypes", $scope);

    $scope.inactiveModel = function(item) {
        modelService.deactivateView(item, $scope);
    }

    $scope.activeModel = function(item) {
        modelService.restoreView($scope, item);
    };

    $scope.edit = function(model) {
        modelService.edit($scope, model);

    }
    
    $scope.getHtml = function(html) {
        return $sce.trustAsHtml(html);
    };
    
    $scope.model = rest().findOne({
        id: $routeParams.id,
        type: $scope.type
    }, function() {
        var mimes = [];
        for (var i = 0; i < $scope.model.mimetype.length; i++) {
            mimes.push('<span class="label label-primary">' + $scope.model.mimetype[i] + '</span>')
        }
        $scope.model.mimetype = mimes.join(" - ");
        usSpinnerService.stop('spinner');
    }, function(error) {
        usSpinnerService.stop('spinner');
        modelService.reloadPage();
    });
}

function FileTypeCreateController($scope, $http, rest, model, Flash, $location, modelService, Alertify, usSpinnerService) {
    modelService.initService("File Type", "filetypes", $scope);

    $http.get('config/mimetypes.json').success(function(data) {
        $scope.mimetypes = Object.keys(data);
    });

    $scope.model = new model();
    $scope.create = true;
    
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
    usSpinnerService.spin('spinner');
    modelService.initService("File Type", "filetypes", $scope);

    $http.get('config/mimetypes.json').success(function(data) {
        $scope.mimetypes = Object.keys(data);
    });

    $scope.model = new model();
    $scope.edit = true;
    
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
                    Alertify.alert('Hubo un error al editar el tipo de archivo.');
                }
            });
        }
    };

    $scope.load = function() {
        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type
        }, function() {
            usSpinnerService.stop('spinner');
        }, function(error) {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
        });
    };

    $scope.load();
}