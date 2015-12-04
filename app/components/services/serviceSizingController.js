"use strict";

shekelApp.controller('ShekelServiceSizingController', function($scope, $http, tileService) {
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
        if ( $scope.versioncache[serviceName].enabled ) {
            var version =  $scope.versioncache[serviceName].selected;
            return $scope.getTile(serviceName, version).then(function(tile) {
                tileService.tiles.push(
                    {
                        name: serviceName,
                        version: version,
                        vms: tile
                    }
                );
            });
        } else {
            tileService.tiles.forEach(function(tile, idx) {
                if ( tile.name == serviceName) {
                    tileService.tiles.splice(idx, 1);
                    return;
                }
            });
        }
    };

    $scope.getTile = function(tileName, tileVersion) {
      return $http.get(['/tile', tileName, tileVersion].join('/')).then(function(data) {
          return data.data;
      });
    };
});