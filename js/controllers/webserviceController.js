var app = angular.module('odin.webserviceControllers', ['ngFileUpload']);

app.factory('model', function($resource) {
    return $resource();
});


function WebserviceListController($scope, $location, rest, $rootScope, Flash, Alertify, $routeParams, modelService) {


    modelService.initService("File", "files", $scope);

    $scope.filtersView = [{
        name: 'Estado',
        model: 'statuses',
        key: 'name',
        modelInput: 'status',
        multiple: true
    }, {
        name: 'Autor',
        model: 'users',
        key: 'username',
        modelInput: 'createdBy',
        multiple: true
    }];
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

    $scope.limit = 20;

    $scope.q = "&skip=0&limit=" + $scope.limit;

    modelService.loadAll($scope);

    $scope.paging = function(event, page, pageSize, total) {
        var skip = (page - 1) * $scope.limit;
        $scope.q = "&skip=" + skip + "&limit=" + $scope.limit;
        modelService.loadAll($scope);
    };
}

function WebserviceViewController($scope, Flash, rest, $routeParams, $location, modelService, $sce, Alertify, usSpinnerService, $window, configs) {
    modelService.initService("File", "files", $scope);
    $scope.getHtml = function(html) {
        return $sce.trustAsHtml(html);
    };

    var loadModel = function() {
        $scope.model = rest().findOne({
                id: $routeParams.id,
                type: $scope.type,
                //params: "include=tags"
            }, function() {
                $scope.model.resources = rest().resources({
                    id: $scope.model.id,
                    type: $scope.type
                });
            }
            /*, function () {
                     var tags = [];
                     for (var i = 0; i < $scope.model.tags.length; i++) {
                     tags.push('<span class="label label-primary">' + $scope.model.tags[i].name + '</span>');
                     }
                     ;
                     $scope.model.tags = tags.join(" - ");
                     }*/
        );
    };

    $scope.edit = function(model) {
        modelService.edit($scope, model);
    };

    //factory configs
    configs.statuses($scope);

    $scope.publish = function(id, type) {
        usSpinnerService.spin('spinner');

        rest().publish({
            id: id,
            type: type,
        }, {}, function(resp) {
            usSpinnerService.stop('spinner');
            loadModel();
            //var url = '/' + $scope.type;
            // $location.path(url);
        }, function(error) {
            usSpinnerService.stop('spinner');
        });
    };

    $scope.unPublish = function(id, type) {
        var text_type = (type == 'charts') ? 'gráfico' : (type == 'maps') ? 'mapa' : 'archivo';
        Alertify.confirm('¿Está seguro que quiere despublicar este ' + text_type + '?').then(
            function onOk() {
                usSpinnerService.spin('spinner');

                rest().unpublish({
                    type: $scope.type,
                    id: $scope.model.id
                }, {}, function(resp) {
                    usSpinnerService.stop('spinner');
                    loadModel();
                    //var url = '/' + $scope.type;
                    // $location.path(url);
                }, function(error) {
                    usSpinnerService.stop('spinner');
                });
            },
            function onCancel() {
                return false;
            }
        );
    };

    loadModel();

    $scope.confirmDelete = function(item) {
        Alertify.confirm('¿Está seguro que quiere borrar este archivo?').then(
            function onOk() {
                usSpinnerService.spin('spinner');
                rest().delete({
                    type: $scope.type,
                    id: $scope.model.id
                }, function(resp) {
                    usSpinnerService.stop('spinner');
                    var url = "/" + $scope.type;
                    $location.path(url);
                }, function(error) {
                    usSpinnerService.stop('spinner');
                });
            },
            function onCancel() {
                return false;
            }
        );
    };

    $scope.deleteResource = function(id, type) {
        Alertify.confirm('¿Está seguro que quiere borrar este recurso?').then(
            function onOk() {
                usSpinnerService.spin('spinner');
                rest().delete({
                    type: type,
                    id: id
                }, function(resp) {
                    usSpinnerService.stop('spinner');
                    $window.location.reload();
                }, function(error) {
                    usSpinnerService.stop('spinner');
                });
            },
            function onCancel() {
                return false;
            }
        );
    };
}

