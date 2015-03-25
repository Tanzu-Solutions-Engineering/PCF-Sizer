"use strict"
var shekelApp = angular.module('ShekelApp', []);

shekelApp.controller('ShekelSizingController', function($scope, $http) {

    $scope.aiPackOptions = new Array();         
    
    $scope.setAIPacs = function() {
    	for ( var i = 1; i <= 50; ++i) {
    		$scope.aiPackOptions.push({ label: i + " ("+i*50+")", value: i});
    	}
    }
    
    $scope.setAIPacs();
                             
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
    
    $scope.avgRam = $scope.avgRamOptions[1];

    $scope.avgAIDisk = 1;
    
    $scope.deaSizeOptions = [ 
        {text: "Small",    "size":16 }, 
        {text: "Medium",   "size":32 },
        {text: "Large",    "size":64 },
        {text: "Bad idea", "size":128}
    ];
    
    $scope.deaSize = $scope.deaSizeOptions[0];
    
    $scope.aZRecoveryCapacity = [25, 50, 100];
    
    $scope.numAZ = 3; 
    
    $scope.aiHelpMeChoose = false;
    
    $scope.aiChooser = { 
    	apps: 1,
    	devs: 1,
    	steps: 1
    };
       
	// This is the app instances formula. for "help me choose"
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
    	var deas = (totalRam / $scope.deaDef.usableRam);
    	return $scope.roundUp(deas);
    };
    
    $scope.deasPerAz = function() { 
    	var azDeas = $scope.numDeasToRunAIs() / $scope.numAZ;
    	return $scope.roundUp(azDeas) + $scope.nPlusX;
    };
    
    $scope.totalDEAs = function() { 
    	return $scope.deasPerAz() * $scope.numAZ;
    }
    
    $scope.vmLayout = null;
    $scope.vmTemplate = null;         
    $scope.showTable=false;
    
    $scope.iaasAskSummary = {
    	ram: 1,
    	disk: 1, 
    	vcpu: 1
    };
    
 
    
    $scope.doIaaSAskForVm = function(vm) {
    	$scope.iaasAskSummary.ram += (vm.ram / 1024) * vm.instances;
		$scope.iaasAskSummary.disk 
			+= ((vm.persistent_disk + vm.ephemeral_disk) / 1024) * vm.instances;
		$scope.iaasAskSummary.vcpu += vm.vcpu * vm.instances;
    }

    //This is the main calculator. We do all the per vm stuff and add the 
    //constants at the bottom.
    $scope.applyTemplate = function(template) { 
    	$scope.iaasAskSummary = {ram: 1, disk: 1, vcpu: 1};
    	$scope.vmLayout = new Array();
        for (var i = 0; i < template.length; i++) {
        	var vm = {};
    		angular.extend(vm, template[i]);
    		if ( !vm.singleton ) {
    			if ( "DEA" == vm.vm ) { 
    				vm.instances = $scope.totalDEAs();
    			} else {
    				vm.instances = vm.instances * $scope.numAZ;
    			}
    		}   
    		$scope.doIaaSAskForVm(vm);
			$scope.vmLayout.push(vm);
    	}
        $scope.iaasAskSummary.disk += $scope.avgAIDisk * $scope.aiPacks.value * 50;
    };
    
    $scope.loadAzTemplate = function() {
    	$http.get('/js/data/ers_vms_single_az_template.json')
    		.success(function(data) { 
    			$scope.vmTemplate = data;
    			$scope.applyTemplate($scope.vmTemplate);
    		}).error(function(data) { 
    			alert("Failed to get json template");
    		});
    };
    
	$scope.loadAzTemplate();
});

shekelApp.controller('ShekelFoundationController', function($scope) {
	$scope.singleComplianceZone = "yes";
	$scope.seperateForProd = "yes";
	$scope.complianceZones = 1;
	$scope.physicalDC = 1;
	
	$scope.foundations = function() { 
		var multiplier = $scope.seperateForProd == "yes" ? 2 : 1;
		//Gross side effect... 
		if ( $scope.singleComplianceZone == "yes") { 
			$scope.complianceZones = 1;
		}
		return $scope.physicalDC * $scope.complianceZones * multiplier; 
	}

});
