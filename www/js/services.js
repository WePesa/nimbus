angular.module('starter.services', ['underscore', 'lw', 'ngCordova', 'blockapps'])

.factory('Camera', function ($http, $rootScope, $stateParams, $q, $cordovaBarcodeScanner) {

  return {

    test: function(){
      console.log("testing camera")
    },

    shoot: function(){

        $cordovaBarcodeScanner.scan().then(function(imageData) {
            alert(imageData.text);
            console.log("Barcode Format -> " + imageData.format);
            console.log("Cancelled -> " + imageData.cancelled);
        }, function(error) {
            console.log("An error happened -> " + error);
        });
    }

  }

})

.factory('Chats', function ($http, $rootScope, $stateParams, $q) {

  var baseUri = 'http://genpact.centralus.cloudapp.azure.com/eth/v1.0'

  var myaddress = 'e1fd0d4a52b75a694de8b55528ad48e2e2cf7859'

  //var myaddress = '9d551f41fed6fc27b719777c224dfecce170004d'

  return {
    all: function () {
      return $http.get(baseUri+'/transaction?address='+myaddress)
      //return $http.get(url, { params: { address: myaddress } })  //{ user_id: $rootScope.session } })
    },
    get: function (hash) {
      return $http.get(baseUri+'/transaction?hash='+hash)
       //return $http.get('https://friends.json/getOne', { params: { user_id: $rootScope.session, chat_id: $stateParams.idchat } })
     },

     face: function (hash){
      //return ('http://robohash.org/'+hash+'?set=set3&size=64x64')
      return ('http://www.gravatar.com/avatar/'+hash+'?d=retro&s=64') // monsterid

     },

     balance: function(account){
      return $http.get(baseUri + '/account?address='+myaddress)
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


.factory('Accounts', function ($http, $rootScope, $stateParams, $q, $window, _, lw, $cordovaTouchID, $ionicPlatform, $cordovaKeychain, blockapps) {

  return {

    newKey : function(){

      $ionicPlatform.ready(function() {

       // if(ionic.Platform.isIOS()){

          var x = $cordovaTouchID.checkSupport()
          x.then(function(greeting) {
            console.log('Success: ' + greeting);
          }, function(reason) {
            console.log('Failed: ' + reason);
          }, function(update) {
            console.log('Got notification: ' + update);
          });
          console.log("testing touchid: " + x)

          console.log(JSON.stringify(ionic.Platform))

          $cordovaKeychain.setForKey("key", "service", "super secret!").then(function(value) {
            console.log(value);
            $cordovaKeychain.getForKey("key", "service").then(function(value) {
              console.log(value);
            }, function (err) {
              console.error(err);
            });
          }, function (err) {
            console.error(err);
          })
      //  } else {
      //    console.log("not on IOS")
      //  }

      });


      var secretSeed = lightwallet.keystore.generateRandomSeed()
      console.log("new wallet: " + secretSeed)

    },

    test : function(){
      console.log("Accounts.test()")
      console.log("underscore: " + _)
      console.log("lw: " + JSON.stringify(lightwallet))
      console.log("ba: " + JSON.stringify(blockapps))

      var secretSeed = lightwallet.keystore.generateRandomSeed()

      console.log("ss: " + secretSeed)

    }
  }
})

var underscore = angular.module('underscore',[]);
underscore.factory('_', ['$window', function($window) {
  return $window._; // assumes underscore has already been loaded on the page
}]);

var blockapps = angular.module('blockapps', [])
.factory('blockapps', ['$window', function($window) {

  return require('blockapps-js')
  //return $window.blockapps; // assumes blockapps has already been loaded on the page
}]);

var lw = angular.module('lw', [])
.factory('lw', ['$window', function($window) {
  return $window.lightwallet; // assumes lw has already been loaded on the page
}]);
