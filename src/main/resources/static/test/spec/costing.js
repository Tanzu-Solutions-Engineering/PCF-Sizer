"use strict";

(function () {

    describe('ShekelCostingController', function() {

        var $rootScope, createController;

        beforeEach(module('ShekelApp'));

        beforeEach(inject(function($injector) {
            $rootScope = $injector.get('$rootScope');

            var $controller = $injector.get('$controller');
            createController = function() {
                return $controller('ShekelCostingController', {'$scope': $rootScope})
            }
        }))


        describe('IaaS consumption', function() {
            beforeEach( function () { createController() });

            it('should fail', function() {
                fail();
            });
        });

    });
})();