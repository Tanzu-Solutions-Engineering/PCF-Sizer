"use strict";

shekelApp.controller('ShekelSizingController', function($scope, $http, vmLayout, aiService) {

    $scope.aiPackOptions = new Array();

    $scope.setAIPackOptions = function() {
    	for ( var i = 1; i <= 300; ++i) {
    		$scope.aiPackOptions.push({ label: i + " ("+i*50+")", value: i});
    	}
    }

    $scope.setAIPackOptions();

    $scope.aiPacks = function(pack) {
    	if (angular.isDefined(pack)) {
    		aiService.setAiPack(pack);
    	}
		return aiService.aiPacks();
    }

    aiService.setAiPack($scope.aiPackOptions[0]);

	/**
	 * When adding a new ERS version, ADD IT TO THE TOP OF THE LIST as the
	 * code defaults to index 0, which should always return the latest
	 * version
	 */
	$scope.ersVersionOptions = [
		{value: 1.5},
		{value: 1.4}
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

    $scope.deaSizeOptions = [
	     {"text": "Small (16GB RAM)",    "size":16},
	     {"text": "Medium (32GB RAM)",   "size":32},
	     {"text": "Large (64GB RAM)",    "size":64},
	     {"text": "Bad idea (128GB RAM)", "size":128}
	 ];

    $scope.deaSizeOptionsDisk =  [
         {"text": "Small (32GB)",    "size":32},
         {"text": "Medium (64GB)",   "size":64},
         {"text": "Large (128GB)",    "size":128},
         {"text": "Crazy (256GB)",    "size":256}
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
        {"text": "2:1", "ratio":2},
        {"text": "4:1", "ratio":4},
        {"text": "8:1", "ratio":8}
    ];

    $scope.platform = {
		ersVersion: $scope.ersVersionOptions[0],
    	avgRam: $scope.avgRamOptions[1],
    	avgAIDisk:  $scope.avgAIDiskOptions[0],
    	deaSize: $scope.deaSizeOptions[0],
    	deaSizeDisk: $scope.deaSizeOptionsDisk[0],
        numAZ: 2,
    	nPlusX: 1,
    	pcfCompilationJobs: $scope.pcfCompilationJobsOptions[4],
    	iaasCPUtoCoreRatio: $scope.iaasCPUtoCoreRatioOptions[1],
    };

    $scope.aZRecoveryCapacity = [25, 50, 100];

    $scope.chooser = { aiHelpMeChoose: false }

    $scope.aiChooser = {
    	apps: 1,
    	devs: 1,
    	steps: 1
    };

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

    $scope.deaUsableRam = function() {
    	return $scope.platform.deaSize.size - 3;
    };

    $scope.deaUsableStg = function() {
    	return $scope.platform.deaSizeDisk.size - $scope.platform.deaSize.size - 4;

    };

    // TODO DRY w/ costing directives
    $scope.roundUp = function(x) {
    	var totalX;
	    if (x == Math.round(x)) {
			totalX = x;
		} else  {
			totalX = parseInt(x) +1;
		}
	    return totalX;
    }

    /**
     * DEA Calculator
     */
    $scope.numDeasToRunAIs = function() {
    	var aipacks = 50;
    	if (null != $scope.aiPacks()) {
    		aipacks = $scope.aiPacks().value * 50;
    	}


    	var totalRam = (aipacks * $scope.platform.avgRam.value);
    	var totalStg = (aipacks * $scope.platform.avgAIDisk.value);

    	var deasRam = (totalRam / $scope.deaUsableRam());
    	var deasStg = (totalStg / $scope.deaUsableStg());


    		//Conditional Limit DEA per Stg or Mem
    		if (deasRam > deasStg || deasRam == deasStg) {
    			var deas = deasRam;
    		}
    		else {
    			var deas = deasStg;
    		}


    	return $scope.roundUp(deas);
    };

    $scope.deasPerAz = function() {
    	var azDeas = $scope.numDeasToRunAIs() / $scope.platform.numAZ;
    	return $scope.roundUp(azDeas) + $scope.platform.nPlusX;
    };

    $scope.totalDEAs = function() {
    	return $scope.deasPerAz() * $scope.platform.numAZ;
    }

	$scope.getVms = function() { return vmLayout; }

    $scope.iaasAskSummary = {
    	ram: 1,
    	disk: 1,
    	vcpu: 1
    };


    $scope.getPhysicalCores = function() {
    	return $scope.roundUp($scope.iaasAskSummary.vcpu / $scope.platform.iaasCPUtoCoreRatio.ratio);
    }

    $scope.doIaaSAskForVm = function(vm) {
    	$scope.iaasAskSummary.ram += vm.ram * vm.instances;
		  $scope.iaasAskSummary.disk
			+= (vm.persistent_disk + vm.ephemeral_disk + vm.ram) * vm.instances;
		  $scope.iaasAskSummary.vcpu += vm.vcpu * vm.instances;
      $scope.iaasAskSummary.ip += (vm.static_ips + vm.dynamic_ips) * vm.instances;
    }

    //This is the main calculator. We do all the per vm stuff and add the
    //constants at the bottom.  <--iaasAskSummary-->

    $scope.applyTemplate = function(template) {
    	$scope.iaasAskSummary = {ram: 1, disk: 1, vcpu: 1, ip: 1};
    	vmLayout.length = 0;
        for (var i = 0; i < template.length; i++) {
        	var vm = {};
    		angular.extend(vm, template[i]);
    		if ( !vm.singleton ) {
    			if ( "DEA" == vm.vm ) {
    				vm.instances = $scope.totalDEAs();
    				vm.ram = $scope.platform.deaSize.size;
					vm.ephemeral_disk = $scope.platform.deaSizeDisk.size;
    			}
    			else {
    				vm.instances = vm.instances * $scope.platform.numAZ;
    			}



    		}
			if ( "Compilation" == vm.vm ){
			    vm.instances = $scope.platform.pcfCompilationJobs.value;
			}
    		$scope.doIaaSAskForVm(vm);
			  vmLayout.push(vm);
    	}
        $scope.iaasAskSummary.disk += $scope.platform.avgAIDisk.value * $scope.aiPacks().value * 50;
    };

    $scope.loadAzTemplate = function() {
    	$http.get('/ersjson/' + $scope.platform.ersVersion.value)
    		.success(function(data) {
    			$scope.vmTemplate = data;
    			$scope.applyTemplate($scope.vmTemplate);
    		}).error(function(data) {
    			alert("Failed to get PCF AZ Template json template");
    		});
    };


	$scope.loadAzTemplate();


	//Watch for Non ng-select input changes
	[
	 'platform.numAZ',
	 'platform.nPlusX'
	].forEach(function(e,l,a) {
		$scope.$watch(e, function() {
				$scope.dropDownTriggerSizing()
		});
	});

	$scope.dropDownTriggerSizing = function () {
		if ($scope.vmTemplate !== undefined) {
			console.log("ShekelSizingController:MGLOG:" + "Triggered Sizing Data Refresh");
			$scope.applyTemplate($scope.vmTemplate)
		};
	};

/////

$scope.serviceVmLayout = new Map();
$scope.vmServiceTemplate = new Map();

$scope.services = [
  {id:0, name:"MySql", version:["1.4","1.5"] , plan:["100mb-dev","10GB-Prod"] , "AZ":"no" },
  {id:1, name:"RabbitMQ", version:["1.4"] , plan:["Prod"] , "AZ":"no" },
  {id:2, name:"Redis", version:["1.4.7"] , plan:["Shared-VM","Dedicated-VM"] , "AZ":"no" },
  {id:3, name:"SpringCloud", version:["1.0"] , plan:["Prod"] , "AZ":"no" }

];

$scope.selectDefaultService = function() {
  console.log("ShekelSizingController:MGLOG:" + "Triggered selectDefaultService");
  $scope.serviceSelection = [
    {selected:false, id:0, name:"MySql", version:"1.5", plan:"100mb-dev", "AZ":"no"},
    {selected:false, id:1, name:"RabbitMQ", version:"1.4", plan:"Prod" , "AZ":"no" },
    {selected:false, id:2, name:"Redis", version:"1.4.7", plan:"Shared-VM" , "AZ":"no" },
    {selected:false, id:3, name:"SpringCloud", version:"1.0" , plan:"Prod" , "AZ":"no" }

  ];
};
$scope.selectDefaultService();



$scope.loadServiceTemplate = function(id) {
  $http.get('/servicejson/'  + $scope.serviceSelection[id].name.toLowerCase() + '/' + $scope.serviceSelection[id].version + '/' + $scope.serviceSelection[id].plan.toLowerCase())
    .success(function(data) {
      console.log("ShekelSizingController:MGLOG:" + "Load Service Template for " + $scope.serviceSelection[id].name.toLowerCase() + '/' + $scope.serviceSelection[id].version + '/' + $scope.serviceSelection[id].plan.toLowerCase());
      $scope.vmServiceTemplate.set(id,data);
      console.dir($scope.vmServiceTemplate);
      $scope.applyServiceTemplate($scope.vmServiceTemplate);
    }).error(function(data) {
      alert("Failed to load PCF Service Template for ID: " + id);
    });
};

$scope.unLoadServiceTemplate = function(id) {
      console.log("ShekelSizingController:MGLOG:" + "unLoad Service Template for " + id);
      $scope.vmServiceTemplate.delete(id);
      if ($scope.vmTemplate !== undefined) {
  			console.log("ShekelSizingController:MGLOG:" + "Triggered Sizing Data Refresh");
  			$scope.applyTemplate($scope.vmTemplate,id)
  		};
      $scope.applyServiceTemplate($scope.vmServiceTemplate);
};

//This is the main calculator. We do all the per vm stuff and add the
//constants at the bottom.  <--iaasAskSummary-->

$scope.applyServiceTemplate = function(template) {
  console.log("ShekelSizingController:MGLOG:" + "Apply Service Template Length ::" + template.size);
  console.dir(template);
  $scope.serviceVmLayout.clear();
  for (var key of template.keys()) {

    var service = template.get(key);
    console.dir(service);

    var serviceVms = new Array();
    for (var s = 0; s < service.length; s++) {
      var servicevm = {};
      angular.extend(servicevm, service[s]);
      console.log("ShekelSizingController:MGLOG:" + "Apply Service Template for " + servicevm.vm);

      if ( !servicevm.singleton ) {
        servicevm.instances = servicevm.instances * $scope.platform.numAZ;
      }
      $scope.doIaaSAskForVm(servicevm);
      serviceVms.push(servicevm);
    }
    $scope.serviceVmLayout.set(key,serviceVms);

  }
  console.log("ShekelSizingController:MGLOG:" + "End Service Template")
};

$scope.getServiceVms = function(id) {
  return $scope.serviceVmLayout.get(id);
};



$scope.selectServiceVersion = function(id) {
  console.log("ShekelSizingController:MGLOG:" + "Triggered selectServiceVersion Refresh" + id + "::" + $scope.serviceSelection[id].version);
  $scope.unLoadServiceTemplate(id);
  $scope.loadServiceTemplate(id);
};

$scope.selectServicePlan = function(id) {
  console.log("ShekelSizingController:MGLOG:" + "Triggered ServicePlan Refresh" + id + "::" + $scope.serviceSelection[id].plan);
  $scope.unLoadServiceTemplate(id);
  $scope.loadServiceTemplate(id);
};


$scope.selectService = function(id) {
  console.log("ShekelSizingController:MGLOG:" + "Triggered Select Service " + id + " ::Selection::"+  $scope.serviceSelection[id].selected );
  if ($scope.serviceSelection[id].selected === 'true') {
    console.log("ShekelSizingController:MGLOG:" + "Service Selected" + id + "::Selection::" + $scope.serviceSelection[id].selected);
    $scope.loadServiceTemplate(id);
  }// Service selected
  else if ($scope.serviceSelection[id].selected === 'false'){
    console.log("ShekelSizingController:MGLOG:" + "Service Unselected" + id + "::Selection::" + $scope.serviceSelection[id].selected);
    $scope.unLoadServiceTemplate(id);
  }// Service selected

  angular.forEach($scope.serviceSelection,function(value,index){
      console.log("ShekelSizingController:MGLOG:" + "Service Selection" + value.id + "::" + value.name + "::" + value.plan + "::" + value.version);
  })
};

$scope.getSelectedServices = function () {
  return $scope.serviceSelection;
}

$scope.azService = function(id) {
};

});
