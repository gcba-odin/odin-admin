var app = angular.module('odin.userControllers', []);

app.factory('model', function ($resource) {
    return $resource();
});

function UserListController($scope, $location, rest, $rootScope, Flash, Alertify, modelService, configs, usSpinnerService) {
    usSpinnerService.spin('spinner');
    modelService.initService("User", "users", $scope);

    $scope.parameters = {
        skip: 0,
        limit: 20,
        conditions: '&fields=id,username,email,deletedAt,role',
        orderBy: 'createdAt',
        sort: 'DESC'
    };

    $scope.current = {
        'id': $scope.adminglob.currentUser.user,
    };

    //var filtersGet = [];//['files', 'datasets', 'charts', 'maps'];

    $scope.inactiveModel = function(item) {
        modelService.deactivateList(item, $scope);
    }

    $scope.activeModel = function (item) {
        modelService.restoreList($scope, item);
    };

    $scope.edit = function (model) {
        modelService.edit($scope, model);
    }

    $scope.view = function (model) {
        modelService.view($scope, model);
    }

    $scope.config_key = 'adminPagination';
    ////factory configs
    configs.findKey($scope, function (resp) {
        if (!!resp.data[0] && !!resp.data[0].value) {
            $scope.parameters.limit = resp.data[0].value;
        }

        $scope.q = "&skip=" + $scope.parameters.skip + "&limit=" + $scope.parameters.limit;

        modelService.loadAll($scope, function (resp) {
            usSpinnerService.stop('spinner');
            if (!resp) {
                modelService.reloadPage();
            }
        });
    });

    $scope.paging = function (event, page, pageSize, total) {
        usSpinnerService.spin('spinner');
        $scope.parameters.skip = (page - 1) * $scope.parameters.limit;
        $scope.q = "&skip=" + $scope.parameters.skip + "&limit=" + $scope.parameters.limit;
        if(!!$scope.parameters.conditions_page) {
            $scope.q += $scope.parameters.conditions_page;
        }
        modelService.loadAll($scope, function (resp) {
            usSpinnerService.stop('spinner');
            if (!resp) {
                modelService.reloadPage();
            }
        });
    };

    $scope.findSort = function(type, cond) {
        usSpinnerService.spin('spinner');
        $scope.sortType = type;

        var sort = 'DESC';
        if(cond) {
            sort = 'ASC';
        }
        $scope.sortReverse = cond;

        $scope.parameters.orderBy = type;
        $scope.parameters.sort = sort;

        modelService.loadAll($scope, function(resp) {
            usSpinnerService.stop('spinner');
            if(!resp) {
                modelService.reloadPage();
            }
        });
    };
}

function UserViewController($scope, Flash, rest, $routeParams, $location, modelService, isUserProfile) {
    $scope.isUserProfile = isUserProfile;
    modelService.initService('User', 'users', $scope);

    $scope.current = {
        'id': $scope.adminglob.currentUser.user,
    };

    if ($scope.isUserProfile) {
        rest().findOne({
            type: 'users',
            id: 'me'
        }, function (user) {
            $scope.model = user;
        });
    } else {
        modelService.findOne($routeParams, $scope);
    }

    $scope.inactiveModel = function (item) {
        modelService.deactivateView(item, $scope);
    };

    $scope.activeModel = function (item) {
        modelService.restoreView($scope, item);
    };

    $scope.edit = function (model) {
        if ($scope.isUserProfile) {
            $location.path('users/me/edit');
        } else {
            modelService.edit($scope, model);
        }
    };
}

function UserCreateController($scope, rest, model, Flash, $location, modelService, usSpinnerService, Alertify) {
    modelService.initService("User", "users", $scope);

    $scope.model = new model();
    $scope.add = function (isValid) {
        usSpinnerService.spin('spinner');
        if (isValid) {
            rest().save({
                type: $scope.type
            }, $scope.model, function (resp) {
                usSpinnerService.stop('spinner');
                Alertify.alert('El usuario se ha creado exitosamente.');
                var url = '/' + $scope.type + '/';
                $location.path(url);

            }, function (error) {
                usSpinnerService.stop('spinner');
                if (error.data.data && error.data.data.username) {
                    Alertify.alert('El usuario ya existe.');
                } else {
                    Alertify.alert('Ha ocurrido un error al crear el usuario.');
                }
            });
        }
    };
}

function UserEditController($rootScope, $scope, Flash, rest, $routeParams, model, $location, modelService, usSpinnerService, Alertify) {
    usSpinnerService.spin('spinner');
    modelService.initService("User", "users", $scope);

    $scope.model = new model();
    $scope.update = function (isValid) {
        usSpinnerService.spin('spinner');
        if (isValid) {
            rest().update({
                type: $scope.type,
                id: $scope.model.id
            }, $scope.model, function () {
                usSpinnerService.stop('spinner');
                Alertify.alert('El usuario se ha editado exitosamente.');
                var url = '/' + $scope.type + '/';
                $location.path(url);
            }, function (error) {
                usSpinnerService.stop('spinner');
                if (error.data.data && error.data.data.username) {
                    Alertify.alert('El usuario ya existe.');
                } else {
                    Alertify.alert('Ha ocurrido un error al editar el usuario.');
                }
            });
        }
    };

    $scope.load = function () {
        $scope.model = rest().findOne({
            id: $routeParams.id ? $routeParams.id : 'me',
            type: $scope.type
        }, function () {
            usSpinnerService.stop('spinner');
        }, function (error) {
            usSpinnerService.spin('spinner');
            modelService.reloadPage();
        });
    };

    $scope.load();
}
