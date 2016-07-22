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

    $scope.options_color = {
        format: 'hex',
        alpha: false,
        placeholder: 'Seleccione un color',
        disabled: true,
    };
    
}

function CategoryCreateController($scope, rest, model, Flash, $location, $rootScope, Alertify, modelService, Upload) {
    modelService.initService("Category", "categories", $scope);
    
    $scope.fileModel = [];
    
    $scope.mostrar = true;

    $scope.clearUpload = function() {
        $scope.fileModel.name = "";
        $scope.fileModel.type = "";
    }
    
    //image usada para subida de imagen como FILE y no
    //como Blob, ya que convierte el svg a png y no genera bien la subida
    image = null;

    $scope.beforeChange = function($files) {
        image = $files[0];
        $scope.fileModel.name = $files[0].name;
    };


    $scope.model = new model();
    $scope.add = function(isValid) {
        if (isValid) {
                $scope.model.uploadImage = image;
            
            var data = {
                'name': $scope.model.name,
                'description': $scope.model.description,
                'color': $scope.model.color,
                'uploadImage': $scope.model.uploadImage,
                'createdBy': $rootScope.globals.currentUser.user
            };

            Upload.upload({
                url: $rootScope.url + "/categories",
                data: data
            }).then(function(resp) {
                Alertify.success('Se ha creado la categoría con éxito');
                $location.url('/categories/' + resp.data.data.id + '/view');
            }, function(resp) {
                // alert(resp.status);
            }, function(evt) {
//                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
//                $scope.uploadImageProgress = progressPercentage;
            });
        } else {
            if(image != null && image.type != 'image/svg+xml') {
                Alertify.alert('Archivo no permitido.');
            } else {
                Alertify.alert('Hay campos sin completar.');
            }
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
    
    $scope.model.color = '#FF0000';

    $scope.options_color = {
        format: 'hex',
        alpha: false,
        placeholder: 'Seleccione un color',
    };

}

function valorCheckbox(valor) {
    console.log(valor);
}

function CategoryEditController($scope, Flash, rest, $routeParams, model, $location, Alertify, modelService, Upload) {
    modelService.initService("Category", "categories", $scope);

    $scope.mostrar = false;

    $scope.model = new model();
    $scope.update = function(isValid) {

        $scope.model.createdBy = $scope.model.createdBy.id;
        
        if (isValid) {
            rest().update({
                type: $scope.type,
                id: $scope.model.id
            }, $scope.model, function() {
                Alertify.success('Se ha editado la categoría con éxito');
                
                var url = '/' + $scope.type;
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
    
    $scope.options_color = {
        format: 'hex',
        alpha: false,
        placeholder: 'Seleccione un color',
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