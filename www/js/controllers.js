angular.module('starter.controllers', ['underscore', 'lw'])

.controller('DashCtrl', function($scope) {})

.controller('ChatsCtrl', function($scope, Chats, _) {
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
      $scope.balance = response[0].balance;
      console.log("balace is "+$scope.balance)
  })

   Chats.getNestedData().success(function(result) {
      $scope.combinedItems = result;
      console.log(JSON.stringify(result))
   });


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

});
