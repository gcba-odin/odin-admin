var app = angular.module('odin.controllers', ["odin.homeControllers", "odin.userControllers", "odin.updateFrequencyControllers", "odin.organizationControllers", "odin.statusControllers", "odin.filetypeControllers", "odin.fileControllers", "odin.tagControllers", "odin.categoryControllers", "odin.mapsControllers", "odin.chartsControllers", "odin.configsControllers", "odin.basemapsControllers", "odin.importerControllers"]);

app.controller("mainController", function($scope, AuthenticationService, $location, $rootScope, $translate) {

    $scope.language = "español";

    this.changeLanguage = function(element) {
        if ($scope.language == "english") {
            $scope.language = "español";
            $translate.use("es");

        } else {
            $scope.language = "english";
            $translate.use("en");
        }
    };

    this.logout = function() {
        AuthenticationService.ClearCredentials();
        $location.url('/login');
    };

    $scope.$back = function() {
        window.history.back();
    };

    $scope.activeClass = function(actualClass, itemclass) {
        if (actualClass == itemclass)
        {
            return "active";
        }
    };
});


function LoginController($location, AuthenticationService, $scope, vcRecaptchaService, Alertify) {
    $scope.$emit('body:class:add', "login-page")

    $scope.login = login;
    
    recaptchaId = null;
    
    $scope.setRecaptchaId = function(widgetId) {
        recaptchaId = widgetId;
    };

    (function initController() {
        // reset login status
        AuthenticationService.ClearCredentials();
    })();

    function login() {
        var vm = $scope.vm;

        if (!vcRecaptchaService.getResponse(recaptchaId)) {
            vm.od_captcha = null;
            vcRecaptchaService.reload(recaptchaId);
            Alertify.alert('Por favor, completa el captcha.');
        } else {
            
            var data = {
                username: vm.username,
                password: vm.password,
                recaptcha: vcRecaptchaService.getResponse(recaptchaId)
            };
            
            vm.dataLoading = true;
            AuthenticationService.Login(data, function(response) {
                if (!response.code) {
                    AuthenticationService.SetCredentials(vm.username, vm.password, response.data.token, response.data.user, response.data.role);
                    $location.path('/');
                } else {
                    vcRecaptchaService.reload(recaptchaId);
                    Alertify.alert(response.message);
                    vm.password = '';
                    vm.dataLoading = false;
                }
            });
        }
    }
    ;
}
