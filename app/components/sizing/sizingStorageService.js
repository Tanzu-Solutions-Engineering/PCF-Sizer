"use strict";

(function() {
  shekelApp.factory('sizingStorageService', function() {
    var service = {
      data: {
        aiPacks: 0,
        serviceAICount: 0,
        selectedIaaS: null,
        elasticRuntimeConfig: {
          runnerRAM:0,
          runnerDisk:0,
          azCount: 0,
          extraRunnersPerAZ: 0,
          avgAIRAM: 0,
          avgAIDisk: 0,
          compilationJobs: 0
        },
        fixedSize: 'small'
      }
    };

    return service;
  });
})();
