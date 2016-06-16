"use strict";

(function() {
  angular.module('SizerApp').factory('sizingStorageService', function() {
    var service = {
      data: {
        aiPacks: 0,
        serviceAICount: 0,
        selectedIaaS: 'vsphere',
        elasticRuntimeConfig: {
          azCount: 0,
          extraRunnersPerAZ: 0,
          avgAIRAM: 0,
          avgAIDisk: 0,
          compilationJobs: 0,
          ersVersion: 1.7
        },
        fixedSize: 'small'
      }
    };
    return service;
  });
})();
