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
    $scope.model.items_file = [];
    $scope.model.items_webservice = [];

    $scope.model.owner = {'id': `${$scope.adminglob.currentUser.user}`, 'username': `${$scope.adminglob.currentUser.username}`};


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
        //$scope.unsave = false;
        $scope.uploadImageProgress = 10;

        for (obj in $scope.model) {
            if (obj.indexOf("parameter") != -1) {
                delete $scope.model[obj]
            }
        }

        $scope.model.parameters = {};
        var cont = 1;
        for (var i = 0; i < $scope.model.items_webservice.length; i++) {
            var values = [];
            $scope.model["parameter" + cont] = "";
            $scope.model.parameters[$scope.model.items_webservice[i].field1] = $scope.model.items_webservice[i].field2;
            cont++;
        }

        var data = {
            'url': $scope.model.url,
            'ws_type': $scope.model.ws_type,
            'parameters': $scope.model.parameters
        };

        var url = '';

        if ($scope.model.ws_type == 'rest') {
            data.datapath = $scope.model.data_url;
            data.titlepath = $scope.model.titlepath;
            data.tokenSignature = $scope.model.sign_name;
            data.token = $scope.model.sign_token;
            data.tokenAlgorithm = $scope.model.sign_algorithm;
            data.username = $scope.model.user;
            data.password = $scope.model.password;

            url = "restservices";
        } else if ($scope.model.ws_type == 'soap') {
            data.namespace = $scope.model.namespace;
            data.attributesAsHeaders = $scope.model.attrs_as_headers;
            data.method = $scope.model.method;

            url = "soapservices";
        }

        for (obj in $scope.model) {
            if (obj.indexOf("optional") != -1) {
                delete $scope.model[obj]
            }
        }

        $scope.model.optionals = {};
        var cont = 1;
        for (var i = 0; i < $scope.model.items_file.length; i++) {
            var values = [];
            $scope.model["optional" + cont] = "";
            $scope.model.optionals[$scope.model.items_file[i].field1] = $scope.model.items_file[i].field2;
            cont++;
        }

        data.file = {
            'name': $scope.model.name,
            'organization': $scope.model.organization,
            'dataset': $scope.model.dataset,
            'description': $scope.model.description,
            'notes': $scope.model.notes,
            'owner': $scope.model.owner,
            'updateFrequency': $scope.model.updateFrequency,
            'updated': $scope.model.updated,
            'optionals': $scope.model.optionals
        }

        console.log(data);
        if (isValid) {

            rest().save({
                type: url,
            }, data, function(ws_info) {
                usSpinnerService.stop('spinner');
                console.log(ws_info);
                //var data_file = {};
                //data_file.type = '9WRhpRV'; //json id
//                if ($scope.model.ws_type == 'rest') {
//                    data_file.restService = resp.data.id;
//                } else if ($scope.model.ws_type == 'soap') {
//                    data_file.soapService = resp.data.id;
//                }
//                rest().update({
//                    type: 'files',
//                    id: resp.data.id
//                }, data_file, function(resp_file) {
                    $location.url('/files/' + ws_info.data.id + '/view');
                //);

            }, function(error) {
                console.log('error en el update del file');
                usSpinnerService.stop('spinner');
                //$location.url('/files/' + resp.data.id + '/view');
            });
        } // end if isValid


    }; //end add function

    $scope.addOption = function() {
        if ($scope.model.items_file.length < 10) {
            var newItemNo = $scope.model.items_file.length + 1;
            $scope.model.items_file.push({
                field: ""
            })
        }

    }
    $scope.deleteOption = function(index, field) {
        $scope.model.items_file.splice(index, 1);
    }

    $scope.addParameter = function() {
        if ($scope.model.items_webservice.length < 10) {
            var newItemNo = $scope.model.items_webservice.length + 1;
            $scope.model.items_webservice.push({
                field: ""
            })
        }

    }
    $scope.deleteParameter = function(index, field) {
        $scope.model.items_webservice.splice(index, 1);
    }

    $scope.increment = function(a) {
        return a + 1;
    }
}

