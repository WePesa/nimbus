angular.module('starter.controllers', ['underscore', 'config', 'blockapps'])

.controller('DashCtrl', function($scope, Accounts, config, Transactions, blockapps) {

  $scope.$on('$ionicView.enter', function(e) {

    console.log("DashCtrl()")

    Accounts.getPersona(Accounts.getCurrentAddress()).then(function(a){

        $scope.$apply(function(){
          $scope.apersona = a;
          console.log("New persona: " + $scope.apersona.name);

          $scope.imageSrc = "http://"+config.ipfsHost+":"+config.ipfsWebPort+ $scope.apersona.image.contentUrl;
          console.log($scope.imageSrc)

        })
      });

    Accounts.balance().success(function(res){
      console.log(JSON.stringify(res))
      $scope.balance = blockapps.ethbase.Units.convertEth(res[0].balance).from("wei").to("ether").toPrecision(4)
    })

    Transactions.all(Accounts.getCurrentAddress()).success(function(response){

      $scope.lastAmount = blockapps.ethbase.Units.convertEth(response[0].value).from("wei").to("ether").toPrecision(4)
    
      $scope.lastTo = response[0].to;
    })

    $scope.incomingTx = []

  });

})

.controller('TransactionsCtrl', function($scope, Transactions, _, blockapps, Accounts) {

  $scope.$on('$ionicView.enter', function(e) {

    Transactions.all(Accounts.getCurrentAddress()).success(function(response){
      console.log("TransactionsCtrl.all()") 

      $scope.c2fmap2 = _.object(response, response.map(function(x){return Transactions.face(x.hash)}))
      $scope.transactions = response;
      $scope.faces = response.map(function(x){return Transactions.face(x.hash)})

      $scope.c2fmap = response.map(function(value, index) {
        value.value = blockapps.ethbase.Units.convertEth(value.value).from("wei").to("ether").toPrecision(4)
        return {
            data: value,
            value: $scope.faces[index]
        }
      });
    })

    Transactions.balance(Accounts.getCurrentAddress()).success(function(response){
      console.log('balance response: ' + JSON.stringify(response))
        $scope.balance = blockapps.ethbase.Units.convertEth(response[0].balance).from("wei").to("ether").toPrecision(4)
        console.log("ETH: " + $scope.balance)
    })
  })
})

.controller('TransactionsDetailCtrl', function($scope, $stateParams, Transactions) {
  console.log("hello TransactionsDetailCtrl()")
  Transactions.get($stateParams.txId).success(function(response){
    $scope.transaction = response;
    $scope.face = Transactions.face(response[0].hash)
  })

})

.controller('TransactionsDetailCtrl', function($scope, $stateParams, Transactions) {
  console.log("hello TransactionsDetailCtrl()")
  Transactions.get($stateParams.txId).success(function(response){
    $scope.transaction = response;
    $scope.face = Transactions.face(response[0].hash)
    $scope.faceTo = Transactions.face(response[0].to)
    $scope.faceFrom = Transactions.face(response[0].from)
  })

  $scope.ipfsURL = "http://"+config.ipfsHost+":"+config.ipfsWebPort;

})

.controller('AccountCtrl', function($scope, $location, Accounts, _, config) {
  console.log("Hello AccountCtrl")

  Accounts.getAllAccounts().then(function(v){
      $scope.$apply(function(){
        $scope.allUsers = v;
      })

  });

  $scope.ipfsURL = "http://"+config.ipfsHost+":"+config.ipfsWebPort;

  $scope.isSelectedClass = function(item){
    console.log("isSelected()")
    if(item.address === Accounts.getCurrentAddress()){
      return "item-remove-animate item-avatar item-icon-right item-calm";
    } else {
      return "item-remove-animate item-avatar item-icon-right item-light";
    }
  };

  $scope.toEdit = function(address) {
    console.log("AccountCtrl.toEdit("+address+")")
    $location.path("/tab/account/"+address); // path not hash
  };

  $scope.select = function(address){
    console.log("AccountCtrl.select("+address+")")

    Accounts.setCurrentAddress(address);

  };

  // ethereum address <-> ipfsHash -> json schema


  $scope.signTx = function(){
    console.log("signTx()")
    Accounts.signTx("0x666666");
  };

})

.controller('AccountDetailCtrl', function($scope, $stateParams, Transactions, Accounts, config) {
  console.log("hello AccountDetailCtrl()")

  Accounts.getPersona($stateParams.accId).then(function(v){
      $scope.$apply(function(){
        $scope.persona = v;
      })
  });

  $scope.ipfsURL = "http://"+config.ipfsHost+":"+config.ipfsWebPort;

  $scope.upsertPersona = function(newName){
    console.log("AccountDetailCtrl.upsertPersona()")

    console.log("New name is: " + newName)

    Accounts.upsertPersona(newName);
    //.then(function(a){
    //  console.log("did upsert")
      // $scope.$apply(function(){
      //   $scope.ipfsHashHex = a;
      //   console.log("new ipfsHashHex: " + a)
      // })
    //})
  };

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
