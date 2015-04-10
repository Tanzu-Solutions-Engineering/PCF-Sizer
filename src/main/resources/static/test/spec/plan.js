'use strict';

(function() {

    describe('ShekelPlanController', function() {

        var $rootScope, createController, planService;
        
        beforeEach(module('ShekelApp'));

        beforeEach(inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            var $controller = $injector.get('$controller');
            planService = $injector.get('planService');
            createController = function () {
                return $controller('ShekelPlanController',
                    {
                        '$scope': $rootScope,
                        planService: planService
                    }
                );
            };
        }));

        beforeEach(function() {createController()});

        describe('defaults', function() {
            beforeEach(function() { createController() });

            it('should start with a default plan', function () {
                expect($rootScope.plan).toBeDefined();
            });

            it('should not have any plans defined', function() {
                expect($rootScope.plans.length).toBe(0);
            });

            it('should have the plan form hidden', function() {
                expect($rootScope.showPlanForm).toBeFalsy();
            })
        });

        describe('iaas overcomitted', function() {

            it('should be true when there is too much consumption', function() {
                spyOn(planService, 'getPlans').and.returnValue([{consumption:101}]);
                expect($rootScope.overcommitted()).toBe(true);
            });

            it('should be false when there is no consumption', function() {
                spyOn(planService, 'getPlans').and.returnValue([{consumption:0}]);
                expect($rootScope.overcommitted()).toBe(false);
            });

            it('should be false when there is some consumption', function() {
                spyOn(planService, 'getPlans').and.returnValue([{consumption:50}]);
                expect($rootScope.overcommitted()).toBe(false);
            })
        });

        describe('iaas new plan', function()  {

            it('should add a new plan', function() {
                spyOn(planService, 'newPlan');
                $rootScope.newPlan();
                expect(planService.newPlan).toHaveBeenCalled();
            });

        });
    });
})();
