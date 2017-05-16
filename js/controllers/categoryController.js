var app = angular.module('odin.categoryControllers', []);

app.factory('model', function($resource) {
    return $resource();
});


function CategoryListController($scope, $rootScope, modelService, configs, usSpinnerService, ROLES) {
    usSpinnerService.spin('spinner');
    modelService.initService("Category", "categories", $scope);

    $scope.parameters = {
        skip: 0,
        limit: 20,
        conditions: '&fields=id,name,datasets,deletedAt,subcategories,datasetsSubcategories,createdBy,parent',
        orderBy: 'name',
        sort: 'ASC'
    };

    $scope.filtersView = [{
        name: 'Autor',
        model: 'users',
        key: 'username',
        modelInput: 'createdBy',
        multiple: true,
        permission: true,
    }];

    if(!!$rootScope.adminglob.currentUser && $rootScope.adminglob.currentUser.role === ROLES.GUEST) {
        $scope.filtersView[0].permission = false;
    }

    $scope.filtersInclude = ['datasets', 'subcategories', 'datasetsSubcategories'];

    $scope.inactiveModel = function(item) {
        modelService.deactivateList(item, $scope);
    }

    $scope.activeModel = function(item) {
        modelService.restoreList($scope, item);
    };

    $scope.confirmDelete = function(item) {
        modelService.confirmDelete(item, {});
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
    configs.findKey($scope, function(resp) {
        if (!!resp.data[0] && !!resp.data[0].value) {
            $scope.parameters.limit = resp.data[0].value;
        }

        $scope.q = "&skip=" + $scope.parameters.skip + "&limit=" + $scope.parameters.limit;

        modelService.loadAll($scope, function(resp) {
            usSpinnerService.stop('spinner');
            if (!resp) {
                modelService.reloadPage();
            }
        });
    });

    $scope.paging = function(event, page, pageSize, total) {
        usSpinnerService.spin('spinner');
        $scope.parameters.skip = (page - 1) * $scope.parameters.limit;
        $scope.q = "&skip=" + $scope.parameters.skip + "&limit=" + $scope.parameters.limit;
        if(!!$scope.parameters.conditions_page) {
            $scope.q += $scope.parameters.conditions_page;
        }
        modelService.loadAll($scope, function(resp) {
            usSpinnerService.stop('spinner');
            if(!resp) {
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
            if (!resp) {
                modelService.reloadPage();
            }
        });
    };

}

function CategoryViewController($scope, Flash, rest, $routeParams, $location, $sce, modelService, $rootScope, usSpinnerService, Alertify, $window) {
    usSpinnerService.spin('spinner');
    modelService.initService("Category", "categories", $scope);

    $scope.filtersInclude = ['datasets', 'subcategories', 'datasetsSubcategories'];

    $scope.inactiveModel = function(item, prev) {
        modelService.deactivateView(item, $scope, prev);
    }

    $scope.activeModel = function(item, prev) {
        modelService.restoreView($scope, item, prev);
    };

    $scope.confirmDelete = function(item) {
        // modelService.confirmDelete(item, {});
        var item = item.target.dataset;
        Alertify.set({
            labels: {
                ok: 'Ok',
                cancel: 'Cancelar'
            }
        });
        Alertify.confirm(item.textdelete).then(
            function onOk() {
                usSpinnerService.spin('spinner');
                rest().delete({
                    id: item.id,
                    type: 'categories'
                }, function(resp) {
                    usSpinnerService.stop('spinner');
                    $window.location.reload();
                }, function(error) {
                    usSpinnerService.stop('spinner');
                    modelService.reloadPage();
                });
            },
            function onCancel() {
                return false;
            }
        );
    };

    $scope.confirmDeleteCategory = function (item) {
        var text = (!!$scope.model.parent) ? 'subcategoría' : 'categoría';
        Alertify.set({
            labels: {
                ok: 'Ok',
                cancel: 'Cancelar'
            }
        });
        Alertify.confirm('¿Está seguro que quiere borrar esta ' + text + '?').then(
            function onOk() {
                usSpinnerService.spin('spinner');
                rest().delete({
                    type: $scope.type,
                    id: $scope.model.id
                }, function (resp) {
                    usSpinnerService.stop('spinner');
                    var url = "/" + $scope.type;
                    $location.path(url);
                }, function (error) {
                    usSpinnerService.stop('spinner');
                    modelService.reloadPage();
                });
            },
            function onCancel() {
                return false;
            }
        );
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

    var loadModel = function() {
        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type,
            params: 'include=subcategories,datasets,datasetsSubcategories&fields=id,parent,description,createdAt,subcategories,datasets,color,updatedAt,name,datasetsSubcategories,createdBy'
        }, function() {
            var subcategories = [];
            for (var i = 0; i < $scope.model.subcategories.length; i++) {
                subcategories.push('<span class="label label-primary condition-active">' + $scope.model.subcategories[i].name + '</span>')
            }
            $scope.subcategoriesNames = subcategories.join(" - ");
            usSpinnerService.stop('spinner');
        }, function(error) {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
        });
    };

    loadModel();

    $scope.publish = function (id, type) {
        usSpinnerService.spin('spinner');

        rest().publish({
            id: id,
            type: type,
        }, {}, function (resp) {
            usSpinnerService.stop('spinner');
            loadModel();
            //var url = '/' + $scope.type;
            // $location.path(url);
        }, function (error) {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
        });
    };

    $scope.unPublish = function (id, type) {
        var text_type = (type == 'datasets') ? 'dataset' : '';
        Alertify.set({
            labels: {
                ok: 'Ok',
                cancel: 'Cancelar'
            }
        });
        Alertify.confirm('¿Está seguro que quiere despublicar este ' + text_type + '?').then(
            function onOk() {
                usSpinnerService.spin('spinner');

                rest().unpublish({
                    type: type,
                    id: id
                }, {}, function (resp) {
                    usSpinnerService.stop('spinner');
                    loadModel();
                    //var url = '/' + $scope.type;
                    // $location.path(url);
                }, function (error) {
                    usSpinnerService.stop('spinner');
                    modelService.reloadPage();
                });
            },
            function onCancel() {
                return false;
            }
        );
    };

    $scope.deleteResource = function (id, type) {
        Alertify.set({
            labels: {
                ok: 'Ok',
                cancel: 'Cancelar'
            }
        });
        Alertify.confirm('¿Está seguro que quiere borrar este dataset?').then(
            function onOk() {
                usSpinnerService.spin('spinner');
                rest().delete({
                    type: type,
                    id: id
                }, function (resp) {
                    usSpinnerService.stop('spinner');
                    $window.location.reload();
                }, function (error) {
                    usSpinnerService.stop('spinner');
                    modelService.reloadPage();
                });
            },
            function onCancel() {
                return false;
            }
        );
    };
}

function CategoryCreateController($scope, rest, $routeParams, model, Flash, $location, $rootScope, Alertify, modelService, Upload, usSpinnerService, subcategory) {
    modelService.initService("Category", "categories", $scope);

    $scope.fileModel = [];

    $scope.mostrar = true;
    $scope.subcategory = subcategory;
    $scope.category_disabled = 'enabled';

    $scope.clearUpload = function() {
        $scope.fileModel.name = "";
        $scope.fileModel.type = "";
    };

    $scope.clearImage = function() {
        image = null;
        for (var att in $scope.form.uploadImage.$error) {
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
                'parent': $scope.model.category
            };

            Upload.upload({
                url: $rootScope.url + "/categories",
                data: data
            }).then(function(resp) {
                usSpinnerService.stop('spinner');
                //Alertify.success('Se ha creado la categoría con éxito');
                $location.url('/categories/' + resp.data.data.id + '/view');
            }, function(error) {
                usSpinnerService.stop('spinner');

                if(error.data.data && (error.data.data.name || error.data.data.slug)) {
                    Alertify.alert('El nombre de la categoría ya existe.');
                } else {
                    Alertify.alert('Ha ocurrido un error al crear la categoría.');
                }
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

    if (!angular.isUndefined($routeParams.category)) {
        $scope.model.parent = $routeParams.category;
        $scope.model.category = rest().findOne({
            id: $routeParams.category,
            type: 'categories',
            params: 'fields=id,name,parent'
        });
        $scope.category_disabled = 'disabled';
    }
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
        $scope.model.deleteImage = "true";
    };

    $scope.clearImage = function() {
        image = null;
        for (var att in $scope.form.uploadImage.$error) {
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
        $scope.model.deleteImage = "false";
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
                'active': $scope.model.active,
                'deleteImage': $scope.model.deleteImage,
                'fileName': $scope.model.fileName
            };

            if (image != null) {
                data.uploadImage = $scope.model.uploadImage;
            } /*else {
                data.uploadImage = null;
            }*/

            Upload.upload({
                url: $rootScope.url + "/categories/" + $scope.model.id,
                method: 'PUT',
                data: data
            }).then(function(resp) {
                usSpinnerService.stop('spinner');
                //Alertify.success('Se ha editado la categoría con éxito');
                $location.url('/categories/' + resp.data.data.id + '/view');
            }, function(error) {
                usSpinnerService.stop('spinner');

                if(error.data.data && (error.data.data.name || error.data.data.slug)) {
                    Alertify.alert('El nombre de la categoría ya existe.');
                } else {
                    Alertify.alert('Ha ocurrido un error al editar la categoría.');
                }
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
            type: $scope.type,
            params: 'fields=id,name,color,fileName,description,category'
        }, function() {
            $scope.fileModel = {
                type: 'svg',
                name: $scope.model.fileName
            };
            $scope.model.deleteImage = "false";
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
