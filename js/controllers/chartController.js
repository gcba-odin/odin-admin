var app = angular.module('odin.chartsControllers', []);


function ChartListController($scope, modelService) {
    modelService.initService("Chart", "charts", $scope);

    $scope.confirmDelete = function(item) {
        modelService.confirmDelete(item);
    };

    $scope.deleteModel = function(model) {
        modelService.delete($scope, model);
    };

    $scope.edit = function(model) {
        modelService.edit($scope, model);
    };

    $scope.view = function(model) {
        modelService.view($scope, model);
    };

    $scope.activeClass = function(activeClass) {
        modelService.activeClass(activeClass);

    };
    
    $scope.limit = 20;

    $scope.q = "&skip=0&limit=" + $scope.limit;

    modelService.loadAll($scope);

    $scope.paging = function(event, page, pageSize, total) {
        var skip = (page - 1) * $scope.limit;
        $scope.q = "&skip=" + skip + "&limit=" + $scope.limit;
        modelService.loadAll($scope);
    };
}

function ChartViewController($scope, modelService, $routeParams, rest, $location, $sce, Alertify, usSpinnerService, configs) {
    modelService.initService("Chart", "charts", $scope);

    var loadModel = function() {
        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type
        });
    };
    
    $scope.confirmDelete = function(item) {
        modelService.confirmDelete(item);
    };

    $scope.edit = function(model) {
        var url = '/' + $scope.type + '/' + model.id + "/edit";
        $location.path(url);
    };

    $scope.getHtml = function(html) {
        return $sce.trustAsHtml(html);
    };

    //factory configs 
    configs.statuses($scope);

    $scope.publish = function() {
        usSpinnerService.spin('spinner');

        rest().publish({
            type: $scope.type,
            id: $scope.model.id
        }, {}, function(resp) {
            loadModel();
            //var url = '/' + $scope.type;
            // $location.path(url);
        });
        usSpinnerService.stop('spinner');
    };

    $scope.unPublish = function() {
        Alertify.confirm('¿Está seguro que quiere despublicar este recurso?').then(
                function onOk() {
                    usSpinnerService.spin('spinner');

                    rest().unpublish({
                        type: $scope.type,
                        id: $scope.model.id
                    }, {}, function(resp) {
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

    loadModel();
}

function ChartPreviewController($scope, modelService, $routeParams, rest, $location, $sce) {
    modelService.initService("Chart", "charts", $scope);

    $scope.model = rest().findOne({
        id: $routeParams.id,
        type: $scope.type
    }, function() {
        $scope.model.link = $sce.trustAsResourceUrl($scope.model.link);
        $scope.model.charttype = 'chart-' + $scope.model.type;
        //load Chart;
    });

    $scope.edit = function(model) {
        var url = '/' + $scope.type + '/' + model.id + "/edit";
        $location.path(url);
    };

    $scope.getHtml = function(html) {
        return $sce.trustAsHtml(html);
    };
}

function ChartCreateController($scope, modelService, rest, $location, model, $sce, $routeParams, Alertify, usSpinnerService) {

    modelService.initService("Chart", "charts", $scope);

    $scope.model = new model();
    $scope.steps = [];
    $scope.steps[0] = "active";
    $scope.steps[1] = "undone";
    $scope.steps[2] = "undone";
    $scope.stepactive = 0;

    $scope.model.items = [{field: ""}, {field: ""}];

    var generate_headers = function() {
        if ($scope.fileModel.data.length > 0)
        {

            $scope.headersFile = Object.keys($scope.fileModel.data[0]);
            $scope.headersFile = $scope.headersFile.filter(function(header) {
                return header !== '_id';
            });

            var headers = [];

            angular.forEach($scope.headersFile, function(value, key) {
                var header = {
                    id: value,
                    name: value
                };

                headers.push(header);
            });

            $scope.headersFile = headers;
        }
    };

    $scope.file_disabled = 'enabled';
    if (!angular.isUndefined($routeParams.file)) {
        $scope.fileModel = rest().contents({
            type: "files",
            id: $routeParams.file,
            params: "limit=1"
        }, function() {
            $scope.model.file = $routeParams.file;

            $scope.headersFile = null;

            generate_headers();
        });
        $scope.file_disabled = 'disabled';


    }

    $scope.checkstep = function(step) {
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

    $scope.step = function(step) {
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

    var validate = function(data) {
        if (data.name != '' && (data.type != '' || data.link != '')) {
            return true;
        } else {
            return false;
        }
    };

    $scope.add = function(model) {
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

        if (validate(model)) {
            rest().save({
                type: $scope.type
            }, $scope.model, function(resp) {
                usSpinnerService.stop('spinner');
                if (resp.data.id) {
                    var url = '/' + $scope.type + '/' + resp.data.id + '/view';
                } else {
                    var url = '/' + $scope.type;
                }
                $location.path(url);
            }, function(error) {
                usSpinnerService.stop('spinner');
                if(error.data.data && error.data.data.name) {
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

    $scope.getHtml = function(html) {
        return $sce.trustAsHtml(html);
    };

}


function ChartEditController($scope, modelService, $routeParams, $sce, rest, $location, model, Alertify, usSpinnerService) {
    modelService.initService("Chart", "charts", $scope);

    $scope.model = new model();

    $scope.steps = [];
    $scope.steps[0] = "active";
    $scope.steps[1] = "undone";
    $scope.steps[2] = "undone";
    $scope.stepactive = 0;

    var generate_headers = function() {
        if ($scope.fileModel.data.length > 0)
        {

            $scope.headersFile = Object.keys($scope.fileModel.data[0]);
            $scope.headersFile = $scope.headersFile.filter(function(header) {
                return header !== '_id';
            });

            var headers = [];

            angular.forEach($scope.headersFile, function(value, key) {
                var header = {
                    id: value,
                    name: value
                };

                headers.push(header);
            });

            $scope.headersFile = headers;
        }
    };

    $scope.checkstep = function(step) {
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

    $scope.step = function(step) {
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

    var validate = function(data) {
        if (data.name != '' && (data.type != '' || data.link != '')) {
            return true;
        } else {
            return false;
        }
    };

    $scope.update = function(model) {

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

        if (validate(model)) {

            rest().update({
                type: $scope.type,
                id: $scope.model.id
            }, $scope.model, function(resp) {
                usSpinnerService.stop('spinner');
                if (resp.data.id) {
                    var url = '/' + $scope.type + '/' + resp.data.id + '/view';
                } else {
                    var url = '/' + $scope.type;
                }
                $location.path(url);
            }, function(error) {
                usSpinnerService.stop('spinner');
                if(error.data.data && error.data.data.name) {
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


    $scope.load = function() {

        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type,
        }, function() {
            $scope.file_disabled = 'enabled';
            if (!angular.isUndefined($scope.model.file)) {
                $scope.fileModel = rest().contents({
                    type: "files",
                    id: $scope.model.file.id,
                    params: "limit=1"
                }, function() {
                    $scope.model.file = $scope.model.file.id;

                    $scope.headersFile = null;

                    generate_headers();
                });
                $scope.file_disabled = 'disabled';

                $scope.model.items = [];

                var counter = 0;
                if (!!$scope.model.dataSeries) {
                    angular.forEach($scope.model.dataSeries, function(value, key) {
                        $scope.model.items.push({
                            field2: value,
                            index: counter
                        });
                        counter++;
                    });
                }
            }
        });
    };

    $scope.load();

    $scope.getHtml = function(html) {
        return $sce.trustAsHtml(html);
    };
}
