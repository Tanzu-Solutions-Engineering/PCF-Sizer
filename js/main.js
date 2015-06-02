"use strict"

var shekelApp = angular.module('ShekelApp', []);

var vmService = shekelApp.factory('vmLayout', function ($rootScope) {
    var vmLayout = new Array();
    return vmLayout;
});

var aiService = shekelApp.factory('aiService', function ($rootScope) {
    var aiPacks = {};

    function setAiPacks(pack) {
        aiPacks = pack;
    }

    function getAiPacks() {
        return aiPacks;
    }

    return {
        aiPacks: getAiPacks,
        setAiPack: setAiPacks
    }

});

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

