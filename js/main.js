"use strict";
(function() {
  var sizerApp = angular.module('sizerApp', ['ui.bootstrap', 'ngRoute']);

  sizerApp.config(function($routeProvider, $locationProvider) {
    $routeProvider
    .when('/sizing/:iaas/:version?/:size?', {
      templateUrl: 'app/components/sizing/sizing.html',
      controller: 'PCFSizingController',
      controllerAs: 'vm',
      resolve: {
        loadTemplates: function(iaasService, $route, sizingStorageService, $location, $q) {
          var storage = sizingStorageService.data;
          var iaas = $route.current.params.iaas;
          var version = $route.current.params.version;
          var size = $route.current.params.size;

          storage.selectedIaaS = iaas;
          storage.fixedSize = size;
          storage.elasticRuntimeConfig.ersVersion = version;

          storage.services = {};
          return iaasService.loadIaaSTemplate(iaas).then(function() {
            return iaasService.loadTemplates(iaas).then(function() {
              return $q(function(resolve, reject) {
                iaasService.loadedConfig.iaas = iaas;
                iaasService.loadedConfig.ersFixedSize = size;
                var availableVersions = iaasService.getPCFVersions();

                if (availableVersions.indexOf(version) === -1) {
                  storage.elasticRuntimeConfig.ersVersion = availableVersions[0];
                  reject('bad version');
                  $location.path(['/sizing', iaas, availableVersions[0], size].join('/'));
                  return;
                } else {
                  if (!_.find(iaasService.pcfInstallSizes[version], {size: size})) {
                    var newSize = iaasService.pcfInstallSizes[version].sort(function(a, b) { return a.priority - b.priority })[0].size;
                    reject('bad size');
                    $location.path(['/sizing', iaas, version, newSize].join('/'));
                    return;
                  }
                }

                resolve();
              });
            });
          }, function(error) {
            return $q(function(resolve, reject) {
              console.log(error);
              reject('could not load');
              $location.path(['/sizing', 'vsphere'].join('/'));
              return;
            })
          });
        }
      }
    }).otherwise({redirectTo:'/sizing/vsphere'});
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
        pricingUrl: null,
        showPricingTypes: false,
        showSystemResourcesUsed: true,
        showInstanceFlavorsUsed: false
      },
      {
        id: 'aws',
        name: 'AWS',
        isDefault: false,
        isDisabled: false,
        pricingUrl: 'https://aws.amazon.com/ec2/pricing/',
        showPricingTypes: true,
        showSystemResourcesUsed: false,
        showInstanceFlavorsUsed: true
      },
      {
        id: 'aws-dedicated',
        name: 'AWS Dedicated',
        isDefault: false,
        isDisabled: false,
        pricingUrl: 'https://aws.amazon.com/ec2/purchasing-options/dedicated-instances/',
        showPricingTypes: true,
        showSystemResourcesUsed: false,
        showInstanceFlavorsUsed: true
      },
      {
        id: 'azure',
        name: 'Azure',
        isDefault: false,
        isDisabled: false,
        pricingUrl: 'https://azure.microsoft.com/en-us/pricing/details/virtual-machines/',
        showPricingTypes: true,
        showSystemResourcesUsed: false,
        showInstanceFlavorsUsed: true
      },{
        id: 'gcp',
        name: 'GCP',
        isDefault: false,
        isDisabled: false,
        pricingUrl: 'https://cloud.google.com/compute/pricing',
        showPricingTypes: true,
        showSystemResourcesUsed: false,
        showInstanceFlavorsUsed: true
      },{
        id: 'openstack',
        name: 'OpenStack',
        isDefault: false,
        isDisabled: false,
        pricingUrl: null,
        showPricingTypes: false,
        showSystemResourcesUsed: true,
        showInstanceFlavorsUsed: true
      }
    ];

    $scope.changeIaaS = function(iaas) {
      $scope.storage.selectedIaaS = iaas.id;
      var version = $scope.storage.elasticRuntimeConfig.ersVersion;
      var fixedSize = $scope.storage.fixedSize;
      $location.path(['/sizing', iaas.id, version, fixedSize].join('/'));
    };

    $scope.changeSize = function(size) {
      var iaas = $scope.storage.selectedIaaS;
      $scope.storage.fixedSize = size;
      var version = $scope.storage.elasticRuntimeConfig.ersVersion;
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
    	return Math.ceil($scope.data.resourceSummary.cpu / $scope.storage.elasticRuntimeConfig.iaasCPUtoCoreRatio);
    };

    $scope.isNavItemSelected = function(nav) {
      var current = $location.path().split('/')[1];
      return current === nav;
    };

    $scope.getPricingTypes = function() {
      return iaasService.getPricingTypes();
    };

    $scope.updatePricingType = function() {
      iaasService.generateResourceSummary();
    };
  });
})();
