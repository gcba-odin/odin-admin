(function() {
    var app = angular.module('odin', ["ngRoute", "ngCookies","ngResource","ngProgress","odin.controllers","store-directives", "store-factories"]);

    app.config(function($routeProvider,$httpProvider) {

        $routeProvider
            .when("/", {
                templateUrl: "home.html",
                controller: controllerHome
            })
            .when("/login", {
                templateUrl: "login.html",
                controller: LoginController
            })
            .when("/prueba", {
                templateUrl: "prueba.html"
            }).when("/users", {
                templateUrl: "views/user/users.html",
                controller:UserListController
            }).when("/users/:id/view", {
                templateUrl: "views/user/user-view.html",
                controller:UserViewController
            }).when("/users/new", {
                templateUrl: "views/user/user-add.html",
                controller:UserCreateController
            }).when("/users/edit", {
                templateUrl: "views/user/user-edit.html",
                controller:UserEditController
            }).otherwise({
                redirectTo: '/'
            });
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    });
    app.run(run);

    function run($rootScope, $location, $cookieStore, $http) {
        // keep user logged in after page refresh
        $rootScope.url='http://137.135.84.77';
        $rootScope.globals = $cookieStore.get('globals') || {};
        if ($rootScope.globals.currentUser) {
            $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
        }

        $rootScope.$on('$locationChangeStart', function(event, next, current) {
            // redirect to login page if not logged in and trying to access a restricted page
            var restrictedPage = $.inArray($location.path(), ['/login', '/register']) === -1;
            var loggedIn = $rootScope.globals.currentUser;
            if (restrictedPage && !loggedIn) {
                $location.path('/login');
            }
        });
    }
})();