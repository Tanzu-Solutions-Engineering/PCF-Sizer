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

});