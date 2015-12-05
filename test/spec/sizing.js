'use strict';

(function () {
    describe('sizingController', function () {

		var $rootScope, createController, $httpBackend, tileService, iaasService;

		beforeEach(module('ShekelApp')); 
		
	    beforeEach(inject(function($injector) {
            $httpBackend = $injector.get('$httpBackend');
            $rootScope = $injector.get('$rootScope');
            iaasService = $injector.get('iaasService');
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

        describe('IaaS asks', function() {
            it('should reset iaas ask', function () {
                $rootScope.iaasAskSummary = {};
                iaasService.resetIaaSAsk();
                expect(iaasService.iaasAskSummary.ram).toBe(1);
                expect(iaasService.iaasAskSummary.disk).toBe(1);
                expect(iaasService.iaasAskSummary.vcpu).toBe(1);
            });

            it('should ask for the number of ai packs times the number of disks for ai disk needs', function () {
                expect($rootScope.calculateAIDiskAsk(1, 1)).toEqual(50);
                expect($rootScope.calculateAIDiskAsk(1, 2)).toEqual(100);
                expect($rootScope.calculateAIDiskAsk(.5, 2)).toEqual(50);
            });
        });

        describe('apply template', function() {
            var opsMan = {
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

            var cell = {
                "vm": "Diego Cell",
                "instances": 2,
                "vcpu": 2,
                "ram": 16,
                "ephemeral_disk": 64,
                "persistent_disk": 0,
                "dynamic_ips": 1,
                "static_ips": 0,
                "singleton": false
            };

            var etcd = {
                "vm": "etcd",
                "instances": 1,
                "vcpu": 1,
                "ram": 1,
                "ephemeral_disk": 2,
                "persistent_disk": 1,
                "dynamic_ips": 1,
                "static_ips": 0,
                "singleton": true
            };

            var router = {
                "vm": "Router",
                "instances": 2,
                "vcpu": 1,
                "ram": 1,
                "ephemeral_disk": 2,
                "persistent_disk": 0,
                "dynamic_ips": 1,
                "static_ips": 1,
                "singleton": false
            };

            var cfg = null;
            beforeEach(function () {
                tileService.addTile($rootScope.ersName, '1.6', [opsMan, etcd, router, cell]);
                expect(tileService.tiles.length).toBe(1);
                expect(tileService.getTile($rootScope.ersName).currentConfig).toBeUndefined();
                $rootScope.platform.numAZ = 100;
                $rootScope.totalRunners = function () {
                    return 10;
                };
                $rootScope.applyTemplate([opsMan, router, cell, etcd]);
                cfg = tileService.getTile($rootScope.ersName).currentConfig;

            });

            function getVM(name) {
                for(var i = 0 ; i < cfg.length; i++) {
                    if ( cfg[i].vm == name) {
                        return cfg[i];
                    }
                }
            }

            it('should build a current config for the ers release', function () {
                expect(cfg).toBeDefined();
            });

            it('should have an ers release with one vm in the current config', function() {
                expect(cfg.length).toBe(4);
            });

            it('should have only one etcd with 100 az', function() {
                var etcd = getVM('etcd');
                expect(etcd.instances).toBe(1);
            });

            it('should have 200 router vms', function() {
                expect(getVM('Router').instances).toBe(200);
            });

            it('should have one opsman', function() {
                expect(getVM('Ops Manager VM').instances).toBe(1);
            });

            it('should have 10 runners because we mocked it above', function() {
                expect(getVM('Diego Cell').instances).toBe(10);
            });

            it('calculates disk ask after applying template', function () {
                expect(iaasService.iaasAskSummary.disk).toEqual(1582);
            });

            describe('getVMS()', function() {
                it('gives me back something with vms and confgs', function () {
                    var vms = $rootScope.getVms();
                    expect(vms).toBeDefined();
                    expect(vms[0].currentConfig).toBeDefined();
                });
            });
        });

        describe('loadAZTemplate', function() {
            
            it('adds the ers tile', function () {
                $rootScope.loadAzTemplate().then(function() {
                    expect(tileService.getTile($rootScope.ersName)).toBeDefined();
                });
            });

            it('applies the template', function () {
                var called = false;
                $rootScope.applyTemplate = function (template) {
                    expect(template).toBeDefined();
                    called = true;
                };

                $rootScope.loadAzTemplate().then(function () {
                    expect(called).toBeTruthy();
                })
            });
        });

        describe('it applies templates for other services', function() {

            var mysqlBroker = {
                "vm": "MySQL Broker",
                "instances": 2,
                "vcpu": 1,
                "ram": 1,
                "ephemeral_disk": 10,
                "persistent_disk": 0,
                "dynamic_ips": 1,
                "static_ips": 1,
                "singleton": false
            };

            beforeEach(function () {
                tileService.addTile($rootScope.ersName, '1.6', [mysqlBroker]);
                tileService.addTile('mysql', '1.7', [mysqlBroker]);
            });

            it('gives the mysql broker a current config', function () {
                expect(tileService.getTile('mysql').currentConfig).toBeUndefined();
                $rootScope.applyTemplate();
                expect(tileService.getTile('mysql').currentConfig).toBeDefined();
            });
        });

    });
})();
