var app = angular.module('odin.fileControllers', ['ngFileUpload']);

app.factory('model', function($resource) {
    return $resource();
});


function FileListController($scope, $location, rest, $rootScope, Flash, Alertify, $routeParams, modelService) {


    modelService.initService("File", "files", $scope);

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
        modelInput: 'owner',
        multiple: false
    }];
    $scope.confirmDelete = function(item) {
        modelService.confirmDelete(item);
    }

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

function FileViewController($scope, Flash, rest, $routeParams, $location, modelService) {
    modelService.initService("File", "files", $scope);


    modelService.findOne($routeParams, $scope);


    $scope.edit = function(model) {
        modelService.edit($scope, model);
    }
}

function FileCreateController($scope, $sce, rest, model, Flash, $location, Upload, $rootScope, modelService) {
    modelService.initService("File", "files", $scope);



    $scope.readURL = function(input) {

        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function(e) {
                console.log(e);
                // $('#blah').attr('src', e.target.result);
            }

            //  reader.readAsDataURL(input.files[0]);
        }
    }

    $scope.clearUpload = function() {
        $scope.fileModel.name = "";
        $scope.fileModel.type = "";
    }

    $scope.beforeChange = function($files) {
        $scope.fileModel.name = $files[0].name;
        var type = $files[0].name.split('.').pop();
        if (type == "doc" || type == "docx") {
            $scope.fileModel.type = 'fa-file-word-o';
        } else if (type == "xlsx" || type == "xls") {
            $scope.fileModel.type = 'fa-file-excel-o';
        } else if (type == "pdf") {
            $scope.fileModel.type = 'fa-file-pdf-o';
        } else if (type == "rar" || type == "zip") {
            $scope.fileModel.type = 'fa-file-archive-o';
        } else {
            $scope.fileModel.type = 'fa-file-text-o';
        }
    }
    $scope.model = new model();
    $scope.steps = [];
    $scope.steps[0] = "active";
    $scope.steps[1] = "undone";
    $scope.steps[2] = "undone";
    $scope.stepactive = 0;

    $scope.fileModel = []
    $scope.checkstep = function(step) {
        if (($scope.fileModel.name && step == 1) || ($scope.fileModel.name && step == 2) || step == 0) {

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
            console.log(step);
            $scope.stepactive = step;
        }
    }
    $scope.step = function(step) {
        if (($scope.fileModel.name && step == 1) || ($scope.fileModel.name && step == 2) || step == 0) {
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
    $scope.getHtml = function(html) {
        return $sce.trustAsHtml(html);
    };

    $scope.addTag= function (name){
        $rootScope.model.filetypes = rest().save({
            type: "filetypes"
        },{name:name},function (){
            console.log("tag agregado");
        });
    }

    $scope.add = function(isValid) {
        $scope.uploadImageProgress = 10;
        var data = {
            'name': $scope.model.name,
            'type': $scope.model.type,
            'status': $scope.model.status,
            'organization': $scope.model.organization,
            'dataset': $scope.model.dataset,
            'description': $scope.model.description,
            'notes': $scope.model.notes,
            'url': $scope.model.url,
            'visibility': $scope.model.visibility,
            ///'fileType':$scope.fileModel.type,
            'uploadFile': $scope.model.uploadFile
        }

        Upload.upload({
            url: $rootScope.url + "/files",
            data: data
        }).then(function(resp) {
            var url = '/' + $scope.type;
            $location.path(url);
        }, function(resp) {
            alert(resp.status);
        }, function(evt) {
            var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            $scope.uploadImageProgress=progressPercentage;
        });
    };


    /*$scope.model.filetypes = rest().get({
        type: "filetypes" ,params:"sort=name DESC"
    });
    $scope.model.statuses = rest().get({
        type: "statuses" ,params:"sort=name DESC"
    });
  /*  $scope.model.organizations = rest().get({
        type: "organizations" ,params:"sort=name DESC"
    });
    $scope.model.frequencies = rest().get({
        type: "updatefrequencies" ,params:"sort=name DESC"
    });
    $scope.tagsmodel = rest().get({
        type: "tags" ,params:"sort=name DESC"
    });*/

}

function FileEditController($scope, Flash, rest, $routeParams, model, $location, modelService) {
    modelService.initService("File", "files", $scope);


    $scope.model = new model();
    $scope.update = function(isValid) {
        if (isValid) {
            rest().update({
                type: $scope.type,
                id: $scope.model.id
            }, $scope.model, function(resp) {
                var url = '/' + $scope.type;
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
