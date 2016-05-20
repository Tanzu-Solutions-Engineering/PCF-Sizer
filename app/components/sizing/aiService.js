var aiService = shekelApp.factory('aiService', function ($rootScope) {
    var aiPacks = 1;

    function setAiPacks(pack) {
        aiPacks = pack;
    }

    function getAiPacks() {
        return aiPacks;
    }

    return {
        getAiPacks: getAiPacks,
        setAiPack: setAiPacks,
        getAiCount: function (){
            return this.getAiPacks() * 50;
        }
    }
});


shekelApp.service('aiSelectionService', function() {
  //contacts array to hold list of all contacts
  var aiSelectionList = [{
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
      }];

      //simply returns the ai list
     this.aiSelectionList = function () {
         return aiSelectionList;
     }


});
