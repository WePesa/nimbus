angular.module('starter.controllers', ['underscore', 'lw', 'blockapps'])

.controller('DashCtrl', function($scope) {


})

.controller('TransactionsCtrl', function($scope, Transactions, _, blockapps) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  Transactions.all().success(function(response){
    console.log("hello Transactios.all()") 

    $scope.c2fmap2 = _.object(response, response.map(function(x){return Transactions.face(x.hash)}))
    $scope.transactions = response;
    $scope.faces = response.map(function(x){return Transactions.face(x.hash)})

    $scope.c2fmap = response.map(function(value, index) {
      return {
          data: value,
          value: $scope.faces[index]
      }
    });

  })

  Transactions.balance('bla').success(function(response){
    console.log('balance response: ' + JSON.stringify(response))
      $scope.balance = blockapps.ethbase.Units.convertEth(response[0].balance).from("wei").to("ether").toPrecision(10)
      console.log("ETH: " + $scope.balance)
  })

   // Chats.getNestedData().success(function(result) {
   //    $scope.combinedItems = result;
   //    console.log(JSON.stringify(result))
   // });


})

.controller('TransactionsDetailCtrl', function($scope, $stateParams, Transactions) {
  console.log("hello transactiondetail.get()")
  Transactions.get($stateParams.txId).success(function(response){
    $scope.transaction = response;
    $scope.face = Transactions.face(response[0].hash)
  })

})

.controller('AccountCtrl', function($scope, Accounts, _) {

  $scope.theperson = "noone";

  $scope.settings = {
    enableFriends: true
  };

  console.log("hello AccountCtrl")

  Accounts.newKey()
  Accounts.test()

  Accounts.newtest().then(function(a){console.log("ADFASFSDF!!!");$scope.apersona = JSON.stringify(a)})

  $scope.signTx = function(){
    console.log("signTx()")
    Accounts.signTx("0x666666");
  },

  $scope.getPersona = function(){
    Accounts.getPersona().then(function(x){ console.log("XXXX: " + JSON.stringify(x)); $scope.theperson = x.value});
    console.log("getPersona() returned")
  }

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

.controller('CameraCtrl', function($scope, _, $cordovaBarcodeScanner, Camera) {
  $scope.settings = {
    enableFriends: true
  };

  $scope.address = "default"

  // $scope.$on('$ionicView.enter', function(e) {
  //     $scope.address = Camera.shoot();
  // });

  console.log("hello CameraCtrl")
  Camera.test();

  // EVERYTHING ASYNC

  $scope.shoot = function(){

    Camera.shoot().then(function(result){
      $scope.address = result;
      console.log("wtf: "+$scope.address)
      alert("wtf: " + $scope.address)
    })


  }

});
