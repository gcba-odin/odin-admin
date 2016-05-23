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
    app.directive("backButton", ["$window", function ($window) {
        return {
            restrict: "A",
            link: function (scope, elem, attrs) {
                elem.bind("click", function () {
                    $window.history.back();
                    scope.$apply();
                });
            }
        };
    }]);

app.directive('confirmClick', function ($window) {
  var i = 0;
  return {
    restrict: 'A',
    priority:  1,
    compile: function (tElem, tAttrs) {
      var fn = '$$confirmClick' + i++,
          _ngClick = tAttrs.ngClick;
      tAttrs.ngClick = fn + '($event)';

      return function (scope, elem, attrs) {
        var confirmMsg = attrs.confirmClick || 'Are you sure?';

        scope[fn] = function (event) {
          if($window.confirm(confirmMsg)) {
            scope.$eval(_ngClick, {$event: event});
          }
        };
      };
    }
  };
});



})();