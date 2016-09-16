var app = angular.module('odin.userControllers', []);

app.factory('model', function($resource) {
    return $resource();
});



function UserListController($scope, $location, rest, $rootScope, Flash, Alertify, modelService) {

    modelService.initService("User", "users", $scope);

    $scope.inactiveModel = function(item) {
        modelService.confirmDelete(item);
    }

    $scope.activeModel = function(item) {
        modelService.restoreList($scope, item);
    };

    $scope.edit = function(model) {
        modelService.edit($scope, model);
    }

    $scope.view = function(model) {
        modelService.view($scope, model);
    }

    $scope.limit = 20;

    $scope.q = "&skip=0&limit=" + $scope.limit;

    modelService.loadAll($scope);

    $scope.paging = function(event, page, pageSize, total) {
        var skip = (page - 1) * $scope.limit;
        $scope.q = "&skip=" + skip + "&limit=" + $scope.limit;
        modelService.loadAll($scope);
    };
}

function UserViewController($scope, Flash, rest, $routeParams, $location, modelService) {
    modelService.initService("User", "users", $scope);

    modelService.findOne($routeParams, $scope);

    $scope.inactiveModel = function(item) {
        modelService.deactivateView(item, $scope);
    }

    $scope.activeModel = function(item) {
        modelService.restoreView($scope, item);
    };

    $scope.edit = function(model) {
        modelService.edit($scope, model);
    }
}

function UserCreateController($scope, rest, model, Flash, $location, modelService, usSpinnerService, Alertify) {
    modelService.initService("User", "users", $scope);

    $scope.model = new model();
    $scope.add = function(isValid) {
        usSpinnerService.spin('spinner');
        if (isValid) {
            rest().save({
                type: $scope.type
            }, $scope.model, function(resp) {
                usSpinnerService.stop('spinner');
                Alertify.alert('El usuario se ha creado exitosamente.');
//                if (!!resp.data) {
//                    var url = '/' + $scope.type + '/' + resp.data.id + "/edit";
//
//                } else {
                    var url = '/' + $scope.type + '/';
//                }
                $location.path(url);

            }, function(error) {
                usSpinnerService.stop('spinner');
                if(error.data.data && error.data.data.username) {
                    Alertify.alert('El usuario ya existe.');
                } else {
                    Alertify.alert('Ha ocurrido un error al crear el usuario.');
                }
            });
        }
    };
}

function UserEditController($scope, Flash, rest, $routeParams, model, $location, modelService, usSpinnerService, Alertify) {
    modelService.initService("User", "users", $scope);

    $scope.model = new model();
    $scope.update = function(isValid) {
        usSpinnerService.spin('spinner');
        if (isValid) {
            rest().update({
                type: $scope.type,
                id: $scope.model.id
            }, $scope.model, function() {
                usSpinnerService.stop('spinner');
                Alertify.alert('El usuario se ha editado exitosamente.');
                var url = '/' + $scope.type + '/';
                $location.path(url);
            }, function(error) {
                usSpinnerService.stop('spinner');
                if(error.data.data && error.data.data.username) {
                    Alertify.alert('El usuario ya existe.');
                } else {
                    Alertify.alert('Ha ocurrido un error al editar el usuario.');
                }
            });
        }
    };

    $scope.load = function() {
        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type
        }, function() {
            // $scope.model.organization=$scope.model.organization.id
        });
    };

    $scope.load();
}