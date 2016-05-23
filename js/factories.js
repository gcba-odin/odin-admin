(function() {
    var app = angular.module('store-factories', ["authentication-service","user-service"]);
   


    app.factory('flashService', function ($compile,Flash){
    	var msgs={};
    	var myEl =$(".navbar");
    	msgs.showError=function(text){
    		Flash.create('error', text, 0, {}, true)
    	}
    	msgs.showWarning=function(text){
    		Flash.create('warning', text, 0, { }, true)
    	}
    	msgs.showSuccess=function(text){
    		Flash.create('success', text, 0, { }, true)
    	}
    	msgs.showInfo=function(text){
    		Flash.create('info', text, 0, { }, true)
    	}
    	return msgs
    });

   


   


	app.factory('rest', ['$resource', '$location','$rootScope','ngProgressFactory','flashService','Flash', function($resource, $location,$rootScope,ngProgressFactory,flashService,Flash) {
        $rootScope.progressbar = ngProgressFactory.createInstance();
	   return function($url) {
	   	    $rootScope.progressbar.start();
	   	    var token=$rootScope.globals.currentUser.token;
	        $url = ($url == null) ? $rootScope.url+'/:type' : $url;
	        return $resource($url, {type: ''}, {
	            update: { method:'PUT' },
	            get : {
	            	url: $url+"?:params",
	                method: 'GET',
	                headers: { 'Authorization': 'JWT '+token},
	                transformResponse:function (data){
					 	$rootScope.progressbar.complete();
						return angular.fromJson(data);
	                },
	                interceptor: {responseError: handError}
	            },
	            findOne : {
	            	url: $url+"/:id",
	                method: 'GET',
	                headers: { 'Authorization': 'JWT '+token},
	                transformResponse:function (data){
	                	if(data){
						 	$rootScope.progressbar.complete();
						 	var json= JSON.parse(data)
							return angular.fromJson(json.data);
	                	}else{
	                		$rootScope.progressbar.complete();
	                	}
	                },
	                interceptor: {responseError: handError}
	            }, 
        		'save': {  
		              url: $url,
				      method: 'POST',
				      headers: { 'Authorization': 'JWT '+token },
				      interceptor: {responseError: handError},
				      transformResponse:function (data){
					      	if(data){
							 	flashService.showSuccess(JSON.parse(data).message);
								$rootScope.progressbar.complete();
								return angular.fromJson(data);
					      	}else{
					      		$rootScope.progressbar.complete();
					      	}
	                	}
				    }, 
        		'delete': {  
		              url: $url+"/:id",
				      method: 'DELETE',
				      headers: { 'Authorization': 'JWT '+token },
				      interceptor: {responseError: handError},
				      transformResponse:function (data){
					 	$rootScope.progressbar.complete();
						return angular.fromJson(data);
	                	}
				    }, 
        		'update': {  
		              url: $url+"/:id",
				      method: 'PATCH',
				      headers: { 'Authorization': 'JWT '+token },
				      interceptor: {responseError: handError},
				      transformResponse:function (data){
					 	$rootScope.progressbar.complete();
					 	flashService.showSuccess(JSON.parse(data).message);
						return angular.fromJson(data);
	                	}
				    }
	        });
	    }


		function handError(e){
		    params=JSON.stringify(e.data) || " "
		    if(!!e.data){
		    	if(e.data.code=="E_VALIDATION"){
		    		params=validationErrors(e.data);
		    	}
		    }
		    
			flashService.showError(" Route: <a target='_blank' href='"+e.config.url+"'>"+e.config.url+"</a> <br>"+params);
		}

		function validationErrors(data){
			var data=data.data;
			var returntext="";
			for (d in data){
					console.log(data[d]);

				for (r in data[d]){
					returntext="<b>SERVER VALIDATIONS: </b> <br><p>Rule: "+data[d][r].rule+" <br>Message:"+data[d][r].message+" </p>";
				}
			}

			return returntext
		}
	}]);
})();


///fdfasdf@dfdf.c