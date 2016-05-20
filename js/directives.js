(function() {
    var app = angular.module('store-directives', ["store-directives-home"]);

    app.filter('urlEncode', [function() {
        return window.encodeURIComponent;
    }]);
    app.filter('capitalize', function() {
        return function(input) {
          return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
        }
    });


    app.filter('truncString', function() {
        return function(input) {
         var  add =  '...';
         var  max=26;
         var str=input;
           return (typeof str === 'string' && str.length > max ? str.substring(0,max)+add : str);
        }
    });
    app.directive('body', [function(){
      return {
        restrict: 'E',
        link: function(scope, element, attrs) {
          scope.$on('body:class:add', function(e, name){
            element.addClass(name);
          });
          scope.$on('body:class:remove', function(e, name){
            element.removeClass(name);
          });
          return;
        }
      };
    }]);

})();