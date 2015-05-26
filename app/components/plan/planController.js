/**
 * Do things with plans.
 */
"use strict"
shekelApp.controller('ShekelPlanController', function($scope, planService) {
	$scope.showPlanForm=false;
	$scope.paidServicePlanOptions = planService.paidServicePlanOptions();
	

	$scope.costModelTypeOptions = planService.costModelTypeOptions();
	$scope.costModelTypeOption = planService.costModelTypeOptions()[0];
	

	
	$scope.plans = planService.getPlans();
	/** 
	 * Defaults for plan creation input hints
	 */
	$scope.plan = planService.defaultPlan();
	
	$scope.newPlan = function() { 
		planService.addPlan(planService.newPlan($scope.plan.name, $scope.plan.memoryQuota, 
				$scope.plan.maxInstanceMem, $scope.plan.maxRoutes, 
				$scope.plan.maxServiceInstances,$scope.plan.paidServicePlans.value,  
				$scope.plan.diskQuota, $scope.plan.aiMax, $scope.plan.gbPerHr,
				$scope.plan.consumption, planService.costModelTypeOptions()[0]));
	};


	$scope.overcommitted = function() {
		var iaasCommit = 0;
		planService.getPlans().forEach(function(plan) {
			iaasCommit += plan.consumption; 
		});
		return iaasCommit > 100;
	};
	
	$scope.deletePlan = function(plan) { 
		planService.deletePlan(plan);
	}
});