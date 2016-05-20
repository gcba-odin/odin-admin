(function() {
    var app = angular.module('store-factories', ["authentication-service","user-service"]);
   
	app.factory('rest', ['$resource', '$location','$rootScope','ngProgressFactory', function($resource, $location,$rootScope,ngProgressFactory) {
        $rootScope.progressbar = ngProgressFactory.createInstance();
	   return function($url) {
	   	    $rootScope.progressbar.start();
	        $url = ($url == null) ? $rootScope.url+'/:type' : $url;
	        return $resource($url, {type: ''}, {
	            update: { method:'PUT' },
	            get : {
	            	url: $url,
	                method: 'GET',
	                headers: { 'Authorization': 'JWT '+$rootScope.globals.token,'Content-Type':'application/json; charset=utf-8'},
	                transformResponse:function (data){
					 	$rootScope.progressbar.complete();
						return angular.fromJson(data);;
	                }
	            }, 
        		'save': {  
		              url: $url,
				      method: 'POST',
				      headers: { 'Authorization': 'JWT '+$rootScope.globals.token },
				      interceptor: {
				        responseError: function(e) {
				          console.warn('Problem making request to backend: ', e)
				        }
				      },
				      transformResponse:function (data){
					 	$rootScope.progressbar.complete();
						return angular.fromJson(data);;
	                }
				    }, 
        		'delete': {  
		              url: $url+"/:id",
				      method: 'DELETE',
				      headers: { 'Authorization': 'JWT '+$rootScope.globals.token },
				      interceptor: {
				        responseError: function(e) {
				          console.warn('Problem making request to backend: ', e)
				        }
				      },
				      transformResponse:function (data){
					 	$rootScope.progressbar.complete();
						return angular.fromJson(data);;
	                }
				    }
	        });
	    }


	}]);
})();