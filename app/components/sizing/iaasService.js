"use strict";
shekelApp.service('iaasSelectionService', function() {
  //contacts array to hold list of all contacts
  var iaasSelectionList = [{
        id: 0,
        name: 'vSphere',
        isDefault: true,
        isDisabled: false
      },{
        id: 1,
        name: 'AWS',
        isDefault: false,
        isDisabled: false
      },{
        id: 2,
        name: 'Azure',
        isDefault: false,
        isDisabled: false
      },{
        id: 3,
        name: 'GCE',
        isDefault: false,
        isDisabled: true
      },{
        id: 4,
        name: 'OpenStack',
        isDefault: false,
        isDisabled: false
      }];

      var selectedIaaS = iaasSelectionList[0];
      //simply returns the iaaS list
     this.iaasList = function () {
         return iaasSelectionList;
     }

     this.iaaS = function () {
        return selectedIaaS;
     }

     this.selectIaaS = function (iaaS) {
       if (iaaS == null) {
            //fall back to default
            this.selectedIaaS = iaasSelectionList[0];
        } else {
            this.selectedIaas = iaasSelectionList[iaaS.id];
        }
        console.log("In selectIaaS Iaas " + this.selectedIaas.id);
        return this.selectedIaaS;
     }

     var ec2 = "0";

     this.selectEC2 = function (ec2) {
         if (ec2 == null) {
              //fall back to default
              this.ec2 = "0";
          } else {
              this.ec2 = ec2;
          }
          return this.ec2;
       }


});


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
