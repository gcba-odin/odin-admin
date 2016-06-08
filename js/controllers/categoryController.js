var app = angular.module('odin.categoryControllers', []);

app.factory('model', function($resource) {
    return $resource();
});

 
function CategoryListController($scope, $location, rest, $rootScope, Flash,Alertify) {

    Flash.clear();
    $scope.modelName = "Category";
    $scope.type = "categories";

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
   $scope.activeClass = function(activeClass) {
            if(activeClass){
                return "label-success";
            }else{
                return "label-warning";
            }
    };  

}

function CategoryViewController($scope, Flash, rest, $routeParams, $location,$sce) {
    Flash.clear();
    $scope.modelName = "Category";
    $scope.type = "categories"
    $scope.model = rest().findOne({
        id: $routeParams.id,
        type: $scope.type 
    });

    $scope.edit = function(model) {
        var url = '/'+$scope.type+'/' + model.id + "/edit";
        $location.path(url);
    }
    $scope.getHtml = function(html){
        return $sce.trustAsHtml(html);
    };

}

function CategoryCreateController($scope, rest, model, Flash,$location,$rootScope,Alertify) {
    Flash.clear();
    $scope.modelName = "Category";
    $scope.type = "categories"
    $scope.model = new model();
    $scope.add = function(isValid) {
        if (isValid) {
            $scope.model.createdBy=$rootScope.globals.currentUser.user
            rest().save({
                type: $scope.type
            }, $scope.model,function (resp){
                Alertify.success('Se ha creado la categoría con éxito');
                var url = '/'+$scope.type;
                $location.path(url);
            });
        }
    };
    $scope.activeClass = function(activeClass,type) {
            if(activeClass && (type==1)){
                $scope.active="true";
                return "active";
            }else if(!activeClass && (type==2)){
                                $scope.active="false";

                return "active";
            }
    };   
    $scope.onReady = function () {

    };
}

function valorCheckbox(valor){
    console.log(valor);
}

function CategoryEditController($scope, Flash, rest, $routeParams, model,$location,Alertify) {
    Flash.clear();
    $scope.modelName = "Category";
    $scope.type = "categories"
    $scope.model = new model();
    $scope.update = function(isValid) {



    if (isValid) {
            rest().update({
                type: $scope.type,
                id: $scope.model.id
            }, $scope.model,function (){
                if($scope.model.active){
                    Alertify.success('Se ha editado y ACTIVADO la categoría con éxito');
                }else{
                    Alertify.success('Se ha editado y DESACTIVADO la categoría con éxito');
                }

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


    $scope.activeClass = function(activeClass,type) {
            if(activeClass && (type==1)){
                return "active";
            }else if(!activeClass && (type==2)){
                return "active";
            }
    };  

  
    $scope.onReady = function () {
        $scope.load();  
    };

}