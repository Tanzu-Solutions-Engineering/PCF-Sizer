"use strict";

(function () {

    describe('ShekelCostingController', function() {

        var $rootScope, createController, planService;

        beforeEach(module('ShekelApp'));

        beforeEach(inject(function($injector) {
            $rootScope = $injector.get('$rootScope');

            var $controller = $injector.get('$controller');
            planService = $injector.get('planService');

            createController = function() {
                return $controller('ShekelCostingController', {'$scope': $rootScope})
            }
        }))


        describe('IaaS consumption', function() {
            beforeEach( function () { createController() });

            beforeEach(function() {
                var thePlan = planService.defaultPlan();
                planService.getPlans().push(planService.defaultPlan());
                $scope.buildRunCards(planService.getPlans());
            });

            it('should run out of cpu in the first month', function() {

            });
        });

    });
})();