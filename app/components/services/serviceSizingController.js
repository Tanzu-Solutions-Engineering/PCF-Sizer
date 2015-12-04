"use strict";

shekelApp.controller('ShekelServiceSizingController', function($scope, $http) {
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
                elements: data.data,
                selected: data.data[0]
            };

            return $scope.versioncache[serviceName]
        });
    };
});