function WebserviceCreateController($scope, $sce, rest, model, Flash, $location, Upload, $rootScope, modelService, $routeParams, Alertify, usSpinnerService) {
    modelService.initService("File", "files", $scope);


    $scope.status_default = true;
    $scope.unsave = true;

    $scope.model = new model();
    $scope.model.url = '';
    $scope.model.ws_type = '';
    $scope.steps = [];
    $scope.steps[0] = "active";
    $scope.steps[1] = "undone";
    $scope.steps[2] = "undone";
    $scope.stepactive = 0;

    $scope.dataset_disabled = 'enabled';
    if (!angular.isUndefined($routeParams.dataset)) {
        $scope.model.dataset = rest().findOne({
            id: $routeParams.dataset,
            type: 'datasets'
        });
        $scope.dataset_disabled = 'disabled';
    }

    $scope.fileModel = []
    $scope.checkstep = function(step) {

        if ($scope.model.url == '' || $scope.ws_type == '') {

            Alertify.alert('Rellene los campos requeridos.');
        } else {
            $scope.stepactive++;
            if (step == 0) {
                $scope.steps[0] = "active";
                $scope.steps[1] = "undone";
                $scope.steps[2] = "undone";
            } else if (step == 1) {
                $scope.steps[0] = "done";
                $scope.steps[1] = "active";
                $scope.steps[2] = "undone";
            } else {
                $scope.steps[0] = "done";
                $scope.steps[1] = "done";
                $scope.steps[2] = "active";
            }
            $scope.stepactive = step;
        }
    }
    $scope.step = function(step) {
        var step = $scope.steps[step];
        if (step == "undone") {
            return "undone";
        } else if (step == "done") {
            return "done";
        } else {
            return "active";

        }

    }
    $scope.getHtml = function(html) {
        return $sce.trustAsHtml(html);
    };

    $scope.add = function(isValid) {
        usSpinnerService.spin('spinner');
        $scope.unsave = false;
        $scope.uploadImageProgress = 10;

        for (obj in $scope.model) {
            if (obj.indexOf("optional") != -1) {
                delete $scope.model[obj]
            }
        }


        var data = {
            'url': $scope.model.url,
            'ws_type': $scope.model.ws_type,
            'attributesAsHeaders': $scope.model.attrs_as_headers,
            'datapath': $scope.model.data_url,
            'token': $scope.model.sign_token,
            'tokenAlgorithm': $scope.model.sign_algorithm,
            'tokenSignature': $scope.model.sign_name,
            'username': $scope.model.user,
            'password': $scope.model.password,
            'method': $scope.model.method,
            'namespace': $scope.model.namespace,
            'titlepath': $scope.model.titlepath,
            'parameters': {}
        };

        if (isValid) {


            usSpinnerService.spin('spinner');
            var url = '';
            if ($scope.model.method == 'rest') {
                url = $rootScope.url + "/restservices";
            }
            elseif($scope.model.method == 'soap') {
                url = $rootScope.url + "/soapservices";
            }

            // $http.post(
            //     url, data).then(function(resp) {
            //     usSpinnerService.stop('spinner');
            // }, function(error) {
            //     usSpinnerService.stop('spinner');
            //
            //
            // });


        } // end if isValid


    }; //end add function



    $scope.deleteIndexInput = function(index, field) {
        $scope.model.items.splice(index, 1);
    }

    $scope.increment = function(a) {
        return a + 1;
    }

    $scope.itemName = function(a) {
        return "optional" + (parseInt(a) + 1);
    }


}

