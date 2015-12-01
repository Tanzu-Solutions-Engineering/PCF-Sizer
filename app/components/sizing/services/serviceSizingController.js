"use strict"

shekelApp.controller('ShekelServiceSizingController', function($scope) {
    $scope.serviceVersionOptions = [
        {value: 2.0},
        {value: 1.0}
    ];

    $scope.service = {
        serviceVersion: $scope.serviceVersionOptions[0]
    };
});