var app = angular.module('odin.mapsControllers', []);


function MapListController($scope, modelService) {
    modelService.initService("Map", "maps", $scope);

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

    modelService.loadAll($scope);

    $scope.activeClass = function (activeClass) {
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
    }, function () {
        loadGeojson();
    });

    var loadGeojson = function () {
        angular.extend($scope, {// Map data
            geojson: {
                data: $scope.model.geojson,
                onEachFeature: function (feature, layer) {
                    if (feature.properties.Name) {
                        layer.bindPopup(feature.properties.Name);
                    }
                }
            }

        });
//        $scope.geojson = {
//            data: $scope.model.geojson,
//        };
    };

    $scope.edit = function (model) {
        var url = '/' + $scope.type + '/' + model.id + "/edit";
        $location.path(url);
    };

    $scope.getHtml = function (html) {
        return $sce.trustAsHtml(html);
    };
}

function MapCreateController($scope, modelService, rest, $location, model, $sce, $routeParams, Alertify) {

    modelService.initService("Map", "maps", $scope);

    $scope.model = new model();
    $scope.steps = [];
    $scope.steps[0] = "active";
    $scope.steps[1] = "undone";
    $scope.steps[2] = "undone";
    $scope.stepactive = 0;

    var generate_headers = function () {
        if ($scope.fileModel.data.length > 0)
        {

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
        });
        $scope.file_disabled = 'disabled';


    }

    $scope.checkstep = function (step) {
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
    $scope.getHtml = function (html) {
        return $sce.trustAsHtml(html);
    };

    var validate = function (data) {
        if (data.name != '' && (data.basemap != '' || data.url != '')) {
            return true;
        } else {
            return false;
        }
    };

    $scope.add = function (model) {
        if (validate(model)) {
            rest().save({
                type: $scope.type
            }, $scope.model, function (resp) {
                var url = '/' + $scope.type;
                $location.path(url);
            });
        } else {
            Alertify.alert('Hay datos incompletos.');
        }
    };

}


function MapEditController($scope, modelService, $routeParams, $sce, rest, $location, model) {
    modelService.initService("Map", "maps", $scope);
    $scope.model = new model();

    $scope.getHtml = function (html) {
        return $sce.trustAsHtml(html);
    };


    $scope.update = function (isValid) {

        var data = {
            //id: $scope.model.id,
            'name': $scope.model.name,
            'description': $scope.model.description,
            'basemap': $scope.model.basemap,
            'notes': $scope.model.notes,
            'url': $scope.model.url,
        };

        if (isValid) {
            rest().update({
                type: $scope.type,
                id: $scope.model.id
            }, data, function (resp) {
                var url = '/' + $scope.type;
                $location.path(url);
            });
        }


    };

    $scope.load = function () {
        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type,
        });
    };

    $scope.load();
}
