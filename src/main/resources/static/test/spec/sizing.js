/*global describe, it */
'use strict';

(function () {
    describe('sizingController', function () {

		var $rootScope, createController ;

		beforeEach(module('ShekelApp')); 
		
	    beforeEach(inject(function($injector) {
	        $rootScope = $injector.get('$rootScope');
	        // The $controller service is used to create instances of controllers
	        var $controller = $injector.get('$controller');

	        createController = function() {
	          return $controller('ShekelSizingController', {'$scope' : $rootScope });
	        };
	      }));


        describe('Test for Value in AI Pack Options', function () {
            it('Should not be null value', function () {
				createController();
				expect($rootScope.aiPackOptions.length).toBeGreaterThan(0);

            });
            
    
        });
        
        describe('Test for AI Average Ram Value > 0', function () {
            it('AI Avg Ram must have a Valid integer > 0', function () {
				createController();
				expect($rootScope.platform.avgRam.value).toBeGreaterThan(0);

            });
            
    
        });
        
        describe('Test for AI Average Stg Value > 0', function () {
            it('AI Avg Stg must have a Valid integer > 0', function () {
				createController();
				expect($rootScope.platform.avgAIDisk.value).toBeGreaterThan(0);

            });
            
    
        });
    });
})();
