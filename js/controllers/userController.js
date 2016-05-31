var app = angular.module('odin.userControllers', []);

app.factory('model', function($resource) {
    return $resource();
});



function UserListController($scope, $location, rest, $rootScope, Flash) {
    Flash.clear();
    $scope.modelName = "User";
    $scope.type = "users";
    var model = rest().get({
        type: $scope.type ,params:"sort=createdAt DESC"
    });
    $scope.data = model;
    $scope.delete = function(model) {
        rest().delete({
            type: $scope.type,
            id: model.id
        }, function(resp) {
            $scope.data = rest().get({
                type: $scope.type ,params:"sort=createdAt DESC"
            });
        });

    };

    $scope.edit = function(model) {
        var url = '/'+$scope.type+'/' + model.id + "/edit";
        $location.path(url);
    }


    $scope.view = function(model) {
        var url = '/'+$scope.type+'/' + model.id + "/view";
        $location.path(url);
    }
}

function UserViewController($scope, Flash, rest, $routeParams, $location) {
    Flash.clear();
    $scope.modelName = "User";
    $scope.type = "users";
    $scope.model = rest().findOne({
        id: $routeParams.id,
        type: $scope.type 
    });

    $scope.edit = function(model) {
        var url = '/'+$scope.type+'/' + model.id + "/edit";
        $location.path(url);
    }
}

function UserCreateController($scope, rest, model, Flash,$location) {
    Flash.clear();
    $scope.modelName = "User";
    $scope.type = "users";
    $scope.model = new model();
    $scope.add = function(isValid) {
        if (isValid) {
            rest().save({
                type: $scope.type
            }, $scope.model,function (resp){

                if(!!resp.data){
                    var url = '/'+$scope.type+'/' + resp.data.id + "/edit";
                    
                }else{
                    var url = '/'+$scope.type+'/';
                }
                $location.path(url);
        
            });
        }
    };
}

function UserEditController($scope, Flash, rest, $routeParams, model,$location) {
    Flash.clear();
    $scope.modelName = "User";
    $scope.type = "users";
    $scope.model = new model();
    $scope.update = function(isValid) {
        if (isValid) {
            rest().update({
                type: $scope.type,
                id: $scope.model.id
            }, $scope.model,function (){
                var url = '/'+$scope.type+'/';
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