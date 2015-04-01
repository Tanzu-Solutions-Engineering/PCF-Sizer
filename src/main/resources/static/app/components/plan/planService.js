/**
 * 
 */
"use strict"
var planService = shekelApp.factory('planService', function($rootScope) {
	
	function makeNewPlan(name, memQuota, instanceMaxMem, maxRoutes,
			maxServiceInstances, paidServicePlans, diskQuota, aiMax, gbPerHr,
			consumption) { 
		return { 
			name: name,
			memoryQuota: memQuota,
			maxInstanceMem: instanceMaxMem, 
			maxRoutes: maxRoutes,
			maxServiceInstances: maxServiceInstances,
			paidServicePlans: paidServicePlans,
			diskQuota: diskQuota,
			aiMax: aiMax,
			gbPerHr: gbPerHr,
			consumption: consumption
		};
	};
	
	function paidServicePlanOptions() { 
		return [
	        {value: true, label: "yes"}, 
	        {value: false, label: "no"}
		];
	}
	
	function defaultPlan() {
		return {		
			name: "new plan",
			memoryQuota: 10,
			maxInstanceMem: 2, 
			maxRoutes: 100,
			maxServiceInstances: 10,
			paidServicePlans: this.paidServicePlanOptions()[0],
			diskQuota: 1,
			aiMax: 100,
			gbPerHr: .08,
			consumption: .50
		}
	}
	
	var plans = new Array(); 
	function getPlans() {
		return plans;
	}
	
	function addPlan(plan) { 
		plans.push(plan);
	}
	
	function deletePlan(plan) {
		
	}
	
	return {
		newPlan : makeNewPlan,
		defaultPlan: defaultPlan,
		paidServicePlanOptions: paidServicePlanOptions,
		getPlans: getPlans,
		addPlan: addPlan,
		deletePlan: deletePlan,
	};
});