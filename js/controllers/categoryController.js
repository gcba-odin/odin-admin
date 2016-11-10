var app = angular.module('odin.categoryControllers', []);

app.factory('model', function($resource) {
    return $resource();
});


function CategoryListController($scope, $location, rest, $rootScope, Flash, Alertify, modelService, configs, usSpinnerService) {
    usSpinnerService.spin('spinner');
    modelService.initService("Category", "categories", $scope);

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

    var filtersGet = ['datasets'];

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

    $scope.activeClass = function(activeClass) {
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

function CategoryViewController($scope, Flash, rest, $routeParams, $location, $sce, modelService, $rootScope, usSpinnerService) {
    usSpinnerService.spin('spinner');
    modelService.initService("Category", "categories", $scope);

    $scope.inactiveModel = function(item) {
        modelService.deactivateView(item, $scope);
    }

    $scope.activeModel = function(item) {
        modelService.restoreView($scope, item);
    };

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

    $scope.model = rest().findOne({
        id: $routeParams.id,
        type: $scope.type
    }, function() {
        usSpinnerService.stop('spinner');
    }, function(error) {
        usSpinnerService.stop('spinner');
        modelService.reloadPage();
    });
}

function CategoryCreateController($scope, rest, model, Flash, $location, $rootScope, Alertify, modelService, Upload, usSpinnerService) {
    modelService.initService("Category", "categories", $scope);

    $scope.fileModel = [];

    $scope.mostrar = true;

    $scope.clearUpload = function() {
        $scope.fileModel.name = "";
        $scope.fileModel.type = "";
    };

    $scope.clearImage = function() {
        image = null;
        for (var att in  $scope.form.uploadImage.$error) {
            if ($scope.form.uploadImage.$error.hasOwnProperty(att)) {
                $scope.form.uploadImage.$setValidity(att, true);
            }
        }
    };

    //image usada para subida de imagen como FILE y no
    //como Blob, ya que convierte el svg a png y no genera bien la subida
    image = null;

    $scope.beforeChange = function($files) {
        image = $files[0];
        $scope.fileModel.name = $files[0].name;
    };


    $scope.model = new model();
    $scope.add = function(isValid) {
        usSpinnerService.spin('spinner');
        if (isValid) {
            $scope.model.uploadImage = image;

            var data = {
                'name': $scope.model.name,
                'description': $scope.model.description,
                'color': $scope.model.color,
                'uploadImage': $scope.model.uploadImage,
            };

            Upload.upload({
                url: $rootScope.url + "/categories",
                data: data
            }).then(function(resp) {
                usSpinnerService.stop('spinner');
                Alertify.success('Se ha creado la categoría con éxito');
                $location.url('/categories/' + resp.data.data.id + '/view');
            }, function(error) {
                usSpinnerService.stop('spinner');
                if(error.data.data && error.data.data.name) {
                    Alertify.alert('El nombre de la categoría ya existe.');
                } else {
                    Alertify.alert('Ha ocurrido un error al crear la categoría.');
                }
                // alert(resp.status);
            }, function(evt) {
                usSpinnerService.stop('spinner');
//                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
//                $scope.uploadImageProgress = progressPercentage;
            });
        } else {
            usSpinnerService.stop('spinner');
            if ((image != null && image.type != 'image/svg+xml') || (!!image && !!image.$error)) {
                $scope.clearImage();
                $scope.clearUpload();
                Alertify.alert('El archivo está dañado o no corresponde a un svg.');
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

function CategoryEditController($scope, Flash, rest, $routeParams, model, $location, Alertify, modelService, Upload, $rootScope, usSpinnerService) {
    usSpinnerService.spin('spinner');
    modelService.initService("Category", "categories", $scope);

    $scope.model = new model();

    $scope.mostrar = false;

    $scope.fileModel = [];

    $scope.clearUpload = function() {
        $scope.fileModel.name = "";
        $scope.fileModel.type = "";
    };

    $scope.clearImage = function() {
        image = null;
        for (var att in  $scope.form.uploadImage.$error) {
            if ($scope.form.uploadImage.$error.hasOwnProperty(att)) {
                $scope.form.uploadImage.$setValidity(att, true);
            }
        }
    };

    //image usada para subida de imagen como FILE y no
    //como Blob, ya que convierte el svg a png y no genera bien la subida
    image = null;

    $scope.beforeChange = function($files) {
        image = $files[0];
        $scope.fileModel.name = $files[0].name;
        $scope.mostrar = true;
    };


    $scope.model = new model();
    $scope.update = function(isValid) {
        usSpinnerService.spin('spinner');
        if (isValid) {
            $scope.model.uploadImage = image;

            var data = {
                'name': $scope.model.name,
                'description': $scope.model.description,
                'color': $scope.model.color,
                'active': $scope.model.active
            };

            if (image != null) {
                data.uploadImage = $scope.model.uploadImage;
            }

            Upload.upload({
                url: $rootScope.url + "/categories/" + $scope.model.id,
                method: 'PUT',
                data: data
            }).then(function(resp) {
                usSpinnerService.stop('spinner');
                Alertify.success('Se ha editado la categoría con éxito');
                $location.url('/categories/' + resp.data.data.id + '/view');
            }, function(error) {
                usSpinnerService.stop('spinner');
                if(error.data.data && error.data.data.name) {
                    Alertify.alert('El nombre de la categoría ya existe.');
                } else {
                    Alertify.alert('Ha ocurrido un error al editar la categoría.');
                }
                // alert(resp.status);
            }, function(evt) {
                usSpinnerService.stop('spinner');
//                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
//                $scope.uploadImageProgress = progressPercentage;
            });
        } else {
            usSpinnerService.stop('spinner');
            if ((image != null && image.type != 'image/svg+xml') || (!!image && !!image.$error)) {
                $scope.clearImage();
                $scope.clearUpload();
                Alertify.alert('El archivo está dañado o no corresponde a un svg.');
            } else {
                Alertify.alert('Hay campos sin completar.');
            }
        }
    };


    $scope.activate = function() {
        $scope.model.active = true;
    };

    $scope.deActivate = function() {
        $scope.model.active = false;
    };

    $scope.load = function() {
        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type
        }, function() {
            $scope.fileModel = {
                type: 'svg',
                name: $scope.model.fileName
            };
            usSpinnerService.stop('spinner');
        }, function(error) {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
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
