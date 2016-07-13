"use strict";
var iaasService = angular.module('SizerApp').factory('iaasService', function(sizingStorageService, $http) {
  var ramOverhead = 3;
  var diskOverhead = 20;
  var aisPerPack = 50;
  var instanceTypes = [];
  var iaasService = {
    vms: [],
    templateVms: [],
    loadedConfig: {
      iaas: null,
      ersFixedSize: null,
      ersVersion: null
    },
    resourceSummary: {
      azCount: 0,
      ram: 0,
      disk: 0,
      cpu: 0,
      ips: 0,
      vmTypes: [],
      cost: 0
    },
    diegoCellSummary: {
      availableCellRam: 0,
      availableCellDisk: 0,
      useableCellRam: 0,
      useableCellDisk: 0,
      numberOfCells: 0,
      cellsPerAZ: 0,
      totalRam: 0
    },
  };

  iaasService.getRamOverhead = function() {
    return ramOverhead;
  }

  iaasService.getDiskOverhead = function() {
    return diskOverhead;
  }

  iaasService.getAIsPerPack = function() {
    return aisPerPack;
  }
  /**
    methods for VMs currently active
  */
  iaasService.addTileVMs = function(tile, size, version) {
    var t = this;
    this.removeVMs(tile);
    this.getTemplateVMs(tile, size, version).forEach(function(vm) {
      t.addVM(vm);
    });
  };

  iaasService.addVM = function(vm) {
    this.vms.push(vm);
  };

  iaasService.resetVMs = function() {
    this.vms = [];
  };

  iaasService.removeVMs = function(tile) {
    _.remove(this.vms, {tile: tile});
  };

  iaasService.getVMs = function(tile) {
    if (tile === undefined) {
      return this.vms;
    }
    return _.filter(this.vms, {tile: tile});
  };

  /**
    END methods for VMs currently  active
  */

  /**
    methods for VMs loaded from templates
  */
  iaasService.addTemplateVM = function(vm) {
    this.templateVms.push(vm);
  };

  iaasService.resetTemplateVMs = function() {
    this.templateVms = [];
  };

  iaasService.removeTemplateVMs = function(tile) {
    _.remove(this.templateVms, {tile: tile});
  };

  iaasService.getTemplateVMs = function(tile, size, version) {
    if (tile === undefined || size === undefined || version === undefined) {
      console.log('Tile, size and version required');
      return;
    }
    return _.filter(this.templateVms, {tile: tile, tshirt: size, version: version});
  };

  iaasService.getTemplateVMVersions = function(tile) {
    return _.map(_.uniqBy(_.filter(this.templateVms, {tile: tile}), 'version'), 'version');
  }

  /**
    END methods for VMs loaded from templates
  */

  iaasService.removeAllServiceVMs = function() {
    _.remove(this.vms, function(n) {
      return n.tile !== 'Elastic Runtime';
    });
  };

  iaasService.removeAllServiceTemplateVMs = function() {
    _.remove(this.templateVms, function(n) {
      return n.tile !== 'Elastic Runtime';
    });
  };

  iaasService.getServices = function() {
    var serviceNames = _.map(_.uniqBy(this.templateVms, 'tile'), 'tile');
    var idx = serviceNames.indexOf('Elastic Runtime');
    serviceNames.splice(idx, 1);
    var services = [];
    serviceNames.forEach(function(service) {
      var versions = iaasService.getTemplateVMVersions(service);
      services.push(
        {
            name: service,
            versions: versions
        }
      )
    });

    return services;
  };

  iaasService.getServiceAICount = function() {
    var services = _.filter(this.vms, {deployed_application: true});
    return _.reduce(_.map(services, 'instances'), function(sum, n) {
      return sum + n;
    }) || 0;
  }

  iaasService.getInstanceTypes = function() {
    return this.instanceTypes;
  }

  iaasService.getInstanceTypeInfo = function(instanceType) {
    return _.find(this.instanceTypes, {name: instanceType});
  }

  iaasService.getDiegoCellInfo = function() {
    return _.find(this.vms, {tile: "Elastic Runtime", vm: "Diego Cell"});
  };

  iaasService.getDiegoCellTemplateInfo = function() {
    return _.find(this.templateVms, {tile: "Elastic Runtime", vm: "Diego Cell"});
  };

  iaasService.generateResourceSummary = function() {
    this.resourceSummary.azCount = sizingStorageService.data.elasticRuntimeConfig.azCount;
    this.resourceSummary.ram = 0;
    this.resourceSummary.disk = 0;
    this.resourceSummary.cpu = 0;
    this.resourceSummary.ips = 0;
    this.resourceSummary.cores = 0;
    this.resourceSummary.vmTypes = [];
    this.resourceSummary.cost = 0;

    for (var i=0; i < this.vms.length; i++) {
      var vm = this.vms[i];
      if (vm.instance_type) {
        var cost = vm.instances * vm.instanceInfo.cost;
        this.resourceSummary.ram += vm.instanceInfo.ram * vm.instances; //total ram
        this.resourceSummary.disk += (vm.persistent_disk + vm.instanceInfo.ephemeral_disk) * vm.instances; //total disk both ephemeral and persistent
        this.resourceSummary.cpu += vm.instanceInfo.cpu * vm.instances; //total cpu
        this.resourceSummary.ips += (vm.dynamic_ips + vm.static_ips) * vm.instances; //total IPs static and dynamic
        this.resourceSummary.cost += cost;

        var type = _.find(this.resourceSummary.vmTypes, {name: vm.instance_type});
        if (type !== undefined) {
          type.count += vm.instances;
          type.cost += cost;
        } else {
          this.resourceSummary.vmTypes.push({name: vm.instance_type, instanceInfo: vm.instanceInfo, count: vm.instances, cost: cost, cpu: vm.instanceInfo.cpu, ram: vm.instanceInfo.ram});
        }
      }
    }
    this.resourceSummary.ram = Math.ceil(this.resourceSummary.ram); //round up to a whole GB
    this.resourceSummary.disk = Math.ceil(this.resourceSummary.disk); //round up to a whole GB
  };

  iaasService.generateDiegoCellSummary = function() {
    var cell = this.getDiegoCellInfo();
    this.diegoCellSummary.totalRam = cell.instances * cell.instanceInfo.ram;
    this.diegoCellSummary.useableCellRam = cell.instanceInfo.ram - ramOverhead;
    this.diegoCellSummary.useableCellDisk = cell.instanceInfo.ephemeral_disk - diskOverhead;
    this.diegoCellSummary.availableCellRam = cell.instances * this.diegoCellSummary.useableCellRam;
    this.diegoCellSummary.availableCellRam -= this.getTotalAIRam();
    this.diegoCellSummary.availableCellDisk = cell.instances * this.diegoCellSummary.useableCellDisk;
    this.diegoCellSummary.availableCellDisk -= this.getTotalAIDisk();
    this.diegoCellSummary.numberOfCells = cell.instances;
    this.diegoCellSummary.cellsPerAZ = Math.ceil(this.diegoCellSummary.numberOfCells / sizingStorageService.data.elasticRuntimeConfig.azCount);
  };

  iaasService.calculateDiegoCellCount = function() {
    var cellInfo = this.getDiegoCellInfo();
    var ram = this.getTotalAIRam();
    var disk = this.getTotalAIDisk();
    var numbersOfCellsBasedOnRam = ram / (cellInfo.instanceInfo.ram - this.getRamOverhead());
    var numbersOfCellsBasedOnDisk = disk / (cellInfo.instanceInfo.ephemeral_disk - this.getDiskOverhead());
    cellInfo.instances = Math.ceil(Math.max(numbersOfCellsBasedOnRam, numbersOfCellsBasedOnDisk));
    cellInfo.instances += (sizingStorageService.data.elasticRuntimeConfig.azCount * sizingStorageService.data.elasticRuntimeConfig.extraRunnersPerAZ);
  }

  iaasService.getTotalAIRam = function() {
    var aiCount = sizingStorageService.data.aiPacks * aisPerPack;
    var ram = aiCount * sizingStorageService.data.elasticRuntimeConfig.avgAIRAM;
    ram += sizingStorageService.data.serviceAICount; //assume 1GB ram usage per service AI
    return ram;
  }

  iaasService.getTotalAIDisk = function() {
    var aiCount = sizingStorageService.data.aiPacks * aisPerPack;
    var disk = aiCount * sizingStorageService.data.elasticRuntimeConfig.avgAIDisk;
    disk += sizingStorageService.data.serviceAICount *2; //assume 2GB disk usage per service AI
    return disk;
  }

  iaasService.getDiegoCellSummary = function() {
    return this.diegoCellSummary;
  }

  iaasService.getResourceSummary = function() {
    return this.resourceSummary;
  }

  iaasService.loadIaaSTemplate = function(iaas) {
    var url = ['/instanceTypes', iaas].join('/');
    return $http.get(url)
    .success(function(data) {
      iaasService.instanceTypes = data;
    }).error(function(data) {
      alert("Failed to get PCF Iaas Types");
    });
  };

  iaasService.processTemplates = function(versions) {
    Object.keys(versions).forEach(function(version) {
      var sizes = versions[version];
      Object.keys(sizes).forEach(function(size) {
        var vms = sizes[size];
        vms.forEach(function(vm) {
          vm.instanceInfo = {};
          angular.extend(vm.instanceInfo, iaasService.getInstanceTypeInfo(vm.instance_type));
          vm.tshirt = size;
          vm.version = version;
          iaasService.addTemplateVM(vm);
        });
      });
    });
  };

  iaasService.loadERSTemplates = function(iaas) {
    var t = this;
    var url = ['/ers', iaas].join('/');
    t.removeVMs('Elastic Runtime');
    t.removeTemplateVMs('Elastic Runtime');
    return $http.get(url)
    .success(function(data) {
      t.processTemplates(data);
    }).error(function(data) {
      alert("Failed to get PCF Template JSON template");
    });
  };

  iaasService.loadServiceTemplates = function(iaas) {
    var t = this;
    var url = ['/services', iaas].join('/');
    t.removeAllServiceVMs();
    t.removeAllServiceTemplateVMs();
    return $http.get(url)
    .success(function(data) {
      Object.keys(data).forEach(function(tileName) {
        t.processTemplates(data[tileName]);
      });
    }).error(function(data) {
      alert("Failed to get " + tileName + " " + tileVersion + " Service Template JSON template");
    });
  };

  return iaasService;
});
