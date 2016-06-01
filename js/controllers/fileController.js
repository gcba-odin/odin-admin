var app = angular.module('odin.fileControllers', ['ngFileUpload']);

app.factory('model', function($resource) {
    return $resource();
});


function FileListController($scope, $location, rest, $rootScope, Flash) {

    Flash.clear();
    $scope.modelName = "File";
    $scope.type = "files";

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

function FileViewController($scope, Flash, rest, $routeParams, $location) {
    Flash.clear();
    $scope.modelName = "File";
    $scope.type = "files";

    $scope.model = rest().findOne({
        id: $routeParams.id,
        type: $scope.type 
    });

    $scope.edit = function(model) {
        var url = '/'+$scope.type+'/' + model.id + "/edit";
        $location.path(url);
    }
}

function FileCreateController($scope, rest, model, Flash,$location,Upload,$rootScope) {

    Flash.clear();
    $scope.modelName = "File";
    $scope.type = "files";

    $scope.model = new model();
    $scope.add = function(isValid) {
    $scope.uploadImageProgress=10;
        var data={
            'name':$scope.model.name,
            'type':$scope.model.type,
            'status':$scope.model.status,
            'organization':$scope.model.organization,
            'dataset':$scope.model.dataset,
            'description':$scope.model.description,
            'notes':$scope.model.notes,
            'url':$scope.model.url,
            'visibility':$scope.model.visibility,

            'uploadFile':$scope.model.uploadFile
        }

        Upload.upload({
            url: $rootScope.url+"/files",
            data: data
        }).then(function (resp) {
          var url = '/'+$scope.type;
            $location.path(url);
        }, function (resp) {
            alert(resp.status);
        }, function (evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            $scope.uploadImageProgress=progressPercentage;
        });
    };


    $scope.model.filetypes = rest().get({
        type: "filetypes" ,params:"sort=name DESC"
    });
    $scope.model.statuses = rest().get({
        type: "statuses" ,params:"sort=name DESC"
    });
    $scope.model.organizations = rest().get({
        type: "organizations" ,params:"sort=name DESC"
    });
    $scope.model.frequencies = rest().get({
        type: "updatefrequencies" ,params:"sort=name DESC"
    });
    $scope.tagsmodel = rest().get({
        type: "tags" ,params:"sort=name DESC"
    });

}

function FileEditController($scope, Flash, rest, $routeParams, model,$location) {
    Flash.clear();
    $scope.modelName = "File";
    $scope.type = "files";

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