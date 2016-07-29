var app = angular.module('odin.mapsControllers', []);


function MapListController($scope, modelService) {
    modelService.initService("Map", "maps", $scope);

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

    modelService.loadAll($scope);

    $scope.activeClass = function(activeClass) {
        modelService.activeClass(activeClass);

    };
}

function MapViewController($scope, modelService, $routeParams, rest, $location, $sce) {
    modelService.initService("Map", "maps", $scope);

    //modelService.findOne($routeParams, $scope);

    $scope.center = {
        lat: -34.603722,
        lng: -58.381592,
        zoom: 13
    };

    $scope.model = rest().findOne({
        id: $routeParams.id,
        type: $scope.type
    }, function() {
        loadGeojson();
    });

    var loadGeojson = function() {
        angular.extend($scope, {// Map data
            geojson: {
                data: $scope.model.geojson,
                onEachFeature: function(feature, layer) {
                    if (feature.properties) {
                        var html = '';
                        angular.forEach(feature.properties, function(value, key) {
                            html += '<strong>' + key + '</strong>: ' + value + '<br><br>';
                        });
                        if (html != '') {
                            layer.bindPopup(html);
                        }
                    }
                }
            }

        });
//        $scope.geojson = {
//            data: $scope.model.geojson,
//        };
    };

    $scope.edit = function(model) {
        var url = '/' + $scope.type + '/' + model.id + "/edit";
        $location.path(url);
    };

    $scope.getHtml = function(html) {
        return $sce.trustAsHtml(html);
    };
}

function MapCreateController($scope, modelService, rest, $location, model, $sce, $routeParams, Alertify, usSpinnerService) {

    modelService.initService("Map", "maps", $scope);

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
        if ((step == 1) && ($scope.headersFile == null)) {
            Alertify.alert('Le faltó asociar el archivo o no se puede leer.');
        } else if ((step == 1) && (!angular.isUndefined($scope.model.url) && $scope.model.url != '')) {
            $scope.checkstep(2);
        } else {
            if ((step == 1 && ($scope.model.basemap) && ($scope.model.file)) || (step == 2 && ($scope.model.file) && ($scope.model.url || $scope.model.basemap)) || step == 0) {

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
    $scope.getHtml = function(html) {
        return $sce.trustAsHtml(html);
    };

    var validate = function(data) {
        if (data.name != '' && (data.basemap != '' || data.url != '')) {
            return true;
        } else {
            return false;
        }
    };

    $scope.add = function(model) {
        usSpinnerService.spin('spinner');

        for (obj in $scope.model) {
            if (obj.indexOf("property") != -1) {
                delete $scope.model[obj]
            }
        }

        var cont = 1;
        $scope.model.properties = [];
        for (var i = 0; i < $scope.model.items.length; i++) {
            var values = [];
            $scope.model["property" + cont] = "";
            $scope.model.properties = $scope.model.properties.concat($scope.model.items[i].field2);
            cont++;
        }
        $scope.model.properties = $scope.model.properties.toString();

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
            });
        } else {
            usSpinnerService.stop('spinner');
            Alertify.alert('Hay datos incompletos.');
        }
    };

    $scope.model.items = [];

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
        return "property" + (parseInt(a) + 1);
    }

}


function MapEditController($scope, modelService, $routeParams, $sce, rest, $location, model, Alertify, usSpinnerService) {
    modelService.initService("Map", "maps", $scope);
    $scope.model = new model();

    $scope.steps = [];
    $scope.steps[0] = "active";
    $scope.steps[1] = "undone";
    $scope.steps[2] = "undone";
    $scope.stepactive = 0;

    var url_map = '';

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

        if ((step == 1) && ($scope.headersFile == null)) {
            Alertify.alert('Le faltó asociar el archivo o no se puede leer.');
        } else if ((step == 1) && (!angular.isUndefined($scope.model.url) && $scope.model.url != '' && ($scope.model.url != url_map))) {
            $scope.checkstep(2);
        } else {
            if ((step == 1 && ($scope.model.basemap) && ($scope.model.file)) || (step == 2 && ($scope.model.file) && ($scope.model.url || $scope.model.basemap)) || step == 0) {

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

    $scope.getHtml = function(html) {
        return $sce.trustAsHtml(html);
    };


    var validate = function(data) {
        if (data.name != '' && (data.basemap != '' || data.url != '')) {
            return true;
        } else {
            return false;
        }
    };

    $scope.update = function(model) {

        usSpinnerService.spin('spinner');

        for (obj in $scope.model) {
            if (obj.indexOf("property") != -1) {
                delete $scope.model[obj]
            }
        }

        var cont = 1;
        $scope.model.properties = [];
        for (var i = 0; i < $scope.model.items.length; i++) {
            var values = [];
            $scope.model["property" + cont] = "";
            $scope.model.properties = $scope.model.properties.concat($scope.model.items[i].field2);
            cont++;
        }
        $scope.model.properties = $scope.model.properties.toString();

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
            url_map = $scope.model.url;
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


            }

            $scope.model.items = [];

            var counter = 0;
            if (!!$scope.model.geojson.features[0]) {
                var valores = Object.keys($scope.model.geojson.features[0].properties);
                angular.forEach(valores, function(value, key) {
                    $scope.model.items.push({
                        field2: value,
                        index: counter
                    });
                    counter++;
                });
            }
        });
    };

    $scope.load();



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
        return "property" + (parseInt(a) + 1);
    }
}
