var app = angular.module('odin.DatasetControllers', ["ngSanitize"]);

app.factory('model', function($resource) {
    return $resource();
});



function DatasetListController($scope, $location, rest, $rootScope, Flash, Alertify, modelService) {


    modelService.initService("Dataset", "datasets", $scope);

    $scope.confirmDelete = function(item) {
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

    modelService.loadAll($scope);
}

function DatasetViewController($scope, Flash, rest, $routeParams, $location, $sce, modelService, Alertify, usSpinnerService, $window) {

    modelService.initService("Dataset", "datasets", $scope);

    $scope.model = rest().findOne({
        id: $routeParams.id,
        type: $scope.type,
        params: "include=tags,files,categories"
    }, function() {
        var tags = [];
        for (var i = 0; i < $scope.model.tags.length; i++) {
            tags.push('<span class="label label-primary">' + $scope.model.tags[i].name + '</span>')
        }
        $scope.model.tags = tags.join(" - ");

        var categories = [];
        for (var i = 0; i < $scope.model.categories.length; i++) {
            categories.push('<span class="label label-primary">' + $scope.model.categories[i].name + '</span>')
        }
        $scope.model.categories = categories.join(" - ");
    });

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

    var update = function() {
        usSpinnerService.spin('spinner');
        $scope.tempData = {
            id: $scope.model.id,
            publishedAt: $scope.model.publishedAt
        };

        rest().update({
            type: $scope.type,
            id: $scope.tempData.id
        }, $scope.tempData, function(resp) {
            var url = '/' + $scope.type;
            // $location.path(url);
        });
        usSpinnerService.stop('spinner');
    };

    $scope.publish = function() {
        $scope.model.publishedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
        update();
    };

    $scope.unPublish = function() {
        Alertify.confirm('¿Está seguro que quiere despublicar este dataset?').then(
            function onOk() {
                $scope.model.publishedAt = null;
                update();
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

function DatasetCreateController($scope, rest, model, Flash, $location, modelService, flashService, usSpinnerService) {
    modelService.initService("Dataset", "datasets", $scope);

    $scope.tagsmodel = rest().get({
        type: "tags",
        params: "orderBy=name&sort=DESC"
    });

    $scope.categoriesmodel = rest().get({
        type: "categories",
        params: "orderBy=name&sort=DESC"
    });

    $scope.model = new model();
    $scope.model.items = [];
    $scope.add = function(isValid) {
        usSpinnerService.spin('spinner');
        for (obj in $scope.model) {
            if (obj.indexOf("optional") != -1) {
                delete $scope.model[obj]
            }
        }

        var cont = 1;
        for (var i = 0; i < $scope.model.items.length; i++) {
            var values = [];
            $scope.model["optional" + cont] = "";
            $scope.model["optional" + cont] = $scope.model.items[i].field1 + "|" + $scope.model.items[i].field2;
            cont++;
        }

        // transform the array of objects into a string of ids
        $scope.model.tags = $scope.model.tags.toString();
        $scope.model.categories = $scope.model.categories.toString();

        if (isValid) {
            rest().save({
                type: $scope.type
            }, $scope.model, function(resp) {
                usSpinnerService.stop('spinner');
                var url = '/' + $scope.type + '/' + resp.data.id;
                $location.path(url);
            }, function(error) {
                usSpinnerService.stop('spinner');
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

function DatasetEditController($scope, Flash, rest, $routeParams, model, $location, modelService, usSpinnerService) {

    modelService.initService("Dataset", "datasets", $scope);


    $scope.model = new model();
    $scope.tags = [];
    var tagstemporal = [];
    $scope.tempData = [];
    $scope.publishAt = "";
    $scope.publish = function() {
        $scope.model.publishedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
    $scope.unPublish = function() {
        $scope.model.publishedAt = "";
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
            var verified = verifyOptional($scope.model.items, o)

            if (verified) {
                optionsTemp.push(verified);
            } else {
                optionsTemp.push("");
            }
        }

        $scope.tempData.items = optionsTemp;
        var cont = 1;
        for (var i = 0; i < $scope.tempData.items.length; i++) {
            $scope.tempData["optional" + cont] = "";
            $scope.tempData["optional" + cont] = $scope.tempData.items[i];
            cont++;
        }

        // transform the array of objects into a string of ids
        $scope.tempData.files = reformatArray($scope.tempData.files).toString();
        $scope.tempData.tags = $scope.tempData.tags.toString();
        $scope.tempData.categories = $scope.tempData.categories.toString();

        // TODO: chequear cual forma de mandar los items (opcionales) es la correcta
        // $scope.tempData.items

        // reformatArray transforms an array of objects into an array of ids
        function reformatArray(originalArray) {
            var reformattedArray = originalArray.map(function(obj) {
                return obj.id;
                // rObj[obj.id] = obj.value;
            });
            return reformattedArray;
        };

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
                params: "include=tags,files,categories"
            }, function() {
                $scope.model.items = [];
                $scope.publishAt = $scope.model.publishAt;
                var counter = 0;
                for (obj in $scope.model) {
                    if (obj.indexOf("optional") != -1) {
                        if (!!$scope.model[obj]) {
                            var valores = $scope.model[obj].split("|");
                            $scope.model.items.push({
                                field1: valores[0],
                                field2: valores[1],
                                index: counter
                            });
                            counter++;
                        }
                    }
                }
            });
        });
    }

    function verifyOptional(arrayOptions, index) {
        var returnOption = false;
        for (var j = 0; j < arrayOptions.length; j++) {
            if (j == index) {
                console.dir(arrayOptions[j]);
                returnOption = arrayOptions[j].field1 + "|" + arrayOptions[j].field2;
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