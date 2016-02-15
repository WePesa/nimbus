angular.module('starter.controllers', ['underscore', 'lw', 'blockapps'])

.controller('DashCtrl', function($scope, Accounts ) {

  Accounts.getPersona($scope.ipfsHashHex).then(function(a){

      $scope.$apply(function(){
        $scope.apersona = a;
        console.log("New persona: " + $scope.apersona.name);

        var ipfsWeb = "104.131.53.68";
        var ipfsWebPort = "8080";

        $scope.imageSrc = "http://"+ipfsWeb+":"+ipfsWebPort+"/" + $scope.apersona.image.contentUrl;
        //$scope.imageSrc = "http://104.131.53.68:8080/ipfs/QmUSBKeGYPmeHmLDAEHknAm5mFEvPhy2ekJc6sJwtrQ6nk";

      })
    });

})

.controller('TransactionsCtrl', function($scope, Transactions, _, blockapps, Accounts) {
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

  Transactions.balance(Accounts.getCurrentAddress()).success(function(response){
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
  console.log("hello TransactionsDetailCtrl()")
  Transactions.get($stateParams.txId).success(function(response){
    $scope.transaction = response;
    $scope.face = Transactions.face(response[0].hash)
  })

})

.controller('AccountDetailCtrl', function($scope, $stateParams, Transactions, Accounts) {
  console.log("hello AccountDetailCtrl()")
  Accounts.getAccount($stateParams.accId).then(function(v){
    console.log("FOUND ACCOUNT!: " + JSON.stringify(v));

      $scope.$apply(function(){
        $scope.editAccount = v;
      })
    
  });

})

.controller('AccountCtrl', function($scope, $location, Accounts, _) {
  console.log("Hello AccountCtrl")

  Accounts.getAllAccounts().then(function(v){

      $scope.$apply(function(){
        $scope.allUsers = v;
      })

  });

  $scope.toEdit = function(address) {
    console.log("AccountCtrl.toEdit("+address+")")
    $location.path("/tab/account/"+address); // path not hash
  };

  // ethereum address <-> ipfsHash -> json schema

  // generateNewAccount()
  // 


  // Accounts.newKey()
  // Accounts.test()

  $scope.setPersona = function(){
    console.log("AccountCtrl.setPersona()")
    Accounts.setPersona().then(function(a){
      $scope.$apply(function(){
        $scope.ipfsHashHex = a;
        console.log("new ipfsHashHex: " + a)
      })
    })
  },
  

  $scope.signTx = function(){
    console.log("signTx()")
    Accounts.signTx("0x666666");
  },

  $scope.getPersona = function(){
    console.log("AccountCtrl.getPersona()")
    Accounts.getPersona($scope.ipfsHashHex).then(function(a){

      $scope.$apply(function(){
        $scope.apersona = a;
        console.log("New persona: " + $scope.apersona.name);

        var ipfsWeb = "104.131.53.68";
        var ipfsWebPort = "8080";

        $scope.imageSrc = "http://"+ipfsWeb+":"+ipfsWebPort+"/" + $scope.apersona.image.contentUrl;
        //$scope.imageSrc = "http://104.131.53.68:8080/ipfs/QmUSBKeGYPmeHmLDAEHknAm5mFEvPhy2ekJc6sJwtrQ6nk";

      })
    })
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
