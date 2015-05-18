/*global describe, it */
'use strict';

(function () {
    describe('VersionController', function () {

		var $httpBackend, $rootScope, createController, requestHandler;

		beforeEach(module('ShekelApp')); 
		
	    beforeEach(inject(function($injector) {
	        // Set up the mock http service responses
	      	$httpBackend = $injector.get('$httpBackend');
	        // backend definition common for all tests
	        requestHandler =
				$httpBackend.when('GET', '/buildnumber')
	            	.respond({ "application_name": "test-version", "application_uris": [ "localhost:8080" ] });

	        // Get hold of a scope (i.e. the root scope)
	        $rootScope = $injector.get('$rootScope');
	        // The $controller service is used to create instances of controllers
	        var $controller = $injector.get('$controller');

	        createController = function() {
	          return $controller('ShekelVersionController', {'$scope' : $rootScope });
	        };
	      }));

		afterEach(function() {
			$httpBackend.verifyNoOutstandingExpectation();
			$httpBackend.verifyNoOutstandingRequest();
		});

        describe('should tell me the version', function () {
            it('should call the backend', function () {
				$httpBackend.expectGET('/buildnumber');
				createController();
				$httpBackend.flush();
				expect("test-version").toEqual($rootScope.version);
            });
        });
    });
})();