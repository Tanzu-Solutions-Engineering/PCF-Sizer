"use strict";
var iaasService = shekelApp.factory('iaasService', function($rootScope) {
    var iaasService = {
      aiPacks : 1,

      //contacts array to hold list of all contacts
      aiSelectionList : [{
            id: 0,
            name: 'Small',
            description: 'Small Size of PCF Foundation and Elastic Runtime for POC and Evalution',
            isDefault: true,
            runnerSizeDisk: {"text": "Small (32GB)", "size":32},
            runnerSize: { "text": "Small (16GB)", "size":16} ,
            avgRam: {value: 1},
            avgAIDisk: { value: 1  },
            pcfCompilationJobs: { value: 4  },
            aiCount: {"label": 50, "value": 1},
            azCount: 1,
            extraRunnersPerAZ : 0,
            isDisabled: false
          },{
            id: 1,
            name: 'Medium',
            description: 'Medium Size of PCF Foundation and Elastic Runtime for Dev and Test Env',
            runnerSizeDisk: {"text": "Medium (64GB)","size":64},
            runnerSize: { "text": "Medium (32GB)", "size":32} ,
            avgRam: {value: 1.5},
            avgAIDisk: { value: 2  },
            pcfCompilationJobs: { value: 6  },
            aiCount: {"label": 100, "value": 2},
            azCount: 3,
            extraRunnersPerAZ : 0,
            isDefault: false,
            isDisabled: false
          },{
            id: 2,
            name: 'Large',
            description: 'Large Size of PCF Foundation and Elastic Runtime for Multiple Dev/Test/Production Env',
            runnerSizeDisk: {"text": "Large (128GB)", "size":128},
            runnerSize: { "text": "Large (64GB)", "size":64} ,
            avgRam: {value: 2},
            avgAIDisk: { value: 4  },
            pcfCompilationJobs: { value: 8  },
            aiCount: {"label": 200, "value": 4},
            azCount: 3,
            extraRunnersPerAZ : 1,
            isDefault: false,
            isDisabled: false
          },{
            id: 3,
            name: 'Custom',
            description: 'Custom Size of PCF Foundation and Elastic Runtime where you can choose the AI Pack Size',
            isDefault: false,
            isDisabled: false
          }],

          //simply returns the ai list
         getAiSelectionList: function () {
             return this.aiSelectionList;
         },

         setAiPack: function(pack) {
             this.aiPacks = pack;
         },

         getAiPack: function() {
             return this.aiPacks;
         },

        iaasAskSummary: {ram: 1, disk: 1, vcpu: 1 , ip : 1, static_ips: 1, dynamic_ips: 1},

        //contacts array to hold list of all contacts
        iaasSelectionList : [{
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
            name: 'GCP',
            isDefault: false,
            isDisabled: true
          },{
            id: 4,
            name: 'OpenStack',
            isDefault: false,
            isDisabled: false
          }],

        selectedIaaS : function() {
          return this.iaasSelectionList[0]
        },

        //simply returns the iaaS list
        getIaasSelectionList: function () {
         return this.iaasSelectionList;
       },

        iaaS: function () {
          return this.selectedIaaS;
        },

        selectIaaS: function (iaaS) {
          if (iaaS == null) {
              //fall back to default
               var selectedIaaS = this.iaasSelectionList[0];
          } else {
               var selectedIaaS = this.iaasSelectionList[iaaS.id];
          }
          return selectedIaaS;
        },

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
    }
    return iaasService;

});
