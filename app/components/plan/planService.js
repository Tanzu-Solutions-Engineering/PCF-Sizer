"use strict";
var planService = shekelApp.factory('planService', function($rootScope) {

	function costModelTypeOptions() {
		return [
			{value: "Billable"},
			{value: "Free"}
		];
	};
	
	function paidServicePlanOptions() { 
		return [
	        {value: true, label: "Yes"}, 
	        {value: false, label: "No"}
		];
	};

	function makeNewPlan(name, memQuota, instanceMaxMem, maxRoutes,
			maxServiceInstances, paidServicePlans, diskQuota, aiMax, gbPerHr,
			consumption, costModelType) { 
		return { 
			name: name,
			memoryQuota: memQuota,
			maxInstanceMem: instanceMaxMem, 
			maxRoutes: maxRoutes,
			maxServiceInstances: maxServiceInstances,
			paidServicePlans: this.paidServicePlanOptions()[0],
			diskQuota: diskQuota,
			aiMax: aiMax,
			consumption: consumption,
			costModelTypeValue: this.costModelTypeOptions()[0],
			costModelType: function(option) {
				if (angular.isDefined(option)) {
					this.costModelTypeValue = option;
				}
				return this.costModelTypeValue;
			}
		};
	};
	

	//TODO This repetition with the above should be re-factored somehow...
	function defaultPlan() {
		return {
			name: "Small Plan",
			memoryQuota: 8,
			maxInstanceMem: 2,
			maxRoutes: 16,
			maxServiceInstances: 16,
			paidServicePlans: true,
			diskQuota: 16,
			aiMax: 4,
			consumption: 25,
			monthlyBill: 0,
			costModelType: this.costModelTypeOptions()[0]

		}
		
	};
	
	var plans = new Array(); 
	
	function getPlans() {
		return plans;
	}
	

	function getBillablePlans() {
		var billPlans = new Array();
		for( var i = 0; i < plans.length; ++i ) {
			if (plans[i].costModelType.value == "Billable") {
				billPlans.push(plans[i])
			}
		}
		return billPlans;
	}
	
	function addPlan(plan) { 
		plans.push(plan);
	}
	
	function deletePlan(plan) {
		for( var i = 0; i < plans.length; ++i ) {
			if ( plans[i] == plan ) { 
				plans.splice(i, 1);
				return;
			}
		}
	}
	
	return {
		newPlan : makeNewPlan,
		defaultPlan: defaultPlan,
		paidServicePlanOptions: paidServicePlanOptions,
		costModelTypeOptions: costModelTypeOptions,
		getPlans: getPlans,
		addPlan: addPlan,
		deletePlan: deletePlan,
		getBillablePlans: getBillablePlans
	};
});