var app = angular.module('odin.categoryControllers', []);

app.factory('model', function($resource) {
    return $resource();
});


function CategoryListController($scope, $location, rest, $rootScope, Flash, Alertify, modelService) {


    modelService.initService("Category", "categories", $scope);

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

    $scope.activeClass = function(activeClass) {
        modelService.activeClass(activeClass);

    };

}

function CategoryViewController($scope, Flash, rest, $routeParams, $location, $sce, modelService) {
    modelService.initService("Category", "categories", $scope);

    modelService.findOne($routeParams, $scope);


    $scope.edit = function(model) {
        var url = '/' + $scope.type + '/' + model.id + "/edit";
        $location.path(url);
    }
    $scope.getHtml = function(html) {
        return $sce.trustAsHtml(html);
    };

}

function CategoryCreateController($scope, rest, model, Flash, $location, $rootScope, Alertify, modelService) {
    modelService.initService("Category", "categories", $scope);

    $scope.model = new model();
    $scope.add = function(isValid) {
        if (isValid) {
            $scope.model.createdBy = $rootScope.globals.currentUser.user
            rest().save({
                type: $scope.type
            }, $scope.model, function(resp) {
                Alertify.success('Se ha creado la categoría con éxito');
                var url = '/' + $scope.type;
                $location.path(url);
            });
        }
    };
    $scope.activeClass = function(activeClass, type) {
        if (activeClass && (type == 1)) {
            $scope.active = "true";
            return "active";
        } else if (!activeClass && (type == 2)) {
            $scope.active = "false";

            return "active";
        }
    };
    $scope.onReady = function() {

    };
}

function valorCheckbox(valor) {
    console.log(valor);
}

function CategoryEditController($scope, Flash, rest, $routeParams, model, $location, Alertify, modelService) {
    modelService.initService("Category", "categories", $scope);

    $scope.model = new model();
    $scope.update = function(isValid) {



        if (isValid) {
            rest().update({
                type: $scope.type,
                id: $scope.model.id
            }, $scope.model, function() {
                if ($scope.model.active) {
                    Alertify.success('Se ha editado y ACTIVADO la categoría con éxito');
                } else {
                    Alertify.success('Se ha editado y DESACTIVADO la categoría con éxito');
                }

                var url = '/#/' + $scope.type;
                $location.path(url);
            });
        }
    };

    $scope.activate = function() {
        $scope.model.deletedAt = "";
        $scope.model.active = true;
    };

    $scope.unActivate = function() {
        $scope.model.deletedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        $scope.model.active = false;
    };

    $scope.load = function() {
        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type
        });

    };


    $scope.activeClass = function(activeClass, type) {
        if (activeClass && (type == 1)) {
            return "active";
        } else if (!activeClass && (type == 2)) {
            return "active";
        }
    };


    $scope.onReady = function() {
        $scope.load();
    };

}