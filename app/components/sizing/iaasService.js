"use strict";
var iaasService = shekelApp.factory('iaasService', function($rootScope) {
    var iaas =  {
        iaasAskSummary: {ram: 1, disk: 1, vcpu: 1},
        resetIaaSAsk: function() {
            this.iaasAskSummary = {ram: 1, disk: 1, vcpu: 1}
        },
        doIaasAskForVM: function (vm) {
            this.iaasAskSummary.ram += vm.ram * vm.instances;
            this.iaasAskSummary.disk += (vm.persistent_disk + vm.ephemeral_disk + vm.ram) * vm.instances;
            this.iaasAskSummary.vcpu += vm.vcpu * vm.instances;
        },
        addRunnerDisk: function (aIAvgDiskSizeInGB, numAIPacks) {
            this.iaasAskSummary.disk += aIAvgDiskSizeInGB * numAIPacks * 50;
        }
    };

    return iaas;
});