
var app=angular.module('odin.userControllers', []);



function UserListController($scope, $location, User,rest,$rootScope) {
      var usersModel=  rest().get({type: 'users'}); 
      $scope.data=usersModel;
        $scope.deleteUser = function(user) { // Delete a User. Issues a DELETE to /api/Users/:id
            rest().delete({type: 'users',id:user.id},function (resp){
                $scope.data=rest().get({type: 'users'},function (){
                }); 

            }); 
        };
    }
 
function UserViewController($scope, User) {
        $scope.User = User.get({
            id: $stateParams.id
        }); //Get a single User.Issues a GET to /api/Users/:id
    }

function UserCreateController($scope, User,rest) {

        $scope.user = new User();
        $scope.addUser = function() { 
            rest().save({type: 'users'}, $scope.user);
        };
    }
function UserEditController($scope, User) {
        $scope.updateUser = function() {
            $scope.user.$update(function() {
                $state.go('Users'); 
            });
        };

        $scope.loadUser = function() {
            $scope.User = User.get({
                id: $stateParams.id
            });
        };

        $scope.loadUser();
    }