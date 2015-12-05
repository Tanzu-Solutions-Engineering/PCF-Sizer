'use strict';

(function() {
    describe('iaasService', function() {
        var iaasService;

        beforeEach(module('ShekelApp'));

        beforeEach(inject(function($injector) {
            iaasService = $injector.get('iaasService');
        }));

        describe('resetIaaSAsk', function() {
            it('sets them all to one', function () {
                iaasService.iaasAskSummary.disk = 10;
                iaasService.iaasAskSummary.ram = 10;
                iaasService.iaasAskSummary.vcpu = 10;
                iaasService.resetIaaSAsk();

                expect(iaasService.iaasAskSummary.disk).toBe(1);
                expect(iaasService.iaasAskSummary.ram).toBe(1);
                expect(iaasService.iaasAskSummary.ram).toBe(1);
            });
        });

        describe('doIaasAskForVM', function() {

            var vm = {
                ram: 10,
                persistent_disk: 5,
                ephemeral_disk: 5,
                vcpu: 10,
                instances: 10
            };

            beforeEach(function () {
                iaasService.doIaasAskForVM(vm);
            });

            it('should add ram for all the instances', function () {
                expect(iaasService.iaasAskSummary.ram).toBe(101);
            });

            it('should add disk for all the instances', function () {
                expect(iaasService.iaasAskSummary.disk).toBe(201);
            });

            it('should add vcpu for all the instances', function () {
                expect(iaasService.iaasAskSummary.vcpu).toBe(101);
            });
        });

    });
})();