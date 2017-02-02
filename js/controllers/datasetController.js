var app = angular.module('odin.DatasetControllers', ["ngSanitize"]);

app.factory('model', function($resource) {
    return $resource();
});



function DatasetListController($scope, $rootScope, Alertify, modelService, $routeParams, configs, usSpinnerService, ROLES) {
    usSpinnerService.spin('spinner');
    modelService.initService('Dataset', "datasets", $scope);
    
    $scope.parameters = {
        skip: 0,
        limit: 20,
        conditions: '',
        orderBy: 'createdAt',
        sort: 'DESC'
    };
    
    $scope.starred = false;
    if($routeParams.filter == 'starred') {
        $scope.parameters.conditions = '&starred=true';
        $scope.starred = true;
        $rootScope.actualUrl = '/datasets/starred';
    } 
    
    $scope.filtersInclude = ['categories'];

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
    }, {
        name: 'Categoria',
        model: 'categories',
        key: 'name',
        modelInput: 'categories',
        multiple: true,
        permission: true,
    }];

    if(!!$rootScope.adminglob.currentUser && $rootScope.adminglob.currentUser.role === ROLES.GUEST) {
        $scope.filtersView[1].permission = false;
    }
    
    $scope.confirmDelete = function(item) {
        Alertify.set({
            labels: {
                ok: 'Ok',
                cancel: 'Cancelar'
            }
        });
        Alertify.confirm('¿Está seguro que quiere borrar este dataset?<br> Al hacerlo, se borrarán todos los recursos asociados').then(
            function onOk() {
                $scope.deleteModel(item);
            },
            function onCancel() {
                return false;
            }
        );
    };

    $scope.deleteModel = function(model) {
        modelService.delete($scope, model);
    };

    $scope.edit = function(model) {
        modelService.edit($scope, model);
    }

    $scope.view = function(model) {
        modelService.view($scope, model);
    }

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

