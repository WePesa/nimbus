angular.module('starter.services', ['underscore', 'lw', 'ngCordova', 'blockapps', 'ipfs'])

.factory('Camera', function ($http, $rootScope, $stateParams, $q, _, $cordovaCamera, $cordovaBarcodeScanner, $cordovaDevice) {

  return {

    test: function(){
      console.log("testing camera")


        console.log("$cordovaCamera: " + JSON.stringify($cordovaCamera))
        $cordovaCamera.getPicture().then(function(a){
          console.log("a:" + a)
        })

        var d = $cordovaDevice.getCordova();
        console.log("cordova: " + d) 
 
        var device = $cordovaDevice.getDevice();
        console.log("device: " + JSON.stringify(device)) 

        var model = $cordovaDevice.getModel();
        console.log("model: " + model) 

        var platform = $cordovaDevice.getPlatform();
        console.log("platform: " + platform) 

        var uuid = $cordovaDevice.getUUID();
        console.log("uuid: " + uuid) 

        var version = $cordovaDevice.getVersion();
        console.log("version: " + version) 
    },

    shoot: function(){

      var deferred = $q.defer(); 
        $cordovaBarcodeScanner.scan().then(function(imageData) {

          //alert(imageData);
          //$rootScope.$apply(function(){
            deferred.resolve(imageData.text);
          //});

          _.defer(function(){$rootScope.$apply();});

          console.log("Barcode Format -> " + imageData.format);
          console.log("Cancelled -> " + imageData.cancelled);
        }, function(error) {

          console.log("An error happened -> " + error);

        });
      return deferred.promise;
    }
  }

})

