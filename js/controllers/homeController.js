var app = angular.module('odin.homeControllers', [])
          .controller('SidebarController', SidebarController);

app.factory('model', function($resource) {
    return $resource();
});


function controllerHome($scope,rest){
    $scope.modelName = "Log";
    $scope.type = "logs";
   $scope.logs = rest().get({
        type: $scope.type ,params:"orderBy=createdAt&sort=DESC"
    });

    $scope.usersCount = rest().count({
        type: "users"
    });
    $scope.filesCount = rest().count({
        type: "files"
    });
    $scope.datasetsCount = rest().count({
        type: "datasets"
    });
    $scope.organizationsCount = rest().count({
        type: "organizations"
    });

      $scope.setClassLog= function(value){
        if(value=="create"){
            return "bg-success";
        }else if(value=="update"){
            return "bg-warning";
        }else{
            return "bg-danger";
        }
    }
}

function SidebarController($scope) {
  $scope.show = {
    files: sessionStorage.getItem('showfiles') || false,
    charts: sessionStorage.getItem('showcharts') || false,
    maps: sessionStorage.getItem('showmaps') || false,
  };

  $scope.toogleCount = function(model) {
    $scope.show[model] = true;
    sessionStorage.setItem('show'+model, true);
  }

  $scope.removeToogle = function() {
    sessionStorage.removeItem('showfiles');
    sessionStorage.removeItem('showcharts');
    sessionStorage.removeItem('showmaps');
  }
}