function WebserviceEditController($rootScope, $scope, Flash, rest, $routeParams, model, $location, modelService, $sce, Upload, usSpinnerService, Alertify) {
    modelService.initService("File", "files", $scope);
    $scope.model = new model();

    $scope.status_default = false;
    $scope.unsave = true;

    $scope.model = new model();
    $scope.steps = [];
    $scope.steps[0] = "active";
    $scope.steps[1] = "undone";
    $scope.steps[2] = "undone";
    $scope.stepactive = 0;

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


    $scope.update = function(isValid) {
        usSpinnerService.spin('spinner');
        $scope.unsave = false;
        $scope.uploadImageProgress = 10;

        for (obj in $scope.model) {
            if (obj.indexOf("parameter") != -1) {
                delete $scope.model[obj]
            }
        }

        $scope.model.parameters = {};
        var cont = 1;
        for (var i = 0; i < $scope.model.items_webservice.length; i++) {
            var values = [];
            $scope.model["parameter" + cont] = "";
            $scope.model.parameters[$scope.model.items_webservice[i].field1] = $scope.model.items_webservice[i].field2;
            cont++;
        }

        var data = {
            'url': $scope.model.url,
            'ws_type': $scope.model.ws_type,
            'parameters': $scope.model.parameters
        };

        var url = '';

        if ($scope.model.ws_type == 'rest') {
            data.datapath = $scope.model.data_url;
            data.titlepath = $scope.model.titlepath;
            data.tokenSignature = $scope.model.sign_name;
            data.token = $scope.model.sign_token;
            data.tokenAlgorithm = $scope.model.sign_algorithm;
            data.username = $scope.model.user;
            data.password = $scope.model.password;

            url = $rootScope.url + "/restservices/" + $scope.model.ws_id;
        } else if ($scope.model.ws_type == 'soap') {
            data.namespace = $scope.model.namespace;
            data.attributesAsHeaders = $scope.model.attrs_as_headers;
            data.method = $scope.model.ws_type;

            url = $rootScope.url + "/soapservices/" + $scope.model.ws_id;
        }

        for (obj in $scope.model) {
            if (obj.indexOf("optional") != -1) {
                delete $scope.model[obj]
            }
        }

        $scope.model.optionals = {};
        var cont = 1;
        for (var i = 0; i < $scope.model.items_file.length; i++) {
            var values = [];
            $scope.model["optional" + cont] = "";
            $scope.model.optionals[$scope.model.items_file[i].field1] = $scope.model.items_file[i].field2;
            cont++;
        }

        console.log(data);
        if (isValid) {

            rest(url).update({}, data, function(resp) {
                data.file = {
                    'name': $scope.model.name,
                    'organization': $scope.model.organization,
                    'dataset': $scope.model.dataset,
                    'description': $scope.model.description,
                    'notes': $scope.model.notes,
                    'owner': $scope.model.owner,
                    'updateFrequency': $scope.model.updateFrequency,
                    'updated': $scope.model.updated,
                    'optionals': $scope.model.optionals,
                    'type': '9WRhpRV' //json id
                };
//                if ($scope.model.ws_type == 'rest') {
//                    data.file.restService = $scope.model.ws_id;
//                } else if ($scope.model.ws_type == 'soap') {
//                    data.file.soapService = $scope.model.ws_id;
//                }
                rest().update({
                    type: 'files',
                    id: $routeParams.id
                }, data.file, function(resp) {
                    usSpinnerService.stop('spinner');
                    console.log(resp);
                    $location.url('/files/' + resp.data.id + '/view');
                }, function(error) {
                    console.log('error en el update del file');
                });

            }, function(error) {
                console.log('error en el update del ws');
            });
        } // end if isValid

    };

    $scope.load = function() {
        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type,
        }, function() {
            console.log($scope.model);
            if (!!$scope.model.updateFrequency) {
                $scope.model.updateFrequency = $scope.model.updateFrequency.id;
            }
            if (!!$scope.model.status) {
                $scope.model.status = $scope.model.status.id;
            }
            if (!!$scope.model.gatheringDate) {
                $scope.model.gatheringDate = $scope.model.gatheringDate ? moment($scope.model.gatheringDate).utc() : '';
            }

            $scope.model.items_webservice = [];

            if (!!$scope.model.restService) {
                $scope.model.ws_id = $scope.model.restService.id;

                $scope.model.url = $scope.model.restService.url;
                $scope.model.ws_type = 'rest';
                $scope.model.data_url = $scope.model.restService.datapath;
                $scope.model.titlepath = $scope.model.restService.titlepath;
                if (!!$scope.model.restService.token) {
                    $scope.model.auth_type = 'token';
                    $scope.model.sign_name = $scope.model.restService.tokenSignature;
                    $scope.model.sign_token = $scope.model.restService.token;
                    $scope.model.sign_algorithm = $scope.model.restService.tokenAlgorithm;
                } else if (!!$scope.model.restService.username) {
                    $scope.model.auth_type = 'user_password';
                    $scope.model.user = $scope.model.restService.username;
                    $scope.model.password = $scope.model.restService.password;
                }

                angular.forEach($scope.model.restService.parameters, function(val, key) {
                    $scope.model.items_webservice.push({
                        field1: key,
                        field2: val,
                    });
                });

            }

            if (!!$scope.model.soapService) {
                $scope.model.ws_id = $scope.model.soapService.id;

                $scope.model.url = $scope.model.soapService.url;
                $scope.model.ws_type = 'soap';
                $scope.model.namespace = $scope.model.soapService.namespace;
                $scope.model.attributesAsHeaders = $scope.model.soapService.attributesAsHeaders;
                $scope.model.method = $scope.model.soapService.method;

                angular.forEach($scope.model.soapService.parameters, function(val, key) {
                    $scope.model.items_webservice.push({
                        field1: key,
                        field2: val,
                    });
                });

            }

            $scope.model.items_file = [];
            angular.forEach($scope.model.optionals, function(val, key) {
                $scope.model.items_file.push({
                    field1: key,
                    field2: val,
                });
            });

        });
    };

    $scope.addOption = function() {
        if ($scope.model.items_file.length < 10) {
            var newItemNo = $scope.model.items_file.length + 1;
            $scope.model.items_file.push({
                field: ""
            })
        }

    }
    $scope.deleteOption = function(index, field) {
        $scope.model.items_file.splice(index, 1);
    }

    $scope.addParameter = function() {
        if ($scope.model.items_webservice.length < 10) {
            var newItemNo = $scope.model.items_webservice.length + 1;
            $scope.model.items_webservice.push({
                field: ""
            })
        }

    }
    $scope.deleteParameter = function(index, field) {
        $scope.model.items_webservice.splice(index, 1);
    }

    $scope.increment = function(a) {
        return a + 1;
    }

    $scope.load();
}
