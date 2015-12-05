"use strict";
var iaasService = shekelApp.factory('iaasService', function($rootScope) {
    return {
        iaasAskSummary: {ram: 1, disk: 1, vcpu: 1},
        resetIaaSAsk: function() {
            this.iaasAskSummary = {ram: 1, disk: 1, vcpu: 1}
        },
        doIaasAskForVM: function (vm) {
            this.iaasAskSummary.ram += vm.ram * vm.instances;
            this.iaasAskSummary.disk += (vm.persistent_disk + vm.ephemeral_disk + vm.ram) * vm.instances;
            this.iaasAskSummary.vcpu += vm.vcpu * vm.instances;
        }
    };
});