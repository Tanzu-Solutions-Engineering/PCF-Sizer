"use strict"
var shekelApp = angular.module('ShekelApp', []);

shekelApp.controller('ShekelController', function($scope, $http) {

    $scope.aiPackOptions = [ 
	    { label:"1 (50)", value: 1},
	    { label: "2 (100)", value: 2},
	    { label: "3 (150)", value: 3},
	    { label: "4 (200)", value: 4},
	    { label: "5 (250)", value: 5},
	    { label: "6 (300)", value: 6},
	    { label: "7 (350)", value: 7},
	    { label: "8 (400)", value: 8},
	    { label: "9 (450)", value: 9},
	    { label: "10 (500)", value: 10}
	];                     
                             
    $scope.aiPacks = $scope.aiPackOptions[0]; 
    
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
        
    $scope.setAis = function() { 
    	$scope.aiPacks = $scope.aiPackOptions[$scope.ais() - 1];
    }

});

