'use strict';

(function() {
    describe('elasticRuntimeService', function() {
        var elasticRuntime, aiService, tileService, iaasService;

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

        beforeEach(module('ShekelApp'));

        beforeEach(inject(function ($injector) {
            elasticRuntime = $injector.get('elasticRuntime');
            aiService = $injector.get('aiService');
            tileService = $injector.get('tileService');
            iaasService = $injector.get('iaasService');
            iaasService.resetIaaSAsk();
        }));

        describe('defaults', function() {
            it('should default to 16 gig ram', function () {
                expect(elasticRuntime.config.runnerRAM).toBe(16);
            });

            it('should default to 64 gig of disk', function () {
                expect(elasticRuntime.config.runnerDisk).toBe(64);
            });

            it('should have 3 azs', function () {
                expect(elasticRuntime.config.azCount).toBe(3);
            });

            it('should set extraRunnersPerAZ to one', function () {
                expect(elasticRuntime.config.extraRunnersPerAZ).toBe(1);
            });

            it('should default to 1 gb average ai ram', function () {
                expect(elasticRuntime.config.avgAIRAM).toBe(1);
            });

            it('should default to 1 gb avg ai disk', function () {
                expect(elasticRuntime.config.avgAIDisk).toBe(.5);
            });

            it('should default to 4 compilation jobs', function () {
                expect(elasticRuntime.config.compilationJobs).toBe(4);
            });
        });

        describe('usable resource calculations', function() {
            beforeEach(function () {
                elasticRuntime.config.runnerRAM = 10;
                elasticRuntime.config.runnerDisk = 100;
            });

            describe('runnerUsableRAM', function() {

                it('should calculate total ram size - 3 gb', function () {
                    expect(elasticRuntime.runnerUsableRAM()).toBe(7);
                });
            });

            describe('runnerUsableStagers', function() {
                it('should calculate total stagers by disk size - ram size -4', function () {
                    expect(elasticRuntime.runnerUsableStager()).toBe(86);
                });
            });
        });

        describe('numRunnersToRunAIs', function() {
            it('should need 5 to run one ai pack at one gig', function () {
                aiService.setAiPack(1);
                expect(elasticRuntime.numRunnersToRunAIs()).toBe(4);
            });
        });

        describe('numRunnersPerAz', function() {
            it('spits the runners evenly across az', function () {
                elasticRuntime.config.azCount = 2;
                elasticRuntime.numRunnersToRunAIs = function() {
                    return 2;
                };
                expect(elasticRuntime.numRunnersPerAz()).toBe(2);
            });
        });

        describe('total runners', function() {
            it('should be the number of runners in each az times the number of azs', function () {
                elasticRuntime.config.azCount = 2;
                elasticRuntime.numRunnersPerAz = function() {
                    return 10;
                };

                expect(elasticRuntime.totalRunners()).toBe(20);
            });
        });


        describe('applyTemplate', function() {
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
            var compilation = {
                "vm": "Compilation",
                "instances": 4,
                "vcpu": 2,
                "ram": 1,
                "ephemeral_disk": 20,
                "persistent_disk": 0,
                "dynamic_ips": 1,
                "static_ips": 0,
                "singleton": true
            };
            var errand = {
                "vm": "Errand",
                "instances": 1,
                "vcpu": 1,
                "ram": 1,
                "ephemeral_disk": 1,
                "persistent_disk": 0,
                "dynamic_ips": 1,
                "static_ips": 0,
                "singleton": true
            };

            var cfg = null;
            beforeEach(function () {
                expect(tileService.tiles.length).toBe(0);

                tileService.addTile(tileService.ersName, '1.6', [opsMan, etcd, router, cell, compilation, errand]);
                expect(tileService.tiles.length).toBe(1);
                expect(tileService.getTile(tileService.ersName).currentConfig).toBeUndefined();
                elasticRuntime.config.azCount = 100;
                elasticRuntime.totalRunners = function () {
                    return 10;
                };
                elasticRuntime.applyTemplate([opsMan, router, cell, etcd, compilation, errand]);
                cfg = tileService.getTile(tileService.ersName).currentConfig;
            });

            function getVM(name) {
                for(var i = 0 ; i < cfg.length; i++) {
                    if ( cfg[i].vm == name) {
                        return cfg[i];
                    }
                }
            }

            describe('it should not ask for resources for disabled services', function() {

                it('should ask the iaas for additional', function () {
                    tileService.addTile('mysql', '1.6', [mysqlBroker]);
                    var origDisk = iaasService.iaasAskSummary.disk;
                    elasticRuntime.applyTemplate();
                    expect(iaasService.iaasAskSummary.disk).toBe(origDisk);
                    expect(tileService.getTile('mysql').currentConfig).toBeUndefined();
                });

                it('should add and then remove the service after we disable it', function () {
                    tileService.addTile('mysql', '1.6', [mysqlBroker]);
                    var origDisk = iaasService.iaasAskSummary.disk;
                    tileService.getTile('mysql').enabled = true;
                    elasticRuntime.applyTemplate();
                    expect(iaasService.iaasAskSummary.disk).toBeGreaterThan(origDisk);
                    expect(tileService.getTile('mysql').currentConfig).toBeDefined();
                    tileService.getTile('mysql').enabled = false;
                    elasticRuntime.applyTemplate();
                    expect(iaasService.iaasAskSummary.disk).toBe(origDisk);
                    expect(tileService.getTile('mysql').currentConfig).toBeUndefined();

                });
            });

            it('should build a current config for the ers release', function () {
                expect(cfg).toBeDefined();
            });

            it('should have an ers release with one vm in the current config', function() {
                expect(cfg.length).toBe(6);
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
                expect(iaasService.iaasAskSummary.disk).toEqual(1668);
            });

            describe('getVMS()', function() {
                it('gives me back something with vms and confgs', function () {
                    expect(tileService.getTile(tileService.ersName).currentConfig).toBeDefined();
                });
            });
        });

        describe('it applies templates for other services', function() {

            beforeEach(function () {
                tileService.addTile(tileService.ersName, '1.6', [mysqlBroker]);
                tileService.addTile('mysql', '1.7', [mysqlBroker]);
            });

            it('gives the mysql broker a current config', function () {
                expect(tileService.getTile('mysql').currentConfig).toBeUndefined();
                elasticRuntime.applyTemplate();
                expect(tileService.getTile('mysql').currentConfig).toBeDefined();
            });
        });

    });
})();