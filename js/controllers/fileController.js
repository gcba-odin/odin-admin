var app = angular.module('odin.fileControllers', ['ngFileUpload']);

app.factory('model', function ($resource) {
    return $resource();
});

function FileListController($scope, $location, rest, $rootScope, Flash, Alertify, $routeParams, modelService, configs, usSpinnerService, underReview, ROLES) {
    usSpinnerService.spin('spinner');
    modelService.initService("File", "files", $scope);
    //factory configs
    configs.statuses($scope);

    $scope.parameters = {
        skip: 0,
        limit: 20,
        conditions: '',
        orderBy: 'createdAt',
        sort: 'DESC'
    };

    $scope.underReview = underReview;
    
    $scope.filtersView = [{
        name: 'Autor',
        model: 'users',
        key: 'username',
        modelInput: 'createdBy',
        multiple: true,
        condition: '',
        permission: true,
    }, {
        name: 'Tipo',
        model: 'filetypes',
        key: 'name',
        modelInput: 'type',
        multiple: true,
        permission: true,
    }];

    if(!!$rootScope.adminglob.currentUser && $rootScope.adminglob.currentUser.role === ROLES.GUEST) {
        $scope.filtersView[0].permission = false;
    }

    if (underReview) {
        $scope.parameters.conditions = '&status=' + $scope.statuses.underReview;
        $scope.filtersView[0].underReview = true;
    } else {
        $scope.parameters.conditions = '';
        if(!!$rootScope.adminglob.currentUser && $rootScope.adminglob.currentUser.role === ROLES.GUEST) {
            var current_us = $rootScope.adminglob.currentUser.user;
            $scope.parameters.conditions = '&createdBy=' + current_us + '&owner=' + current_us;
        }
        
        $scope.filtersView.push({
            name: 'Estado',
            model: 'statuses',
            key: 'name',
            modelInput: 'status',
            multiple: true
        });
    }

    $scope.confirmDelete = function (item) {
        modelService.confirmDelete(item);
    }

    $scope.deleteModel = function (model) {
        modelService.delete($scope, model);
    };

    $scope.edit = function (model) {
        var type = $scope;

        if (!!model.restService || !!model.soapService) {
            type = {
                type: 'webservices'
            };
        }
        modelService.edit(type, model);
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

function FileViewController($scope, Flash, rest, $routeParams, $location, modelService, $sce, Alertify, usSpinnerService, $window, configs, $filter, $rootScope, ROLES) {
    usSpinnerService.spin('spinner');
    modelService.initService("File", "files", $scope);
    $scope.getHtml = function (html) {
        return $sce.trustAsHtml(html);
    };
    $scope.view_ok = true;
    $scope.permission_block = false;

    var loadModel = function () {
        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type,
            //params: "include=tags"
        }, function () {
            $scope.model.resources = rest().resources({
                id: $scope.model.id,
                type: $scope.type
            }, function(resp) {
                if(!!resp.data.maps) {
                    var maps_guest = $filter('filterIfGuestUser')(resp.data.maps);
                    if(maps_guest.length == 0) {
                        $scope.view_ok = false;
                    }
                }
                if(!!resp.data.charts) {
                    var charts_guest = $filter('filterIfGuestUser')(resp.data.charts);
                    if(charts_guest.length == 0) {
                        $scope.view_ok = false;
                    }
                }
            });
            
            $scope.model.kml = false;
            if($.inArray('application/vnd.google-earth.kml+xml', $scope.model.type.mimetype) == 0)
                $scope.model.kml = true;
            
            if($rootScope.adminglob.currentUser.role === ROLES.GUEST && $scope.model.status.id == $scope.statuses.rejected) {
                $scope.permission_block = true;
            }
            
            usSpinnerService.stop('spinner');
        }, function (error) {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
        });
    };

    $scope.edit = function (model) {
        var type = $scope;

        if (!!model.restService || !!model.soapService) {
            type = {
                type: 'webservices'
            };
        }
        modelService.edit(type, model);
    }

    //factory configs
    configs.statuses($scope);

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
        var text_type = (type == 'charts') ? 'gráfico' : (type == 'maps') ? 'mapa' : 'recurso';
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

    $scope.reject = function (id, type) {
        var text_type = (type == 'charts') ? 'gráfico' : (type == 'maps') ? 'mapa' : 'recurso';
        Alertify.set({
            labels: {
                ok: 'Ok',
                cancel: 'Cancelar'
            }
        });
        Alertify.confirm('¿Está seguro que quiere rechazar este ' + text_type + '?').then(
            function onOk() {
                usSpinnerService.spin('spinner');

                rest().reject({
                    type: type,
                    id: id
                }, {}, function (resp) {
                    usSpinnerService.stop('spinner');
                    loadModel();
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
    
    $scope.sendReview = function (id, type) {
        var text_type = (type == 'charts') ? 'gráfico' : (type == 'maps') ? 'mapa' : 'recurso';
        Alertify.set({
            labels: {
                ok: 'Ok',
                cancel: 'Cancelar'
            }
        });
        Alertify.confirm('¿Está seguro que quiere enviar a revisión este ' + text_type + '?').then(
            function onOk() {
                usSpinnerService.spin('spinner');

                rest().sendReview({
                    type: type,
                    id: id
                }, {}, function (resp) {
                    usSpinnerService.stop('spinner');
                    loadModel();
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
    
    $scope.cancel = function (id, type) {
        var text_type = (type == 'charts') ? 'gráfico' : (type == 'maps') ? 'mapa' : 'recurso';
        Alertify.set({
            labels: {
                ok: 'Ok',
                cancel: 'Cancelar'
            }
        });
        Alertify.confirm('¿Está seguro que quiere cancelar este ' + text_type + '?').then(
            function onOk() {
                usSpinnerService.spin('spinner');

                rest().cancel({
                    type: type,
                    id: id
                }, {}, function (resp) {
                    usSpinnerService.stop('spinner');
                    loadModel();
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

    loadModel();

    $scope.confirmDelete = function (item) {
        Alertify.set({
            labels: {
                ok: 'Ok',
                cancel: 'Cancelar'
            }
        });
        Alertify.confirm('¿Está seguro que quiere borrar este recurso?').then(
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

    $scope.deleteResource = function (id, type) {
        Alertify.set({
            labels: {
                ok: 'Ok',
                cancel: 'Cancelar'
            }
        });
        Alertify.confirm('¿Está seguro que quiere borrar este recurso?').then(
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

function FilePreviewController($scope, Flash, rest, $routeParams, $location, modelService, $sce, Alertify, usSpinnerService, $window, configs) {
    usSpinnerService.spin('spinner');
    modelService.initService("File", "files", $scope);

    $scope.params = {
        limit: 20
    };

    $scope.model = rest().findOne({
        id: $routeParams.id,
        type: $scope.type
    }, function (resp) {
        if (resp.type.api) {
            $scope.model.contents = rest().contents({
                id: $scope.model.id,
                type: $scope.type,
                params: 'limit=' + $scope.params.limit
            }, function () {
                usSpinnerService.stop('spinner');
            }, function (error) {
                usSpinnerService.stop('spinner');
                modelService.reloadPage();
            });
        } else {
            usSpinnerService.stop('spinner');
        }
    }, function (error) {
        usSpinnerService.stop('spinner');
        modelService.reloadPage();
    });

    $scope.paging = function (event, page, pageSize, total, resource) {
        usSpinnerService.spin('spinner');
        var skip = (page - 1) * $scope.params.limit;
        //$scope.q = "&skip=" + skip + "&limit=" + $scope.limit;
        resource.contents = rest().contents({
            id: resource.id,
            type: 'files',
            params: "skip=" + skip + "&limit=" + $scope.params.limit
        }, function () {
            usSpinnerService.stop('spinner');
        }, function (error) {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
        });
    };
    
    $scope.scroll = 0;
    $scope.loading = 'Cargando..';

    $scope.getNavStyle = function(scroll) {
        if (scroll > 100)
            return 'pdf-controls fixed';
        else
            return 'pdf-controls';
    }

    $scope.onError = function() {
        Alertify.alert('El archivo a previsualizar está dañado o hubo un problema al descargarlo.');
        $scope.loading = 'El archivo a previsualizar está dañado o hubo un problema al descargarlo.';
    }

    $scope.onLoad = function() {
        $scope.loading = '';
    }
}

function FileCreateController($scope, $sce, rest, model, flashService, Flash, $location, Upload, $rootScope, modelService, $routeParams, Alertify, usSpinnerService, $window, configs, Idle, session_timeout) {
    $scope.today = moment().format('YYYY-MM-DD');

    usSpinnerService.spin('spinner');
    modelService.initService("File", "files", $scope);

    $scope.clearUpload = function () {
        $scope.fileModel.name = "";
        $scope.fileModel.type = "";
        $scope.fileModel.mimetype = "";
    }

    //factory configs
    configs.statuses($scope);

    $scope.filter = true;
    var hard_file = null;
    var f_types = [];

    $scope.beforeChange = function ($files) {
        $scope.filter = true;
        $scope.fileModel.name = $files[0].name;
        $scope.fileModel.mimetype = $files[0].type;

        var type = $files[0].name.split('.').pop();
        if (type == "doc" || type == "docx") {
            $scope.fileModel.type = 'fa-file-word-o';
        } else if (type == "xlsx" || type == "xls") {
            $scope.fileModel.type = 'fa-file-excel-o';
        } else if (type == "pdf") {
            $scope.fileModel.type = 'fa-file-pdf-o';
        } else if ((type == "rar") || (type == "zip")) {
            $scope.fileModel.type = 'fa-file-archive-o';
            //if (type == "rar") {
            $scope.filter = false;
            hard_file = $files[0];
            //}
        } else if (type == "shp") {
            $scope.filter = false;
            hard_file = $files[0];
            $scope.fileModel.type = 'fa-file-text-o';
        } else if (type == "kml") {
            $scope.filter = false;
            hard_file = $files[0];
            $scope.fileModel.type = 'fa-file-text-o';
        } else {
            $scope.fileModel.type = 'fa-file-text-o';
        }
    }

    var datasetHasLayout = function (id, callback) {
        var dataset_file = rest().findOne({
            id: id,
            type: 'datasets',
            params: 'include=files'
        }, function () {
            var datab = {
                ret: false,
                file: {}
            };
            if (!!dataset_file.files) {
                angular.forEach(dataset_file.files, function (element) {
                    if (element.layout) {
                        datab.ret = true;
                        datab.file.id = element.id;
                        datab.file.name = element.name;
                    }
                });
            }
            callback(datab);
        });
    };

    $scope.status_default = true;
    $scope.unsave = true;

    $scope.model = new model();
    $scope.model.items = [];
    $scope.model.uploadFile = '';
    $scope.model.updated = false;
    $scope.model.layout = false;
    $scope.model.status = $scope.statuses.default;

    $scope.steps = [];
    $scope.steps[0] = "active";
    $scope.steps[1] = "undone";
    $scope.steps[2] = "undone";
    $scope.stepactive = 0;

    $scope.model.owner = {
        'id': $scope.adminglob.currentUser.user,
        'username': $scope.adminglob.currentUser.username
    };
    
    //get optionals by default on config
    $scope.config_key = 'defaultOptionals';
    configs.findKey($scope, function(resp) {
        if (!!resp.data[0] && !!resp.data[0].value) {
            var opts = resp.data[0].value.split(',');
            angular.forEach(opts, function(element) {
                $scope.model.items.push({
                    field1: element,
                    field2: ''
                });
            });
        }
    });

    // get organization by default on config
    $scope.config_key = 'defaultOrganization';
    configs.findKey($scope, function (resp) {
        if (!!resp.data[0] && !!resp.data[0].value) {
            rest().findOne({
                type: 'organizations',
                id: resp.data[0].value
            }, function (organization) {
                $scope.model.organization = {
                    'id': resp.data[0].value,
                    'name': organization.name
                }
            });

        }
    });


    $scope.dataset_disabled = 'enabled';
    if (!angular.isUndefined($routeParams.dataset)) {
        $scope.model.dataset = rest().findOne({
            id: $routeParams.dataset,
            type: 'datasets'
        });
        $scope.dataset_disabled = 'disabled';
    }

    $scope.fileModel = []
    $scope.checkstep = function (step) {
        if ($scope.model.uploadFile == null && step == 1 && $scope.fileModel.name && $scope.filter) {
            var text_mimetype = '';
            if (!!$scope.fileModel.mimetype && $scope.fileModel.mimetype != '') {
                text_mimetype = ' (' + $scope.fileModel.mimetype + ')';
            }
            $scope.clearUpload();
            Alertify.set({
                labels: {
                    ok: 'Ir a Tipo de archivos',
                    cancel: 'Continuar'
                }
            });
            Alertify
                .confirm("Archivo no permitido. Revise que el tipo del archivo" + text_mimetype + " que desea crear se encuentre en la sección 'Tipos de Archivos'.")

                .then(
                function onOk() {
                    $location.path('filetypes');
                }
                );
        } else {
            if (($scope.fileModel.name && step == 1 && ($scope.model.uploadFile != null || hard_file != null)) || ($scope.fileModel.name && step == 2 && $scope.form.$valid && ($scope.model.uploadFile != null || hard_file != null)) || step == 0) {

                if (step == 0) {
                    $scope.steps[0] = "active";
                    $scope.steps[1] = "undone";
                    $scope.steps[2] = "undone";
                } else if (step == 1) {
                    $scope.steps[0] = "done";
                    $scope.steps[1] = "active";
                    $scope.steps[2] = "undone";
                } else {
                    if ($scope.model.layout) {
                        datasetHasLayout($scope.model.dataset, function (resp) {
                            if (resp.ret) {
                                Alertify.set({
                                    labels: {
                                        ok: 'Si',
                                        cancel: 'No'
                                    }
                                });
                                Alertify
                                    .confirm("El dataset seleccionado ya cuenta con una Guía de Datos. El archivo es <a target='_blank' href='#/files/" + resp.file.id + "/view'>" + resp.file.name + "</a><br>¿Desea cambiarlo? Los archivos no se sobreescribirán.")

                                    .then(
                                    function onOk() {
                                        //nothing
                                    },
                                    function onCancel() {
                                        $scope.model.layout = false;
                                        //$scope.checkstep(step - 1);
                                    }
                                    );
                            }
                        });
                    }


                    $scope.steps[0] = "done";
                    $scope.steps[1] = "done";
                    $scope.steps[2] = "active";
                }
                $scope.stepactive = step;
            }
        }
    }
    $scope.step = function (step) {
        if (($scope.fileModel.name && step == 1) || ($scope.fileModel.name && step == 2) || step == 0 && ($scope.model.uploadFile != null || hard_file != null)) {
            var step = $scope.steps[step];
            if (step == "undone") {
                return "undone";
            } else if (step == "done") {
                return "done";
            } else {
                return "active";

            }
        }

    }
    $scope.getHtml = function (html) {
        return $sce.trustAsHtml(html);
    };

    $scope.add = function(isValid) {
        Idle.setIdle(session_timeout.extended);
        usSpinnerService.spin('spinner');
        $scope.unsave = false;
        $scope.uploadImageProgress = 10;

        for (obj in $scope.model) {
            if (obj.indexOf("optional") != -1) {
                delete $scope.model[obj]
            }
        }

        $scope.model.optionals = {};
        var cont = 1;
        for (var i = 0; i < $scope.model.items.length; i++) {
            var values = [];
            $scope.model["optional" + cont] = "";
            $scope.model.optionals[$scope.model.items[i].field1] = $scope.model.items[i].field2;
            cont++;
        }

        if (hard_file != null) {
            $scope.model.uploadFile = hard_file;
        }

        var data = {
            'name': $scope.model.name, //.replace(/\.[^/.]+$/, ""), //removes file extension from name
            //'status': $scope.model.status,
            'organization': $scope.model.organization,
            'dataset': $scope.model.dataset,
            'description': $scope.model.description,
            'notes': $scope.model.notes,
            'optionals': Upload.json($scope.model.optionals),
            //  'url': $scope.model.url,
            //'visible': $scope.model.visible,
            'owner': $scope.model.owner,
            'updateFrequency': $scope.model.updateFrequency,
            //'tags': $scope.model.tags ? $scope.model.tags.join(",") : "",
            'layout': $scope.model.layout,
            'updated': $scope.model.updated,
        };

        if ($scope.statuses.default == $scope.statuses.published) {
            data.publishedAt = new Date();
        } else if($scope.statuses.default == $scope.statuses.unpublished) {
            data.unPublishedAt = new Date();
        } else if($scope.statuses.default == $scope.statuses.rejected) {
            data.rejectedAt = new Date();
        } else if($scope.statuses.default == $scope.statuses.underReview) {
            data.reviewedAt = new Date();
        }

        if ($scope.model.gatheringDate) {
            data.gatheringDate = $scope.model.gatheringDate.toISOString().slice(0, 10); //.toISOString().slice(0, 10), //new Date().toISOString().slice(0, 19).replace('T', ' ');
        }
        
        if ($scope.model.uploadFile != null) {
            data.uploadFile = $scope.model.uploadFile;
        } 

        Upload.upload({
            url: $rootScope.url + "/files",
            data: data,
        }).then(function(resp) {
            Idle.setIdle(session_timeout.base);
            Flash.clear();
            usSpinnerService.stop('spinner');
            $location.url('/files/' + resp.data.data.id + '/view');
        }, function(error) {
            Idle.setIdle(session_timeout.base);
            usSpinnerService.stop('spinner');
            // alert(resp.status);
            $scope.unsave = true;
            if (error.data.data && error.data.data.name) {
                Alertify.alert('El nombre del recurso ya existe.');
            } else {
                Alertify.alert('Ha ocurrido un error al crear el recurso.');
            }
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            $scope.uploadImageProgress = progressPercentage;
            $scope.unsave = true;
            if($scope.uploadImageProgress == 100) {
                flashService.showInfo('Aguarde que se está guardando en la base de datos.');
            }
            //usSpinnerService.stop('spinner');
        });
    };


    $scope.inputs = [];
    var i = 0;
    $scope.addInput = function () {
        if ($scope.model.items.length < 10) {
            var newItemNo = $scope.model.items.length + 1;
            $scope.model.items.push({
                field: ""
            })
        }

    }
    $scope.deleteIndexInput = function (index, field) {
        $scope.model.items.splice(index, 1);
    }

    $scope.increment = function (a) {
        return a + 1;
    }

    $scope.itemName = function (a) {
        return "optional" + (parseInt(a) + 1);
    }

    var loadFileTypes = function () {
        var fileTypes = rest().get({
            type: 'fileTypes'
        }, function () {

            angular.forEach(fileTypes.data, function (element) {
                f_types.push(element.mimetype);
            });
            $scope.fileTypes = f_types.toString();
            usSpinnerService.stop('spinner');
        }, function () {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
        });
    };

    loadFileTypes();

}

function FileEditController($rootScope, $scope, flashService, Flash, rest, $routeParams, model, $location, modelService, $sce, Upload, usSpinnerService, Alertify, $window, configs, Idle, session_timeout, ROLES) {
    $scope.today = moment().format('YYYY-MM-DD');
    usSpinnerService.spin('spinner');
    modelService.initService("File", "files", $scope);
    $scope.model = new model();

    $scope.status_default = false;

    //factory configs
    configs.statuses($scope);

    $scope.model = new model();
    $scope.steps = [];
    $scope.steps[0] = "active";
    $scope.steps[1] = "undone";
    $scope.steps[2] = "undone";
    $scope.stepactive = 0;

    $scope.mostrar = false;
    var hard_file = null;
    $scope.filter = true;

    $scope.fileModel = [];

    $scope.clearUpload = function () {
        $scope.fileModel.name = "";
        $scope.fileModel.type = "";
        $scope.fileModel.mimetype = "";
    }

    var datasetHasLayout = function (id, callback) {
        var dataset_file = rest().findOne({
            id: id,
            type: 'datasets',
            params: 'include=files'
        }, function () {
            var datab = {
                ret: false,
                file: {}
            };
            if (!!dataset_file.files) {
                angular.forEach(dataset_file.files, function (element) {
                    if (($scope.model.id != element.id) && (element.layout)) {
                        datab.ret = true;
                        datab.file.id = element.id;
                        datab.file.name = element.name;
                    }
                });
            }
            callback(datab);
        });
    };

    $scope.beforeChange = function ($files) {
        $scope.mostrar = false;
        $scope.filter = true;
        $scope.fileModel.name = $files[0].name;
        $scope.fileModel.mimetype = $files[0].type;
        //$scope.model.name = $scope.fileModel.name;
        var type = $files[0].name.split('.').pop();
        if (type == "doc" || type == "docx") {
            $scope.fileModel.type = 'fa-file-word-o';
        } else if (type == "xlsx" || type == "xls") {
            $scope.fileModel.type = 'fa-file-excel-o';
        } else if (type == "pdf") {
            $scope.fileModel.type = 'fa-file-pdf-o';
        } else if (type == "rar" || type == "zip") {
            $scope.fileModel.type = 'fa-file-archive-o';
            //if (type == "rar") {
            $scope.filter = false;
            hard_file = $files[0];
            //}
        } else if (type == "shp") {
            $scope.filter = false;
            hard_file = $files[0];
            $scope.fileModel.type = 'fa-file-text-o';
        } else if (type == "kml") {
            $scope.filter = false;
            hard_file = $files[0];
            $scope.fileModel.type = 'fa-file-text-o';
        } else {
            $scope.fileModel.type = 'fa-file-text-o';
        }
        $scope.mostrar = true;
    }

    $scope.checkstep = function (step) {
        if ($scope.model.uploadFile == null && step == 1 && $scope.fileModel.name && $scope.filter && $scope.mostrar) {
            var text_mimetype = '';
            if (!!$scope.fileModel.mimetype && $scope.fileModel.mimetype != '') {
                text_mimetype = ' (' + $scope.fileModel.mimetype + ')';
            }
            $scope.clearUpload();
            Alertify.set({
                labels: {
                    ok: 'Ir a Tipo de archivos',
                    cancel: 'Continuar'
                }
            });
            Alertify
                .confirm("Archivo no permitido. Revise que el tipo del archivo" + text_mimetype + " que desea crear se encuentre en la sección 'Tipos de Archivos'.")

                .then(
                function onOk() {
                    $location.path('filetypes');
                }
                );
        } else {
            if (($scope.fileModel.name && step == 1 && ((!$scope.mostrar) || ($scope.mostrar && ($scope.model.uploadFile != null || hard_file != null)))) || ($scope.fileModel.name && step == 2 && ((!$scope.mostrar) || ($scope.mostrar && ($scope.model.uploadFile != null || hard_file != null)))) || step == 0) {

                if (step == 0) {
                    $scope.steps[0] = "active";
                    $scope.steps[1] = "undone";
                    $scope.steps[2] = "undone";
                } else if (step == 1) {
                    $scope.steps[0] = "done";
                    $scope.steps[1] = "active";
                    $scope.steps[2] = "undone";
                } else {
                    if ($scope.model.layout) {
                        datasetHasLayout($scope.model.dataset, function (resp) {
                            if (resp.ret) {
                                Alertify.set({
                                    labels: {
                                        ok: 'Si',
                                        cancel: 'No'
                                    }
                                });
                                Alertify
                                    .confirm("El dataset seleccionado ya cuenta con una Guía de Datos. El archivo es <a target='_blank' href='#/files/" + resp.file.id + "/view'>" + resp.file.name + "</a><br>¿Desea cambiarlo? Los archivos no se sobreescribirán.")

                                    .then(
                                    function onOk() {
                                        //nothing
                                    },
                                    function onCancel() {
                                        $scope.model.layout = false;
                                        //$scope.checkstep(step - 1);
                                    }
                                    );
                            }
                        });
                    }

                    $scope.steps[0] = "done";
                    $scope.steps[1] = "done";
                    $scope.steps[2] = "active";
                }
                $scope.stepactive = step;
            }
        }
    }
    $scope.step = function (step) {
        if (($scope.fileModel.name && step == 1) || ($scope.fileModel.name && step == 2) || step == 0 && ((!$scope.mostrar) || ($scope.mostrar && ($scope.model.uploadFile != null || hard_file != null)))) {
            var step = $scope.steps[step];
            if (step == "undone") {
                return "undone";
            } else if (step == "done") {
                return "done";
            } else {
                return "active";

            }
        }

    }

    $scope.getHtml = function (html) {
        return $sce.trustAsHtml(html);
    };


    $scope.update = function (isValid) {
        usSpinnerService.spin('spinner');
        Idle.setIdle(session_timeout.extended);

        $scope.model.optionals = {};
        angular.forEach($scope.model.items, function (element) {
            $scope.model.optionals[element.field1] = element.field2;
        });

        $scope.uploadImageProgress = 10;
        var data = {
            'name': $scope.model.name,
            'status': $scope.model.status,
            'organization': $scope.model.organization,
            'dataset': $scope.model.dataset,
            'description': $scope.model.description,
            'optionals': Upload.json($scope.model.optionals),
            'notes': $scope.model.notes,
            // 'url': $scope.model.url,
            //'visible': $scope.model.visible,
            'owner': $scope.model.owner,
            'updateFrequency': $scope.model.updateFrequency,
            //'tags': $scope.model.tags ? $scope.model.tags.join(",") : "",
            'updated': $scope.model.updated,
            'layout': $scope.model.layout,
            'gatheringDate': null
        }

        if (!!$scope.model.gatheringDate) {
            data.gatheringDate = $scope.model.gatheringDate.toISOString().slice(0, 10); //.toISOString().slice(0, 10), //new Date().toISOString().slice(0, 19).replace('T', ' ');
        }
        
        if(!!$scope.model.fileName) {
            data.fileName = $scope.model.fileName;
        }

        if ($scope.model.status == $scope.statuses.published) {
            data.publishedAt = new Date();
        } else if($scope.model.status == $scope.statuses.unpublished) {
            data.unPublishedAt = new Date();
        } else if($scope.model.status == $scope.statuses.rejected) {
            if(!!$rootScope.adminglob.currentUser && $rootScope.adminglob.currentUser.role === ROLES.GUEST) {
                data.status = $scope.statuses.draft;
            } else {
                data.rejectedAt = new Date();
            }
        } else if($scope.model.status == $scope.statuses.draft) {
            data.cancelledAt = new Date();
        } else if($scope.model.status == $scope.statuses.underReview) {
            data.reviewedAt = new Date();
        }
        
        if ($scope.model.uploadFile != null) {
            data.uploadFile = $scope.model.uploadFile;
        } else if (hard_file != null) {
            data.uploadFile = hard_file;
        }

        if (isValid) {
            Upload.upload({
                url: $rootScope.url + "/files/" + $scope.model.id,
                data: data,
                method: 'PUT',
            }).then(function(resp) {
                Idle.setIdle(session_timeout.base);
                Flash.clear();
                usSpinnerService.stop('spinner');
                $location.url('/files/' + resp.data.data.id + '/view');
            }, function(error) {
                Idle.setIdle(session_timeout.base);
                usSpinnerService.stop('spinner');
                // alert(resp.status);
                $scope.unsave = false;
                if (error.data.data && error.data.data.name) {
                    Alertify.alert('El nombre del recurso ya existe.');
                } else {
                    Alertify.alert('Ha ocurrido un error al editar el recurso.');
                }
            }, function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                $scope.uploadImageProgress = progressPercentage;
                $scope.unsave = false;
                if($scope.uploadImageProgress == 100) {
                    flashService.showInfo('Aguarde que se está guardando en la base de datos.');
                }
            });
        }


    };

    $scope.load = function () {
        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type,
            //params: "include=tags"
        }, function () {
            if (!!$scope.model.updateFrequency) {
                $scope.model.updateFrequency = $scope.model.updateFrequency.id;
            }
            if (!!$scope.model.status) {
                $scope.model.status = $scope.model.status.id;
            }
            if (!!$scope.model.gatheringDate) {
                $scope.model.gatheringDate = $scope.model.gatheringDate ? moment($scope.model.gatheringDate).utc() : null;
            }

            if (!$scope.model.updated) {
                $scope.model.updated = false;
            }

            if (!$scope.model.layout) {
                $scope.model.layout = false;
            }

            $scope.model.items = [];
            angular.forEach($scope.model.optionals, function (val, key) {
                $scope.model.items.push({
                    field1: key,
                    field2: val,
                });
            });

            $scope.fileModel.name = $scope.model.name;
            var type = $scope.fileModel.name.split('.').pop();
            if (type == "doc" || type == "docx") {
                $scope.fileModel.type = 'fa-file-word-o';
            } else if (type == "xlsx" || type == "xls") {
                $scope.fileModel.type = 'fa-file-excel-o';
            } else if (type == "pdf") {
                $scope.fileModel.type = 'fa-file-pdf-o';
            } else if (type == "rar" || type == "zip") {
                $scope.fileModel.type = 'fa-file-archive-o';
            } else {
                $scope.fileModel.type = 'fa-file-text-o';
            }
            usSpinnerService.stop('spinner');
        }, function (error) {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
        });
    };

    $scope.inputs = [];
    var i = 0;
    $scope.addInput = function () {
        if ($scope.model.items.length < 10) {
            var newItemNo = $scope.model.items.length + 1;
            $scope.model.items.push({
                field: ""
            })
        }

    }
    $scope.deleteIndexInput = function (index, field) {
        $scope.model.items.splice(index, 1);
    }

    $scope.increment = function (a) {
        return a + 1;
    }

    $scope.itemName = function (a) {
        return "optional" + (parseInt(a) + 1);
    }

    $scope.load();

    var loadFileTypes = function () {
        var fileTypes = rest().get({
            type: 'fileTypes'
        }, function () {
            $scope.fileTypes = [];
            angular.forEach(fileTypes.data, function (element) {
                $scope.fileTypes.push(element.mimetype);
            });
            $scope.fileTypes = $scope.fileTypes.toString();
        }, function () {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
        });
    };

    loadFileTypes();
}
