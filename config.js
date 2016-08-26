(function() {
    var app = angular.module('config-odin',[]);
    app.run(run);
    function run($rootScope, $location, $cookieStore, $http) {
        $rootScope.$on('$routeChangeSuccess', function (e, current, pre) {
            $rootScope.actualUrl=current.$$route.originalPath;
//            $rootScope.url='http://localhost:3000';
            $rootScope.url='http://40.76.56.16/api';

        });
    }
})();
