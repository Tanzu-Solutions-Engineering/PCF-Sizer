"use strict"
var shekelApp = angular.module('ShekelApp', []);

shekelApp.controller('ShekelController', function($scope, $http) {

    $scope.aiPacks = [50, 100, 150, 200, 250, 300];

    $scope.avgRam = [.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 10, 20, "too much"];
    
    $scope.deaSize = ["Small", "Medium", "Large", "Bad idea"]
});

