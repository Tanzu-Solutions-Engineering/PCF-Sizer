"use strict";
var iaasService = shekelApp.factory('iaasService', function($rootScope) {
    var iaas =  {
        iaasAskSummary: {ram: 1, disk: 1, vcpu: 1 , ip : 1, static_ips: 1, dynamic_ips: 1},
        resetIaaSAsk: function() {
            this.iaasAskSummary = {ram: 1, disk: 1, vcpu: 1, ip: 1, static_ips: 1, dynamic_ips: 1}
        },
        doIaasAskForVM: function (vm) {
            this.iaasAskSummary.ram += vm.ram * vm.instances;
            var pdisk = vm.persistent_disk ? vm.persistent_disk : 0
            this.iaasAskSummary.disk += (pdisk + vm.ephemeral_disk + vm.ram) * vm.instances;
            this.iaasAskSummary.vcpu += vm.vcpu * vm.instances;
            if ((vm.static_ips)  || (vm.dynamic_ups))
               this.iaasAskSummary.ip += (vm.static_ips + vm.dynamic_ips) * vm.instances;
        },
        addRunnerDisk: function (aIAvgDiskSizeInGB, numAIPacks) {
            this.iaasAskSummary.disk += aIAvgDiskSizeInGB * numAIPacks * 50;
        }
    };

    return iaas;
});
