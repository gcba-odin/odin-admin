var app = angular.module('odin.mapsControllers', []);

function MapListController($scope, modelService, configs, usSpinnerService, underReview, $rootScope, ROLES) {
    usSpinnerService.spin('spinner');
    modelService.initService("Map", "maps", $scope);
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
            //condition: 'status=oWRhpRV&'
        }];
    } else {
        $scope.parameters.conditions = '';
        if(!!$rootScope.adminglob.currentUser && $rootScope.adminglob.currentUser.role === ROLES.GUEST) {
            var current_us = $rootScope.adminglob.currentUser.user;
            $scope.parameters.conditions = '&createdBy=' + current_us + '&owner=' + current_us;
        }
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

function MapViewController($scope, modelService, $routeParams, rest, $location, $sce, configs, usSpinnerService, Alertify) {
    usSpinnerService.spin('spinner');
    modelService.initService("Map", "maps", $scope);

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
        modelService.confirmDelete(item);
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
        Alertify.confirm('¿Está seguro que quiere despublicar este recurso?').then(
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
        Alertify.confirm('¿Está seguro que quiere rechazar este mapa?').then(
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

function MapPreviewController($scope, modelService, $routeParams, rest, $location, $sce, leafletData, usSpinnerService,configs) {
    usSpinnerService.spin('spinner');
    modelService.initService("Map", "maps", $scope);

    //modelService.findOne($routeParams, $scope);

    $scope.tiles = {
        url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    };

    $scope.center = {
        lat: -34.603722,
        lng: -58.381592,
        zoom: 12
    };

    $scope.model = rest().findOne({
        id: $routeParams.id,
        type: $scope.type
    }, function () {
        $scope.model.link = $sce.trustAsResourceUrl($scope.model.link);
        if (!$scope.model.link) {
            loadGeojson();
        } else {
            usSpinnerService.stop('spinner');
        }
    }, function (error) {
        usSpinnerService.stop('spinner');
        modelService.reloadPage();
    });

    //calculate center automatically from geoJson
    $scope.centerJSON = function () {
        leafletData.getMap('mapid').then(function (map) {
            var latlngs = [];
            for (var i in $scope.geojson.data.features) {
                var coord = $scope.geojson.data.features[i].geometry.coordinates;
                var typeGeometry = $scope.geojson.data.features[i].geometry.type;
                for (var j in coord) {
                    if(typeGeometry == 'Point') {
                        latlngs.push(L.GeoJSON.coordsToLatLng(coord));
                    } else if(typeGeometry == 'LineString' || typeGeometry == 'Polygon') {
                        for (var k in j) {
                            if(typeGeometry == 'LineString') {
                                latlngs.push(L.GeoJSON.coordsToLatLng(coord[j]));
                            } else if(typeGeometry == 'Polygon') {
                                for (var h in coord[j][k]) {
                                    latlngs.push(L.GeoJSON.coordsToLatLng(coord[j][k]));
                                }
                            }
                        }
                    }            
                } 

            }
            if (latlngs.length > 0)
                map.fitBounds(latlngs);
        });
    };

    var loadGeojson = function () {
        var minZoom = 0;
        var maxZoom = 18;
        var tms = false;
        var attribution = '';
        
        if(!!$scope.model.basemap.minZoom) {
            minZoom = $scope.model.basemap.minZoom;
        } 
        if(!!$scope.model.basemap.maxZoom) {
            maxZoom = $scope.model.basemap.maxZoom;
        } 
        if(!!$scope.model.basemap.tms) {
            tms = $scope.model.basemap.tms;
        }
        if(!!$scope.model.basemap.attribution) {
            attribution = $scope.model.basemap.attribution;
        }
        angular.extend($scope, {// Map data
            tiles: {
                url: $scope.model.basemap.url,
                options: {
                    minZoom: minZoom,
                    maxZoom: maxZoom,
                    tms: tms,
                    attribution: attribution
                }
            },
            geojson: {
                data: $scope.model.geojson,
                onEachFeature: function (feature, layer) {
                    if (feature.properties) {
                        var html = '';
                        angular.forEach(feature.properties, function (value, key) {
                            html += '<strong>' + key + '</strong>: ' + value + '<br><br>';
                        });
                        var custom_options = {
                            'maxHeight': '200'
                        };
                        if (html != '') {
                            layer.bindPopup(html, custom_options);
                        }
                    }
                }
            },
        });
        //calculate center automatically from geoJson
        $scope.centerJSON();
        usSpinnerService.stop('spinner');
    };

    $scope.edit = function (model) {
        var url = '/' + $scope.type + '/' + model.id + "/edit";
        $location.path(url);
    };

    $scope.getHtml = function (html) {
        return $sce.trustAsHtml(html);
    };
}

function MapCreateController($scope, modelService, rest, $location, model, $sce, $routeParams, Alertify, usSpinnerService, configs) {
    usSpinnerService.spin('spinner');
    modelService.initService("Map", "maps", $scope);
    
    //factory configs
    configs.statuses($scope);

    $scope.model = new model();
    $scope.steps = [];
    $scope.steps[0] = "active";
    $scope.steps[1] = "undone";
    $scope.steps[2] = "undone";
    $scope.stepactive = 0;
    $scope.basemap_view = true;
    $scope.model.kml = false;

    $scope.config_key = 'mapPointsLimit';
    var data_limit_map = 2000;
    ////factory configs
    configs.findKey($scope, function (resp) {
        usSpinnerService.stop('spinner');
        if (!!resp.data[0] && !!resp.data[0].value) {
            data_limit_map = resp.data[0].value;
        } else {
            modelService.reloadPage();
        }
    });

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
        $scope.model.file = $routeParams.file;
        
        var file_map = rest().findOne({
            type: 'files',
            id: $routeParams.file,
            params: 'include=maps'
        }, function (resp) {
            var map_exist = {
                condition: false,
            };

            if (!!file_map.maps) {
                angular.forEach(file_map.maps, function (element) {
                    if (!!element.basemap && !element.link) {
                        map_exist = {
                            condition: true,
                            id: element.id
                        };
                        //continue;
                    }
                });
            }

            if (map_exist.condition) {
                usSpinnerService.stop('spinner');
                $scope.basemap_view = false;
                Alertify.set({
                    labels:
                    {
                        ok: 'Ir a editar mapa',
                        cancel: 'Continuar'
                    }
                });
                Alertify
                    .confirm('Usted ya tiene un mapa generado con basemap. Podrá editarlo o continuar para crear un mapa a través de URL.')

                    .then(
                    function onOk() {
                        $location.path('maps/' + map_exist.id + '/edit');
                    },
                    function onCancel() {
                        //continue
                    }
                    );
            } else {
                if($.inArray('application/vnd.google-earth.kml+xml', resp.type.mimetype) == 0) { 
                    $scope.model.kml = true;
                } else {
                    $scope.fileModel = rest().contents({
                        type: "files",
                        id: $routeParams.file,
                        params: "limit=1"
                    }, function () {
                        $scope.headersFile = null;
                        generate_headers();
                    }, function (error) {
                        usSpinnerService.stop('spinner');
                        modelService.reloadPage();
                    });
                }
            }
        }, function (error) {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
        });

        $scope.file_disabled = 'disabled';


    }

    $scope.checkstep = function (step) {
        $scope.jump = 1;
        if ((step == 1) && ((!angular.isUndefined($scope.model.link) && $scope.model.link != '') || ($scope.model.kml))) {
            $scope.checkstep(2);
            $scope.jump = 2;
        } else if ((step == 1) && (($scope.headersFile == null) || ($scope.fileModel.meta.count > data_limit_map))) {
            if ($scope.headersFile == null) {
                Alertify.alert('Le faltó asociar el archivo o no se puede leer.');
            } else {
                Alertify.alert('El archivo que está queriendo renderizar supera los ' + data_limit_map + ' datos. Intente asociarle un link.');
            }
        } else {
            if ((step == 1 && ($scope.model.basemap) && ($scope.model.file)) || (step == 2 && ($scope.model.file || $scope.model.kml) && ($scope.model.link || $scope.model.basemap)) || step == 0) {

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
        if (data.name != '' && (data.basemap != '' || data.link != '')) {
            return true;
        } else {
            return false;
        }
    };

    $scope.add = function (model) {
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

        if ($scope.statuses.default == $scope.statuses.published) {
            $scope.model.publishedAt = new Date();
        } else if($scope.statuses.default == $scope.statuses.unpublished) {
            $scope.model.unPublishedAt = new Date();
        } else if($scope.statuses.default == $scope.statuses.rejected) {
            $scope.model.rejectedAt = new Date();
        } else if($scope.statuses.default == $scope.statuses.draft) {
            $scope.model.cancelledAt = new Date();
        } else if($scope.statuses.default == $scope.statuses.underReview) {
            $scope.model.reviewedAt = new Date();
        }

        if (validate(model)) {
            rest().save({
                type: $scope.type
            }, $scope.model, function (resp) {
                usSpinnerService.stop('spinner');

                var alert_text = 'El mapa se generó ';

                if (!!resp.data.incorrect && resp.data.incorrect > 0) {
                    alert_text += 'con errores.';
                } else {
                    alert_text += 'correctamente.';
                }

                if (!$scope.model.link && !$scope.model.kml) {
                    alert_text += "<br><br><strong>Detalle:</strong><br><br>Del total de datos procesados, " + resp.data.correct + " se registraron correctamente y " + resp.data.incorrect + " tuvieron error.";
                }

                Alertify.alert(alert_text);
                if (resp.data.id) {
                    var url = '/' + $scope.type + '/' + resp.data.id + '/view';
                } else {
                    var url = '/' + $scope.type;
                }
                $location.path(url);
            }, function (error) {
                usSpinnerService.stop('spinner');
                if (error.data.data && error.data.data.name) {
                    Alertify.alert('El nombre del mapa ya existe.');
                } else {
                    Alertify.alert('Ha ocurrido un error al crear el mapa.');
                }
            });
        } else {
            usSpinnerService.stop('spinner');
            Alertify.alert('Hay datos incompletos.');
        }
    };

    $scope.model.items = [];

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
        return "property" + (parseInt(a) + 1);
    }

    $scope.basemaps = rest().get({
        type: 'basemaps'
    }, function () {
        usSpinnerService.stop('spinner');
    }, function (error) {
        usSpinnerService.stop('spinner');
        modelService.reloadPage();
    });

}

function MapEditController($scope, modelService, $routeParams, $sce, rest, $location, model, Alertify, usSpinnerService, configs) {
    usSpinnerService.spin('spinner');
    modelService.initService("Map", "maps", $scope);
    $scope.model = new model();
    $scope.model.items = [];
    $scope.steps = [];
    $scope.steps[0] = "active";
    $scope.steps[1] = "undone";
    $scope.steps[2] = "undone";
    $scope.stepactive = 0;
    $scope.basemap_view = true;

    $scope.config_key = 'mapPointsLimit';
    var data_limit_map = 2000;
    ////factory configs
    configs.findKey($scope, function (resp) {
        usSpinnerService.stop('spinner');
        if (!!resp.data[0] && !!resp.data[0].value) {
            data_limit_map = resp.data[0].value;
        } else {
            modelService.reloadPage();
        }
    });

    var url_map = '';

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
        if ((step == 1) && ((!!$scope.model.link)  || ($scope.model.kml))) {
            $scope.checkstep(2);
            $scope.jump = 2;
        } else if ((step == 1) && (($scope.headersFile == null) || ($scope.fileModel.meta.count > data_limit_map))) {
            if ($scope.headersFile == null) {
                Alertify.alert('Le faltó asociar el archivo o no se puede leer.');
            } else {
                Alertify.alert('El archivo que está queriendo renderizar supera los ' + data_limit_map + ' datos. Intente asociarle un link.');
            }
        } else {
            if ((step == 1 && ($scope.model.basemap) && ($scope.model.file)) || (step == 2 && (($scope.model.file) || ($scope.model.kml)) && ($scope.model.link || $scope.model.basemap)) || step == 0) {

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
        if (data.name != '' && (data.basemap != '' || data.link != '')) {
            return true;
        } else {
            return false;
        }
    };

    $scope.update = function (model) {

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
            }, $scope.model, function (resp) {
                usSpinnerService.stop('spinner');

                var alert_text = 'El mapa se editó ';

                if (!!resp.data.incorrect && resp.data.incorrect > 0) {
                    alert_text += 'con errores.';
                } else {
                    alert_text += 'correctamente.';
                }

                if (!$scope.model.link && !$scope.model.kml) {
                    alert_text += "<br><br><strong>Detalle:</strong><br><br>Del total de datos procesados, " + resp.data.correct + " se registraron correctamente y " + resp.data.incorrect + " tuvieron error.";
                }

                Alertify.alert(alert_text);
                //Alertify.alert('El mapa se generó correctamente.<br><br><strong>Detalle:</strong><br><br>Del total de datos procesados, ' + resp.data.correct + ' se registraron correctamente y ' + resp.data.incorrect + ' tuvieron error.');
                if (resp.data.id) {
                    var url = '/' + $scope.type + '/' + resp.data.id + '/view';
                } else {
                    var url = '/' + $scope.type;
                }
                $location.path(url);

            }, function (error) {
                usSpinnerService.stop('spinner');
                if (error.data.data && error.data.data.name) {
                    Alertify.alert('El nombre del mapa ya existe.');
                } else {
                    Alertify.alert('Ha ocurrido un error al editar el mapa.');
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
            if (!!$scope.model.basemap) {
                $scope.model.basemap = $scope.model.basemap.id;
            }
            url_map = $scope.model.link;
            $scope.file_disabled = 'enabled';
            if (!angular.isUndefined($scope.model.file) && !$scope.model.kml) {
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


            }

            $scope.model.items = [];

            var counter = 0;
            if (!!$scope.model.geojson && !!$scope.model.geojson.features[0]) {
                var valores = Object.keys($scope.model.geojson.features[0].properties);
                angular.forEach(valores, function (value, key) {
                    $scope.model.items.push({
                        field2: value,
                        index: counter
                    });
                    counter++;
                });
            }
        }, function (error) {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
        });

        $scope.basemaps = rest().get({
            type: 'basemaps'
        }, function () {
            usSpinnerService.stop('spinner');
        }, function (error) {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
        });
    };

    $scope.load();



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
        return "property" + (parseInt(a) + 1);
    }
}
