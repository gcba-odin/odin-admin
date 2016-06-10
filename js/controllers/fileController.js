var app = angular.module('odin.fileControllers', ['ngFileUpload']);

app.factory('model', function($resource) {
    return $resource();
});


function FileListController($scope, $location, rest, $rootScope, Flash,Alertify,$routeParams,modelService) {


    modelService.initService("File","files",$scope);

    $scope.filtersView=[
                {name:'Estado',model:'statuses',key:'name',modelInput:'status',multiple:true},
                {name:'Autor',model:'users',key:'username',modelInput:'owner',multiple:false}
            ];
    $scope.confirmDelete=function (item){
        modelService.confirmDelete(item);
    }

    var deleteModel = function(model) {
        modelService.delete($scope,model);
    };

    $scope.edit = function(model) {
        modelService.edit($scope,model);
    }

    $scope.view = function(model) {
        modelService.view($scope,model);
    }

    modelService.loadAll($scope);
}

function FileViewController($scope, Flash, rest, $routeParams, $location,modelService) {
    Flash.clear();
    $scope.modelName = "File";
    $scope.type = "files";

    $scope.model = rest().findOne({
        id: $routeParams.id,
        type: $scope.type 
    });

    $scope.edit = function(model) {
        modelService.edit($scope,model);
    }
}

function FileCreateController($scope, rest, model, Flash,$location,Upload,$rootScope) {

    Flash.clear();
    $scope.modelName = "File";
    $scope.type = "files";

$scope.beforeChange=function($files){
    $scope.model.name=$files[0].name;

    var filestypes=$scope.model.filetypes.data;
    for (var i = 0; i < filestypes.length; i++) {
        if(filestypes[i].name==type){
            $scope.model.type=filestypes[i].id;
        }
    }
}
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
            console.log(evt.config._file.name);
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
  /*  $scope.model.organizations = rest().get({
        type: "organizations" ,params:"sort=name DESC"
    });*/
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