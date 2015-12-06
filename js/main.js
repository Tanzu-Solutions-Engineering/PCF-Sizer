"use strict";

var shekelApp = angular.module('ShekelApp', []);

shekelApp.controller('ShekelFoundationController', function ($scope) {
    $scope.singleComplianceZone = "yes";
    $scope.seperateForProd = "yes";
    $scope.complianceZones = 1;
    $scope.physicalDC = 1;

    $scope.foundations = function () {
        var multiplier = $scope.seperateForProd == "yes" ? 2 : 1;
        //Gross side effect...
        if ($scope.singleComplianceZone == "yes") {
            $scope.complianceZones = 1;
        }
        return $scope.physicalDC * $scope.complianceZones * multiplier;
    }
});

