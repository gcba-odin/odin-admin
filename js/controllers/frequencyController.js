var app = angular.module('odin.updateFrequencyControllers', []);

app.factory('model', function($resource) {
    return $resource();
});

function updateFrequencyListController($scope, $location, rest, $rootScope, Flash,Alertify,modelService) {

 modelService.initService("updateFrequency","updatefrequencies",$scope);

    $scope.confirmDelete=function (item){
        modelService.confirmDelete(item);
    }

    $scope.deleteModel = function(model) {
        modelService.delete($scope,model);
    };

    $scope.edit = function(model) {
        modelService.edit($scope,model);
    }

    $scope.view = function(model) {
        modelService.view($scope,model);
    }

    $scope.limit = 20;

    $scope.q = "&skip=0&limit=" + $scope.limit;

    modelService.loadAll($scope);

    $scope.paging = function(event, page, pageSize, total) {
        var skip = (page - 1) * $scope.limit;
        $scope.q = "&skip=" + skip + "&limit=" + $scope.limit;
        modelService.loadAll($scope);
    };  
}

function updateFrequencyViewController($scope, Flash, rest, $routeParams, $location,modelService) {
 modelService.initService("updateFrequency","updatefrequencies",$scope);

    modelService.findOne($routeParams,$scope);


    $scope.edit = function(model) {
        modelService.edit($scope,model);
    }
}

function updateFrequencyCreateController($scope, rest, model, Flash,$location,modelService) {
 modelService.initService("updateFrequency","updatefrequencies",$scope);


    $scope.model = new model();
    $scope.add = function(isValid) {
        if (isValid) {
            rest().save({
                type: $scope.type
            }, $scope.model,function (resp){
                var url = '/'+$scope.type;
                $location.path(url);
            });
        }
    };
}

function updateFrequencyEditController($scope, Flash, rest, $routeParams, model,$location,modelService) {
 modelService.initService("updateFrequency","updatefrequencies",$scope);


    $scope.model = new model();
    $scope.update = function(isValid) {
        if (isValid) {
            rest().update({
                type: $scope.type,
                id: $scope.model.id
            }, $scope.model,function (resp){
                var url = '/'+$scope.type;
                $location.path(url);
            });
        }
    };

    $scope.load = function() {
        $scope.model = rest().findOne({
            id: $routeParams.id,
            type: $scope.type
        });
    };

    $scope.load();
}