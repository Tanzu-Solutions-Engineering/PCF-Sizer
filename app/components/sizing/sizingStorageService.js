"use strict";

(function() {
  angular.module('sizerApp').factory('sizingStorageService', function() {
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
          ersVersion: ''
        },
        services: {},
        fixedSize: 'small'
      }
    };
    return service;
  });
})();
