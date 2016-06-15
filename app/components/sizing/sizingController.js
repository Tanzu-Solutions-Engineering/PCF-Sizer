"use strict";
(function() {
    angular.module('SizerApp').controller('PCFSizingController', function($scope, $route, $routeParams, $location, $http, iaasService, sizingStorageService) {
    $scope.data = {};
    $scope.data.aiPackOptions = [];
    // console.log(iaasService.getVMs('Elastic Runtime'));
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
    $scope.data.ersVersionOptions = [
      {value: 1.7},
      {value: 1.6}
    ];

    $scope.data.avgRamOptions = [
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

    $scope.data.iaasCPUtoCoreRatioOptions = [
      {text: "2:1", ratio:2},
      {text: "4:1", ratio:4},
      {text: "8:1", ratio:8}
    ];

    $scope.data.installSizeSelectionList = [
      {
        id: 'small',
        name: 'Small',
        description: 'Small Size of PCF Foundation and Elastic Runtime for POC and Evalution',
        isDefault: true,
        avgRam: 1,
        avgAIDisk: 1,
        aiPacks: 1,
        azCount: 1,
        extraRunnersPerAZ : 0,
        isDisabled: false
      },
      {
        id: 'medium',
        name: 'Medium',
        description: 'Medium Size of PCF Foundation and Elastic Runtime for Dev and Test Env',
        avgRam: 1.5,
        avgAIDisk: 2,
        aiPacks: 2,
        azCount: 3,
        extraRunnersPerAZ : 0,
        isDefault: false,
        isDisabled: false
      },
      {
        id: 'large',
        name: 'Large',
        description: 'Large Size of PCF Foundation and Elastic Runtime for Multiple Dev/Test/Production Env',
        avgRam: 2,
        avgAIDisk: 3,
        aiPacks: 4,
        azCount: 3,
        extraRunnersPerAZ : 0,
        isDefault: false,
        isDisabled: false
      },
      {
        id: 'custom',
        name: 'Custom',
        description: 'Custom Size of PCF Foundation and Elastic Runtime where you can choose the AI Pack Size',
        avgRam: 2,
        avgAIDisk: 4,
        aiPacks: 4,
        azCount: 3,
        extraRunnersPerAZ : 0,
        isDefault: false,
        isDisabled: false
      }
    ];

    // $scope.data.iaasSelectionList = [
    //   {
    //     id: 'vsphere',
    //     name: 'vSphere',
    //     isDefault: true,
    //     isDisabled: false,
    //     pricingUrl: null
    //   },
    //   {
    //     id: 'aws',
    //     name: 'AWS',
    //     isDefault: false,
    //     isDisabled: false,
    //     pricingUrl: 'https://aws.amazon.com/ec2/pricing/'
    //   },
    //   {
    //     id: 'azure',
    //     name: 'Azure',
    //     isDefault: false,
    //     isDisabled: true,
    //     pricingUrl: null
    //   },{
    //     id: 'gcp',
    //     name: 'GCP',
    //     isDefault: false,
    //     isDisabled: true,
    //     pricingUrl: null
    //   },{
    //     id: 'openstack',
    //     name: 'OpenStack',
    //     isDefault: false,
    //     isDisabled: true,
    //     pricingUrl: null
    //   }
    // ];

    $scope.storage = sizingStorageService.data;
    $scope.data.selectedIaaS = _.find($scope.data.iaasSelectionList, {id: $scope.storage.selectedIaaS});
    // $scope.storage.elasticRuntimeConfig = {};

    $scope.data.elasticRuntimeConfig = {
      ersVersion: $scope.data.ersVersionOptions[0],
      avgRam: $scope.data.avgRamOptions[1],
      avgAIDisk:  $scope.data.avgAIDiskOptions[0],
      instanceType: {},
      runnerDisk: 0,
      runnerRam: 0,
      // pcfCompilationJobs: $scope.data.pcfCompilationJobsOptions[4],
      iaasCPUtoCoreRatio: $scope.data.iaasCPUtoCoreRatioOptions[1],
      aiPacks : $scope.data.aiPackOptions[0]
    };

      // $scope.chooser = { aiHelpMeChoose: false };

      // $scope.aiChooser = {
      // 	apps: 1,
      // 	devs: 1,
      // 	steps: 1
      // };

  	// This is the app instances formula. for "help me choose"
      // $scope.ais = function() {
      // 	var totalAis = $scope.aiChooser.apps
      // 			* $scope.aiChooser.devs
      // 			* $scope.aiChooser.steps;
      // 	var packs = (totalAis /  50) + 1;
      // 	return parseInt(packs);
      // };

      // $scope.setAis = function() {
      // 	$scope.aiPacks($scope.aiPackOptions[$scope.ais() - 1]);
      // };

      //refactor to use iaasService.getVms()


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
      var cellInfo = iaasService.getDiegoCellInfo();
      if (cellInfo !== undefined) {
        var choices = [];
        cellInfo.valid_instance_types.forEach(function(type) {
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
      }
    };

    // $scope.changeIaaS = function(iaas) {
      // iaasService.loadIaaSTemplate($scope.data.selectedIaaS.id).then(function() {
        // iaasService.loadERSTemplates($scope.data.selectedIaaS.id, $scope.data.elasticRuntimeConfig.ersVersion.value).then(function() {

        // });
      // });
    // };

    // $scope.changeIaaS($scope.storage.selectedIaaS);

    $scope.setElasticRuntimeConfig = function() {
      $scope.data.elasticRuntimeConfig.runnerDisk = $scope.data.elasticRuntimeConfig.instanceType.disk;
      $scope.data.elasticRuntimeConfig.runnerRAM = $scope.data.elasticRuntimeConfig.instanceType.ram;
      $scope.storage.elasticRuntimeConfig.avgAIRAM = $scope.data.elasticRuntimeConfig.avgRam.value;
      $scope.storage.elasticRuntimeConfig.avgAIDisk = $scope.data.elasticRuntimeConfig.avgAIDisk.value;
      $scope.storage.elasticRuntimeConfig.azCount = $scope.data.elasticRuntimeConfig.azCount;
      $scope.storage.elasticRuntimeConfig.extraRunnersPerAZ = $scope.data.elasticRuntimeConfig.extraRunnersPerAZ;
      $scope.storage.elasticRuntimeConfig.iaasCPUtoCoreRatio = $scope.data.elasticRuntimeConfig.iaasCPUtoCoreRatio.ratio;
    }

    $scope.fixedSizing = function (size) {
      $scope.storage.fixedSize = size;
      iaasService.addTileVMs('Elastic Runtime', size);
      $scope.data.instanceTypes = $scope.getAvailableCellTypes();
      var cellInfo = iaasService.getDiegoCellInfo();
      $scope.data.elasticRuntimeConfig.instanceType = _.find($scope.data.instanceTypes, {instance_type: cellInfo.instance_type});
      var selectedSize = _.find($scope.data.installSizeSelectionList, { id: size });
      $scope.data.sizingDescription = selectedSize.description;
      $scope.data.elasticRuntimeConfig.avgRam = _.find($scope.data.avgRamOptions, function(o) {
        if (o.value === selectedSize.avgRam) { return o; }
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
      iaasService.generateResourceSummary();
      iaasService.generateDiegoCellSummary();
    }

    $scope.fixedSizing($scope.storage.fixedSize);

    $scope.customSizing = function (size) {
      $scope.fixedSizing('custom');
      $scope.customSizeDropdownUpdated();
    };

    $scope.customSizeDropdownUpdated = function() {
      $scope.setAiPacks($scope.data.elasticRuntimeConfig.aiPacks.value);
      var cellInfo = iaasService.getDiegoCellInfo();
      var templateCellInfo = iaasService.getDiegoCellTemplateInfo();
      cellInfo.instanceInfo.ephemeral_disk = $scope.data.elasticRuntimeConfig.instanceType.disk;
      cellInfo.instanceInfo.ram = $scope.data.elasticRuntimeConfig.instanceType.ram;
      var numbersOfCellsBasedOnRam = ($scope.data.elasticRuntimeConfig.aiPacks.value * iaasService.getAIsPerPack() * $scope.data.elasticRuntimeConfig.avgRam.value) / (cellInfo.instanceInfo.ram - iaasService.getRamOverhead());
      var numbersOfCellsBasedOnDisk = ($scope.data.elasticRuntimeConfig.aiPacks.value * iaasService.getAIsPerPack() * $scope.data.elasticRuntimeConfig.avgAIDisk.value) / (cellInfo.instanceInfo.ephemeral_disk - iaasService.getDiskOverhead());
      cellInfo.instances = Math.ceil(Math.max(numbersOfCellsBasedOnRam, numbersOfCellsBasedOnDisk));
      cellInfo.instances += ($scope.data.elasticRuntimeConfig.azCount * $scope.data.elasticRuntimeConfig.extraRunnersPerAZ)
      $scope.updateStuff();
    };

    //when controller loads, make sure if custom size to recalculate resources
    if ($scope.storage.fixedSize === 'custom') {
      $scope.customSizeDropdownUpdated();
    }
  });
})();
