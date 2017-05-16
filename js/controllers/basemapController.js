var app = angular.module('odin.basemapsControllers', []);


function BasemapListController($scope, modelService, configs, usSpinnerService, $rootScope, ROLES) {
    usSpinnerService.spin('spinner');
    modelService.initService("Basemap", "basemaps", $scope);

    $scope.parameters = {
        skip: 0,
        limit: 20,
        conditions: '&fields=id,name,deletedAt,maps,createdBy',
        orderBy: 'createdAt',
        sort: 'DESC'
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

    $scope.filtersInclude = ['maps'];

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
    };

    $scope.view = function(model) {
        modelService.view($scope, model);
    };

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

function BasemapViewController($scope, modelService, $routeParams, rest, $location, $sce, usSpinnerService, Alertify, $window) {
    usSpinnerService.spin('spinner');
    modelService.initService("Basemap", "basemaps", $scope);

    $scope.filtersInclude = ['maps'];

    var loadModel = function() {
        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type,
            params: 'include=maps'
        }, function() {
            usSpinnerService.stop('spinner');
        }, function(error) {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
        });
    };

    $scope.inactiveModel = function(item) {
        modelService.deactivateView(item, $scope);
    }

    $scope.activeModel = function(item) {
        modelService.restoreView($scope, item);
    };

    $scope.edit = function(model) {
        var url = '/' + $scope.type + '/' + model.id + "/edit";
        $location.path(url);
    };

    $scope.getHtml = function(html) {
        return $sce.trustAsHtml(html);
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
        var text_type = (type == 'charts') ? 'gráfico' : (type == 'maps') ? 'mapa' : 'archivo';
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

    $scope.confirmDelete = function (item) {
        Alertify.set({
            labels: {
                ok: 'Ok',
                cancel: 'Cancelar'
            }
        });
        Alertify.confirm('¿Está seguro que quiere borrar este mapa base?').then(
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

    $scope.reject = function (id, type) {
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
        Alertify.set({
            labels: {
                ok: 'Ok',
                cancel: 'Cancelar'
            }
        });
        Alertify.confirm('¿Está seguro que quiere enviar a revisión este mapa?').then(
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
        Alertify.set({
            labels: {
                ok: 'Ok',
                cancel: 'Cancelar'
            }
        });
        Alertify.confirm('¿Está seguro que quiere cancelar este mapa?').then(
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
}

function BasemapCreateController($scope, modelService, rest, $location, model, $sce, $routeParams, Alertify, usSpinnerService, configs) {

    modelService.initService("Basemap", "basemaps", $scope);

    $scope.model = new model();
    $scope.model.items = [];
    $scope.baseMin = 0;
    $scope.baseMax = 18;
    $scope.model.tms = false;

    $scope.config_key = 'minZoom';
    ////factory configs
    configs.findKey($scope, function(resp) {
        if (!!resp.data[0] && !!resp.data[0].value) {
            $scope.baseMin = parseInt(resp.data[0].value);
        }

        $scope.model.minZoom = $scope.baseMin;

        $scope.config_key = 'maxZoom';
        ////factory configs
        configs.findKey($scope, function(resp) {
            if (!!resp.data[0] && !!resp.data[0].value) {
                $scope.baseMax = parseInt(resp.data[0].value);
            }
            $scope.model.maxZoom = $scope.baseMax;
        });
    });

    $scope.add = function(model) {
        usSpinnerService.spin('spinner');

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



        if (model) {
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
                if (error.data.data && error.data.data.name) {
                    Alertify.alert('El nombre del basemap ya existe.');
                } else {
                    Alertify.alert('Ha ocurrido un error al crear el basemap.');
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



}


function BasemapEditController($scope, modelService, $routeParams, $sce, rest, $location, model, Alertify, usSpinnerService, configs) {
    usSpinnerService.spin('spinner');
    modelService.initService("Basemap", "basemaps", $scope);

    $scope.model = new model();

    $scope.baseMin = 0;
    $scope.baseMax = 18;

    $scope.config_key = 'minZoom';
    ////factory configs
    configs.findKey($scope, function(resp) {
        if (!!resp.data[0] && !!resp.data[0].value) {
            $scope.baseMin = parseInt(resp.data[0].value);
        }

        $scope.config_key = 'maxZoom';
        ////factory configs
        configs.findKey($scope, function(resp) {
            if (!!resp.data[0] && !!resp.data[0].value) {
                $scope.baseMax = parseInt(resp.data[0].value);
            }
        });
    });

    $scope.update = function(model) {

        usSpinnerService.spin('spinner');

        $scope.model.optionals = {};
        angular.forEach($scope.model.items, function(element) {
            $scope.model.optionals[element.field1] = element.field2;
        });

        if (model) {
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
                if (error.data.data && error.data.data.name) {
                    Alertify.alert('El nombre del basemap ya existe.');
                } else {
                    Alertify.alert('Ha ocurrido un error al editar el basemap.');
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
            usSpinnerService.stop('spinner');
            $scope.model.items = [];
            angular.forEach($scope.model.optionals, function(val, key) {
                $scope.model.items.push({
                    field1: key,
                    field2: val,
                });
            });
        }, function(error) {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
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

    $scope.getHtml = function(html) {
        return $sce.trustAsHtml(html);
    };
}
