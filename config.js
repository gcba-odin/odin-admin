(function() {
    var app = angular.module('config-odin',[]);
    app.run(run);
    function run($rootScope, $location, $cookieStore, $http) {
        $rootScope.$on('$routeChangeSuccess', function (e, current, pre) {
            $rootScope.actualUrl=current.$$route.originalPath;
//            $rootScope.url='http://104.208.247.131/api';
            $rootScope.url='http://localhost:3000';

        });
    }
})();
