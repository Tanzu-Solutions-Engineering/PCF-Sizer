/*global describe, it */
'use strict';

(function () {
    describe('sizingController', function () {

		var $rootScope, createController, $httpBackend, tileService ;

		beforeEach(module('ShekelApp')); 
		
	    beforeEach(inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $rootScope = $injector.get('$rootScope');
	        tileService = $injector.get('tileService');
            var $controller = $injector.get('$controller');

	        createController = function() {
	          return $controller('ShekelSizingController',
                  {
                      '$scope' : $rootScope,
                      tileService: tileService
                  });
	        };
            createController();
	      }));


        describe('Value in AI Pack Options', function () {
            it('Should not be null value', function () {
				expect($rootScope.aiPackOptions.length).toBeGreaterThan(0);
            });
        });
        
        describe('AI Average Ram Value > 0', function () {
            it('AI Avg Ram must have a Valid integer > 0', function () {
				expect($rootScope.platform.avgRam.value).toBeGreaterThan(0);
            });
        });
        
        describe('Test for AI Average Stg Value > 0', function () {
            it('AI Avg Stg must have a Valid integer > 0', function () {
				expect($rootScope.platform.avgAIDisk.value).toBeGreaterThan(0);
            });
        });

		describe('Loading ERS template', function() {
           it('should load it in the tile service', function() {
               $httpBackend.when('GET', '/ersjson/1.6').respond("{}");
               expect(tileService.tiles.length).toBe(0);
               $rootScope.loadAzTemplate().then(function() {
                  expect(tileService.tiles.length).toBe(1);
               });
               $httpBackend.flush();
           });
        });

        describe('reset to apply templates', function () {
            it('should reset iaas ask', function () {
                $rootScope.iaasAskSummary = {};
                $rootScope.resetIaaSAsk();
                expect($rootScope.iaasAskSummary.ram).toBe(1);
                expect($rootScope.iaasAskSummary.disk).toBe(1);
                expect($rootScope.iaasAskSummary.vcpu).toBe(1);
            });
        });

    });
})();
