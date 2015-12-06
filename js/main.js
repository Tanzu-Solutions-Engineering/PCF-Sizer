"use strict";

var shekelApp = angular.module('ShekelApp', []);

function roundUp(x) {
    var totalX;
    if (x == Math.round(x)) {
        totalX = x;
    } else  {
        totalX = parseInt(x) +1;
    }
    return totalX;
}

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

