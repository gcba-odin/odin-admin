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
function OrganizationListController($scope, $location, rest, $rootScope, Flash, Alertify, modelService) {

    modelService.initService("Organization", "organizations", $scope);

    $scope.confirmDelete = function (item) {
        modelService.confirmDelete(item);
    }

    $scope.deleteModel = function (model) {
        modelService.delete($scope, model);
    };

    $scope.edit = function (model) {
        modelService.edit($scope, model);
    }

    $scope.view = function (model) {
        modelService.view($scope, model);
    }

    modelService.loadAll($scope);

    $scope.activeClass = function (activeClass) {
        modelService.activeClass(activeClass);
    };
}

function OrganizationViewController($scope, Flash, rest, $routeParams, $location, modelService, $sce) {
    modelService.initService("Organization", "organizations", $scope);

    modelService.findOne($routeParams, $scope);
    $scope.edit = function (model) {
        modelService.edit($scope, model);
    }

    $scope.getHtml = function (html) {
        return $sce.trustAsHtml(html);
    };
}

function OrganizationCreateController($scope, rest, model, Flash, $location, modelService, usSpinnerService) {
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

function OrganizationEditController($scope, Flash, rest, $routeParams, model, $location, modelService, usSpinnerService) {

    $scope.editorOptions = {
        language: 'es',
    };

    modelService.initService("Organization", "organizations", $scope);


    $scope.model = new model();
    $scope.update = function (isValid) {
        usSpinnerService.spin('spinner');
        if (isValid) {
            rest().update({
                type: $scope.type,
                id: $scope.model.id
            }, $scope.model, function (resp) {
                usSpinnerService.stop('spinner');
                var url = '/' + $scope.type;
                $location.path(url);
            }, function(error) {
                usSpinnerService.stop('spinner');
            });
        }
    };

    $scope.load = function () {
        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type
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