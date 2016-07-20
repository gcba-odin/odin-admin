var app=angular.module('odin.controllers', ["odin.homeControllers","odin.userControllers","odin.updateFrequencyControllers","odin.organizationControllers","odin.statusControllers","odin.filetypeControllers","odin.fileControllers","odin.tagControllers","odin.categoryControllers","odin.mapsControllers"]);

  app.controller("mainController", function($scope, AuthenticationService, $location,$rootScope,$translate) {

        $scope.language="español";

        this.changeLanguage=function (element){
                console.log(element);
            if($scope.language=="english"){
                $scope.language="español";
                $translate.use("es");

            }else{
                $scope.language="english";
                $translate.use("en");
            }
        }

        this.logout = function() {
            AuthenticationService.ClearCredentials();
            $location.url('/login');
        };

        $scope.$back = function() {
            window.history.back();
        };

         $scope.activeClass= function(actualClass,itemclass){
         if(actualClass==itemclass)
             {
                return "active";
             }
        }


    });


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

            if (!response.code) {
                AuthenticationService.SetCredentials(vm.username, vm.password,response.data.token,response.data.user);
                $location.path('/');
            } else {
                alert(response.message);
                vm.dataLoading = false;
            }
        });
    };
}
