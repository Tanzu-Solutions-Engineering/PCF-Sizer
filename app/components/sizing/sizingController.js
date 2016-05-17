"use strict";



shekelApp.controller('ShekelSizingController', function($scope, $http, tileService, aiService,
                                                        iaasService, iaasSelectionService, aiSelectionService,elasticRuntime)
{


    $scope.aiPackOptions = [];
    $scope.setAIPackOptions = function() {      
        for ( var i = 1; i <= 300; ++i) {
    		$scope.aiPackOptions.push({ label: i + " ("+i*50+")", value: i});
    	}
    };

    $scope.setAIPackOptions();

    $scope.aiPacks = function(pack) {
    	if (angular.isDefined(pack)) {
    		aiService.setAiPack(pack.value);
    	}
        //Look up the right object by the number of ai packs the service keeps track of
		  return $scope.aiPackOptions[aiService.aiPacks() - 1];
    };

	/**
	 * When adding a new ERS version, ADD IT TO THE TOP OF THE LIST as the
	 * code defaults to index 0, which should always return the latest
	 * version
	 */
	$scope.ersVersionOptions = [
        {value: 1.7},
        {value: 1.6}

	];

  $scope.avgRamOptions = [
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

    $scope.runnerSizeOptions = [
	     {text: "Small (16GB)",     size:16},
	     {text: "Medium (32GB)",    size:32},
	     {text: "Large (64GB)",     size:64},
	     {text: "Bad idea (128GB)", size:128}
	 ];

    $scope.runnerSizeOptionsDisk =  [
         {text: "Small (32GB)",    size:32},
         {text: "Medium (64GB)",   size:64},
         {text: "Large (128GB)",   size:128},
         {text: "Crazy (256GB)",   size:256}
    ];

    $scope.avgAIDiskOptions = [
      { value: .5  },
	    { value: 1  },
	    { value: 2  },
	    { value: 4  },
	    { value: 8  }
    ];

    $scope.pcfCompilationJobsOptions = [
        { value: 0  },
        { value: 1  },
        { value: 2  },
        { value: 3  },
        { value: 4  },
        { value: 5  },
        { value: 6  },
        { value: 7  },
        { value: 8  },
        { value: 9  },
        { value: 10  }
    ];


    $scope.iaasCPUtoCoreRatioOptions = [
        {text: "2:1", ratio:2},
        {text: "4:1", ratio:4},
        {text: "8:1", ratio:8}
    ];

    $scope.platformConfigMapping = {
		  ersVersion: $scope.ersVersionOptions[0],
    	avgRam: $scope.avgRamOptions[1],
    	avgAIDisk:  $scope.avgAIDiskOptions[0],
    	runnerSize: $scope.runnerSizeOptions[0],
    	runnerSizeDisk: $scope.runnerSizeOptionsDisk[1],
    	pcfCompilationJobs: $scope.pcfCompilationJobsOptions[4],
    	iaasCPUtoCoreRatio: $scope.iaasCPUtoCoreRatioOptions[1],
      aiCount : $scope.aiPackOptions[0]
    };

    $scope.chooser = { aiHelpMeChoose: false };

    $scope.aiChooser = {
    	apps: 1,
    	devs: 1,
    	steps: 1
    };

    $scope.elasticRuntime = elasticRuntime;
    $scope.elasticRuntimeConfig = elasticRuntime.config;

	// This is the app instances formula. for "help me choose"
    $scope.ais = function() {
    	var totalAis = $scope.aiChooser.apps
    			* $scope.aiChooser.devs
    			* $scope.aiChooser.steps;
    	var packs = (totalAis /  50) + 1;
    	return parseInt(packs);
    };

    $scope.setAis = function() {
    	$scope.aiPacks($scope.aiPackOptions[$scope.ais() - 1]);
    };

	$scope.getVms = function() { return tileService.tiles; };

    $scope.getPhysicalCores = function() {
    	return roundUp(iaasService.iaasAskSummary.vcpu / $scope.platformConfigMapping.iaasCPUtoCoreRatio.ratio);
    };

    $scope.iaasAskSummary = function() {
        return iaasService.iaasAskSummary;
    };

    $scope.iaasSelectionList = iaasSelectionService.iaasList();

    $scope.setDefaultIaaS = function(iaaS) {
      $scope.selectedIaaS = iaasSelectionService.selectIaaS(iaaS);
      return iaasSelectionService.selectIaaS(iaaS);
    };


    $scope.ec2 = iaasSelectionService.selectEC2(0);

    $scope.setDefaultAWS = function(ec2) {
      return iaasSelectionService.selectEC2(ec2);
    };


    $scope.calculateAIDiskAsk = function(AIAvgDiskSizeInGB, NumAIPacks) {
        return AIAvgDiskSizeInGB * NumAIPacks * 50;
    };

    $scope.loadAzTemplate = function() {

        return $http.get('/ersjson/' + $scope.platformConfigMapping.ersVersion.value)
    		.success(function(data) {
                tileService.addTile(tileService.ersName, $scope.platformConfigMapping.ersVersion.value, data);
                tileService.enableTile(tileService.ersName);
                elasticRuntime.applyTemplate(tileService.getTile(tileService.ersName).template);
    		}).error(function(data) {
                alert("Failed to get PCF AZ Template json template");
    		});
    };

	$scope.loadAzTemplate();

  $scope.dropDownTriggerSizing = function () {
        elasticRuntime.applyTemplate();
        elasticRuntime.config.runnerDisk = $scope.platformConfigMapping.runnerSizeDisk.size;
        elasticRuntime.config.runnerRAM = $scope.platformConfigMapping.runnerSize.size;
        elasticRuntime.config.avgAIRAM = $scope.platformConfigMapping.avgRam.value;
        elasticRuntime.config.avgAIDisk = $scope.platformConfigMapping.avgAIDisk.value;
        elasticRuntime.config.compilationJobs = $scope.platformConfigMapping.pcfCompilationJobs.value;
	};

  $scope.aiList = aiSelectionService.aiSelectionList();
  $scope.fixedSize = 0;

  $scope.fixedSizing = function (size) {
    $scope.fixedSize = size;
    $scope.sizingDescription = $scope.aiList[size].description;
    $scope.platformConfigMapping.runnerSizeDisk = _.find($scope.runnerSizeOptionsDisk, function(o) {
      if (o.size === $scope.aiList[size].runnerSizeDisk.size) { return o; }
    });
    $scope.platformConfigMapping.runnerSize = _.find($scope.runnerSizeOptions, function(o) {
      if (o.size === $scope.aiList[size].runnerSize.size) { return o; }
    });
    $scope.platformConfigMapping.avgRam = _.find($scope.avgRamOptions, function(o) {
      if (o.value === $scope.aiList[size].avgRam.value) { return o; }
    });
    $scope.platformConfigMapping.avgAIDisk = _.find($scope.avgAIDiskOptions, function(o) {
      if (o.value === $scope.aiList[size].avgAIDisk.value) { return o; }
    });
    $scope.platformConfigMapping.pcfCompilationJobs = _.find($scope.pcfCompilationJobsOptions, function(o) {
      if (o.value === $scope.aiList[size].pcfCompilationJobs.value) { return o; }
    });
    $scope.platformConfigMapping.aiCount = _.find($scope.aiPackOptions, function(o) {
      if (o.value === $scope.aiList[size].aiCount.value) { return o; }
    });
    $scope.elasticRuntimeConfig.azCount = $scope.aiList[size].azCount;
    $scope.elasticRuntimeConfig.extraRunnersPerAZ = $scope.aiList[size].extraRunnersPerAZ;
    aiService.setAiPack($scope.aiList[size].aiCount.value)
    $scope.dropDownTriggerSizing();
  };

  $scope.fixedSizing(0);

  $scope.customSizing = function (size) {
    $scope.setAIPackOptions();
    $scope.fixedSizing(1); //default to settings for Medium size
    $scope.dropDownTriggerSizing();
    // This is for custom sizing
    $scope.fixedSize = size;
  }

});
