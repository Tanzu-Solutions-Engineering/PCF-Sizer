shekelApp.controller('ShekelCostingController', function($scope, vmLayout, aiService, planService) {
	
	$scope.vcpuPerAI = .20;
	$scope.rampUpPlans = 5; 
	$scope.rampUpGrowth = 10;
	$scope.initialPlans = 5;
	$scope.points = { 
			profitMarginPoints: 10
	}
	$scope.paasCost = 1200000; 
	$scope.iaasCost = 2000000;
	$scope.opexCost = 400000;
	$scope.forecastLength = 36;
	$scope.paasMonthly = "duration";
	$scope.iaasMonthly = "duration";
	$scope.opexMonthly = "duration";
	$scope.burndownMonths = $scope.forecastLength;
			
	/**
	 * Closure to enable math against a dea property.
	 */
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
	
	$scope.getDurationTCO = function() { 
		var pCost = $scope.paasMonthly == "duration" ? $scope.paasCost : $scope.paasCost * $scope.forecastLength;
		var iCost = $scope.iaasMonthly == "duration" ? $scope.iaasCost : $scope.iaasCost * $scope.forecastLength;
		var oCost = $scope.opexMonthly == "duration" ? $scope.opexCost : $scope.opexCost * $scope.forecastLength;
		return (pCost + iCost + oCost).toFixed(2);
	}
	
	$scope.getMonthlyTCO = function() { 
		return $scope.getDurationTCO() / $scope.forecastLength; 
	}
	
	$scope.gbPerHrBreakEven = function() {
		var daysInTco = $scope.getDurationTCO()/($scope.forecastLength) / 4 / 7;
		var hoursInTco = daysInTco / 24;
		return hoursInTco/$scope.deaRam();	
	}
	
	$scope.getGbPerHrWithPoints = function() { 
		return parseFloat($scope.gbPerHrBreakEven().toFixed(2)) +
			parseFloat(($scope.gbPerHrBreakEven() * $scope.points.profitMarginPoints * .01).toFixed(2)) 
	};
	
	$scope.getPayoffMonths = function () { 
		var monthlyPay =  $scope.getGbPerHrWithPoints() * 24 * 7 * 4;
		return $scope.getDurationTCO() / (monthlyPay * $scope.deaRam()); 
	};
	
	$scope.planService = planService;

	$scope.runCards = new Array(); 
	
	$scope.generateRunCard = function(plan) {
		runCard = new Array();
		var plansInUse = plan.consumption * $scope.initialPlans; 
		for ( var i = 1; i <= $scope.forecastLength; ++i ) {
			plansInUse = plansInUse + (plansInUse * ($scope.rampUpGrowth * .01));
			var ais = plansInUse * plan.aiMax;
			var revenue = plansInUse * $scope.getGbPerHrWithPoints() * 24*4*7;
			runCard.push({month: i, plansInUse: plansInUse, ais: ais, revenue: revenue});
		}
		return runCard;
	}
	
	$scope.buildRunCards = function(plans) {
		$scope.runCards = new Array();
		for ( var i = 0; i < plans.length; ++i ) { 
			$scope.runCards.push({ name:plans[i].name, runCard:$scope.generateRunCard(plans[i]) });
		}
	};
	//This could be optimised to not generate everything every time.
	$scope.$watchCollection('planService.getPlans()', function(newPlans, oldPlans) {
		$scope.buildRunCards(newPlans)
	});
});