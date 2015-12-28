angular.module('starter.services', ['underscore', 'mylib', 'lw', 'ngCordova'])

.factory('Chats', function ($http, $rootScope, $stateParams, $q) {

  var url = 'http://genpact.centralus.cloudapp.azure.com/eth/v1.0/transaction?'
  var myaddress = 'e1fd0d4a52b75a694de8b55528ad48e2e2cf7859'


  //var url = 'https://testapi.blockapps.net/eth/v1.0/log?'
  //var myaddress = '9d551f41fed6fc27b719777c224dfecce170004d'

  return {
    all: function () {
      console.log("all()")
      return $http.get(url+'address='+myaddress)
      //return $http.get(url, { params: { address: myaddress } })  //{ user_id: $rootScope.session } })
    },
    get: function (hash) {
      console.log("get("+hash+")")
      return $http.get(url+'hash='+hash)
       //return $http.get('https://friends.json/getOne', { params: { user_id: $rootScope.session, chat_id: $stateParams.idchat } })
     },

     face: function (hash){
      //return ('http://robohash.org/'+hash+'?set=set3&size=64x64')
      return ('http://www.gravatar.com/avatar/'+hash+'?d=retro&s=64') // monsterid

     },

     balance: function(account){
      console.log('balance()')
      return $http.get('http://genpact.centralus.cloudapp.azure.com/eth/v1.0/account?address='+myaddress)
     },

     getNestedData: function() {
      
      var promises = [];
      var deferredCombinedItems = $q.defer();
      var combinedItems = [];
      
      return $http.get('http://testapi.blockapps.net/eth/v1.0/log?address=e1fd0d4a52b75a694de8b55528ad48e2e2cf7859').success(function(res) {
        
        angular.forEach(res.data, function(list) {
          var deferredItemList = $q.defer();

          $http.get('http://testapi.blockapps.net/eth/v1.0/transaction?hash='+list.hash).then(function(res) {

            var returnedItems = res.data;
            combinedItems = combinedItems.concat(returnedItems);
            deferredItemList.resolve();
          });
          
          promises.push(deferredItemList.promise);
        });
        
        $q.all(promises).then( function() {
          deferredCombinedItems.resolve(combinedItems);
        });
        
         return deferredCombinedItems.promise;

      });
     }
  };
})


.factory('Accounts', function ($http, $rootScope, $stateParams, $q, $window, _, mylib, lw, $cordovaTouchID, $ionicPlatform, $cordovaKeychain) {

  return {

    newKey : function(){

      $ionicPlatform.ready(function() {
        var x = $cordovaTouchID.checkSupport()
        x.then(function(greeting) {
          console.log('Success: ' + greeting);
        }, function(reason) {
          console.log('Failed: ' + reason);
        }, function(update) {
          console.log('Got notification: ' + update);
        });
        console.log("testing touchid: " + x)
      });

      $ionicPlatform.ready(function() {
        $cordovaKeychain.setForKey("key", "service", "value").then(function(value) {
          console.log(value);
          $cordovaKeychain.getForKey("key", "service").then(function(value) {
            console.log(value);
          }, function (err) {
            console.error(err);
          });
        }, function (err) {
          console.error(err);
        })
      });


      var secretSeed = lightwallet.keystore.generateRandomSeed()
      console.log("new wallet: " + secretSeed)

    },

    test : function(){
      console.log("Accounts.test()")
      console.log("underscore: " + _)
      console.log("lw: " + JSON.stringify(lightwallet))
      console.log("lww: " + JSON.stringify($window.lightwallet))
      console.log("ba: " + JSON.stringify(blockapps))
      console.log("baw: "+ JSON.stringify($window['blockapps-js']))
      console.log("mylib: " + mylib)
      console.log("mylib.VERSION: " + mylib.VERSION)
      console.log(mylib)

      var ba2 = require('blockapps-js')
      console.log("ba2: " + JSON.stringify(ba2))

      var secretSeed = lightwallet.keystore.generateRandomSeed()

      console.log("ss: " + secretSeed)

    }
  }
})

var underscore = angular.module('underscore',[]);
underscore.factory('_', ['$window', function($window) {
  console.log("hello underscore factory: " + JSON.stringify($window._))
  return $window._; // assumes underscore has already been loaded on the page
}]);

var blockapps = angular.module('blockapps', [])
.factory('blockapps', ['$window', function($window) {
  console.log("hello blockapps factory: " + JSON.stringify($window.blockapps))
  return $window.blockapps; // assumes blockapps has already been loaded on the page
}]);

var mylib = angular.module('mylib', [])
.factory('mylib', ['$window', function($window) {
  console.log("hello mylib factory: " + JSON.stringify($window.mylib))
  return $window.mylib; // assumes blockapps has already been loaded on the page
}]);

var lw = angular.module('lw', [])
.factory('lw', ['$window', function($window) {
  console.log("hello lw factory: " + JSON.stringify($window.lightwallet))
  return $window.lightwallet; // assumes blockapps has already been loaded on the page
}]);
