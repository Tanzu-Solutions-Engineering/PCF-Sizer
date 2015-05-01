"use strict";
shekelApp.controller('ShekelCostingController', function($scope, vmLayout, aiService, planService) {
	
	$scope.rampUpPlans = 5;
	$scope.forecastLength = 36;

	$scope.vcpuPerAIOptions = [ 
	        {"text": "1:1", "ratio":1}, 
	        {"text": "2:1", "ratio":2}, 
	        {"text": "3:1", "ratio":3}, 
	        {"text": "4:1", "ratio":4},
	        {"text": "5:1", "ratio":5}, 
	        {"text": "6:1", "ratio":6}, 
	        {"text": "7:1", "ratio":7}, 
	        {"text": "8:1", "ratio":8},
	        {"text": "9:1", "ratio":9}, 
	        {"text": "10:1", "ratio":10} 
	      ];
	
	$scope.forecasting = { 
		vcpuPerAI: $scope.vcpuPerAIOptions[4],
		profitMarginPoints: 0,
		rampUpGrowth: 5,
		initialPlans: 3,
		burndownMonths: $scope.forecastLength,
		burndownMode: "gbhr",
		hoursInOperation: 100,
		aiDeployed: 100
	};
	$scope.paasCost = 200000; 
	$scope.iaasCost = 200000;
	$scope.opexCost = 10000;
	$scope.paasMonthly = "duration";
	$scope.iaasMonthly = "duration";
	$scope.opexMonthly = "monthly";
			
	/**
	 * Closure to enable math against a dea property.
	 */
	$scope.deaFunction = function(method, overhead) { 
		for (var i = 0; i < vmLayout.length; ++i) { 
			var vm = vmLayout[i];
			if ( "DEA" == vm.vm ) {
				if ( "ephemeral_disk" == method ){
					// MG Factor in SWAP partition on DEA Ephemeral Disk
					return (vm[method] * vm.instances) - (vm.ram * vm.instances) - (overhead * vm.instances);
				}
				else{
					return (vm[method] * vm.instances) - (overhead * vm.instances);
				}
			}
		}
	};
	
	$scope.deaVcpu = function() { 
		return $scope.deaFunction("vcpu", 0);
	};
	
	$scope.deaRam = function() { 
		return $scope.deaFunction("ram", 3)
	};
	
	$scope.deaDisk = function() {
		//MG Factor in 4 GB Used Space in /var/vcap/data
		return $scope.deaFunction("ephemeral_disk", 4);
	};
	
	$scope.aiAvgDisk = function ()  { 
		return $scope.deaDisk() / (aiService.aiPacks().value * 50); 
	};

	$scope.aiAvgRam = function ()  { 
		return $scope.deaRam() / (aiService.aiPacks().value * 50); 
	};
	
	$scope.aiAvgVcpu = function ()  { 
		return $scope.deaVcpu() / (aiService.aiPacks().value * 50); 
	};
	
	$scope.getDurationTCO = function() { 
		var pCost = $scope.paasMonthly == "duration" ? $scope.paasCost : $scope.paasCost * $scope.forecastLength;
		var iCost = $scope.iaasMonthly == "duration" ? $scope.iaasCost : $scope.iaasCost * $scope.forecastLength;
		var oCost = $scope.opexMonthly == "duration" ? $scope.opexCost : $scope.opexCost * $scope.forecastLength;
		return pCost + iCost + oCost;
	};
	
	$scope.getMonthlyTCO = function() { 
		return $scope.getDurationTCO() / $scope.forecastLength; 
	};
	
	/*
	 * The following calculators assume 100% utilization. See 
	 * https://www.pivotaltracker.com/story/show/90807616 for 
	 * future plans around how we ramp up.
	 * MG:  var gbPerHrBreakEven represents the cost to deliver GB/Hour assuming 100% utilization
	 */
	$scope.gbPerHrBreakEven = function() {
		var perDay = ($scope.getMonthlyTCO() * 12) / 365;
		var perHour = perDay / 24;
		return perHour/$scope.deaRam();	
	}
	
	$scope.getGbPerHrWithPoints = function() { 
		//if ( 'date' == $scope.forecasting.burndownMode) { 
			//var gbHr = $scope.getDurationTCO() / ($scope.forecasting.burndownMonths / 12 ) / 365 / 24 / $scope.deaRam();
			//$scope.forecasting.profitMarginPoints =  ((gbHr - $scope.gbPerHrBreakEven() ) / gbHr ) * 100; 
			//return gbHr;
		//}
		//else {
			return parseFloat($scope.gbPerHrBreakEven().toFixed(2)) +
			parseFloat(($scope.gbPerHrBreakEven() * $scope.forecasting.profitMarginPoints * .01).toFixed(2)) 
		//}
	};

	//100% utilization.
	$scope.getPayoffMonths = function () {
		if ( 'date' == $scope.forecasting.burndownMode ) { 
			return $scope.forecasting.burndownMonths;
		}
		else {
			$scope.forecasting.burndownMonths = $scope.forecastLength;
			return $scope.forecastLength;
		}
	};
	
	
	//Forecast Adjustment Points
	$scope.getForecastAdjustment = function () {
				if ( 'gbhr' == $scope.forecasting.burndownMode || 'date' == $scope.forecasting.burndownMode ) {
				var baseRevenueFromRunCards = $scope.getBaseRevenueFromRunCards();
				var totalRevenueShortFall = $scope.getDurationTCO() - baseRevenueFromRunCards;
				var burnDownAdjustmentPoints = (totalRevenueShortFall / baseRevenueFromRunCards) * 100;
				if ( isFinite(burnDownAdjustmentPoints) && totalRevenueShortFall > 0 ) {
						var trAdjust = $scope.forecasting.profitMarginPoints = burnDownAdjustmentPoints + 0.5;	
					}
				else {
						var trAdjust = $scope.forecasting.profitMarginPoints = 0;	
					}
				//MG console.log("MGLOG baseRevenueFromRunCards=" + baseRevenueFromRunCards);
				//MG console.log("MGLOG totalRevenueShortFall=" + totalRevenueShortFall);
				//MG console.log("MGLOG adjustval=" + trAdjust);
				return trAdjust
				}
	}
	
	//Get the Projected Base Revenue From Existing Rate Cards
	$scope.getBaseRevenueFromRunCards = function () {
		if ( $scope.runCards.length < 1 ) {
			return 0;
		}
		else {
			var trRunCards = 0;
			$scope.runCards.forEach(function(runCard){
				var trBaseMonthly = $scope.calculateBaseMonthly(runCard.plan);
				for (var i =0; i < $scope.forecasting.burndownMonths; i++ ) {
					// MG console.log(runCard);
					if (runCard.runCard[i].costModelType == "Billable"){
						var trRunCardIterationRevenue = runCard.runCard[i].plansInUse * trBaseMonthly;
						trRunCards += trRunCardIterationRevenue;
					}
				}
			});
		}
		return trRunCards;
	}

			
	$scope.planService = planService;

	$scope.runCards = []; 
	
	$scope.calculateMonthly = function(plan) {
		var monthlyBill = ((365/12) * 24 * ($scope.forecasting.hoursInOperation / 100)) 
			* ((plan.memoryQuota/plan.aiMax) * (plan.aiMax * ($scope.forecasting.aiDeployed / 100))) 
			* $scope.getGbPerHrWithPoints();
		return monthlyBill;
	};
	
	//Necessary to help forecast adjustment
	$scope.calculateBaseMonthly = function(plan) {
		var monthlyBill = ((365/12) * 24 * ($scope.forecasting.hoursInOperation / 100)) 
			* ((plan.memoryQuota/plan.aiMax) * (plan.aiMax * ($scope.forecasting.aiDeployed / 100))) 
			* $scope.gbPerHrBreakEven();
		return monthlyBill;
	};

	$scope.generateRunCard = function(plan) {
		var runCard = new Array();
		var plansInUse = (plan.consumption / 100) * $scope.forecasting.initialPlans;
		var gbHr = $scope.getGbPerHrWithPoints();
		plan.monthlyBill = $scope.calculateMonthly(plan)
		plan.gbPerHr = gbHr;
		var lastMonthRevenue = 0;
		var runcostModelType = plan.costModelType.value;
		for ( var i = 1; i <= $scope.forecastLength; ++i ) {
			var ais = plansInUse * plan.aiMax;
			var revenue =  lastMonthRevenue + (plansInUse * plan.monthlyBill);
			runCard.push({month: i, plansInUse: plansInUse, ais: ais, revenue: revenue, costModelType: runcostModelType});
			plansInUse = plansInUse + (plansInUse * ($scope.forecasting.rampUpGrowth * .01));
			lastMonthRevenue = revenue;
		}
		return runCard;
	};
	
	$scope.buildRunCards = function(plans) {
		$scope.runCards = new Array();
		for ( var i = 0; i < plans.length; ++i ) { 
			$scope.runCards.push({ plan:plans[i], name:plans[i].name, runCard:$scope.generateRunCard(plans[i])});
		}
		$scope.markupRuncard();
		$scope.getForecastAdjustment();
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
	 'forecasting.burndownMonths',
	 'forcasting.burndownMode',
	 'forcasting.costModelType'
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
				
					if ($scope.runCards[i].plan.costModelType.value == "Billable"){
					sum += $scope.runCards[i].runCard[month].revenue
						}
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
		
	};

    /*
    This function checks each Runcard over each month for over consumption of the IaaS
     */
    $scope.markupRuncard = function() {
        for (var i =0; i < $scope.forecastLength; i++ ) {
		            
        			var consumedRam = 0;
		            var consumedVCPU = 0;
		            var consumedDisk = 0;
            
		            $scope.runCards.forEach(function(runCard) {
		                var runCardForMonth = runCard.runCard[i];
		                var runCardIaasReservation = runCard.plan.consumption;
		                var runHasIaaS = true;
		                consumedRam = runCardForMonth.ais * runCard.plan.maxInstanceMem;
		                consumedVCPU = runCardForMonth.ais * $scope.aiAvgVcpu();
		                consumedDisk = runCardForMonth.ais * $scope.aiAvgDisk();
		                runCardForMonth.oversubscribed = new Array();
		                if (consumedRam >= ($scope.deaRam() * ( runCardIaasReservation * .01))) {
		                    runCardForMonth.oversubscribed.push("RAM");
		                    runHasIaaS = false;
		                }
		                if ( consumedVCPU >= ($scope.deaVcpu() * ( runCardIaasReservation * .01))) {
		                	runCardForMonth.oversubscribed.push("VCPU");
		                    runHasIaaS = false;
		                }
		                if (runCardForMonth.ais >= (aiService.aiPacks().value * 50) * (runCardIaasReservation * .01)) {
		                    runCardForMonth.oversubscribed.push("AI");
		                    runHasIaaS = false;
		                }
		                if ( consumedDisk > ( $scope.deaDisk() * ( runCardIaasReservation * .01))) {
		                    runCardForMonth.oversubscribed.push("Disk");
		                    runHasIaaS = false;
		                }
		                if ( runHasIaaS == true ) {
		                    runCardForMonth.oversubscribed.push("IaaS Available");
		                }
		                
		            });
            
        }
    };

});