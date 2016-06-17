"use strict";
(function() {
  var sizerApp = angular.module('SizerApp', ['ui.bootstrap', 'ngRoute']);

  sizerApp.config(function($routeProvider, $locationProvider) {
    $routeProvider
    .when('/sizing/:iaas/:version/:size', {
      templateUrl: 'app/components/sizing/sizing.html',
      controller: 'PCFSizingController',
      controllerAs: 'vm',
      resolve: {
        loadErsTemplates: function(iaasService, $route, sizingStorageService) {
          var storage = sizingStorageService.data;
          var iaas = $route.current.params.iaas;
          var version = $route.current.params.version;
          var size = $route.current.params.size;

          storage.selectedIaaS = iaas;
          storage.fixedSize = size;
          storage.services = {};
          if (iaasService.loadedConfig.iaas !== iaas) {
            return iaasService.loadIaaSTemplate(iaas).then(function() {
              return iaasService.loadERSTemplates(iaas).then(function() {
                iaasService.loadedConfig.iaas = iaas;
                iaasService.loadedConfig.ersFixedSize = size;
                return iaasService.loadServiceTemplates(storage.selectedIaaS);
              });
            });
          }
        }
      }
    }).otherwise({redirectTo:'/sizing/vsphere/1.7/small'});
    $locationProvider.html5Mode(false);
  });

  sizerApp.controller('MainController', function($rootScope, $scope, $route, $routeParams, $location, sizingStorageService, iaasService) {
    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;
    $scope.storage = sizingStorageService.data;
    $scope.data = {};

    $scope.$watch('storage.selectedIaaS', function(newValue, oldValue) {
      if (newValue !== null) {
        $scope.data.selectedIaaS = _.find($scope.data.iaasSelectionList, {id: $scope.storage.selectedIaaS});
      }
    });

    $scope.data.cellDetailSummary = iaasService.getDiegoCellSummary();
    $scope.data.resourceSummary = iaasService.getResourceSummary();

    $scope.data.iaasSelectionList = [
      {
        id: 'vsphere',
        name: 'vSphere',
        isDefault: true,
        isDisabled: false,
        pricingUrl: null
      },
      {
        id: 'aws',
        name: 'AWS',
        isDefault: false,
        isDisabled: false,
        pricingUrl: 'https://aws.amazon.com/ec2/pricing/'
      },
      {
        id: 'azure',
        name: 'Azure',
        isDefault: false,
        isDisabled: true,
        pricingUrl: null
      },{
        id: 'gcp',
        name: 'GCP',
        isDefault: false,
        isDisabled: true,
        pricingUrl: null
      },{
        id: 'openstack',
        name: 'OpenStack',
        isDefault: false,
        isDisabled: true,
        pricingUrl: null
      }
    ];

    $scope.changeIaaS = function(iaas) {
      $scope.storage.selectedIaaS = iaas.id;
      var version = $scope.storage.elasticRuntimeConfig.ersVersion;
      var fixedSize = $scope.storage.fixedSize;
      $location.path(['/sizing', iaas.id, version, fixedSize].join('/'));
    };

    $scope.changeVersion = function(version) {
      var iaas = $scope.storage.selectedIaaS;
      var fixedSize = $scope.storage.fixedSize;
      $scope.storage.elasticRuntimeConfig.ersVersion = version;
      $location.path(['/sizing', iaas, version, fixedSize].join('/'));
    };

    $scope.changeSize = function(size) {
      var iaas = $scope.storage.selectedIaaS;
      $scope.storage.fixedSize = size;
      var version = $scope.storage.elasticRuntimeConfig.ersVersion;
      $scope.storage.elasticRuntimeConfig.ersVersion = version;
      $location.path(['/sizing', iaas, version, size].join('/'));
    };

    $scope.getVMs = function(tile) {
      return iaasService.getVMs(tile);
    };

    $scope.getTileNames = function() { //gets all the unique tile names
      var tiles = _.map(_.uniqBy($scope.getVMs(), 'tile'), 'tile')
      tiles.sort();
      return tiles;
    }

    $scope.scsSelected = function() {
      return _.find(iaasService.getVMs('Spring Cloud Services')) !== undefined || _.find(iaasService.getVMs('Single Sign On')) !== undefined;
    };

    $scope.getPhysicalCores = function() {
    	return Math.ceil($scope.data.resourceSummary.cpu / $scope.storage.elasticRuntimeConfig.iaasCPUtoCoreRatio  );
    };

    $scope.isNavItemSelected = function(nav) {
      var current = $location.path().split('/')[1];
      return current === nav;
    }
   });

})();
