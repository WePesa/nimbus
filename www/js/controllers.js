angular.module('starter.controllers', ['underscore', 'config', 'blockapps'])

.controller('DashCtrl', function($scope, Accounts, config, Transactions, blockapps) {

  $scope.$on('$ionicView.enter', function(e) {

    console.log("DashCtrl()")

    Accounts.getPersona(Accounts.getCurrentAddress()).then(function(a){
        $scope.$apply(function(){
          $scope.apersona = a;
          console.log("New persona: " + $scope.apersona.name);
          //$scope.imageSrc = "http://"+config.ipfsHost+":"+config.ipfsWebPort+ $scope.apersona.image.contentUrl;
          $scope.imageSrc = $scope.apersona.image.contentUrl;
          console.log($scope.imageSrc)
        })
      });

    Accounts.balance().success(function(res){
      console.log(JSON.stringify(res))
      if(res[0]){
        $scope.balance = blockapps.ethbase.Units.convertEth(res[0].balance).from("wei").to("ether").toPrecision(4)
      } else {
        $scope.balance = 0
      }
    })

    var currentAddress = Accounts.getCurrentAddress();
    Transactions.all(currentAddress).success(function(response){
      var tx = response[response.length-1];
      var sign = tx.from == currentAddress ? 1 : -1;
      $scope.lastAmount = sign*blockapps.ethbase.Units.convertEth(tx.value).from("wei").to("ether").toPrecision(4)
      $scope.lastTo = tx.to;
    })

    Accounts.getPending().success(function(response){
      console.log("response: " + response.length)
      $scope.pending = response;
    })

  });

})

.controller('PendingCtrl', function($scope, Transactions, _, blockapps, Accounts) {

 // Date.prototype.yyyymmdd = function() {
 //   var yyyy = this.getFullYear().toString();
 //   var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
 //   var dd  = this.getDate().toString();
 //   return yyyy + (mm[1]?mm:"0"+mm[0]) + (dd[1]?dd:"0"+dd[0]); // padding
 //  };

 //  $scope.dateString(p){
 //    var d = new Date(p.time);
 //    return d.yyyymmdd();
 //  };

  $scope.refresh = function(){
    Accounts.getPending().success(function(response){
      console.log("response: " + response.length)
      $scope.pending = response;
    })
  };

  $scope.$on('$ionicView.enter', function(e) {
      $scope.refresh();
  });

  $scope.signTx = function(p){
    console.log("signTx("+JSON.stringify(p)+")")
    Accounts.signTx(p);
  };

  $scope.removeTx = function(p){
    console.log("removing: " + JSON.stringify(p));
    Accounts.removeTx(p);
    $scope.refresh();
  };

  $scope.ba = blockapps;



})

.controller('TransactionsCtrl', function($scope, Transactions, _, blockapps, Accounts) {

  $scope.$on('$ionicView.enter', function(e) {

    var myAddr = Accounts.getCurrentAddress();

    Transactions.all(myAddr).success(function(response){
      console.log("TransactionsCtrl.all()") 

      $scope.c2fmap2 = _.object(response, response.map(function(x){return Transactions.face(x.hash)}))
      $scope.transactions = response;
      $scope.faces = response.map(function(x){return Transactions.face(x.hash)})

      $scope.c2fmap = response.map(function(value, index) {
        var sign = value.from == myAddr ? -1 : 1
        value.value = sign*blockapps.ethbase.Units.convertEth(value.value).from("wei").to("ether").toPrecision(4)
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

})

.controller('AccountDetailCtrl', function($scope, $stateParams, Transactions, Accounts, config) {
  console.log("hello AccountDetailCtrl()")

  $scope.ipfsURL = "http://"+config.ipfsHost+":"+config.ipfsWebPort;

  if($stateParams.accId === 0){

    //Accounts.newPersona().then(function(v){

    //}

  } else {
    Accounts.getPersona($stateParams.accId).then(function(v){
      $scope.$apply(function(){
        $scope.persona = v;
      })
    });
  }

  $scope.upsertPersona = function(newName){
    console.log("AccountDetailCtrl.upsertPersona("+newName+")");
    Accounts.upsertPersona(newName);
  };
})

.controller('SettingsCtrl', function($scope, Accounts, _, $cordovaBarcodeScanner, $http, config) {

  $scope.settings = {
    camera2: JSON.stringify($cordovaBarcodeScanner.scan),
    camera: (JSON.stringify($cordovaBarcodeScanner) !== "{}")
  };

  $scope.refill = function(){
    console.log("putting TXs...")
    $http.get(config.keyserver + '/utils/').success(function(r){
      console.log("success")
    })
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