.factory('Transactions', function ($http, $rootScope, $stateParams, $q) {

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
       //return $http.get('https://friends.json/getOne', { params: { user_id: $rootScope.session, tx_id: $stateParams.idtx } })
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


.factory('Accounts', function ($http, $rootScope, $stateParams, $q, $window, _, lw, blockapps, $ionicPlatform, ipfs) { //$cordovaKeychain, $cordovaTouchID

  var privkey = "e011bdbfde66bb78af76aaf907e6bbf2c5715d163524241ae50b5309b40da42d";

  var config = 
    {
      "mainnet": {
        "web3Host" : "frontier-lb.ether.camp",
        "web3Port" : "80",
        "ipfsHost" : "104.131.53.68",
        "ipfsPort" : "5001",
        "ipfsWebPort" : "8080",
        "personaRegistry": "0x42487fd067fc32f14cb3d5e0fd32f23d95c1ecfc"
      },
      "consensys_testnet": {
        "web3Host" : "104.236.65.136",
        "web3Port" : "8545",
        "ipfsHost" : "104.236.65.136",
        "ipfsPort" : "5001",
        "ipfsWebPort" : "8080",
        "personaRegistry": "0xd65e0311162d01cec291d00cc9a0806b7e0ed5ed"
      },
      "selection": "mainnet"
    };

  var contract = blockapps.Solidity.attach( {"code":"contract PersonaRegistry {\n\n  uint public version;\n  address public previousPublishedVersion;\n\n  mapping(address => bytes) public ipfsAttributeLookup;\n\n  function PersonaRegistry(address _previousPublishedVersion) {\n    version = 1;\n    previousPublishedVersion = _previousPublishedVersion;\n  }\n\n  function setPersonaAttributes(bytes ipfsHash) {\n    ipfsAttributeLookup[msg.sender] = ipfsHash;\n  }\n\n  function getPersonaAttributes(address personaAddress) constant returns(bytes) {\n    return ipfsAttributeLookup[personaAddress];\n  }\n}\n","name":"PersonaRegistry","vmCode":"606060405260405160208061046b8339016040526060805190602001505b600160006000508190555080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055505b50610407806100646000396000f30060606040526000357c0100000000000000000000000000000000000000000000000000000000900480631b6caad91461006557806354fd4d50146100b75780636104464f146100d8578063884179d81461010f57806397df212b1461018e57610063565b005b6100b56004803590602001906004018035906020019191908080601f01602080910402602001604051908101604052809392919081815260200183838082843782019150505050505090506102b1565b005b6100c260045061020d565b6040518082815260200191505060405180910390f35b6100e3600450610216565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b61012060048035906020015061023c565b60405180806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156101805780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b61019f60048035906020015061035d565b60405180806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156101ff5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b60006000505481565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6002600050602052806000526040600020600091509050805480601f016020809104026020016040519081016040528092919081815260200182805480156102a957820191906000526020600020905b81548152906001019060200180831161028c57829003601f168201915b505050505081565b80600260005060003373ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600050908051906020019082805482825590600052602060002090601f0160209004810192821561032c579182015b8281111561032b57825182600050559160200191906001019061030d565b5b5090506103579190610339565b808211156103535760008181506000905550600101610339565b5090565b50505b50565b6020604051908101604052806000815260200150600260005060008373ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600050805480601f016020809104026020016040519081016040528092919081815260200182805480156103f657820191906000526020600020905b8154815290600101906020018083116103d957829003601f168201915b50505050509050610402565b91905056","symTab":{"ipfsAttributeLookup":{"atStorageKey":"2","mappingKey":{"bytesUsed":"14","jsType":"Address","solidityType":"address"},"bytesUsed":"20","jsType":"Mapping","mappingValue":{"bytesUsed":"20","jsType":"Bytes","arrayNewKeyEach":"20","solidityType":"bytes"},"solidityType":"mapping (address => bytes)"},"previousPublishedVersion":{"atStorageKey":"1","bytesUsed":"14","jsType":"Address","solidityType":"address"},"setPersonaAttributes":{"functionDomain":[{"atStorageKey":"0","bytesUsed":"20","jsType":"Bytes","arrayNewKeyEach":"20","arrayDataStart":"290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563","solidityType":"bytes"}],"functionArgs":["ipfsHash"],"functionHash":"1b6caad9","bytesUsed":"0","jsType":"Function","solidityType":"function(bytes) returns ()"},"version":{"atStorageKey":"0","bytesUsed":"20","jsType":"Int","solidityType":"uint256"},"getPersonaAttributes":{"functionDomain":[{"atStorageKey":"0","bytesUsed":"14","jsType":"Address","solidityType":"address"}],"functionArgs":["personaAddress"],"functionHash":"97df212b","bytesUsed":"0","jsType":"Function","functionReturns":{"atStorageKey":"0","bytesUsed":"20","jsType":"Bytes","arrayNewKeyEach":"20","arrayDataStart":"290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563","solidityType":"bytes"},"solidityType":"function(address) returns (bytes)"}},"address":"c367f2e2501aa0dd4f6e6eec7f993eb14d8bb464"} );
  blockapps.query.serverURI = 'http://strato-dev2.blockapps.net';
  var Units = blockapps.ethbase.Units;

  return {

    getPersona : function(){
      console.log("getPersona()")

      // return blockapps.routes.storage({ key: "c7f6cd8f951298227792595b4b23551f3b6ccae71f0d99fba2f4a76864ea1f15"
      //                           , address: "c367f2e2501aa0dd4f6e6eec7f993eb14d8bb464"});

      return new Promise( function(accept, reject){

        blockapps.routes.storageAddress("c367f2e2501aa0dd4f6e6eec7f993eb14d8bb464").then(function(res){

          console.log("res: " + JSON.stringify(res))

          var ipfsHashHex = res.value;

          console.log("ipfs: " + JSON.stringify(ipfs))

          var ipfsHash = ipfs.utils.hexToBase58(ipfsHashHex.slice(2));
          ipfs.catJson(ipfsHash, function(err, personaObj) {

            console.log("personaObj: " + JSON.stringify(personaObj))
          
            if (err !== null) { reject(err); return; }
            accept(personaObj);
          
          });

        })
      });

    },

    signTx : function(hash) {
      console.log("hello contract: " + JSON.stringify(contract))

      contract.state["setPersonaAttributes"].apply(null,["98765432"]).txParams({
        value : Units.ethValue(1000000000).in("wei")
      }).callFrom(privkey).then(function(r){console.log("afterTX: " + r)}).catch(function (err) { console.log("err: " + err); });

    },

    newKey : function(){

      $ionicPlatform.ready(function() {

       // if(ionic.Platform.isIOS()){

          // var x = $cordovaTouchID.checkSupport()
          // x.then(function(greeting) {
          //   console.log('Success: ' + greeting);
          // }, function(reason) {
          //   console.log('Failed: ' + reason);
          // }, function(update) {
          //   console.log('Got notification: ' + update);
          // });
          // console.log("testing touchid: " + x)

          // console.log(JSON.stringify(ionic.Platform))

          // $cordovaKeychain.setForKey("key", "service", "super secret!").then(function(value) {
          //   console.log(value);
          //   $cordovaKeychain.getForKey("key", "service").then(function(value) {
          //     console.log(value);
          //   }, function (err) {
          //     console.error(err);
          //   });
          // }, function (err) {
          //   console.error(err);
          // })


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
      console.log("ipfs: " + JSON.stringify(ipfs))

      var secretSeed = lightwallet.keystore.generateRandomSeed()

      console.log("ss: " + secretSeed)
    }
  }
})

var ipfs = angular.module('ipfs',[]);
ipfs.factory('ipfs', ['$window', function($window) {
  //var i =  require('ipfs-js');
  //return $window.ipfs; //
  var ipfs = window.ipfsAPI();
  return ipfs;  
}]);

var underscore = angular.module('underscore',[]);
underscore.factory('_', ['$window', function($window) {
  return $window._; // assumes underscore has already been loaded on the page
}]);

var blockapps = angular.module('blockapps', [])
.factory('blockapps', ['$window', function($window) {

  var b = require('blockapps-js')
  return b;
  //return $window.blockapps; // assumes blockapps has already been loaded on the page
}]);

var lw = angular.module('lw', [])
.factory('lw', ['$window', function($window) {
  return $window.lightwallet; // assumes lw has already been loaded on the page
}]);
