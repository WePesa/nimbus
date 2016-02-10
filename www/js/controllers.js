angular.module('starter.controllers', ['underscore', 'lw', 'blockapps'])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats, _, blockapps) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  Chats.all().success(function(response){
    console.log("hello chat.all()") 

    $scope.c2fmap2 = _.object(response, response.map(function(x){return Chats.face(x.hash)}))
    $scope.chats = response;
    $scope.faces = response.map(function(x){return Chats.face(x.hash)})

    $scope.c2fmap = response.map(function(value, index) {
      return {
          data: value,
          value: $scope.faces[index]
      }
    });

  })

  Chats.balance('bla').success(function(response){
    console.log('balance response: ' + JSON.stringify(response))
      $scope.balance = blockapps.ethbase.Units.convertEth(response[0].balance).from("wei").to("ether").toPrecision(10)
      console.log("ETH: " + $scope.balance)
  })

   // Chats.getNestedData().success(function(result) {
   //    $scope.combinedItems = result;
   //    console.log(JSON.stringify(result))
   // });


})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  console.log("hello chat.get()")
  Chats.get($stateParams.chatId).success(function(response){
    $scope.chat = response;
    
    $scope.face = Chats.face(response[0].hash)
  })

})

.controller('AccountCtrl', function($scope, Accounts, _) {
  $scope.settings = {
    enableFriends: true
  };

  console.log("hello AccountCtrl")
  Accounts.newKey()
  Accounts.test()
})

.controller('SettingsCtrl', function($scope, Accounts, _, $cordovaBarcodeScanner) {

  $scope.settings = {
    camera2: JSON.stringify($cordovaBarcodeScanner.scan),
    camera: (JSON.stringify($cordovaBarcodeScanner) !== "{}")
  };

  if (typeof $cordovaBarcodeScanner === 'undefined') {
   console.log("camera undefined")
  }

  console.log("hello SettingsCtrl")
  console.log("$cordovaBarcodeScanner: " + JSON.stringify($cordovaBarcodeScanner))

})

.controller('CameraCtrl', function($scope, Accounts, _, $cordovaBarcodeScanner, Camera) {
  $scope.settings = {
    enableFriends: true
  };

  console.log("hello CameraCtrl")
  Camera.test()
  Camera.shoot()

});
