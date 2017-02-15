var app = angular.module('odin.configsControllers', []);

app.factory('model', function($resource) {
    return $resource();
});

function ConfigListController($scope, $location, rest, $rootScope, Flash, Alertify, modelService, usSpinnerService, $cookieStore) {
    usSpinnerService.spin('spinner');
    modelService.initService("Config", "configs", $scope);
    
    $scope.tab_active = $cookieStore.get('tab_active') || 0;
    var conf = ['site', 'visualizations', 'integrations'];
    
    $scope.parameters = {
        orderBy: 'description',
        sort: 'ASC',
        conditions: '&category=' + conf[$scope.tab_active]
    };

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
    
    $scope.changeTab = function(category) {
        $cookieStore.put('tab_active', category);
        usSpinnerService.spin('spinner');
        
        $scope.parameters.conditions = '&category=' + conf[category];
        modelService.loadAll($scope, function(resp) {
            usSpinnerService.stop('spinner');
            if(!resp) {
                modelService.reloadPage();
            }
        });
    };

    modelService.loadAll($scope, function(resp) {
        usSpinnerService.stop('spinner');
        if(!resp) {
            modelService.reloadPage();
        }
    });
}

function ConfigViewController($scope, Flash, rest, $routeParams, $location, modelService) {
    modelService.initService("Config", "configs", $scope);

    modelService.findOne($routeParams, $scope);

    $scope.edit = function(model) {
        var url = '/' + $scope.type + '/' + model.id + "/edit";
        $location.path(url);
    }
}

function ConfigCreateController($scope, rest, model, Flash, $location, modelService, Alertify, usSpinnerService) {

    modelService.initService("Config", "configs", $scope);


    $scope.model = new model();
    $scope.add = function(isValid) {
        usSpinnerService.spin('spinner');
        if (isValid) {
            rest().save({
                type: $scope.type
            }, $scope.model, function(resp) {
                usSpinnerService.stop('spinner');
                var url = '/' + $scope.type;
                $location.path(url);
            }, function(error) {
                usSpinnerService.stop('spinner');
                if(error.data.data && error.data.data.name) {
                    Alertify.alert('La configuracion que quiere guardar ya existe.');
                } else {
                    Alertify.alert('Hubo un error al crear la configuracion.');
                }
            });
        }
    };
}

function ConfigEditController($scope, Flash, rest, $routeParams, model, $location, modelService, Alertify, usSpinnerService, $filter, $parse) {
    usSpinnerService.spin('spinner');
    modelService.initService("Config", "configs", $scope);

    
    $scope.model = new model();
    $scope.update = function(isValid) {
        usSpinnerService.spin('spinner');
        if (isValid) {
            var value = ($scope.model.value === true) ? 'true' : ($scope.model.value === false) ? 'false' : $scope.model.value;
            var data = {
                value: value
            };

            rest().update({
                type: $scope.type,
                id: $scope.model.id
            }, data, function(resp) {
                if($scope.model.value === true) {
                    angular.forEach($scope.model.subconfigs, function(element) {
                        var data_sub = {
                            value: element.value
                        };
                        rest().update({
                            type: $scope.type,
                            id: element.id
                        }, data_sub, function(resp) {
                            
                        });
                    });
                }
                usSpinnerService.stop('spinner');
                var url = '/' + $scope.type;
                $location.path(url);
            }, function(error) {
                usSpinnerService.stop('spinner');
                if(error.data.data && error.data.data.name) {
                    Alertify.alert('La configuracion que quiere guardar ya existe.');
                } else {
                    Alertify.alert('Hubo un error al crear la configuracion.');
                }
            });
        }
    };

    $scope.load = function() {

        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type,
            params: 'include=subconfigs'
        }, function() {
            if($scope.model.value == 'true') {
                $scope.model.value = true;
            } else if($scope.model.value == 'false'){
                $scope.model.value = false;
            }
            if (!!$scope.model.model) {
                $scope.value = rest().findOne({
                    id: $scope.model.value,
                    type: $filter('lowercase')($scope.model.model)
                }, function() {
                    $scope.model.value = $scope.value.id
                });
            }
            usSpinnerService.stop('spinner');
        }, function(error) {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
        });
    };
    $scope.load();
}