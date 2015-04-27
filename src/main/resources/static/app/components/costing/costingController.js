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
	$scope.paasCost = 200000; 
	$scope.iaasCost = 500000;
	$scope.opexCost = 1000000;
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
	//100% utilization.
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
	
	$scope.calculateMonthly = function(plan) {
		var monthlyBill = ((365/12) * 24 * ($scope.forecasting.hoursInOperation / 100)) 
			* ((plan.memoryQuota/plan.aiMax) * (plan.aiMax * ($scope.forecasting.aiDeployed / 100))) 
			* $scope.getGbPerHrWithPoints();
		return monthlyBill;
	}

	$scope.generateRunCard = function(plan) {
		runCard = new Array();
		var plansInUse = (plan.consumption / 100) * $scope.forecasting.initialPlans;
		var gbHr = $scope.getGbPerHrWithPoints();
		plan.monthlyBill = $scope.calculateMonthly(plan)
		plan.gbPerHr = gbHr;
		var lastMonthRevenue = 0;
		for ( var i = 1; i <= $scope.forecastLength; ++i ) {
			var ais = plansInUse * plan.aiMax;
			var revenue =  lastMonthRevenue + (plansInUse * plan.monthlyBill);
			runCard.push({month: i, plansInUse: plansInUse, ais: ais, revenue: revenue});
			plansInUse = plansInUse + (plansInUse * ($scope.forecasting.rampUpGrowth * .01));
			lastMonthRevenue = revenue;
		}
		return runCard;
	}
	
	$scope.buildRunCards = function(plans) {
		$scope.runCards = new Array();
		for ( var i = 0; i < plans.length; ++i ) { 
			$scope.runCards.push({ plan:plans[i], name:plans[i].name, runCard:$scope.generateRunCard(plans[i])});
		}
		$scope.markupRuncard();
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
			$scope.buildRunCards(planService.getPlans());
		});
	});
	
	$scope.calculatePayoffWithPlans = function() { 
		var month = 0;
		var tco = $scope.getDurationTCO();
		for (; month < $scope.forecastLength ; ++month) {
			var sum = 0;
			for(var i = 0; i < $scope.runCards.length; ++i ) {
				sum += $scope.runCards[i].runCard[month].revenue
				if ( sum > tco ) { 
					return month;
				}
			}
		}
		return -1;
	};
	
	$scope.totalProfit = function () { 
		var lastMonthTotal = 0; 
		$scope.runCards.forEach(function(runCard) {
			lastMonthTotal += runCard.runCard[$scope.forecastLength -1 ].revenue; 
		});
		return lastMonthTotal - $scope.getDurationTCO();
		
	}

    /*
    This function checks each runcard over each month for over consumption of the IaaS
     */
    $scope.markupRuncard = function() {
    	console.log("RAM available to DEA is " + $scope.deaRam());
		console.log("vCPU available to DEA is " + $scope.deaVcpu());
        for (var i =0; i < $scope.forecastLength; i++ ) {
            var consumedRam = 0;
            var consumedVCPU = 0;
            $scope.runCards.forEach(function(runCard) {
                var runCardForMonth = runCard.runCard[i];
                consumedRam += runCardForMonth.ais * runCard.plan.maxInstanceMem;
                consumedVCPU += runCardForMonth.ais * $scope.aiAvgVcpu();
                runCardForMonth.oversubscribed = new Array();
                if (consumedRam > $scope.deaRam()) {
                    runCardForMonth.oversubscribed.push("RAM");
                }
                if ( consumedVCPU > $scope.deaVcpu()) {
                    runCardForMonth.oversubscribed.push("VCPU");
                }
            });
        }
    };

});