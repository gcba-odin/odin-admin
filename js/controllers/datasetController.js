var app = angular.module('odin.DatasetControllers', ["ngSanitize"]);

app.factory('model', function($resource) {
    return $resource();
});



function DatasetListController($scope, $location, rest, $rootScope, Flash,Alertify) {

    Flash.clear();
    $scope.modelName = "Dataset";
    $scope.type = "datasets";

    var model = rest().get({
        type: $scope.type ,params:"sort=createdAt DESC"
    });

    $scope.data = model;
      $scope.confirmDelete=function (item){
        var item=item.target.dataset; 
                Alertify.confirm(item.textdelete).then(
            function onOk() {
                deleteModel({id:item.id})
            }, 
            function onCancel() { return false }
        );
    }

    var deleteModel = function(model) {
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
    $scope.modelName = "Dataset";
    $scope.type = "datasets";

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
    $scope.modelName = "Dataset";
    $scope.type = "datasets";

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
    $scope.modelName = "Dataset";
    $scope.type = "datasets";

    $scope.model = new model();
    $scope.tags=[]; 
    var tagstemporal=[];
$scope.tempData=[];
    $scope.update = function(isValid) {

        for ( obj in $scope.model){
            if(obj.indexOf("optional") != -1){
                delete $scope.model[obj]
            }
        }

        var optionsTemp=[];
   

          $scope.tempData= angular.copy($scope.model);

        for (var o = 0; o < 10; o++) {
            var verifify=verifyOptional($scope.model.items,o)
            if(verifify){
                optionsTemp.push({field:verifify.field});
            }else{
                optionsTemp.push({field:""});    
            }
        }

        $scope.tempData.items=optionsTemp;

        var cont=1;
        for (var i = 0; i < $scope.tempData.items.length; i++) {
            $scope.tempData["optional"+cont]="";
            $scope.tempData["optional"+cont]=$scope.tempData.items[i].field;
            cont++;
        }


        if (isValid) {
            rest().update({
                type: $scope.type,
                id: $scope.tempData.id
            }, $scope.tempData,function (resp){
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

                $scope.model.items=[];
                var counter=0;
                for ( obj in $scope.model){
                    if(obj.indexOf("optional") != -1){
                       if(!!$scope.model[obj]){

                            $scope.model.items.push({field:$scope.model[obj],index:counter});
                            counter++;
                       }
                    }
                } 
            }); 
        });
 }

     function verifyOptional(arrayOptions,index){
        var returnOption=false;
        for (var j = 0; j < arrayOptions.length; j++) {

            if(j== index){
                returnOption = arrayOptions[j];
                break;
            }
        }
        return returnOption;
     }

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
    $scope.load();
    

}