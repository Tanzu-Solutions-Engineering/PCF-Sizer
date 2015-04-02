shekelApp.controller('ShekelCostingController', function($scope, vmLayout, aiService, planService) {
	
	$scope.vcpuPerAI = .20;
	$scope.rampUpPlans = 5; 
	$scope.forecastLength = 36;

	$scope.forecasting = { 
		profitMarginPoints: 10,
		rampUpGrowth: 10,
		initialPlans: 5,
		burndownMonths: $scope.forecastLength,
		burndownMode: "gbhr",
		hoursInOperation: 100,
		aiDeployed: 100
	}
	$scope.paasCost = 1200000; 
	$scope.iaasCost = 2000000;
	$scope.opexCost = 400000;
	$scope.paasMonthly = "duration";
	$scope.iaasMonthly = "duration";
	$scope.opexMonthly = "duration";
			
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
		return pCost + iCost + oCost;
	}
	
	$scope.getMonthlyTCO = function() { 
		return $scope.getDurationTCO() / $scope.forecastLength; 
	}
	
	/*
	 * The following calculators assume 100% utilization. See 
	 * https://www.pivotaltracker.com/story/show/90807616 for 
	 * future plans around how we ramp up.
	 */
	$scope.gbPerHrBreakEven = function() {
		var perDay = $scope.getDurationTCO()/($scope.forecastLength / 12) / 365;
		var perHour = perDay / 24;
		return perHour/$scope.deaRam();	
	}
	
	$scope.getGbPerHrWithPoints = function() { 
		if ( 'date' == $scope.forecasting.burndownMode) { 
			var gbHr = $scope.getDurationTCO() / ($scope.forecasting.burndownMonths / 12 ) / 365 / 24 / $scope.deaRam();
			$scope.forecasting.profitMarginPoints =  ((gbHr - $scope.gbPerHrBreakEven() ) / gbHr ) * 100; 
			return gbHr;
		}
		return parseFloat($scope.gbPerHrBreakEven().toFixed(2)) +
			parseFloat(($scope.gbPerHrBreakEven() * $scope.forecasting.profitMarginPoints * .01).toFixed(2)) 
	};
	
	$scope.getPayoffMonths = function () {
		if ( 'date' == $scope.forecasting.burndownMode ) { 
			return $scope.forecasting.burndownMonths;
		}
		var monthlyIntakePerGB = ($scope.getGbPerHrWithPoints() * 24 * 365) / 12;
		var monthlyIntake = monthlyIntakePerGB * $scope.deaRam();
		var months = $scope.getDurationTCO() / monthlyIntake;
		$scope.forecasting.burndownMonths = months;
		return months;
	};
	
	$scope.planService = planService;

	$scope.runCards = []; 
	
	$scope.generateRunCard = function(plan) {
		runCard = new Array();
		var plansInUse = plan.consumption * $scope.forecasting.initialPlans; 
		for ( var i = 1; i <= $scope.forecastLength; ++i ) {
			plansInUse = plansInUse + (plansInUse * ($scope.forecasting.rampUpGrowth * .01));
			var ais = plansInUse * plan.aiMax;
			var revenue = plansInUse * $scope.getGbPerHrWithPoints() * 24*4*7;
			runCard.push({month: i, plansInUse: plansInUse, ais: ais, revenue: revenue});
		}
		plan.monthlyBill = ((365/12) * 24 * $scope.forecasting.hoursInOperation) * ((plan.memoryQuota/plan.aiMax) 
				* (plan.aiMax * $scope.forecasting.aiDeployed/100)) * $scope.getGbPerHrWithPoints();
		return runCard;
	}
	
	$scope.buildRunCards = function(plans) {
		$scope.runCards = new Array();
		for ( var i = 0; i < plans.length; ++i ) { 
			$scope.runCards.push({ name:plans[i].name, runCard:$scope.generateRunCard(plans[i]) });
		}
	};
	//This could be optimized to not generate everything every time.
	$scope.$watchCollection('planService.getPlans()', function(newPlans, oldPlans) {
		$scope.buildRunCards(newPlans);
		for ( var i = 0; i < planService.getPlans().length; ++i) {
			var expr = 'planService.getPlans()[' + i + ']';
			$scope.$watch(expr, function(newPlan, oldPlan) {
				$scope.buildRunCards(planService.getPlans());
			}, true);
		}
	});
	
	/**
	 * Watch all forecasting inputs to update the rate cards.
	 */
	[
	 'forecasting.rampUpGrowth', 
	 'forecasting.initialPlans', 
	 'forecasting.profitMarginPoints',
	 'forecasting.burndownMonths'
	 ].forEach(function(e,l,a) {
		$scope.$watch(e, function(newValue, oldValue) { 
			$scope.buildRunCards(planService.getPlans())
		});
	});

});