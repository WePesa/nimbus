angular.module('starter.services', ['underscore', 'config', 'ngCordova', 'blockapps', 'ipfs_', 'lightwallet_', 'ionic.utils'])

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

.factory('Transactions', function ($http, $rootScope, $stateParams, $q, config) {

  return {

    all: function (address) {
      //console.log("Transactions.all("+address+")");
      return $http.get(config.uri+'/transaction?address='+address)
      //return $http.get(url, { params: { address: myaddress } })  //{ user_id: $rootScope.session } })
    },

    get: function (hash) {
      //console.log("Transactions.get("+hash+")");
      return $http.get(config.uri+'/transaction?hash='+hash)
    },

    face: function (hash){
      //console.log("Transactions.face("+hash+")");
      //return ('http://robohash.org/'+hash+'?set=set3&size=64x64')
      return ('http://www.gravatar.com/avatar/'+hash+'?d=retro&s=64') // monsterid
    },

    balance: function(account){
      console.log("Transactions.balance("+account+")") 
      return $http.get(config.uri + '/account?address='+account)
    },

    getNestedData: function(address) {
      console.log("Transactions.getNestedData("+address+")");
      
      var promises = [];
      var deferredCombinedItems = $q.defer();
      var combinedItems = [];
      
      return $http.get(config.uri+'/log?address='+address).success(function(res) {
        
        angular.forEach(res.data, function(list) {
          var deferredItemList = $q.defer();

          $http.get(config.uri+"transaction?hash="+list.hash).then(function(res) {

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

.factory('Accounts', function ($http, $rootScope, $stateParams, $q, $window, _, config, blockapps, $ionicPlatform, ipfs_, lightwallet_, $localstorage) { //$cordovaKeychain, $cordovaTouchID

  var p1 = {
    address : "903b4a914940f08399e41dddcab8e1ea8939cbab",
    privkey : "e011bdbfde66bb78af76aaf907e6bbf2c5715d163524241ae50b5309b40da42d",
    personaSchema :  {
        'name': "Jesus",
        'image': {'@type': 'ImageObject',
              'name': 'avatar',
              'contentUrl' : '/ipfs/QmW95EqBGLCkbW6nTPcEkDL4MtsnzkHgrxj8KRwTMDyaRR'}
    },
    ipfshash : "00000"
  }
  var p2 = {
    address : "1cee1690d65268ca551bcd2791c570a8fcac5e7a",
    privkey : "a08494b907ec1f4b834cc1f6aee65d2d341d0764162b61e9485b217bce3ce751",
    personaSchema :  {
        'name': "Johann Sebastian Bach",
        'image': {'@type': 'ImageObject',
              'name': 'avatar',
              'contentUrl' : '/ipfs/QmZjQqCfkVtxjx5yNvvEKFEnTNnz2zsuJCyZuZgPpUPW5D'}
    },
    ipfshash : "11111"
  }

  $localstorage.setObject("p1", p1);
  $localstorage.setObject("p2", p2);

  console.log("localstorage keys: " + $localstorage.keys())
  var ps = [p1,p2];

  var _currentAddress = ps[0].address;

  var contract = blockapps.Solidity.attach( {"code":"contract PersonaRegistry {\n\n  uint public version;\n  address public previousPublishedVersion;\n\n  uint numPersonas;\n\n  string status;\n\n  struct Persona { bytes ipfs; uint index; address owner; }\n  Persona[] public personas;\n  mapping(address => Persona) public ipfsAttributeLookup;\n\n  function PersonaRegistry(address _previousPublishedVersion) {\n    version = 1;\n    previousPublishedVersion = _previousPublishedVersion;\n    status = \"initated\";\n  }\n\n  function setPersonaAttributes(bytes ipfsHash) {\n\n    // new persona\n    if (ipfsAttributeLookup[msg.sender].owner == 0) {\n\n      status = \"new persona\";\n\n      personas.length = numPersonas + 1;\n\n      personas[numPersonas].ipfs = ipfsHash;\n      personas[numPersonas].owner = msg.sender;\n      personas[numPersonas].index = numPersonas;\n\n      ipfsAttributeLookup[msg.sender].ipfs = ipfsHash;\n      ipfsAttributeLookup[msg.sender].owner = msg.sender;\n      ipfsAttributeLookup[msg.sender].index = numPersonas;\n\n      numPersonas = numPersonas + 1;\n\n    } else { // update a persona\n\n      status = \"updating persona\";\n\n      uint ind = ipfsAttributeLookup[msg.sender].index;\n\n      personas[ind].ipfs = ipfsHash;\n      ipfsAttributeLookup[msg.sender].ipfs = ipfsHash;\n\n    }\n  }\n\n  function getPersonaAttributes(address personaAddress) constant returns(bytes) {\n    status = \"getting persona\";\n    return ipfsAttributeLookup[personaAddress].ipfs;\n  }\n}\n","name":"PersonaRegistry","vmCode":"6060604052604051602080610ce68339016040526060805190602001505b600160006000508190555080600160006101000a81548173ffffffffffffffffffffffffffffffffffffffff02191690830217905550604060405190810160405280600881526020017f696e6974617465640000000000000000000000000000000000000000000000008152602001506003600050908051906020019082805482825590600052602060002090601f016020900481019282156100dd579182015b828111156100dc5782518260005055916020019190600101906100be565b5b50905061010891906100ea565b8082111561010457600081815060009055506001016100ea565b5090565b50505b50610bcb8061011b6000396000f30060606040523615610074576000357c0100000000000000000000000000000000000000000000000000000000900480631b6caad91461007657806340291e6a146100c857806354fd4d50146101575780636104464f14610178578063884179d8146101af57806397df212b1461023e57610074565b005b6100c66004803590602001906004018035906020019191908080601f016020809104026020016040519081016040528093929190818152602001838380828437820191505050505050905061039c565b005b6100d960048035906020015061030f565b60405180806020018481526020018373ffffffffffffffffffffffffffffffffffffffff168152602001828103825285818154815260200191508054801561014657820191906000526020600020905b81548152906001019060200180831161012957829003601f168201915b505094505050505060405180910390f35b61016260045061036d565b6040518082815260200191505060405180910390f35b610183600450610376565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6101c06004803590602001506102bd565b60405180806020018481526020018373ffffffffffffffffffffffffffffffffffffffff168152602001828103825285818154815260200191508054801561022d57820191906000526020600020905b81548152906001019060200180831161021057829003601f168201915b505094505050505060405180910390f35b61024f600480359060200150610a64565b60405180806020018281038252838181518152602001915080519060200190808383829060006004602084601f0104600302600f01f150905090810190601f1680156102af5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b600560005060205280600052604060002060009150905080600001600050908060010160005054908060020160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905083565b600460005081815481101561000257906000526020600020906003020160009150905080600001600050908060010160005054908060020160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905083565b60006000505481565b600160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60006000600560005060003373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005060020160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16141561082257604060405190810160405280600b81526020017f6e657720706572736f6e610000000000000000000000000000000000000000008152602001506003600050908051906020019082805482825590600052602060002090601f01602090048101928215610499579182015b8281111561049857825182600050559160200191906001019061047a565b5b5090506104c491906104a6565b808211156104c057600081815060009055506001016104a6565b5090565b5050600160026000505401600460005081815481835581811511610595576003028160030283600052602060002091820191016105949190610501565b8082111561059057600060008201600050805460008255601f0160209004906000526020600020908101906105549190610536565b808211156105505760008181506000905550600101610536565b5090565b5060018201600050600090556002820160006101000a81549073ffffffffffffffffffffffffffffffffffffffff021916905550600101610501565b5090565b5b505050508160046000506002600050548154811015610002579060005260206000209060030201600050600001600050908051906020019082805482825590600052602060002090601f01602090048101928215610610579182015b8281111561060f5782518260005055916020019190600101906105f1565b5b50905061063b919061061d565b80821115610637576000818150600090555060010161061d565b5090565b5050336004600050600260005054815481101561000257906000526020600020906003020160005060020160006101000a81548173ffffffffffffffffffffffffffffffffffffffff02191690830217905550600260005054600460005060026000505481548110156100025790600052602060002090600302016000506001016000508190555081600560005060003373ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600050600001600050908051906020019082805482825590600052602060002090601f01602090048101928215610744579182015b82811115610743578251826000505591602001919060010190610725565b5b50905061076f9190610751565b8082111561076b5760008181506000905550600101610751565b5090565b505033600560005060003373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005060020160006101000a81548173ffffffffffffffffffffffffffffffffffffffff02191690830217905550600260005054600560005060003373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005060010160005081905550600160026000505401600260005081905550610a5f565b604060405190810160405280601081526020017f7570646174696e6720706572736f6e61000000000000000000000000000000008152602001506003600050908051906020019082805482825590600052602060002090601f016020900481019282156108ac579182015b828111156108ab57825182600050559160200191906001019061088d565b5b5090506108d791906108b9565b808211156108d357600081815060009055506001016108b9565b5090565b5050600560005060003373ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600050600101600050549050816004600050828154811015610002579060005260206000209060030201600050600001600050908051906020019082805482825590600052602060002090601f01602090048101928215610983579182015b82811115610982578251826000505591602001919060010190610964565b5b5090506109ae9190610990565b808211156109aa5760008181506000905550600101610990565b5090565b505081600560005060003373ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600050600001600050908051906020019082805482825590600052602060002090601f01602090048101928215610a31579182015b82811115610a30578251826000505591602001919060010190610a12565b5b509050610a5c9190610a3e565b80821115610a585760008181506000905550600101610a3e565b5090565b50505b5b5050565b6020604051908101604052806000815260200150604060405190810160405280600f81526020017f67657474696e6720706572736f6e6100000000000000000000000000000000008152602001506003600050908051906020019082805482825590600052602060002090601f01602090048101928215610b02579182015b82811115610b01578251826000505591602001919060010190610ae3565b5b509050610b2d9190610b0f565b80821115610b295760008181506000905550600101610b0f565b5090565b5050600560005060008373ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600050600001600050805480601f01602080910402602001604051908101604052809291908181526020018280548015610bba57820191906000526020600020905b815481529060010190602001808311610b9d57829003601f168201915b50505050509050610bc6565b91905056","symTab":{"status":{"atStorageKey":"3","bytesUsed":"20","jsType":"String","arrayNewKeyEach":"20","arrayDataStart":"c2575a0e9e593c00f959f8c92f12db2869c3395a3b0502d05e2516446f71f85b","solidityType":"string"},"personas":{"atStorageKey":"4","bytesUsed":"20","jsType":"Array","arrayElement":{"bytesUsed":"60","jsType":"Struct","solidityType":"Persona"},"arrayNewKeyEach":"1","arrayDataStart":"8a35acfbc15ff81a39ae7d344fd709f28e8600b4aa8c65c6b64bfe7fe36bd19b","solidityType":"Persona[]"},"ipfsAttributeLookup":{"atStorageKey":"5","mappingKey":{"bytesUsed":"14","jsType":"Address","solidityType":"address"},"bytesUsed":"20","jsType":"Mapping","mappingValue":{"bytesUsed":"60","jsType":"Struct","solidityType":"Persona"},"solidityType":"mapping (address => Persona)"},"previousPublishedVersion":{"atStorageKey":"1","bytesUsed":"14","jsType":"Address","solidityType":"address"},"setPersonaAttributes":{"functionDomain":[{"atStorageKey":"0","bytesUsed":"20","jsType":"Bytes","arrayNewKeyEach":"20","arrayDataStart":"290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563","solidityType":"bytes"}],"functionArgs":["ipfsHash"],"functionHash":"1b6caad9","bytesUsed":"0","jsType":"Function","solidityType":"function(bytes) returns ()"},"Persona":{"bytesUsed":"60","structFields":{"owner":{"atStorageKey":"2","bytesUsed":"14","jsType":"Address","solidityType":"address"},"ipfs":{"atStorageKey":"0","bytesUsed":"20","jsType":"Bytes","arrayNewKeyEach":"20","arrayDataStart":"290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563","solidityType":"bytes"},"index":{"atStorageKey":"1","bytesUsed":"20","jsType":"Int","solidityType":"uint256"}},"jsType":"Struct","solidityType":"struct {bytes ipfs; uint256 index; address owner}"},"version":{"atStorageKey":"0","bytesUsed":"20","jsType":"Int","solidityType":"uint256"},"getPersonaAttributes":{"functionDomain":[{"atStorageKey":"0","bytesUsed":"14","jsType":"Address","solidityType":"address"}],"functionArgs":["personaAddress"],"functionHash":"97df212b","bytesUsed":"0","jsType":"Function","functionReturns":{"atStorageKey":"0","bytesUsed":"20","jsType":"Bytes","arrayNewKeyEach":"20","arrayDataStart":"290decd9548b62a8d60345a988386fc84ba6bc95484008f6362f93160ef3e563","solidityType":"bytes"},"solidityType":"function(address) returns (bytes)"},"numPersonas":{"atStorageKey":"2","bytesUsed":"20","jsType":"Int","solidityType":"uint256"}},"address":"d9ffec038375699cc76528f3b7fa5dd07e4ea4df"} );

  var getCurrentAddress = function(){
    console.log("Accounts.getCurrentAddress()")
    return _currentAddress;
    //return ps[0].address;
  };

  var setCurrentAddress = function(address){
    console.log("Account.setCurrentAddress("+address+")")
    _currentAddress = address;
  };

  var getPersona = function(address){
    console.log("Accounts.getPersona()");

    (contract.state.ipfsAttributeLookup(getCurrentAddress())).then(function(s){
          console.log("hello blockapps too")
          console.log("Keylookup!: " + s.owner.toString());
        });

    return new Promise( function(accept, reject){
      var persona = _.find(ps, function(p){
        return p.address === address;
      });

      accept(persona.personaSchema);

    })
  };

  var upsertPersona = function(newname){

    var address = getCurrentAddress();

    var val_ = _.find(ps, function(v){
      return v.address === address;
    });

    var newPersona;
    var persona;

    if(val_ !== null){

      console.log("val: " + JSON.stringify(val_))
      console.log("updating...: " + newname)
      console.log("private key: " + val_.privkey)

      persona = {
          name: newname,
          image: val_.personaSchema.image
        };

      ipfs_.addJson(persona, function(err, ipfsHash) {
            console.log("new ipfsHash: " + ipfsHash);

            newPersona = {
              address : address,
              privkey : val_.privkey,
              personaSchema : persona,
              ipfshash : ipfsHash
            }

            _.extend(_.findWhere(ps, { address: newPersona.address }), newPersona);

            console.log(JSON.stringify(ps))

            var ipfsHashHex = ipfs_.utils.base58ToHex(ipfsHash);
            console.log("new ipfsHashHex: " + ipfsHashHex);

            console.log("privkey: " + val_.privkey)

            contract.state["setPersonaAttributes"].apply(null,[ipfsHashHex]).txParams({
              value : blockapps.ethbase.Units.ethValue(1000000000).in("wei")
              }).callFrom(val_.privkey)
              .then(function(r){console.log("afterTX: " + r)})
              .catch(function (err) { console.log("err: " + err); 
            });
          })

    } else { 
      console.log("inserting...")

      newPersona = {
        address : address,
        privkey : "xxxxxxx",
        personaSchema : {
          name: name,
          image: {'@type': 'ImageObject',
                'name': 'avatar',
                'contentUrl' : '/ipfs/QmUSBKeGYPmeHmLDAEHknAm5mFEvPhy2ekJc6sJwtrQ6nk'}
        },
        ipfshash : "1111"
      }

    }
  };

  getAccount = function(address){
      return new Promise(function(accept, reject){
        accept(_.find(ps, function(v){ return v.address == address}));
      })
    };
 
  return {

    getCurrentAddress : getCurrentAddress,

    setCurrentAddress : setCurrentAddress,

    upsertPersona : upsertPersona,

    getPersona: getPersona,

    getAccount : getAccount,

    getFace: function (hash){
      //console.log("Transactions.face("+hash+")");
      //return ('http://robohash.org/'+hash+'?set=set3&size=64x64')
      return ('http://www.gravatar.com/avatar/'+hash+'?d=retro&s=64') // monsterid
    },

    getPending : function(){
        console.log("Accounts.getPending("+getCurrentAddress()+")")
        return $http.get(config.keyserver + '/addresses/'+getCurrentAddress()+'/pending')
    },

    getAllAccounts : function(){
      return new Promise(function(accept, reject){
        accept(ps);
      })
    },

    balance: function(){
      console.log("Accounts.balance("+getCurrentAddress()+")") 
      return $http.get(config.uri + '/account?address='+getCurrentAddress())
    },

    setPersona : function(){
      console.log("Accounts.setPersona()")

      return new Promise( function(accept, reject){

        // put attrib
        ipfs_.addJson(thePerson2, function(err, ipfsHash) {
          console.log("ipfsHash: " + ipfsHash);

          var ipfsHashHex = ipfs_.utils.base58ToHex(ipfsHash);
          console.log("ipfsHashHex: " + ipfsHashHex);

          contract.state["setPersonaAttributes"].apply(null,[ipfsHashHex]).txParams({
            value : blockapps.ethbase.Units.ethValue(1000000000).in("wei")
            }).callFrom(privkey)
            .then(function(r){console.log("afterTX: " + r)})
            .catch(function (err) { console.log("err: " + err); 
          });

          (contract.state.personas).then(function(v){
            console.log("hello blockapps")
          //  console.log(v.toString())
          })
          
          if (err !== null) { reject(err); return; }

          accept(ipfsHashHex);
        });
      });
    },

    getPersona_old : function(address){

      return new Promise( function(accept, reject){

        var ipfsHashHex =  "12204919b9cf05c5ee5c5b6b87d4ee54ea9600a9e9f7c9e18f18566d233324eaafe2";//res[0].value;
        console.log("ipfsHashHex: " + ipfsHashHex)
        console.log(ipfsHashHex.slice(2))
        var ipfsHash = ipfs.utils.hexToBase58(ipfsHashHex.slice(2));
        console.log("ipfsHash: " + ipfsHash)
        ipfs_.catJson("QmTG1DvAFYHPBgkBr92BQGKfTQTg17V3tC9PMs4kvqsVff", function(err, personaObj) {

          console.log("personaObj: " + JSON.stringify(personaObj))
        
          if (err !== null) { reject(err); return; }
          accept(personaObj);
        
        });
      });
    },

    signTx : function(p) {
      getAccount(getCurrentAddress()).then(function(account){
        console.log("account:  " + JSON.stringify(account))
        var simpleIdContract = blockapps.Solidity.attach({"code":"contract SimpleIdentity {\n\n\taddress master = 0x903b4a914940f08399e41dddcab8e1ea8939cbab;\n\tstring status = \"sleeping\";\n\n\tfunction ringBell(){\n\t\tif(msg.sender == master){\n\t\t\tstatus = \"master called\";\n\t\t} else {\n\t\t\tstatus = \"ignoring call\";\n\t\t}\n\t}\n\n\tfunction sleep(){\n\t\tstatus = \"sleeping\";\n\t}\n}","name":"SimpleIdentity","vmCode":"606060405273903b4a914940f08399e41dddcab8e1ea8939cbab600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff02191690830217905550604060405190810160405280600881526020017f736c656570696e670000000000000000000000000000000000000000000000008152602001506001600050908051906020019082805482825590600052602060002090601f016020900481019282156100cd579182015b828111156100cc5782518260005055916020019190600101906100ae565b5b5090506100f891906100da565b808211156100f457600081815060009055506001016100da565b5090565b50506102e5806101096000396000f30060606040526000357c010000000000000000000000000000000000000000000000000000000090048063133a473e14610044578063d1df12521461005157610042565b005b61004f60045061022b565b005b61005c60045061005e565b005b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141561017057604060405190810160405280600d81526020017f6d61737465722063616c6c6564000000000000000000000000000000000000008152602001506001600050908051906020019082805482825590600052602060002090601f0160209004810192821561013e579182015b8281111561013d57825182600050559160200191906001019061011f565b5b509050610169919061014b565b80821115610165576000818150600090555060010161014b565b5090565b5050610228565b604060405190810160405280600d81526020017f69676e6f72696e672063616c6c000000000000000000000000000000000000008152602001506001600050908051906020019082805482825590600052602060002090601f016020900481019282156101fa579182015b828111156101f95782518260005055916020019190600101906101db565b5b5090506102259190610207565b808211156102215760008181506000905550600101610207565b5090565b50505b5b565b604060405190810160405280600881526020017f736c656570696e670000000000000000000000000000000000000000000000008152602001506001600050908051906020019082805482825590600052602060002090601f016020900481019282156102b5579182015b828111156102b4578251826000505591602001919060010190610296565b5b5090506102e091906102c2565b808211156102dc57600081815060009055506001016102c2565b5090565b50505b56","symTab":{"status":{"atStorageKey":"1","bytesUsed":"20","jsType":"String","arrayNewKeyEach":"20","arrayDataStart":"b10e2d527612073b26eecdfd717e6a320cf44b4afac2b0732d9fcbe2b7fa0cf6","solidityType":"string"},"sleep":{"functionDomain":[],"functionArgs":[],"functionHash":"133a473e","bytesUsed":"0","jsType":"Function","solidityType":"function() returns ()"},"master":{"atStorageKey":"0","bytesUsed":"14","jsType":"Address","solidityType":"address"},"ringBell":{"functionDomain":[],"functionArgs":[],"functionHash":"d1df1252","bytesUsed":"0","jsType":"Function","solidityType":"function() returns ()"}},"address":"b2ef9164f2415a437a6e04217c3138d6946ee8cc"});
        // FIXME actually supply args here (but what does [{}] mean?)
        simpleIdContract.state[p.method].apply(null,[]).txParams({
          value : blockapps.ethbase.Units.ethValue(1000000000).in("wei")
        }).callFrom(account.privkey).then(function(r){console.log("afterTX: " + r)}).catch(function (err) { console.log("err: " + err); });
      })
    },

    removeTx : function(p){
      console.log("P:" + JSON.stringify(p))
      $http.get(config.keyserver + '/addresses/'+getCurrentAddress()+'/pending/remove/'+p.time).success(function(s){
        console.log("successfully removed? " + s)
      })
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

    }
  }
})

var ipfs_ = angular.module('ipfs_',['config'])
.factory('ipfs_', function(config) {
  ipfs.setProvider({host: config.ipfsHost, port: config.ipfsPort});
  console.log("IPFS host: " + config.ipfsHost+":"+config.ipfsPort)
  return ipfs;
});

var lightwallet_ = angular.module('lightwallet_',[])
.factory('lightwallet_', ['$window', function($window) {
  return lightwallet; //
}]);

var underscore = angular.module('underscore',[])
.factory('_', ['$window', function($window) {
  return $window._; // assumes underscore has already been loaded on the page
}]);

var blockapps = angular.module('blockapps', ['config'])
.factory('blockapps', ['$window', function($window) {
  var b = require('blockapps-js')
  b.query.serverURI = config.strato;
  return b;
  //return $window.blockapps; // assumes blockapps has already been loaded on the page
}]);

var config = angular.module('config', [])
// .factory('config', ['$window', function($window) {
//   return $window.lightwallet; // assumes config has already been loaded on the page
// }])
.constant('config', {
    strato :          "http://strato-dev2.blockapps.net",
    uri:              "http://strato-dev2.blockapps.net" + "/eth/v1.0",
    keyserver:        "http://blockapps-keymaster.cloudapp.net", 
    ipfsHost :        "http://blockapps-keymaster.cloudapp.net",//"104.131.53.68", //"http://104.236.65.136",
    ipfsPort :        "5001",
    ipfsWebPort:      "8080",
    personaRegistry:  "d9ffec038375699cc76528f3b7fa5dd07e4ea4df"
  }
)
.constant('config_local', {
    strato :          "http://strato-dev2.blockapps.net",
    uri:              "http://strato-dev2.blockapps.net" + "/eth/v1.0",
    keyserver:        "http://localhost:8000",
    ipfsHost :        "blockapps-keymaster.cloudapp.net",//"104.131.53.68", //"http://104.236.65.136",
    ipfsPort :        "5001",
    ipfsWebPort:      "8080",
    personaRegistry:  "d9ffec038375699cc76528f3b7fa5dd07e4ea4df"
  }
);

angular.module('ionic.utils', [])

.factory('$localstorage', ['$window', function($window, underscore) {

  return {
    keys: function(){
      return _.keys($window.localStorage);
    },
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}]);
