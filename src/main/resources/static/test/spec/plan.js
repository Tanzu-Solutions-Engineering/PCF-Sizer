'use strict';

(function() {

    describe('ShekelPlanController', function() {

        var $rootScope, createController;

        beforeEach(module('ShekelApp'));

        beforeEach(inject(function($injector) {
            $rootScope = $injector.get('$rootScope');
            var $controller = $injector.get('$controller');

            createController = function () {
                return $controller('ShekelPlanController', {'$scope': $rootScope});
            };
        }));


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

    });
})();
