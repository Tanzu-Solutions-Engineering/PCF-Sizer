"use strict";
(function() {
    angular.module('sizerApp').controller('PCFSizingController', function($scope, $route, $routeParams, $location, $http, iaasService, sizingStorageService) {
    $scope.data = {};
    $scope.data.aiPackOptions = [];
    $scope.setAIPackOptions = function() {
      for (var i = 1; i <= 300; ++i) {
        $scope.data.aiPackOptions.push({ label: i + " ("+i*50+")", value: i});
      }
    };

    $scope.setAIPackOptions();

    $scope.setAiPacks = function(pack) {
      if (angular.isDefined(pack)) {
        $scope.storage.aiPacks = pack;
      }
        //Look up the right object by the number of ai packs the service keeps track of
      return $scope.data.aiPackOptions[$scope.storage.aiPacks - 1];
    };

  	/**
  	 * When adding a new ERS version, ADD IT TO THE TOP OF THE LIST as the
  	 * code defaults to index 0, which should always return the latest
  	 * version
  	 */
    $scope.data.ersVersionOptions = iaasService.getPCFVersions();

    $scope.data.avgAIRamOptions = [
      { value: .5 },
      { value: 1  },
      { value: 1.5},
      { value: 2  },
      { value: 2.5},
      { value: 3  },
      { value: 4  },
      { value: 6  },
      { value: 10 },
      { value: 20 }
    ];

    $scope.data.avgAIDiskOptions = [
      { value: .5  },
      { value: 1  },
      { value: 2  },
      { value: 3  },
      { value: 4  },
      { value: 8  }
    ];

    $scope.data.availabilityZones = [
      1,
      2,
      3,
      4,
      5,
      6
    ];

    $scope.data.extraCellsPerAZ = [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10
    ];
    $scope.data.numberOfInstances = [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      20,
      30,
      40,
      50,
      75,
      100,
      150,
      200
    ];
    $scope.data.persistentDiskOptions = [
      0,
      1,
      2,
      5,
      10,
      20,
      30,
      50,
      75,
      100,
      150,
      200,
      300,
      500,
      740,
      1000,
      2000,
      5000,
      10000,
      160000
    ]

    $scope.data.iaasCPUtoCoreRatioOptions = [
      {text: "2:1", ratio:2},
      {text: "4:1", ratio:4},
      {text: "8:1", ratio:8},
      {text: "16:1", ratio:16}
    ];

    $scope.data.installSizeSelectionList = iaasService.pcfInstallSizes;
    $scope.storage = sizingStorageService.data;
    $scope.data.selectedIaaS = _.find(iaasService.iaasSelectionList, {id: $scope.storage.selectedIaaS});

    $scope.data.elasticRuntimeConfig = {
      avgAIRam: $scope.data.avgAIRamOptions[1],
      avgAIDisk:  $scope.data.avgAIDiskOptions[0],
      instanceType: {},
      runnerDisk: 0,
      runnerRam: 0,
      iaasCPUtoCoreRatio: $scope.data.iaasCPUtoCoreRatioOptions[1],
      aiPacks : $scope.data.aiPackOptions[0]
    };

    $scope.updateEstimatedApplicationSize = function() {
      var cell = iaasService.getDiegoCellInfo();
      var size = $scope.storage.fixedSize;
      if (cell !== undefined) {
        var instanceType = _.find(iaasService.getInstanceTypes(), {name: cell.instance_type});
        $scope.data.elasticRuntimeConfig.runnerRam = instanceType.ram;
        $scope.data.elasticRuntimeConfig.runnerDisk = instanceType.ephemeral_disk;
      }
    };

    $scope.getAvailableCellTypes = function() {
      var cell = iaasService.getDiegoCellInfo();
      return $scope.getAvailableInstanceTypes(cell);
    };

    $scope.getAvailableInstanceTypes = function(vm) {
      var choices = [];
      vm.valid_instance_types.forEach(function(type) {
        var specs = iaasService.getInstanceTypeInfo(type);
        choices.push({
          instance_type: type,
          cpu: specs.cpu,
          ram: specs.ram,
          cost: specs.cost,
          disk: specs.ephemeral_disk
        });
      });
      return choices;
    };

    $scope.getInstanceTypeInfo = function(instanceType) {
      return iaasService.getInstanceTypeInfo(instanceType);
    }

    $scope.setElasticRuntimeConfig = function() {
      $scope.data.elasticRuntimeConfig.runnerDisk = $scope.data.elasticRuntimeConfig.instanceType.disk;
      $scope.data.elasticRuntimeConfig.runnerRAM = $scope.data.elasticRuntimeConfig.instanceType.ram;
      $scope.storage.elasticRuntimeConfig.diegoCellInstanceType = $scope.data.elasticRuntimeConfig.instanceType.instance_type;
      $scope.storage.elasticRuntimeConfig.avgAIRAM = $scope.data.elasticRuntimeConfig.avgAIRam.value;
      $scope.storage.elasticRuntimeConfig.avgAIDisk = $scope.data.elasticRuntimeConfig.avgAIDisk.value;
      $scope.storage.elasticRuntimeConfig.azCount = $scope.data.elasticRuntimeConfig.azCount;
      $scope.storage.elasticRuntimeConfig.extraRunnersPerAZ = $scope.data.elasticRuntimeConfig.extraRunnersPerAZ;
      $scope.storage.elasticRuntimeConfig.iaasCPUtoCoreRatio = $scope.data.elasticRuntimeConfig.iaasCPUtoCoreRatio.ratio;
    }

    $scope.loadVMs = function(size, version) {
      iaasService.addTileVMs('Elastic Runtime', size, version);
      $scope.data.services = iaasService.getServices();
    }

    $scope.fixedSizing = function (size) {
      var version = $scope.storage.elasticRuntimeConfig.ersVersion;
      $scope.loadVMs(size, version);
      $scope.storage.fixedSize = size;
      $scope.data.instanceTypes = $scope.getAvailableCellTypes();
      var cellInfo = iaasService.getDiegoCellInfo();
      $scope.data.elasticRuntimeConfig.instanceType = _.find($scope.data.instanceTypes, {instance_type: cellInfo.instance_type});
      var selectedSize = _.find($scope.data.installSizeSelectionList[$scope.storage.elasticRuntimeConfig.ersVersion], {size: size});
      $scope.data.selectedSize = selectedSize
      $scope.data.sizingDescription = selectedSize.description;
      $scope.data.elasticRuntimeConfig.avgAIRam = _.find($scope.data.avgAIRamOptions, function(o) {
        if (o.value === selectedSize.avgAIRam) { return o; }
      });
      $scope.data.elasticRuntimeConfig.avgAIDisk = _.find($scope.data.avgAIDiskOptions, function(o) {
        if (o.value === selectedSize.avgAIDisk) { return o; }
      });
      $scope.data.elasticRuntimeConfig.aiPacks = _.find($scope.data.aiPackOptions, function(o) {
        if (o.value === selectedSize.aiPacks) { return o; }
      });
      $scope.data.elasticRuntimeConfig.azCount = selectedSize.azCount;
      $scope.data.elasticRuntimeConfig.extraRunnersPerAZ = selectedSize.extraRunnersPerAZ;
      $scope.setAiPacks(selectedSize.aiPacks);
      $scope.updateStuff();
    };


    $scope.updateStuff = function() {
      $scope.setElasticRuntimeConfig();
      $scope.updateEstimatedApplicationSize();
      iaasService.calculateDiegoCellCount();
      iaasService.generateResourceSummary();
      iaasService.generateDiegoCellSummary();
    };

    $scope.toggleService = function(service) {
      $scope.storage.services[service].configure = false;
      if ($scope.storage.services[service].enabled === true) {
        var version = $scope.storage.services[service].version;
        if (version === undefined) { //version not set yet, set a default
          version = _.first(iaasService.getTemplateVMVersions(service));
          $scope.storage.services[service].version = version; //set the version in storage
        }
        $scope.addServiceVMs(service, version);
      } else {
        iaasService.removeVMs(service);
        $scope.storage.services[service] = {}; //remove all config saved in storage for the service
      }
      $scope.storage.serviceAICount = iaasService.getServiceAICount();
      $scope.updateStuff();
    };

    $scope.addServiceVMs = function(service, version) {
      iaasService.addTileVMs(service, 'all', version);
      $scope.storage.services[service].vms = [];
      iaasService.getVMs(service).forEach(function(vm) {
        var vmInfo = {
          name: vm.vm,
          instances: vm.instances,
          instance_type: vm.instance_type,
          persistent_disk: vm.persistent_disk
        };
        $scope.storage.services[service].vms.push(vmInfo);
      });
    };

    $scope.getServiceVMs = function(service) {
      return iaasService.getVMs(service);
    };

    $scope.customSizing = function (size) {
      $scope.fixedSizing('custom');
      $scope.customSizeDropdownUpdated();
    };

    $scope.customSizeDropdownUpdated = function() {
      $scope.setAiPacks($scope.data.elasticRuntimeConfig.aiPacks.value);
      var cellInfo = iaasService.getDiegoCellInfo();
      cellInfo.instance_type = $scope.data.elasticRuntimeConfig.instanceType.instance_type;
      cellInfo.instanceInfo.cpu = $scope.data.elasticRuntimeConfig.instanceType.cpu;
      cellInfo.instanceInfo.ephemeral_disk = $scope.data.elasticRuntimeConfig.instanceType.disk;
      cellInfo.instanceInfo.ram = $scope.data.elasticRuntimeConfig.instanceType.ram;
      $scope.updateStuff();
    };

    $scope.serviceUpdated = function(service, vm) {
      var instanceInfo = iaasService.getInstanceTypeInfo(vm.instance_type);
      var storedVM = _.find($scope.storage.services[service].vms, {name: vm.vm});
      //update storage
      storedVM.instances = vm.instances;
      storedVM.instance_type = vm.instance_type;
      storedVM.persistent_disk = vm.persistent_disk;

      //update existing VM info
      vm.instanceInfo.name = instanceInfo.name;
      vm.instanceInfo.cpu = instanceInfo.cpu;
      vm.instanceInfo.ram = instanceInfo.ram;
      vm.instanceInfo.ephemeral_disk = instanceInfo.ephemeral_disk;
      $scope.updateStuff();
    };

    $scope.serviceCountUpdated = function(service, vm) {
      var storedVM = _.find($scope.storage.services[service].vms, {name: vm.vm});
      storedVM.instances = vm.instances;
      $scope.storage.serviceAICount = iaasService.getServiceAICount();
      $scope.updateStuff();
    }

    $scope.serviceVersionChanged = function(service) {
      var version = $scope.storage.services[service].version;
      $scope.addServiceVMs(service, version);
      $scope.updateStuff();
    }

    $scope.pcfVersionChanged = function() {
      $scope.fixedSizing($scope.storage.fixedSize);
    }

    $scope.fixedSizing($scope.storage.fixedSize);
    //when controller loads, make sure if custom size to recalculate resources
    if ($scope.storage.fixedSize === 'custom') {
      $scope.customSizeDropdownUpdated();
    }
  });
})();
