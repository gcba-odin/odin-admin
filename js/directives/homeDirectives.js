(function() {
    var app = angular.module('store-directives-home', []);

    app.directive("sidebarHome", function() {
        return {
            restrict: "E",
            templateUrl: "directives/home/sidebar-home.html",
            controller: function($scope, $rootScope) {
                $rootScope.isActive = function(viewLocation) {
                    return  viewLocation === $rootScope.actualUrl;
                };
                $rootScope.isActiveEdit = function(viewLocation) {
                    return  "/" + viewLocation + "/:id/edit" === $rootScope.actualUrl;
                };
            },
            controllerAs: "sidebarHome"
        };
    });

    app.directive("breadcrumbs", function() {
        return {
            restrict: "E",
            templateUrl: "directives/breadcrumbs.html",
            controller: function($scope) {
            }, link: function(scope, element, attrs) {
                scope.modelUrl = attrs.model;
                scope.typeModel = attrs.type;
                scope.modelName = attrs.modelName;

            },
            controllerAs: "breadcrumbs"
        };
    });

    app.directive("headerHome", function() {
        return {
            restrict: "E",
            templateUrl: "directives/home/header-home.html",
            controller: function($scope) {

            },
            controllerAs: "headerHome"
        };
    });
    app.directive("controlHome", function() {
        return {
            restrict: "E",
            templateUrl: "directives/home/control-home.html",
            controller: function($scope) {

            },
            controllerAs: "controlHome"
        };
    });
    app.directive("footerHome", function() {
        return {
            restrict: "E",
            templateUrl: "directives/home/footer-home.html",
            controller: function($scope) {

            },
            controllerAs: "footerHome"
        };
    });
    app.directive("countUnderreview", function(rest) {
        return {
            restrict: "A",
            controller: function($scope, configs) {
                //factory statuses
                configs.statuses($scope);
                
            },
            link: function(scope, element, attrs) {
                var data = rest().get({
                    type: attrs.countUnderreview,
                    params: 'status=' + scope.statuses.underReview
                }, function(resp){
                    var cant = 0;
                    if(!!resp.data) 
                        cant = resp.data.length;
                    element[0].innerHTML = '(' + cant + ')';
                });
            },
            controllerAs: "countUnderreview"
        };
    });

})();
