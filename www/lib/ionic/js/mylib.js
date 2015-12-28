(function() {

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Create a safe reference to the Underscore object for use below.
  var mylib = function(obj) {
    if (obj instanceof mylib) return obj;
    if (!(this instanceof mylib)) return new mylib(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = mylib;
    }
    exports.mylib = mylib;
  } else {
    root.mylib = mylib;
  }

  mylib.hello = function(){
    console.log("hello mylib.hello()")
  }

  var hello = function(){
    console.log("hello mylib")
  }

  mylib.VERSION = '0.0.1';

  mylib()

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('mylib', [], function() {
      return mylib;
    });
  }

}.call(this));
