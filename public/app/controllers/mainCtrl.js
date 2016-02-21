angular.module('mainCtrl', [])

.controller('mainController', function($rootScope, $location, Auth){
  var vm = this;

  //get info if user is logged login
  vm.loggedIn = Auth.isLoggedIn();

  //check is user is logged in on every request
  $rootScope.$on('$routeChangeStart', function(){
    vm.loggedIn = Auth.isLoggedIn();
    Auth.getUser()
    .then(function(data){
      vm.user = data.data;
    });
  });

  //register new user
  vm.doRegister = function(){
    vm.processing = true;
    vm.error = '';
    Auth.register(vm.registerData.name, vm.registerData.username, vm.registerData.password)
    .success(function(data){
      vm.processing = false;
      if (data.success) {
        $location.path('/login');
      }
      else {
        vm.error = data.message;
      }
    });
  };

  //function to handle login form
  vm.doLogin = function(){
    vm.processing = true;
    vm.error = '';
    Auth.login(vm.loginData.username, vm.loginData.password)
    .success(function(data){
      vm.processing = false;
      if (data.success) {
        $location.path('/users');
      }
      else {
        vm.error = data.message;
      }
    });
  };

  //function to handle logout
  vm.doLogout = function(){
    Auth.logout();
    vm.user = ' ';
    $location.path('/');
  };

});
