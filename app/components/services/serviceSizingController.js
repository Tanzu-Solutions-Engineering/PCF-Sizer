"use strict";

angular.module('SizerApp').controller('ServiceSizingController', function($scope, $route, $routeParams, $location, $http, iaasService, sizingStorageService) {
    $scope.svcs = [];
    $scope.versioncache = {};
    $scope.serviceData = sizingStorageService.data;

    if (iaasService.loadedConfig.iaas === null) {
      $location.path('/');
    }

    $scope.services = function() {
        return $scope.svcs
    };

    $http.get('/services').success(function(data) {
        data.forEach(function(service) {
          var name = service.split('_')[0];
          $scope.svcs.push(name);
        });
        $scope.svcs.forEach(function(service) {
            $scope.getServiceVersions(service);
        });
    });

    $scope.services();

    $scope.serviceversion = 0;
    /**
     * Returns a promise which will contain an array of versions.
     * @param serviceName
     * @returns {*}
     */
    $scope.getServiceVersions = function(serviceName) {
        var url = '/services/' + serviceName + '/versions';
        return $http.get(url).then(function(data) {
            $scope.versioncache[serviceName] = {
                elements: data.data.sort().reverse(),
                selected: data.data[0],
                enabled: false
            };

            return $scope.versioncache[serviceName]
        });
    };

    $scope.getActiveTemplate = function(serviceName) {
        var cachedService = $scope.versioncache[serviceName];
        if (undefined === cachedService || false == cachedService.enabled) {
            return null;
        }
        // var tile = tileService.getTile(serviceName, 'all');
        iaasService.loadTileTemplate(serviceName);
        //Handle the case where it's been enabled but not fetched. The digest cycle will
        //run again in these cases, so this just prevents the browser console from getting
        //errors.
        // if (undefined === tile) {
        //     return [];
        // }
        // return tile.template;

    };

    $scope.toggleService = function(serviceName) {
        if ( $scope.versioncache[serviceName].enabled ) {
            var version =  $scope.versioncache[serviceName].selected;
            iaasService.addTileVMs(serviceName);
        } else {
          console.log('service disabled');
          iaasService.removeVMs(serviceName);
        }
    };
});
