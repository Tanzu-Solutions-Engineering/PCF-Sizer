"use strict"
var shekelApp = angular.module('ShekelApp', []);

var vmService = shekelApp.factory('vmLayout', function($rootScope) {
	var vmLayout = new Array(); 
	return vmLayout;
});

var aiService = shekelApp.factory('aiService', function($rootScope) {
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

shekelApp.controller('ShekelSizingController', function($scope, $http, vmLayout, aiService) {

    $scope.aiPackOptions = new Array();         
    
    $scope.setAIPackOptions = function() {
    	for ( var i = 1; i <= 50; ++i) {
    		$scope.aiPackOptions.push({ label: i + " ("+i*50+")", value: i});
    	}
    }
    
    $scope.setAIPackOptions();
               
    $scope.aiPacks = function(pack) { 
    	if (angular.isDefined(pack)) {
    		aiService.setAiPack(pack);
    	}
		return aiService.aiPacks();	
    }
    
    aiService.setAiPack($scope.aiPackOptions[0]);  
    
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
        {"text": "Small (16GB RAM)",    "size":16 }, 
        {"text": "Medium (32GB RAM)",   "size":32 },
        {"text": "Large (64GB RAM)",    "size":64 },
        {"text": "Bad idea (128GB RAM)", "size":128}
    ];
    
    $scope.deaSize = $scope.deaSizeOptions[0];
    
    $scope.aZRecoveryCapacity = [25, 50, 100];
    
    $scope.numAZ = 2; 
    
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
    	$scope.aiPacks($scope.aiPackOptions[$scope.ais() - 1]);
    }
    
    $scope.deaUsableRam = function() { 
    	return $scope.deaSize.size - 3;
    }
    
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
    	var aipacks = 50;
    	if (null != $scope.aiPacks()) { 
    		aipacks = $scope.aiPacks().value * 50;
    	}
    	var totalRam = (aipacks * $scope.avgRam.value)
    	var deas = (totalRam / $scope.deaUsableRam());
    	return $scope.roundUp(deas);
    };
    
    $scope.deasPerAz = function() { 
    	var azDeas = $scope.numDeasToRunAIs() / $scope.numAZ;
    	return $scope.roundUp(azDeas) + $scope.nPlusX;
    };
    
    $scope.totalDEAs = function() { 
    	return $scope.deasPerAz() * $scope.numAZ;
    }
    
	$scope.getVms = function() { return vmLayout; } 
    $scope.showTable=false;
    
    $scope.iaasAskSummary = {
    	ram: 1,
    	disk: 1, 
    	vcpu: 1
    };
    
    $scope.getPhysicalCores = function() { 
    	return $scope.roundUp($scope.iaasAskSummary.vcpu / 4); 
    }
    
    $scope.doIaaSAskForVm = function(vm) {
    	$scope.iaasAskSummary.ram += vm.ram * vm.instances;
		$scope.iaasAskSummary.disk 
			+= (vm.persistent_disk + vm.ephemeral_disk) * vm.instances;
		$scope.iaasAskSummary.vcpu += vm.vcpu * vm.instances;
    }

    //This is the main calculator. We do all the per vm stuff and add the 
    //constants at the bottom.
    $scope.applyTemplate = function(template) { 
    	$scope.iaasAskSummary = {ram: 1, disk: 1, vcpu: 1};
    	vmLayout.length = 0;
        for (var i = 0; i < template.length; i++) {
        	var vm = {};
    		angular.extend(vm, template[i]);
    		if ( !vm.singleton ) {
    			if ( "DEA" == vm.vm ) { 
    				vm.instances = $scope.totalDEAs();
    				vm.ram = $scope.deaSize.size;
    			} else {
    				vm.instances = vm.instances * $scope.numAZ;
    			}
    		}   
    		$scope.doIaaSAskForVm(vm);
			vmLayout.push(vm);
    	}
        $scope.iaasAskSummary.disk += $scope.avgAIDisk * $scope.aiPacks().value * 50;
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

shekelApp.controller('ShekelCostingController', function($scope, vmLayout, aiService) {
	$scope.gbPerHr = .08; //$
	$scope.burndownMonths = 36; //months
	$scope.costPerDay = 100;
	
	$scope.vcpuPerAI = .20;
	$scope.rampUpPlans = 5; 
	$scope.rampUpGrowth = .10;
	$scope.initialPlans = 5;
	$scope.profitMarginPoints = 0;
		
	$scope.deaFunction = function(method, overhead) { 
		for (var i = 0; i < vmLayout.length; ++i) { 
			var vm = vmLayout[i];
			if ( "DEA" == vm.vm ) {
				return (vm[method] * vm.instances) - (overhead * vm.instances);
			}
		}
	}
	$scope.deaVcpu = function() { 
		return $scope.deaFunction("vcpu", 0);
	}
	
	$scope.deaRam = function() { 
		return $scope.deaFunction("ram", 3)
	}
	
	$scope.deaDisk = function() {
		//TODO figure out real DEA Storage Overhead. Estimated here as 1GB.
		return $scope.deaFunction("ephemeral_disk", 1);
	}
	
	$scope.aiAvgDisk = function ()  { 
		return $scope.deaDisk() / (aiService.aiPacks().value * 50); 
	}

	$scope.aiAvgRam = function ()  { 
		return $scope.deaRam() / (aiService.aiPacks().value * 50); 
	}
	
	$scope.aiAvgVcpu = function ()  { 
		return $scope.deaVcpu() / (aiService.aiPacks().value *50); 
	}
	
	$scope.paasCost = 0; 
	$scope.iaasCost = 0;
	$scope.opexCost = 0;
	$scope.forcastLength = 36;
	$scope.paasMonthly = "duration";
	$scope.iaasMonthly = "duration";
	$scope.opexMonthly = "duration";
	
	$scope.getDurationTCO = function() { 
		var pCost = $scope.paasMonthly == "duration" ? $scope.paasCost : $scope.paasCost * 12;
		var iCost = $scope.iaasMonthly == "duration" ? $scope.iaasCost : $scope.iaasCost * 12;
		var oCost = $scope.opexMonthly == "duration" ? $scope.opexCost : $scope.opexCost * 12;
		return (pCost + iCost + oCost).toFixed(2);
	}
	
	$scope.getMonthlyTCO = function() { 
		return ($scope.getDurationTCO() / $scope.forcastLength).toFixed(2); 
	}
});