function DatasetViewController($scope, Flash, rest, $routeParams, $location, $sce, modelService, Alertify, usSpinnerService, $window, configs, $rootScope, ROLES) {
    usSpinnerService.spin('spinner');
    modelService.initService("Dataset", "datasets", $scope);

    var loadModel = function() {
        var params = '';
        if(!!$rootScope.adminglob.currentUser && $rootScope.adminglob.currentUser.role === ROLES.GUEST) {
            var current_us = $rootScope.adminglob.currentUser.user;
            params = '&files.createdBy=' + current_us + '&files.owner=' + current_us;
        }
        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type,
            params: "include=tags,files,categories,subcategories" + params
        }, function() {
            var tags = [];
            for (var i = 0; i < $scope.model.tags.length; i++) {
                tags.push('<span class="label label-primary condition-active">' + $scope.model.tags[i].name + '</span>')
            }
            $scope.model.tags = tags.join(" - ");

            var categories = [];
            var subcategories = [];

            for (var i = 0; i < $scope.model.categories.length; i++) {
                categories.push('<span class="label label-primary condition-active">' + $scope.model.categories[i].name + '</span>')
            }
            $scope.model.categories = categories.join(" - ");

            for (var i = 0; i < $scope.model.subcategories.length; i++) {
                subcategories.push('<span class="label label-primary condition-active">' + $scope.model.subcategories[i].name + '</span>')
            }
            $scope.model.subcategories = subcategories.join(" - ");

            $scope.model.items = [];
            for (obj in $scope.model) {
                if (obj.indexOf("optional") != -1) {
                    if (!!$scope.model[obj]) {
                        $scope.model.items.push({
                            clave: $scope.model[obj].clave,
                            valor: $scope.model[obj].valor,
                        });
                    }
                }
            }
            usSpinnerService.stop('spinner');
        }, function(error) {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
        });
    };

    $scope.edit = function(model) {
        modelService.edit($scope, model);

    }
    $scope.getHtml = function(html) {
        return $sce.trustAsHtml(html);
    };

    app.filter('html', function($sce) {
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    });

    //factory configs
    configs.statuses($scope);

    $scope.publish = function(id, type) {
        usSpinnerService.spin('spinner');

        rest().publish({
            type: type,
            id: id
        }, {}, function(resp) {
            loadModel();
            //var url = '/' + $scope.type;
            // $location.path(url);
        });
        usSpinnerService.stop('spinner');
    };


    $scope.unPublish = function(id, type) {
        var text_type = 'dataset';
        if (type == 'files') {
            text_type = 'recurso';
        }
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

    $scope.deleteResource = function(id, type) {
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
    
    $scope.reject = function (id, type) {
        Alertify.set({
            labels: {
                ok: 'Ok',
                cancel: 'Cancelar'
            }
        });
        Alertify.confirm('¿Está seguro que quiere rechazar este recurso?').then(
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
        Alertify.confirm('¿Está seguro que quiere enviar a revisión este recurso?').then(
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
        Alertify.confirm('¿Está seguro que quiere cancelar este recurso?').then(
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
    
    $scope.confirmDelete = function (item) {
        Alertify.set({
            labels: {
                ok: 'Ok',
                cancel: 'Cancelar'
            }
        });
        Alertify.confirm('¿Está seguro que quiere borrar este dataset?<br> Al hacerlo, se borrarán todos los recursos asociados').then(
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

    loadModel();

}

function DatasetCreateController($scope, rest, model, Flash, $location, modelService, flashService, usSpinnerService, Alertify, configs) {
    modelService.initService("Dataset", "datasets", $scope);

    $scope.tagsmodel = rest().get({
        type: "tags",
        params: "orderBy=name&sort=DESC"
    });

    $scope.categoriesmodel = rest().get({
        type: "categories",
        params: "orderBy=name&sort=DESC"
    });

    $scope.status_default = true;

    //factory configs
    configs.statuses($scope);

    $scope.model = new model();
    $scope.model.items = [];
    $scope.model.starred = false;
    
    $scope.model.owner = { 'id': $scope.adminglob.currentUser.user, 'username': $scope.adminglob.currentUser.username };

    $scope.add = function(isValid) {
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

        // transform the array of objects into a string of ids
        $scope.model.tags = $scope.model.tags.toString();
        $scope.model.categories = $scope.model.categories.toString();
        if (!!$scope.model.subcategories && $scope.model.subcategories.length > 0) {
            $scope.model.subcategories = $scope.model.subcategories.toString();
        }

        if ($scope.statuses.default == $scope.statuses.published) {
            $scope.model.publishedAt = new Date();
        } else if($scope.statuses.default == $scope.statuses.unpublished) {
            $scope.model.unPublishedAt = new Date();
        } else if($scope.statuses.default == $scope.statuses.rejected) {
            $scope.model.rejectedAt = new Date();
        } else if($scope.statuses.default == $scope.statuses.underReview) {
            $scope.model.reviewedAt = new Date();
        }

        if (isValid) {
            rest().save({
                type: $scope.type
            }, $scope.model, function(resp) {
                usSpinnerService.stop('spinner');
                var url = '/' + $scope.type + '/' + resp.data.id + '/view';
                $location.path(url);
            }, function(error) {
                usSpinnerService.stop('spinner');

                if (error.data.data && (error.data.data.name || error.data.data.slug)) {
                    Alertify.alert('El nombre de dataset ya existe.');
                } else {
                    Alertify.alert('Ha ocurrido un error al crear el dataset.');
                }

            });
        }
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

function DatasetEditController($scope, Flash, rest, $routeParams, model, $location, modelService, usSpinnerService, configs, Alertify, $rootScope) {
    usSpinnerService.spin('spinner');
    modelService.initService("Dataset", "datasets", $scope);

    $scope.status_default = false;

    $scope.model = new model();
    $scope.tags = [];
    var tagstemporal = [];
    $scope.tempData = [];
    $scope.publishAt = "";
    $rootScope.hasSubs = false;
    
    var prev_status = null;

    //factory configs
    configs.statuses($scope);

    $scope.publish = function() {
        $scope.model.publishedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        $scope.model.status = $scope.statuses.published;
    }
    $scope.unPublish = function() {
        $scope.model.publishedAt = "";
        $scope.model.status = $scope.statuses.unpublished;
    }
    $scope.update = function(isValid) {
        usSpinnerService.spin('spinner');

        for (obj in $scope.model) {
            if (obj.indexOf("optional") != -1) {
                delete $scope.model[obj]
            }
        }

        var optionsTemp = [];

        $scope.tempData = angular.copy($scope.model);
        
        for (var o = 0; o < 10; o++) {
            var verified = verifyOptional($scope.model.items, o);

            if (verified) {
                optionsTemp.push(verified);
            }
        }

        $scope.tempData.items = optionsTemp;
        $scope.tempData.optionals = {};
        angular.forEach($scope.tempData.items, function(element) {
            $scope.tempData.optionals[element.clave] = element.valor;
        });

        // transform the array of objects into a string of ids
        $scope.tempData.files = reformatArray($scope.tempData.files).toString();
        $scope.tempData.tags = $scope.tempData.tags.toString();
        $scope.tempData.categories = $scope.tempData.categories.toString();

        if (!!$rootScope.hasSubs && !!$scope.model.subcategories && $scope.model.subcategories.length > 0) {
            $scope.tempData.subcategories = $scope.model.subcategories.toString();
        } else {
            $scope.tempData.subcategories = [];
        }

        if (prev_status != $scope.model.status && $scope.model.status == $scope.statuses.published) {
            $scope.tempData.publishedAt = new Date();
        } else if(prev_status != $scope.model.status && $scope.model.status == $scope.statuses.unpublished) {
            $scope.tempData.unPublishedAt = new Date();
        } else if(prev_status != $scope.model.status && $scope.model.status == $scope.statuses.rejected) {
            $scope.tempData.rejectedAt = new Date();
        } else if(prev_status != $scope.model.status && $scope.model.status == $scope.statuses.draft) {
            $scope.tempData.cancelledAt = new Date();
        } else if(prev_status != $scope.model.status && $scope.model.status == $scope.statuses.underReview) {
            $scope.tempData.reviewedAt = new Date();
        }

        // TODO: chequear cual forma de mandar los items (opcionales) es la correcta
        // $scope.tempData.items

        // reformatArray transforms an array of objects into an array of ids
        function reformatArray(originalArray) {
            var reformattedArray = originalArray.map(function(obj) {
                return obj.id;
                // rObj[obj.id] = obj.value;
            });
            return reformattedArray;
        }
        ;
        if (isValid) {
            rest().update({
                type: $scope.type,
                id: $scope.tempData.id
            }, $scope.tempData, function(resp) {
                usSpinnerService.stop('spinner');
                var url = '/' + $scope.type + '/' + $scope.tempData.id + '/view';
                $location.path(url);
            }, function(error) {
                usSpinnerService.stop('spinner');

                if (error.data.data && (error.data.data.name || error.data.data.slug)) {
                    Alertify.alert('El nombre de dataset ya existe.');
                } else {
                    Alertify.alert('Ha ocurrido un error al editar el dataset.');
                }
            });
        }
    };

    $scope.load = function() {
        $scope.tagsmodel = rest().get({
            type: "tags",
            params: "orderBy=name&sort=DESC"
        }, function() {
            $scope.model = rest().findOne({
                id: $routeParams.id,
                type: $scope.type,
                params: "include=tags,files,categories,subcategories"
            }, function() {
                if (!!$scope.model.status) {
                    $scope.model.status = $scope.model.status.id;
                    prev_status = $scope.model.status;
                }
                if (!$scope.model.starred) {
                    $scope.model.starred = false;
                }
//                if(!!$scope.model.subcategories) {
////                    angular.forEach($scope.model.subcategories, function(element) {
////                        $scope.data_subcategories.push(element.id);
////                    });
//                    $scope.data_subcategories = $scope.model.subcategories;
//                } 
                $scope.model.items = [];
                $scope.publishAt = $scope.model.publishAt;
                angular.forEach($scope.model.optionals, function(val, key) {
                    $scope.model.items.push({
                        field1: key,
                        field2: val,
                    });
                });
            });
            usSpinnerService.stop('spinner');
        }, function(error) {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
        });
    }

    function verifyOptional(arrayOptions, index) {
        var returnOption = false;
        for (var j = 0; j < arrayOptions.length; j++) {
            if (j == index) {
                returnOption = {
                    clave: arrayOptions[j].field1,
                    valor: arrayOptions[j].field2,
                    index: j
                }
                break;
            }
        }
        return returnOption;
    }

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
}
