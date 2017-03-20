var app = angular.module('odin.DatasetRequestControllers', []);

function DatasetRequestListController($scope, $rootScope, Alertify, modelService, $routeParams, configs, usSpinnerService, ROLES) {
    usSpinnerService.spin('spinner');
    modelService.initService('Dataset', "datasetrequests", $scope);
    
    $scope.parameters = {
        skip: 0,
        limit: 20,
        conditions: '',
        orderBy: 'createdAt',
        sort: 'DESC'
    };
    
    $scope.filtersInclude = ['categories'];

    $scope.view = function(model) {
        modelService.view($scope, model);
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

}

function DatasetRequestViewController($scope, Flash, rest, $routeParams, $location, $sce, modelService, Alertify, usSpinnerService, $window, configs, $rootScope, ROLES) {
    usSpinnerService.spin('spinner');
    modelService.initService("Dataset", "datasetrequests", $scope);

    var loadModel = function() {
        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type,
            params: "include=categories"
        }, function() {
            var categories = [];
            
            for (var i = 0; i < $scope.model.categories.length; i++) {
                categories.push('<span class="label label-primary condition-active">' + $scope.model.categories[i].name + '</span>')
            }
            $scope.model.categories = categories.join(" - ");

            usSpinnerService.stop('spinner');
        }, function(error) {
            usSpinnerService.stop('spinner');
            modelService.reloadPage();
        });
    };

    $scope.getHtml = function(html) {
        return $sce.trustAsHtml(html);
    };

    loadModel();

}