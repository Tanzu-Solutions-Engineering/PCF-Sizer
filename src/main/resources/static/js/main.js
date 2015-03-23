"use strict"
var shekelApp = angular.module('ShekelApp', []);

shekelApp.controller('ShekelController', function($scope, $http) {

    $scope.aiPacks = [50, 100, 150, 200, 250, 300];

    $scope.avgRam = [.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 10, 20, "too much"];
    
    $scope.deaSize = ["Small", "Medium", "Large", "Bad idea"];
    
    $scope.aZRecoveryCapacity = [25, 50, 100];
    
    $scope.aiHelpMeChoose = false;
    
    $scope.aiChooser = { 
    	apps: 1,
    	devs: 1,
    	steps: 1,
    };
       
	// This is the app instances formula. Change it here.
    $scope.ais = function() {  
    	var totalAis = $scope.aiChooser.apps 
    			* $scope.aiChooser.devs 
    			* $scope.aiChooser.steps;
    	var packs = (totalAis /  50) + 1;
    	return parseInt(packs);
    };
    
    $scope.numAis = $scope.ais();

});

