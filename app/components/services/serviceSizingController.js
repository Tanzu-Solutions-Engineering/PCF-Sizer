"use strict";

shekelApp.controller('ShekelServiceSizingController', function($scope, $http, vmLayout) {
    $scope.svcs = null;
    $scope.versioncache = {};

    $scope.services = function() {
        return $scope.svcs
    };

    $http.get('/services').success(function(data) {
        $scope.svcs = data;
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
            $scope.versioncache
            $scope.versioncache[serviceName] = {
                elements: data.data.sort().reverse(),
                selected: data.data[0],
                enabled: false
            };

            return $scope.versioncache[serviceName]
        });
    };

    $scope.toggleService = function(serviceName) {
        return $scope.getTile(serviceName, $scope.versioncache[serviceName].selected).then(function(tile) {
            vmLayout.splice.apply(vmLayout, [vmLayout.length,0].concat(tile));
        });
    };

    $scope.getTile = function(tileName, tileVersion) {
      return $http.get(['/tile', tileName, tileVersion].join('/')).then(function(data) {
          return data.data;
      });
    };
});