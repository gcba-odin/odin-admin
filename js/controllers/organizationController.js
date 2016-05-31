var app = angular.module('odin.organizationControllers', []);

app.factory('model', function($resource) {
    return $resource();
});



app.directive('wysihtml5', function() {
    return {
        // Restrict it to be an attribute in this case
        restrict: 'A',
        // responsible for registering DOM listeners as well as updating the DOM
        link: function($scope, element, $attrs) {
                       
 CKEDITOR.replace('textarea');

      /*  $scope.$parent.$watch( $attrs.content, function( newValue, oldValue ) {
                                
                                $scope.editor.innerHTML = newValue;
                                $scope.editor.composer.setValue( newValue );
                     });*/
                        
                  
        }
    };
});
function OrganizationListController($scope, $location, rest, $rootScope, Flash) {
Flash.clear();
$scope.modelName = "Organization";
$scope.type = "organizations"; 

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
    };
    $scope.activeClass = function(activeClass) {
            if(activeClass){
                return "label-success";
            }else{
                return "label-warning";
            }
    }; 
}

function OrganizationViewController($scope, Flash, rest, $routeParams, $location) {
Flash.clear();
$scope.modelName = "Organization";
$scope.type = "organizations"; 

    $scope.model = rest().findOne({
        id: $routeParams.id,
        type: $scope.type 
    });

    $scope.edit = function(model) {
        var url = '/'+$scope.type+'/' + model.id + "/edit";
        $location.path(url);
    }
}

function OrganizationCreateController($scope, rest, model, Flash,$location) {
Flash.clear();
$scope.modelName = "Organization";
$scope.type = "organizations"; 

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

     $scope.activeClass = function(activeClass,type) {
            if(activeClass && (type==1)){
                return "active";
            }else if(!activeClass && (type==2)){
                return "active";
            }
    };  
}

function OrganizationEditController($scope, Flash, rest, $routeParams, model,$location) {

$scope.editorOptions = {
    language: 'es',
};

Flash.clear();
$scope.modelName = "Organization";
$scope.type = "organizations";  

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

 $scope.activeClass = function(activeClass,type) {
            if(activeClass && (type==1)){
                return "active";
            }else if(!activeClass && (type==2)){
                return "active";
            }
    };  

    $scope.load();
}