"use strict";

shekelApp.controller('ShekelServiceSizingController', function($scope, $http) {
    $scope.svcs = null;

    $scope.services = function() {
        if ( null == $scope.svcs) {
            $http.get('/services').success(function(data) {
                $scope.svcs = data;
            })
        }
        return $scope.svcs
    };

    $scope.services();

    /**
     * Returns a promise which will contain an array of versions.
     * @param serviceName
     * @returns {*}
     */
    $scope.getServiceVersions = function(serviceName) {
        var url = '/services/' + serviceName + '/versions';
        return $http.get(url).then(function(data) {return data.data;});
    };

});