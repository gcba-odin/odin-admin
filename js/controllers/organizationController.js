var app = angular.module('odin.organizationControllers', []);

app.factory('model', function ($resource) {
    return $resource();
});



app.directive('wysihtml5', function () {
    return {
        // Restrict it to be an attribute in this case
        restrict: 'A',
        // responsible for registering DOM listeners as well as updating the DOM
        link: function ($scope, element, $attrs) {

            CKEDITOR.replace('textarea');

            /*  $scope.$parent.$watch( $attrs.content, function( newValue, oldValue ) {

             $scope.editor.innerHTML = newValue;
             $scope.editor.composer.setValue( newValue );
             });*/


        }
    };
});
function OrganizationListController($scope, $location, rest, $rootScope, Flash, Alertify, modelService, configs, usSpinnerService) {
    usSpinnerService.spin('spinner');
    modelService.initService("Organization", "organizations", $scope);

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

    var filtersGet = ['files', 'users'];

    $scope.inactiveModel = function(item) {
        modelService.deactivateList(item, $scope, filtersGet);
    }

    $scope.activeModel = function(item) {
        modelService.restoreList($scope, item, filtersGet);
    };

    $scope.confirmDelete = function(item) {
        modelService.confirmDelete(item, {}, filtersGet);
    };

    $scope.edit = function (model) {
        modelService.edit($scope, model);
    }

    $scope.view = function (model) {
        modelService.view($scope, model);
    }

    $scope.activeClass = function (activeClass) {
        modelService.activeClass(activeClass);
    };

    $scope.config_key = 'adminPagination';
    ////factory configs
    configs.findKey($scope, function (resp) {
        if (!!resp.data[0] && !!resp.data[0].value) {
            $scope.parameters.limit = resp.data[0].value;
        }
        $scope.q = "&skip=" + $scope.parameters.skip + "&limit=" + $scope.parameters.limit;

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
        $scope.q = "&skip=" + $scope.parameters.skip + "&limit=" + $scope.parameters.limit;
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

function OrganizationViewController($scope, Flash, rest, $routeParams, $location, modelService, $sce) {
    modelService.initService("Organization", "organizations", $scope);

    modelService.findOne($routeParams, $scope);

    $scope.inactiveModel = function(item) {
        modelService.deactivateView(item, $scope);
    }

    $scope.activeModel = function(item) {
        modelService.restoreView($scope, item);
    };

    $scope.edit = function (model) {
        modelService.edit($scope, model);
    }

    $scope.getHtml = function (html) {
        return $sce.trustAsHtml(html);
    };
}

function OrganizationCreateController($scope, rest, model, Flash, $location, modelService, usSpinnerService, Alertify) {
    modelService.initService("Organization", "organizations", $scope);


    $scope.model = new model();
    $scope.add = function (isValid) {
        usSpinnerService.spin('spinner');
        if (isValid) {
            rest().save({
                type: $scope.type
            }, $scope.model, function (resp) {
                usSpinnerService.stop('spinner');
                var url = '/' + $scope.type;
                $location.path(url);
            }, function(error) {
                usSpinnerService.stop('spinner');
                if(error.data.data && error.data.data.name) {
                    Alertify.alert('El nombre de la organización ya existe.');
                } else {
                    Alertify.alert('Ha ocurrido un error al crear la organización.');
                }
            });
        }
    };

    $scope.activeClass = function (activeClass, type) {
        if (activeClass && (type == 1)) {
            return "active";
        } else if (!activeClass && (type == 2)) {
            return "active";
        }
    };
}

function OrganizationEditController($scope, Flash, rest, $routeParams, model, $location, modelService, usSpinnerService, Alertify) {
    usSpinnerService.spin('spinner');
    $scope.editorOptions = {
        language: 'es',
    };

    modelService.initService("Organization", "organizations", $scope);


    $scope.model = new model();
    $scope.update = function (isValid) {
        usSpinnerService.spin('spinner');
        if (isValid) {

            $scope.tempData = {
                address: $scope.model.address,
                description: $scope.model.description,
                name: $scope.model.name
            };

            //console.log($scope.model);
            rest().update({
                type: $scope.type,
                id: $scope.model.id
            }, $scope.tempData, function (resp) {
                usSpinnerService.stop('spinner');
                var url = '/' + $scope.type;
                $location.path(url);
            }, function(error) {
                usSpinnerService.stop('spinner');
                if(error.data.data && error.data.data.name) {
                    Alertify.alert('El nombre de la organización ya existe.');
                } else {
                    Alertify.alert('Ha ocurrido un error al editar la organización.');
                }
            });
        }
    };

    $scope.load = function () {
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

    $scope.activeClass = function (activeClass, type) {
        if (activeClass && (type == 1)) {
            return "active";
        } else if (!activeClass && (type == 2)) {
            return "active";
        }
    };

    $scope.load();
}
