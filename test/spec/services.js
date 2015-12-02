'use strict';

(function() {
    describe('ShekelServicesController', function() {
        var $rootScope, createController, $httpBackend;
        var services = ['mysql', 'gemfire', 'rabbit', 'redis'];
        beforeEach(module('ShekelApp'));

        beforeEach(inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.when('GET', '/services').respond(services);
            $rootScope = $injector.get('$rootScope');
            var $controller = $injector.get('$controller');
            createController = function() {
                return $controller('ShekelServiceSizingController', {'$scope': $rootScope });
            }
        }));

        beforeEach(function() {
            $httpBackend.expectGET('/services');
            createController();
            $httpBackend.flush();
        });

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });


        it('should return a mysql and gemfire service', function() {
            var returnedServices = $rootScope.services();
            expect(returnedServices).toContain('mysql');
            expect(returnedServices).toContain('gemfire');
        });

        it ('should return as many services as the api returns', function() {
            expect($rootScope.services().length).toBe(services.length)
        })
    })
})();