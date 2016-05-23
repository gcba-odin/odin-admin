var app=angular.module('odin.controllers', ["odin.userControllers","odin.organizationControllers","odin.statusControllers","odin.filetypeControllers","odin.fileControllers","odin.categoryControllers"]);

  app.controller("mainController", function($scope, AuthenticationService, $location,$rootScope) {

        this.logout = function() {
            AuthenticationService.ClearCredentials();
            $location.url('/login');
        };

        $scope.$back = function() { 
            window.history.back();
        };

         $scope.activeClass= function(actualClass,itemclass){
            console.log(actualClass,itemclass);
         if(actualClass==itemclass)
             {
                return "active";
             }
        }
    }); 

function controllerHome($scope, $rootScope) {
    console.log($rootScope.globals)
}

function LoginController($location, AuthenticationService, $scope) {
    $scope.$emit('body:class:add', "login-page")

    $scope.login = login;

    (function initController() {
        // reset login status
        AuthenticationService.ClearCredentials();
    })();

    function login() {
        var vm = $scope.vm;

        vm.dataLoading = true;
        AuthenticationService.Login(vm.username, vm.password, function(response) {

            if (response.code=="OK") {
                AuthenticationService.SetCredentials(vm.username, vm.password,response.data.token);
                $location.path('/');
            } else {
                FlashService.Error(response.message);
                vm.dataLoading = false;
            }
        });
    };
}