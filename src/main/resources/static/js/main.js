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
    
    $scope.avgRamOptions = [ 
	    { value: .5 },
	    { value: 1  },
	    { value: 1.5},
	    { value: 2  },
	    { value: 2.5},
	    { value: 3  },
	    { value: 4  },
	    { value: 6  },
	    { value: 10 },
	    { value: 20 }
	]; 
    
    $scope.avgRam = $scope.avgRamOptions[0];

    
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
    
    
    $scope.deaDef = { 
    	usableRam: 10
    };
    
    $scope.nPlusX = 2;
    
    /**
     * DEA Calculator
     */
    $scope.numDeas = function() { 
    	var totalRam = ($scope.aiPacks.value * 50 * $scope.avgRam.value)
    	var deas = (totalRam / $scope.deaDef.usableRam) + $scope.nPlusX;
    	//This might have a bug in it, double check when we're writing real apps.
    	if (deas == Math.round(deas)) { 
    		return deas;
    	}
    	return parseInt(deas) +1;
    };
    
    

});

