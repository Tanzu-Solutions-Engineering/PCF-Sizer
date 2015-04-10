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
            it('should call the backend', function () {
				createController();
				expect($rootScope.aiPackOptions.length).toBeGreaterThan(0);

            });
        });
    });
})();
