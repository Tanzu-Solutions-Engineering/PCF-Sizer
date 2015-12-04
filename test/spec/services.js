'use strict';

(function() {
    describe('ShekelServicesController', function() {
        var $rootScope, createController, $httpBackend, vmLayout;
        var services = ['mysql', 'gemfire', 'rabbit', 'redis'];
        var mysqlVersions = ['1.6.5', '1.7.1', '1.6.4', '1.7', '1.3'];

        var vcenter =
            {
                "vm": "vCenter",
                "instances": 1,
                "vcpu": 2,
                "ram": 12,
                "ephemeral_disk": 0,
                "persistent_disk": 125,
                "dynamic_ips": 0,
                "static_ips": 1,
                "singleton": true
            };
        var opsMan =
            {
                "vm": "Ops Manager VM",
                "instances": 1,
                "vcpu": 2,
                "ram": 2,
                "ephemeral_disk": 0,
                "persistent_disk": 150,
                "dynamic_ips": 1,
                "static_ips": 0,
                "singleton": true
            };

        beforeEach(module('ShekelApp'));

        beforeEach(inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.when('GET', '/services').respond(services);
            $httpBackend.when('GET', '/services/mysql/versions').respond(mysqlVersions);
            $httpBackend.when('GET', '/services/gemfire/versions').respond(mysqlVersions);
            $httpBackend.when('GET', '/services/rabbit/versions').respond(mysqlVersions);
            $httpBackend.when('GET', '/services/redis/versions').respond(mysqlVersions);
            $rootScope = $injector.get('$rootScope');
            vmLayout = $injector.get('vmLayout');
            vmLayout.push(vcenter);
            vmLayout.push(opsMan);

            var $controller = $injector.get('$controller');
            createController = function() {
                return $controller('ShekelServiceSizingController', {
                    '$scope': $rootScope,
                    vmLayout: vmLayout
                });
            }
        }));

        afterEach(function() {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        describe('listing services', function() {

            beforeEach(function() {
                $httpBackend.expectGET('/services');
                createController();
                $httpBackend.flush();
            });

            it('should return a mysql and gemfire service', function() {
                var returnedServices = $rootScope.services();
                expect(returnedServices).toContain('mysql');
                expect(returnedServices).toContain('gemfire');
            });

            it ('should return as many services as the api returns', function() {
                expect($rootScope.services().length).toBe(services.length)
            });

            it('should initialize the version cache for all the services it finds so ng-repeat works', function() {
                expect(Array.isArray($rootScope.versioncache['mysql'].elements)).toBeTruthy();
                expect(Array.isArray($rootScope.versioncache['gemfire'].elements)).toBeTruthy();
            });

            it('should be disabled by default', function() {
                Object.keys($rootScope.versioncache).forEach(function (service) {
                    expect(service.enabled).toBeFalsy();
                });
            })
        });

        describe('listing versions and being ', function() {
            var versions = null;

            beforeEach(function() {
                $httpBackend.expectGET('/services/mysql/versions');
                createController();
                $rootScope.getServiceVersions('mysql').then(function(v) {
                    versions = v;
                });
                $httpBackend.flush();
            });

            it('Should return all the mysql versions', function() {
                expect(versions.elements.length).toBe(mysqlVersions.length);
            });

            //It selects the highest element in the versonings.
            it('should contain version 1.7 and select it by default', function() {
                expect(versions.elements).toContain('1.7');
                expect(versions.selected).toBe('1.7.1')
            });
        });

        describe('enabling a service', function() {
            beforeEach(function() {
                createController();
                $httpBackend.flush();

                $httpBackend.expectGET('/tile/mysql/1.7.1').respond(
                    [
                       {
                            "vm": "MySQL Broker",
                            "instances": 2,
                            "vcpu": 1,
                            "ram": 1,
                            "ephemeral_disk": 10,
                            "persistent_disk": 0,
                            "dynamic_ips": 1,
                            "static_ips": 1,
                            "singleton": false
                        }
                    ]
                );
            });

            afterEach(function() {
                $httpBackend.flush();
            });

            it('should add the vms to the vmlist when enabled', function() {
                var originalNumberOfVMs = vmLayout.length;
                $rootScope.toggleService('mysql').then(function() {
                    expect(originalNumberOfVMs).toBeLessThan(vmLayout.length);
                    expect(Array.isArray(vmLayout)).toBeTruthy();
                });
            });

            it('should have a vm named mysql broker at the end so we can group things in the vm list table', function() {
                $rootScope.toggleService('mysql').then(function() {
                    expect(vmLayout.length).toBe(3);
                    expect(vmLayout[2].vm).toBe("MySQL Broker");
                });
            });

            it('downloads the tiles json', function() {
                $rootScope.getTile('mysql', '1.7.1').then(function(tile) {
                    expect(tile).toBeDefined();
                });
            });
        });

    })
})();