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
    
    $scope.numAZ = 3; 
    
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
    
    $scope.roundUp = function(x) {  
    	var totalX;
	    if (x == Math.round(x)) { 
			totalX = x;
		} else  { 
			totalX = parseInt(x) +1;
		}
	    return totalX;
    }
    
    /**
     * DEA Calculator
     */
    $scope.numDeasToRunAIs = function() { 
    	var totalRam = ($scope.aiPacks.value * 50 * $scope.avgRam.value)
    	var deas = (totalRam / $scope.deaDef.usableRam) + $scope.nPlusX;
    	return $scope.roundUp(deas);
    };
    
    $scope.deasPerAz = function() { 
    	var azDeas = $scope.numDeasToRunAIs() / $scope.numAZ;
    	return $scope.roundUp(azDeas);
    };
    
    $scope.totalDEAs = function() { 
    	return $scope.deasPerAz() * $scope.numAZ;
    }
    
    //Does not account (well) for singletons or az's.
    $scope.buildVms = function () {
    	$scope.vms = [
           {name: "DEA", 				qty: $scope.totalDEAs()},
           {name: "DEA per AZ", 			qty: $scope.deasPerAz()},
           {name: "Ops Manager", 		qty: 1},
           {name: "Ops Manager Director",qty: 1},
           {name: "HAProxy", 			qty: $scope.numAZ}, //Depends on production
           {name: "NATS", 				qty: $scope.numAZ},
           {name: "etcd", 				qty: $scope.numAZ},
           {name: "Health Manager",		qty: $scope.numAZ},
           {name: "Blob Store", 					qty: 1}, //Not on AWS w/ S3
           {name: "Cloud Controller Database",	qty: 1},
           {name: "Cloud Controller", qty: $scope.numAZ},
           {name: "Clock Global", qty: 1},
           {name: "Cloud Controller Worker", qty: $scope.numAZ},
           {name: "Router", qty: $scope.numAZ},
           {name: "Collector", qty: 1}, //Do we scale this this way?
           {name: "UAA Database", qty: 1},
           {name: "UAA", qty: $scope.numAZ},
           {name: "Login Server", qty: 1},
           {name: "Apps Manager Database", qty: 1}, //Is this really a VM?
           {name: "Loggregator", qty: 1},
           {name: "Loggregator Traffic Controller", qty: 1},
           {name: "Compilation", qty: 4},
           {name: "Post-Install Errand", qty: $scope.numAZ},
           {name: "VCenter", qty: 1},
      	];
    };
    
    
    $scope.vms = {}
    $scope.buildVms(); 
});

