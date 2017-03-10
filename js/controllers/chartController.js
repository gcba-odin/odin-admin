var app = angular.module('odin.chartsControllers', []);


function ChartListController($scope, modelService, configs, usSpinnerService, underReview, $rootScope, ROLES) {
    usSpinnerService.spin('spinner');
    modelService.initService("Chart", "charts", $scope);
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

    if (underReview) {
        $scope.parameters.conditions = '&status=' + $scope.statuses.underReview;
        $scope.filtersView = [{
            name: 'Autor',
            model: 'users',
            key: 'username',
            modelInput: 'createdBy',
            multiple: true,
            permission: true,
            //condition: 'status=oWRhpRV&'
        }];
    } else {
        $scope.filtersView = [{
            name: 'Estado',
            model: 'statuses',
            key: 'name',
            modelInput: 'status',
            multiple: true,
            permission: true,
        }, {
            name: 'Autor',
            model: 'users',
            key: 'username',
            modelInput: 'createdBy',
            multiple: true,
            permission: true,
        }];
    
        $scope.parameters.conditions = '';
        if(!!$rootScope.adminglob.currentUser && $rootScope.adminglob.currentUser.role === ROLES.GUEST) {
            var current_us = $rootScope.adminglob.currentUser.user;
            $scope.parameters.conditions = '&createdBy=' + current_us + '&owner=' + current_us;
            
            $scope.filtersView[1].permission = false;
        }
    }

    $scope.confirmDelete = function (item) {
        modelService.confirmDelete(item);
    };

    $scope.deleteModel = function (model) {
        modelService.delete($scope, model);
    };

    $scope.edit = function (model) {
        modelService.edit($scope, model);
    };

    $scope.view = function (model) {
        modelService.view($scope, model);
    };

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

function ChartViewController($scope, modelService, $routeParams, rest, $location, $sce, Alertify, usSpinnerService, configs) {
    usSpinnerService.spin('spinner');
    modelService.initService("Chart", "charts", $scope);

    var loadModel = function () {
        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type
        }, function () {
            usSpinnerService.stop('spinner');
        }, function (error) {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
        });
    };

    $scope.confirmDelete = function (item) {
        Alertify.set({
            labels: {
                ok: 'Ok',
                cancel: 'Cancelar'
            }
        });
        Alertify.confirm('¿Está seguro que quiere borrar este gráfico?').then(
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

    $scope.edit = function (model) {
        var url = '/' + $scope.type + '/' + model.id + "/edit";
        $location.path(url);
    };

    $scope.getHtml = function (html) {
        return $sce.trustAsHtml(html);
    };

    //factory configs 
    configs.statuses($scope);

    $scope.publish = function () {
        usSpinnerService.spin('spinner');

        rest().publish({
            type: $scope.type,
            id: $scope.model.id
        }, {}, function (resp) {
            loadModel();
            //var url = '/' + $scope.type;
            // $location.path(url);
        });
        usSpinnerService.stop('spinner');
    };

    $scope.unPublish = function () {
        Alertify.set({
            labels: {
                ok: 'Ok',
                cancel: 'Cancelar'
            }
        });
        Alertify.confirm('¿Está seguro que quiere despublicar este gráfico?').then(
            function onOk() {
                usSpinnerService.spin('spinner');

                rest().unpublish({
                    type: $scope.type,
                    id: $scope.model.id
                }, {}, function (resp) {
                    loadModel();
                    //var url = '/' + $scope.type;
                    // $location.path(url);
                });
                usSpinnerService.stop('spinner');
            },
            function onCancel() {
                return false;
            }
        );
    };

    $scope.reject = function () {
        Alertify.set({
            labels: {
                ok: 'Ok',
                cancel: 'Cancelar'
            }
        });
        Alertify.confirm('¿Está seguro que quiere rechazar este gráfico?').then(
            function onOk() {
                usSpinnerService.spin('spinner');

                rest().reject({
                    type: $scope.type,
                    id: $scope.model.id
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
    
    $scope.sendReview = function () {
        Alertify.set({
            labels: {
                ok: 'Ok',
                cancel: 'Cancelar'
            }
        });
        Alertify.confirm('¿Está seguro que quiere enviar a revisión este gráfico?').then(
            function onOk() {
                usSpinnerService.spin('spinner');

                rest().sendReview({
                    type: $scope.type,
                    id: $scope.model.id
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
    
    $scope.cancel = function () {
        Alertify.set({
            labels: {
                ok: 'Ok',
                cancel: 'Cancelar'
            }
        });
        Alertify.confirm('¿Está seguro que quiere cancelar este gráfico?').then(
            function onOk() {
                usSpinnerService.spin('spinner');

                rest().cancel({
                    type: $scope.type,
                    id: $scope.model.id
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
}

function ChartPreviewController($scope, modelService, $routeParams, rest, $location, $sce, usSpinnerService) {
    usSpinnerService.spin('spinner');
    modelService.initService("Chart", "charts", $scope);

    $scope.model = rest().findOne({
        id: $routeParams.id,
        type: $scope.type
    }, function () {
        $scope.model.link = $sce.trustAsResourceUrl($scope.model.link);
        $scope.model.charttype = 'chart-' + $scope.model.type;
        $scope.model.series = [[]];
        if (!!$scope.model.dataSeries) {
            if ($scope.model.dataType == 'qualitative') {
                $scope.model.series[0] = $scope.model.dataSeries;
            } else {
                $scope.model.series[0].push($scope.model.dataSeries[1]);
            }
        }
        if(!!$scope.model.data) {
            $scope.model.dataChart = {
                data: [$scope.model.data.data]
            };
        }

        var getRandomColor = function (point) {
            var palette = ['#e74c3c', '#3e4f5e', '#19c3e3',
                            '#f39c12', '#18b596', '#fdd306', '#f56292', '#3e4f5e',
                            '#037dbf', '#88bf48', '#9b59b6', '#fcda59', '#e74c3c',
                            '#ffffff', '#19c3e3', '#9b59b6'];
            
            return palette[Math.round(point % palette.length)];
        }

        $scope.model.colors = [];
        if (!!$scope.model.type && $scope.model.type != 'line') {
            $scope.model.colors[0] = {
                backgroundColor: []
            };
            angular.forEach($scope.model.data.data, function (val, key) {
                $scope.model.colors[0].backgroundColor.push(getRandomColor(key));
            });
        }
        //load Chart;
        usSpinnerService.stop('spinner');
    }, function (error) {
        usSpinnerService.stop('spinner');
        modelService.reloadPage();
    });

    $scope.edit = function (model) {
        var url = '/' + $scope.type + '/' + model.id + "/edit";
        $location.path(url);
    };

    $scope.getHtml = function (html) {
        return $sce.trustAsHtml(html);
    };
}

function ChartCreateController($scope, modelService, rest, $location, model, $sce, $routeParams, Alertify, usSpinnerService, configs) {
    usSpinnerService.spin('spinner');
    modelService.initService("Chart", "charts", $scope);
    
    //factory configs
    configs.statuses($scope);

    $scope.model = new model();
    $scope.steps = [];
    $scope.steps[0] = "active";
    $scope.steps[1] = "undone";
    $scope.steps[2] = "undone";
    $scope.stepactive = 0;
    $scope.status_default = true;

    $scope.model.items = [{ field: "" }, { field: "" }];

    var generate_headers = function () {
        if ($scope.fileModel.data.length > 0) {

            $scope.headersFile = Object.keys($scope.fileModel.data[0]);
            $scope.headersFile = $scope.headersFile.filter(function (header) {
                return header !== '_id';
            });

            var headers = [];

            angular.forEach($scope.headersFile, function (value, key) {
                var header = {
                    id: value,
                    name: value
                };

                headers.push(header);
            });

            $scope.headersFile = headers;
        }
        usSpinnerService.stop('spinner');
    };

    $scope.file_disabled = 'enabled';
    if (!angular.isUndefined($routeParams.file)) {
        $scope.fileModel = rest().contents({
            type: "files",
            id: $routeParams.file,
            params: "limit=1"
        }, function () {
            $scope.model.file = $routeParams.file;

            $scope.headersFile = null;

            generate_headers();
        }, function (error) {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
        });
        $scope.file_disabled = 'disabled';


    }

    $scope.checkstep = function (step) {
        $scope.jump = 1;
        if ((step == 1) && (!angular.isUndefined($scope.model.link) && $scope.model.link != '')) {
            $scope.checkstep(2);
            $scope.jump = 2;
        } else if ((step == 1) && ($scope.headersFile == null)) {
            Alertify.alert('Le faltó asociar el archivo o no se puede leer.');
        } else {
            if ((step == 1 && ($scope.model.type) && ($scope.model.file)) || (step == 2 && ($scope.model.file) && ($scope.model.link || ($scope.model.type && $scope.model.dataType && $scope.model.items[0]))) || step == 0) {

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

    $scope.step = function (step) {
        if ((step == 1) || (step == 2) || step == 0) {
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

    var validate = function (data) {
        if (data.name != '' && (data.type != '' || data.link != '')) {
            return true;
        } else {
            return false;
        }
    };

    $scope.add = function (model) {
        usSpinnerService.spin('spinner');

        $scope.model.dataSeries = [];
        for (var i = 0; i < $scope.model.items.length; i++) {
            var values = [];
            //$scope.model["property" + cont] = "";
            if ($scope.model.items[i].field2) {
                $scope.model.dataSeries = $scope.model.dataSeries.concat($scope.model.items[i].field2);
            }
        }
        $scope.model.dataSeries = $scope.model.dataSeries.toString();

        if ($scope.statuses.default == $scope.statuses.published) {
            $scope.model.publishedAt = new Date();
        }if ($scope.statuses.default == $scope.statuses.published) {
            $scope.model.publishedAt = new Date();
        } else if($scope.statuses.default == $scope.statuses.unpublished) {
            $scope.model.unPublishedAt = new Date();
        } else if($scope.statuses.default == $scope.statuses.rejected) {
            $scope.model.rejectedAt = new Date();
        } else if($scope.statuses.default == $scope.statuses.underReview) {
            $scope.model.reviewedAt = new Date();
        }

        if (validate(model)) {
            rest().save({
                type: $scope.type
            }, $scope.model, function (resp) {
                usSpinnerService.stop('spinner');
                if (resp.data.id) {
                    var url = '/' + $scope.type + '/' + resp.data.id + '/view';
                } else {
                    var url = '/' + $scope.type;
                }
                $location.path(url);
            }, function (error) {
                usSpinnerService.stop('spinner');
                if (error.data.data && error.data.data.name) {
                    Alertify.alert('El nombre del gráfico ya existe.');
                } else {
                    Alertify.alert('Ha ocurrido un error al crear el gráfico.');
                }
            });
        } else {
            usSpinnerService.stop('spinner');
            Alertify.alert('Hay datos incompletos.');
        }
    };

    $scope.getHtml = function (html) {
        return $sce.trustAsHtml(html);
    };

}


function ChartEditController($scope, modelService, $routeParams, $sce, rest, $location, model, Alertify, usSpinnerService, configs) {
    usSpinnerService.spin('spinner');
    modelService.initService("Chart", "charts", $scope);

    $scope.model = new model();

    $scope.steps = [];
    $scope.steps[0] = "active";
    $scope.steps[1] = "undone";
    $scope.steps[2] = "undone";
    $scope.stepactive = 0;
    $scope.status_default = false;
    
    var prev_status = null;
    
    //factory configs
    configs.statuses($scope);

    var generate_headers = function () {
        if ($scope.fileModel.data.length > 0) {

            $scope.headersFile = Object.keys($scope.fileModel.data[0]);
            $scope.headersFile = $scope.headersFile.filter(function (header) {
                return header !== '_id';
            });

            var headers = [];

            angular.forEach($scope.headersFile, function (value, key) {
                var header = {
                    id: value,
                    name: value
                };

                headers.push(header);
            });

            $scope.headersFile = headers;
        }
        usSpinnerService.stop('spinner');
    };

    $scope.checkstep = function (step) {
        $scope.jump = 1;
        if ((step == 1) && (!!$scope.model.link)) {
            $scope.checkstep(2);
            $scope.jump = 2;
        } else if ((step == 1) && ($scope.headersFile == null)) {
            Alertify.alert('Le faltó asociar el archivo o no se puede leer.');
        } else {
            if ((step == 1 && ($scope.model.type) && ($scope.model.file)) || (step == 2 && ($scope.model.file) && ($scope.model.link || ($scope.model.type && $scope.model.dataType && $scope.model.items[0]))) || step == 0) {

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

    $scope.step = function (step) {
        if ((step == 1) || (step == 2) || step == 0) {
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

    var validate = function (data) {
        if (data.name != '' && (data.type != '' || data.link != '')) {
            return true;
        } else {
            return false;
        }
    };

    $scope.update = function (model) {

        usSpinnerService.spin('spinner');

        $scope.model.dataSeries = [];
        for (var i = 0; i < $scope.model.items.length; i++) {
            var values = [];
            //$scope.model["property" + cont] = "";
            if ($scope.model.items[i].field2) {
                $scope.model.dataSeries = $scope.model.dataSeries.concat($scope.model.items[i].field2);
            }
        }
        $scope.model.dataSeries = $scope.model.dataSeries.toString();
        
        if (prev_status != $scope.model.status && $scope.model.status == $scope.statuses.published) {
            $scope.model.publishedAt = new Date();
        } else if(prev_status != $scope.model.status && $scope.model.status == $scope.statuses.unpublished) {
            $scope.model.unPublishedAt = new Date();
        } else if(prev_status != $scope.model.status && $scope.model.status == $scope.statuses.rejected) {
            $scope.model.rejectedAt = new Date();
        } else if(prev_status != $scope.model.status && $scope.model.status == $scope.statuses.draft) {
            $scope.model.cancelledAt = new Date();
        } else if(prev_status != $scope.model.status && $scope.model.status == $scope.statuses.underReview) {
            $scope.model.reviewedAt = new Date();
        }

        if (validate(model)) {

            rest().update({
                type: $scope.type,
                id: $scope.model.id
            }, $scope.model, function (resp) {
                usSpinnerService.stop('spinner');
                if (resp.data.id) {
                    var url = '/' + $scope.type + '/' + resp.data.id + '/view';
                } else {
                    var url = '/' + $scope.type;
                }
                $location.path(url);
            }, function (error) {
                usSpinnerService.stop('spinner');
                if (error.data.data && error.data.data.name) {
                    Alertify.alert('El nombre del gráfico ya existe.');
                } else {
                    Alertify.alert('Ha ocurrido un error al editar el gráfico.');
                }
            });
        } else {
            usSpinnerService.stop('spinner');
            Alertify.alert('Hay datos incompletos.');
        }
    };


    $scope.load = function () {

        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type,
        }, function () {
            $scope.file_disabled = 'enabled';
            if (!!$scope.model.status) {
                $scope.model.status = $scope.model.status.id;
                prev_status = $scope.model.status;
            }
            if (!angular.isUndefined($scope.model.file)) {
                $scope.fileModel = rest().contents({
                    type: "files",
                    id: $scope.model.file.id,
                    params: "limit=1"
                }, function () {
                    $scope.model.file = $scope.model.file.id;

                    $scope.headersFile = null;

                    generate_headers();
                }, function (error) {
                    usSpinnerService.stop('spinner');
                    modelService.reloadPage();
                });
                $scope.file_disabled = 'disabled';

                $scope.model.items = [];

                var counter = 0;
                if (!!$scope.model.dataSeries) {
                    angular.forEach($scope.model.dataSeries, function (value, key) {
                        $scope.model.items.push({
                            field2: value,
                            index: counter
                        });
                        counter++;
                    });
                }
            }
        }, function (error) {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
        });
    };

    $scope.load();

    $scope.getHtml = function (html) {
        return $sce.trustAsHtml(html);
    };
}
