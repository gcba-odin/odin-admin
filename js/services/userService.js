(function() {
    var app = angular.module('user-service', []);
   
app.factory('UserService', UserService);
 
    UserService.$inject = ['$http'];
    function UserService($http) {
        var service = {};
 
        
        return service;
 
 }



})();