function WebserviceEditController($rootScope, $scope, Flash, rest, $routeParams, model, $location, modelService, $sce, Upload, usSpinnerService, Alertify) {
    modelService.initService("File", "files", $scope);
    $scope.model = new model();

    $scope.status_default = false;

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

    $scope.clearUpload = function() {
        $scope.fileModel.name = "";
        $scope.fileModel.type = "";
    }

    $scope.beforeChange = function($files) {
        $scope.mostrar = false;
        $scope.filter = true;
        $scope.fileModel.name = $files[0].name;
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
        } else {
            $scope.fileModel.type = 'fa-file-text-o';
        }
        $scope.mostrar = true;
    }

    $scope.checkstep = function(step) {
        if ($scope.model.url == null && step == 1 && $scope.model.ws_type == null) {
            Alertify.alert('Archivo no permitido.');
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
                    $scope.steps[0] = "done";
                    $scope.steps[1] = "done";
                    $scope.steps[2] = "active";
                }
                $scope.stepactive = step;
            }
        }
    }
    $scope.step = function(step) {
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

    $scope.getHtml = function(html) {
        return $sce.trustAsHtml(html);
    };


    $scope.update = function(isValid) {
        usSpinnerService.spin('spinner');

        $scope.model.optionals = {};
        angular.forEach($scope.model.items, function(element) {
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
            //    'gatheringDate': $scope.model.gatheringDate //new Date().toISOString().slice(0, 19).replace('T', ' ');
        }

        if ($scope.model.uploadFile != null) {
            if (hard_file != null) {
                data.uploadFile = hard_file;
            } else {
                data.uploadFile = $scope.model.uploadFile;
            }
        }

        var param = {
            gatheringDate: null
        };
        if (!!$scope.model.gatheringDate) {
            param.gatheringDate = $scope.model.gatheringDate.toISOString().slice(0, 10); //.toISOString().slice(0, 10), //new Date().toISOString().slice(0, 19).replace('T', ' ');
        }

        if (isValid) {
            Upload.upload({
                url: $rootScope.url + "/files/" + $scope.model.id,
                data: data,
                method: 'PUT',
                params: param
            }).then(function(resp) {
                usSpinnerService.stop('spinner');
                $location.url('/files/' + resp.data.data.id + '/view');
            }, function(error) {
                usSpinnerService.stop('spinner');
                // alert(resp.status);
                $scope.unsave = false;
                if (error.data.data && error.data.data.name) {
                    Alertify.alert('El nombre del archivo ya existe.');
                } else {
                    Alertify.alert('Ha ocurrido un error al editar el archivo.');
                }
            }, function(evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                $scope.uploadImageProgress = progressPercentage;
                $scope.unsave = false;
                usSpinnerService.stop('spinner');
            });
        }


    };

    $scope.load = function() {
        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type,
            //params: "include=tags"
        }, function() {
            if (!!$scope.model.updateFrequency) {
                $scope.model.updateFrequency = $scope.model.updateFrequency.id;
            }
            if (!!$scope.model.status) {
                $scope.model.status = $scope.model.status.id;
            }
            if (!!$scope.model.gatheringDate) {
                $scope.model.gatheringDate = $scope.model.gatheringDate ? moment($scope.model.gatheringDate).utc() : '';
            }

            $scope.model.items = [];
            angular.forEach($scope.model.optionals, function(val, key) {
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
        });
    };

    $scope.inputs = [];
    var i = 0;
    $scope.addInput = function() {
        if ($scope.model.items.length < 10) {
            var newItemNo = $scope.model.items.length + 1;
            $scope.model.items.push({
                field: ""
            })
        }

    }
    $scope.deleteIndexInput = function(index, field) {
        $scope.model.items.splice(index, 1);
    }

    $scope.increment = function(a) {
        return a + 1;
    }

    $scope.itemName = function(a) {
        return "optional" + (parseInt(a) + 1);
    }

    $scope.load();

    var loadFileTypes = function() {
        var fileTypes = rest().get({
            type: 'fileTypes'
        }, function() {
            $scope.fileTypes = [];
            angular.forEach(fileTypes.data, function(element) {
                $scope.fileTypes.push(element.mimetype);
            });
            $scope.fileTypes = $scope.fileTypes.toString();
        });
    };

    loadFileTypes();
}
