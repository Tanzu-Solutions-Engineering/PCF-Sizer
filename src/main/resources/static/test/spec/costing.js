"use strict";

(function () {

    describe('ShekelCostingController', function() {

        var $rootScope, createController, planService, aiService;

        beforeEach(module('ShekelApp'));

        beforeEach(inject(function($injector) {
            $rootScope = $injector.get('$rootScope');

            var $controller = $injector.get('$controller');
            planService = $injector.get('planService');
            aiService = $injector.get('aiService');
            createController = function() {
                return $controller('ShekelCostingController',
                    {
                        '$scope': $rootScope,
                        'aiService': aiService
                    });
            };
        }));

        beforeEach(function() {
            aiService.aiPacks = function() { return { label: "0", value: 0} };
        });

        beforeEach( function () {
            createController()
        });

        beforeEach(function() {
            planService.getPlans().length = 0;
            planService.getPlans().push(planService.defaultPlan());
            $rootScope.buildRunCards(planService.getPlans());
        });

        describe('IaaS CPU consumption', function() {

            beforeEach(function () {
                $rootScope.aiAvgVcpu = function( ) { return 0.2; };
            });

            it('should run out of CPU in the first month', function() {
                $rootScope.deaVcpu = function() { return 0; };
                $rootScope.markupRuncard();
                expect($rootScope.runCards[0].runCard[0].oversubscribed).toContain("VCPU");
            });

            it('should be out of CPU and RAM in the first Month', function() {
                $rootScope.deaVcpu = function() { return 0; };
                $rootScope.deaRam = function() { return 0; };

                $rootScope.markupRuncard();
                expect($rootScope.runCards[0].runCard[0].oversubscribed).toContain("VCPU");
            });
        });

        describe('AI Consumption', function() {

            it('should run out of ais in the first month', function() {
                $rootScope.markupRuncard();
                expect($rootScope.runCards[0].runCard[0].oversubscribed).toContain("AI");
            });
        });


        describe('IaaS RAM consumption', function() {

            beforeEach(function() {
                aiService.aiPacks = function() { return { label: "0", value: 100000} };
            });

            it('should run out of memory in the first month', function() {
                $rootScope.deaRam = function() { return 0; };
                $rootScope.markupRuncard();
                expect($rootScope.runCards[0].runCard[0].oversubscribed).toContain("RAM");
            });

            it('should run out of memory in the 5th month', function() {
                $rootScope.deaRam = function() { return 10; };
                var card = $rootScope.runCards[0];
                for (var i = 0; i < 6; ++i) {
                    card.runCard[i].ais = i + 1;
                }
                $rootScope.markupRuncard();
                expect($rootScope.runCards[0].runCard[4].oversubscribed.length).toBe(0);
                expect($rootScope.runCards[0].runCard[5].oversubscribed).toContain("RAM");
            });
        });
    });
})();