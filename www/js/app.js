// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'ionic-material'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.dash', {
    url: '/dash',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'DashCtrl'
      }
    }
  })

  .state('tab.transactions', {
    url: '/transactions',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-transactions.html',
        controller: 'TransactionsCtrl'
      }
    }
  })

  .state('tab.transactions-detail', {
    url: '/transactions/:txId',
    views: {
      'menuContent': {
        templateUrl: 'templates/transactions-detail.html',
        controller: 'TransactionsDetailCtrl'
      }
    }
  })

  .state('tab.pending', {
    url: '/pending',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-pending.html',
        controller: 'PendingCtrl'
      }
    }
  })


  .state('tab.settings', {
    url: '/settings',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-settings.html',
        controller: 'SettingsCtrl'
      }
    }
  })

  .state('tab.account', {
    url: '/account',
    views: {
      'menuContent': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl'
      }
    }
  })

  .state('tab.account-detail', {
    url: '/account/:accId',
    views: {
      'menuContent': {
        templateUrl: 'templates/account-detail.html',
        controller: 'AccountDetailCtrl'
      }
    }
  })

  // .state('tab.account', {
  //   url: "/account",
  //   abstract: true,
  //   controller: 'AccountCtrl',
  //   templateUrl: function() {
  //     if (ionic.Platform.isIOS()) {
  //         return  "templates/tab-camera.html";
  //     }
  //     return "templates/tab-camera.html";
  //   }
  // })

  .state('tab.camera', {
    url: '/camera',
    views: {
      'tab-camera': {
        templateUrl: 'templates/tab-camera.html',
        controller: 'CameraCtrl'
      }
    }
  })

  ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/dash');

});
