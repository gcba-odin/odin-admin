var app = angular.module('odin.filetypeControllers', []);

app.factory('model', function($resource) {
    return $resource();
});

function FileTypeListController($scope, $location, rest, $rootScope, Flash, Alertify, modelService, configs, usSpinnerService) {
    usSpinnerService.spin('spinner');
    modelService.initService("File Type", "filetypes", $scope);
    
    $scope.parameters = {
        skip: 0,
        limit: 20,
        conditions: '',
        orderBy: 'createdAt',
        sort: 'DESC'
    };
    
    $scope.filtersView = [{
            name: 'Autor',
            model: 'users',
            key: 'username',
            modelInput: 'createdBy',
            multiple: true
        }];
    
    $scope.filtersInclude = ['files'];

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
    }

    $scope.view = function(model) {
        modelService.view($scope, model);
    }
    
    $scope.config_key = 'adminPagination';
    ////factory configs
    configs.findKey($scope, function (resp) {
        if (!!resp.data[0] && !!resp.data[0].value) {
            $scope.parameters.limit = resp.data[0].value;
        }
        
        $scope.q = "&skip=" + $scope.parameters.skip + "&limit=" + $scope.parameters.limit;

        modelService.loadAll($scope, function(resp) {
            usSpinnerService.stop('spinner');
            if(!resp) {
                modelService.reloadPage();
            }
        });
    });

    $scope.paging = function(event, page, pageSize, total) {
        usSpinnerService.spin('spinner');
        $scope.parameters.skip = (page - 1) * $scope.parameters.limit;
        $scope.q = "&skip=" + $scope.parameters.skip + "&limit=" + $scope.parameters.limit;
        
        if(!!$scope.parameters.conditions) {
            $scope.q += $scope.parameters.conditions;
        }
        modelService.loadAll($scope, function(resp) {
            usSpinnerService.stop('spinner');
            if(!resp) {
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

function FileTypeViewController($scope, Flash, rest, $routeParams, $location, modelService, $sce, usSpinnerService, Alertify, $window) {
    usSpinnerService.spin('spinner');
    modelService.initService("File Type", "filetypes", $scope);

    $scope.inactiveModel = function(item) {
        modelService.deactivateView(item, $scope);
    }

    $scope.activeModel = function(item) {
        modelService.restoreView($scope, item);
    };

    $scope.edit = function(model) {
        modelService.edit($scope, model);

    }
    
    $scope.getHtml = function(html) {
        return $sce.trustAsHtml(html);
    };
    
    var loadModel = function() {
        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type,
            params: 'include=files'
        }, function() {
            var mimes = [];
            for (var i = 0; i < $scope.model.mimetype.length; i++) {
                mimes.push('<span class="label label-primary">' + $scope.model.mimetype[i] + '</span>')
            }
            $scope.model.mimetype = mimes.join(" - ");
            usSpinnerService.stop('spinner');
        }, function(error) {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
        });
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
         var text_type = (type == 'files') ? 'recurso' : '';
         Alertify.confirm('¿Está seguro que quiere despublicar este ' + text_type + '?').then(
             function onOk() {
                 usSpinnerService.spin('spinner');
 
                 rest().unpublish({
                     type: $scope.type,
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
}

function FileTypeCreateController($scope, $http, rest, model, Flash, $location, modelService, Alertify, usSpinnerService) {
    modelService.initService("File Type", "filetypes", $scope);

    $http.get('config/mimetypes.json').success(function(data) {
        $scope.mimetypes = Object.keys(data);
    });

    $scope.model = new model();
    $scope.create = true;
    
    $scope.add = function(isValid) {
        usSpinnerService.spin('spinner');
        if (isValid) {
            rest().save({
                type: $scope.type
            }, $scope.model, function(resp) {
                usSpinnerService.stop('spinner');
                var url = '/' + $scope.type + '/' + resp.data.id + "/view";
                $location.path(url);
            }, function(error) {
                usSpinnerService.stop('spinner');
                
                //if(error.data.data && (error.data.data.name || error.data.data.slug)) {
                    Alertify.alert('El tipo de archivo que quiere guardar ya existe.');
                //} else {
                //    Alertify.alert('Hubo un error al crear el tipo de archivo.');
                //}
            });
        }
    };
}

function FileTypeEditController($scope, $http, Flash, rest, $routeParams, model, $location, modelService, Alertify, usSpinnerService) {
    usSpinnerService.spin('spinner');
    modelService.initService("File Type", "filetypes", $scope);

    $http.get('config/mimetypes.json').success(function(data) {
        $scope.mimetypes = Object.keys(data);
    });

    $scope.model = new model();
    $scope.edit = true;
    
    $scope.update = function(isValid) {
        usSpinnerService.spin('spinner');
        if (isValid) {
            rest().update({
                type: $scope.type,
                id: $scope.model.id
            }, $scope.model, function(resp) {
                usSpinnerService.stop('spinner');
                var url = '/' + $scope.type + '/' + resp.data.id + "/view";
                $location.path(url);
            }, function(error) {
                usSpinnerService.stop('spinner');

                //if(error.data.data && (error.data.data.name || error.data.data.slug)) {
                    Alertify.alert('El tipo de archivo que quiere guardar ya existe.');
                //} else {
                //    Alertify.alert('Hubo un error al editar el tipo de archivo.');
                //}
            });
        }
    };

    $scope.load = function() {
        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type
        }, function() {
            usSpinnerService.stop('spinner');
        }, function(error) {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
        });
    };

    $scope.load();
}