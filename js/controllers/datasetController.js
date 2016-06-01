var app = angular.module('odin.DatasetControllers', ["ngSanitize"]);

app.factory('model', function($resource) {
    return $resource();
});



     var modelName = "Dataset";
    var type = "datasets";
function DatasetListController($scope, $location, rest, $rootScope, Flash) {

    Flash.clear();
    $scope.modelName = modelName;
    $scope.type = type;

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

function DatasetViewController($scope, Flash, rest, $routeParams, $location,$sce) {

    Flash.clear();
    $scope.modelName = modelName;
    $scope.type = type;

    $scope.model = rest().findOne({
        id: $routeParams.id,
        type: $scope.type,
        params:"include=tags"
    },function (){
        var tags=[];
        for (var i = 0; i < $scope.model.tags.length; i++) {
            tags.push('<span class="label label-primary">'+$scope.model.tags[i].name+'</span>')
        }
        $scope.model.tags=tags.join(" - ");
    });

    $scope.edit = function(model) {
        var url = '/'+$scope.type+'/' + model.id + "/edit";
        $location.path(url);
    }
    $scope.getHtml = function(html){
        return $sce.trustAsHtml(html);
    };

    app.filter('html', function($sce) {
        return function(val) {
            return $sce.trustAsHtml(val);
        };
    });
}

function DatasetCreateController($scope, rest, model, Flash,$location) {

    $scope.tagsmodel = rest().get({
        type: "tags" ,params:"sort=name DESC"
    });
    Flash.clear();
    $scope.modelName = modelName;
    $scope.type = type;

    $scope.model = new model();
    $scope.model.items=[];
    $scope.add = function(isValid) {
        for ( obj in $scope.model){
            if(obj.indexOf("optional") != -1){
                delete $scope.model[obj]
            }
        }

        var cont=1;
        for (var i = 0; i < $scope.model.items.length; i++) {
            $scope.model["optional"+cont]="";
            $scope.model["optional"+cont]=$scope.model.items[i].field;
            cont++;
        }

            $scope.model.tags=$scope.model.tags.split(",");

        if (isValid) {
            rest().save({
                type: $scope.type
            }, $scope.model,function (resp){
                var url = '/'+$scope.type;
                $location.path(url);
            });
        }  
    };

    $scope.inputs = [];
    var i=0;
    $scope.addInput=function (){
        if($scope.model.items.length <10){
            var newItemNo = $scope.model.items.length+1;
            $scope.model.items.push({field:""})
        }

    }
    $scope.deleteIndexInput=function (index,field){
        $scope.model.items.splice(index, 1);
    }

    $scope.increment= function(a){
            return a+1;
        }

    $scope.itemName= function(a){
            return "optional"+(parseInt(a)+1);
        }
    

}

function DatasetEditController($scope, Flash, rest, $routeParams, model,$location) {

    Flash.clear();
    $scope.modelName = modelName;
    $scope.type = type;

    $scope.model = new model();
    $scope.tags=[]; 
    var tagstemporal=[];
    $scope.update = function(isValid) {
        $scope.model.tagsmodel=$scope.model.tags.split(",");

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
        $scope.tagsmodel = rest().get({
            type: "tags" ,params:"sort=name DESC"
        },function (){
            $scope.model = rest().findOne({
                id: $routeParams.id,
                type: $scope.type,
                params:"include=tags"
            },function (){
                var tags=[];
                for (var i = 0; i < $scope.model.tags.length; i++) {
                    tags.push($scope.model.tags[i].id)
                }
                $scope.tags=tags;

            }); 
        });
 }
    $scope.load();
    

}