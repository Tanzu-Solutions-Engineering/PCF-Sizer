"use strict"
var shekelApp = angular.module('ShekelApp', []);

shekelApp.controller('ShekelSizingController', function($scope, $http) {

    $scope.aiPackOptions = new Array();         
    
    $scope.setAIPacs = function() {
    	for ( var i = 1; i <= 50; ++i) {
    		$scope.aiPackOptions.push({ label: i + " ("+i*50+")", value: i});
    	}
    }
    
    $scope.setAIPacs();
                             
    $scope.aiPacks = $scope.aiPackOptions[0];  
    
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
    
    $scope.avgRam = $scope.avgRamOptions[1];

    $scope.avgAIDisk = 1;
    
    $scope.deaSize = ["Small", "Medium", "Large", "Bad idea"];
    
    $scope.aZRecoveryCapacity = [25, 50, 100];
    
    $scope.numAZ = 3; 
    
    $scope.aiHelpMeChoose = false;
    
    $scope.aiChooser = { 
    	apps: 1,
    	devs: 1,
    	steps: 1,
    };
       
	// This is the app instances formula. Change it here.
    $scope.ais = function() {  
    	var totalAis = $scope.aiChooser.apps 
    			* $scope.aiChooser.devs 
    			* $scope.aiChooser.steps;
    	var packs = (totalAis /  50) + 1;
    	return parseInt(packs);
    };
        
    $scope.setAis = function() { 
    	$scope.aiPacks = $scope.aiPackOptions[$scope.ais() - 1];
    }
    
    
    $scope.deaDef = { 
    	usableRam: 10
    };
    
    $scope.nPlusX = 2;
    
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
    	var totalRam = ($scope.aiPacks.value * 50 * $scope.avgRam.value)
    	var deas = (totalRam / $scope.deaDef.usableRam);
    	return $scope.roundUp(deas);
    };
    
    $scope.deasPerAz = function() { 
    	var azDeas = $scope.numDeasToRunAIs() / $scope.numAZ;
    	return $scope.roundUp(azDeas) + $scope.nPlusX;
    };
    
    $scope.totalDEAs = function() { 
    	return $scope.deasPerAz() * $scope.numAZ;
    }
    
    //Does not account (well) for singletons or az's.
    $scope.buildVms = function () {
    	$scope.vms = [
           {name: "DEA", 				qty: $scope.totalDEAs()},
           {name: "DEA per AZ", 			qty: $scope.deasPerAz()},
           {name: "Ops Manager", 		qty: 1},
           {name: "Ops Manager Director",qty: 1},
           {name: "HAProxy", 			qty: $scope.numAZ}, //Depends on production
           {name: "NATS", 				qty: $scope.numAZ},
           {name: "etcd", 				qty: $scope.numAZ},
           {name: "Health Manager",		qty: $scope.numAZ},
           {name: "Blob Store", 					qty: 1}, //Not on AWS w/ S3
           {name: "Cloud Controller Database",	qty: 1},
           {name: "Cloud Controller", qty: $scope.numAZ},
           {name: "Clock Global", qty: 1},
           {name: "Cloud Controller Worker", qty: $scope.numAZ},
           {name: "Router", qty: $scope.numAZ},
           {name: "Collector", qty: 1}, //Do we scale this this way?
           {name: "UAA Database", qty: 1},
           {name: "UAA", qty: $scope.numAZ},
           {name: "Login Server", qty: 1},
           {name: "Apps Manager Database", qty: 1}, //Is this really a VM?
           {name: "Loggregator", qty: 1},
           {name: "Loggregator Traffic Controller", qty: 1},
           {name: "Compilation", qty: 4},
           {name: "Post-Install Errand", qty: $scope.numAZ},
           {name: "VCenter", qty: 1},
      	];
    };
     
    $scope.vms = {}
    $scope.buildVms(); 
    
    $scope.showTable=false;
    
    $scope.iaasAskSummary = {
    	ram: 1,
    	disk: 1, 
    	vcpu: 1
    };
    
    $scope.vmLayout = null;
    $scope.vmTemplate = null; 
    
    $scope.doIaaSAskForVm = function(vm) {
    	$scope.iaasAskSummary.ram += (vm.ram / 1024) * vm.instances;
		$scope.iaasAskSummary.disk 
			+= ((vm.persistent_disk + vm.ephemeral_disk) / 1024) * vm.instances;
		$scope.iaasAskSummary.vcpu += vm.vcpu * vm.instances;
    }

    $scope.applyTemplate = function(template) { 
    	$scope.iaasAskSummary = {ram: 1, disk: 1, vcpu: 1};
    	$scope.vmLayout = new Array();
        for (var i = 0; i < template.length; i++) {
        	var vm = {};
    		angular.extend(vm, template[i]);
    		if ( !vm.singleton ) {
    			if ( "DEA" == vm.vm ) { 
    				vm.instances = $scope.totalDEAs();
    			} else {
    				vm.instances = vm.instances * $scope.numAZ;
    			}
    		}   
    		$scope.doIaaSAskForVm(vm);
			$scope.vmLayout.push(vm);
    	}
    };
    
    $scope.loadAzTemplate = function() {
    	$http.get('/js/data/ers_vms_single_az_template.json')
    		.success(function(data) { 
    			$scope.vmTemplate = data;
    			$scope.applyTemplate($scope.vmTemplate);
    		}).error(function(data) { 
    			alert("Failed to get json template");
    		});
    };
    
	$scope.loadAzTemplate();
});

shekelApp.controller('ShekelFoundationController', function($scope) {
	$scope.singleComplianceZone = "yes";
	$scope.seperateForProd = "yes";
	$scope.complianceZones = 1;
	$scope.physicalDC = 1;
	
	$scope.foundations = function() { 
		var multiplier = $scope.seperateForProd == "yes" ? 2 : 1;
		//Gross side effect... 
		if ( $scope.singleComplianceZone == "yes") { 
			$scope.complianceZones = 1;
		}
		return $scope.physicalDC * $scope.complianceZones * multiplier; 
	}

});
