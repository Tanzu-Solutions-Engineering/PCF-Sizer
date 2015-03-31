shekelApp.controller('ShekelCostingController', function($scope, vmLayout, aiService) {
	$scope.gbPerHr = .08; //$
	$scope.burndownMonths = 36; //months
	$scope.costPerDay = 100;
	
	$scope.vcpuPerAI = .20;
	$scope.rampUpPlans = 5; 
	$scope.rampUpGrowth = .10;
	$scope.initialPlans = 5;
	$scope.profitMarginPoints = 0;
	
	$scope.payoffDays = 0;
		
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