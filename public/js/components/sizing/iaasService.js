"use strict";
var iaasService = angular.module('sizerApp').factory('iaasService', function(sizingStorageService, $http, $q) {
  var ramOverhead = 3;
  var diskOverhead = 4;
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
      cost: 0,
      totalVMs: 0
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
    pcfInstallSizes: []
  };

  iaasService.iaasSelectionList =[
    {
      id: 'vsphere',
      name: 'vSphere',
      isDefault: true,
      isDisabled: false,
      pricingUrl: null,
      showPricingTypes: false,
      iaasTuning: true,
      showSystemResourcesUsed: true,
      showInstanceFlavorsUsed: false
    },
    {
      id: 'aws',
      name: 'AWS',
      isDefault: false,
      isDisabled: false,
      pricingUrl: 'https://aws.amazon.com/ec2/pricing/',
      showPricingTypes: true,
      iaasTuning: false,
      showSystemResourcesUsed: false,
      showInstanceFlavorsUsed: true
    },
    {
      id: 'aws-dedicated',
      name: 'AWS Dedicated',
      isDefault: false,
      isDisabled: false,
      pricingUrl: 'https://aws.amazon.com/ec2/purchasing-options/dedicated-instances/',
      showPricingTypes: true,
      iaasTuning: false,
      showSystemResourcesUsed: false,
      showInstanceFlavorsUsed: true
    },
    {
      id: 'azure',
      name: 'Azure',
      isDefault: false,
      isDisabled: false,
      pricingUrl: 'https://azure.microsoft.com/en-us/pricing/details/virtual-machines/',
      showPricingTypes: true,
      iaasTuning: false,
      showSystemResourcesUsed: false,
      showInstanceFlavorsUsed: true
    },{
      id: 'gcp',
      name: 'GCP',
      isDefault: false,
      isDisabled: false,
      pricingUrl: 'https://cloud.google.com/compute/pricing',
      showPricingTypes: true,
      iaasTuning: false,
      showSystemResourcesUsed: false,
      showInstanceFlavorsUsed: true
    },{
      id: 'openstack',
      name: 'OpenStack',
      isDefault: false,
      isDisabled: false,
      pricingUrl: null,
      showPricingTypes: false,
      iaasTuning: true,
      showSystemResourcesUsed: true,
      showInstanceFlavorsUsed: true
    },{
      id: 'nhc-vsphere',
      name: 'NHC vSphere',
      isDefault: false,
      isDisabled: false,
      pricingUrl: null,
      showPricingTypes: false,
      iaasTuning: true,
      showSystemResourcesUsed: true,
      showInstanceFlavorsUsed: false
    }
  ];

  iaasService.getRamOverhead = function() {
    return ramOverhead;
  }

  iaasService.getDiskOverhead = function() {
    return diskOverhead;
  }

  iaasService.getUsedCellDisk = function(instanceInfo) {
    return instanceInfo.ephemeralDisk - iaasService.getDiskOverhead() - instanceInfo.ram;
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

  iaasService.calculateERTVMCount = () => {
    var vms = iaasService.getVMs("Elastic Runtime");
    vms.forEach((vm) => {
      if (vm.scaling) {
        vm.instances = Math.max(vm.instances, Math.ceil(sizingStorageService.data.aiPacks * aisPerPack / vm.scaling.ratio));
      }
    })
  }

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

  iaasService.resetInstallSizes = function() {
    this.pcfInstallSizes = [];
  }

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

  iaasService.getPCFVersions = function() {
    return ["1.11", "1.10", "1.9"];
  }

  iaasService.getPricingTypes = function() {
    var types = [];
    var instanceTypes = this.getInstanceTypes();

    if (instanceTypes && instanceTypes[0].cost) {
      instanceTypes.forEach(function(t) {
        Object.keys(t.cost).forEach(function(type) {
          types.push(type);
        });
      });
      var uniqueTypes = _.uniq(types);

      if (!sizingStorageService.data.pricingType) {
          sizingStorageService.data.pricingType = uniqueTypes[0];
      }
      return uniqueTypes;
    }
  };

  /**
    END methods for VMs loaded from templates
  */

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
    this.resourceSummary.totalCost = 0;
    this.resourceSummary.totalVMs = 0;

    for (var i=0; i < this.vms.length; i++) {

      var vm = this.vms[i];
      if (vm.instance_type) {
        var cost = 0;
        var perVmCost = 0;
        if (sizingStorageService.data.pricingType) {
          perVmCost = vm.instanceInfo.cost[sizingStorageService.data.pricingType]
          cost = vm.instances * perVmCost;
        }


        this.resourceSummary.totalVMs = this.resourceSummary.totalVMs + vm.instances;
        this.resourceSummary.ram += vm.instanceInfo.ram * vm.instances; //total ram
        this.resourceSummary.disk += (vm.persistent_disk + vm.instanceInfo.ephemeralDisk) * vm.instances; //total disk both ephemeral and persistent
        this.resourceSummary.cpu += vm.instanceInfo.cpu * vm.instances; //total cpu
        this.resourceSummary.ips += (vm.dynamic_ips + vm.static_ips) * vm.instances; //total IPs static and dynamic
        this.resourceSummary.totalCost += cost;

        var type = _.find(this.resourceSummary.vmTypes, {name: vm.instance_type});
        if (type !== undefined) {
          type.count += vm.instances;
          type.totalCost += cost;
        } else {
          this.resourceSummary.vmTypes.push(
            {
              name: vm.instance_type,
              instanceInfo: vm.instanceInfo,
              count: vm.instances,
              totalCost: cost,
              cost: perVmCost,
              cpu: vm.instanceInfo.cpu,
              ram: vm.instanceInfo.ram
            }
          );
        }
      }
    }
    this.resourceSummary.ram = Math.ceil(this.resourceSummary.ram); //round up to a whole GB
    this.resourceSummary.disk = Math.ceil(this.resourceSummary.disk); //round up to a whole GB
  };

  iaasService.generateDiegoCellSummary = function() {
    var cell = this.getDiegoCellInfo();
    this.diegoCellSummary.totalRam = cell.instances * cell.instanceInfo.ram;
    this.diegoCellSummary.useableCellRam = cell.instanceInfo.ram - this.getRamOverhead();
    this.diegoCellSummary.useableCellDisk = this.getUsedCellDisk(cell.instanceInfo);
    this.diegoCellSummary.availableCellRam = cell.instances * this.diegoCellSummary.useableCellRam;
    this.diegoCellSummary.availableCellRam -= this.getTotalAIRam();
    this.diegoCellSummary.availableCellDisk = cell.instances * this.diegoCellSummary.useableCellDisk;
    this.diegoCellSummary.availableCellDisk -= this.getTotalAIDisk();
    this.diegoCellSummary.numberOfCells = cell.instances;
    this.diegoCellSummary.cellsPerAZ = Math.ceil(this.diegoCellSummary.numberOfCells / sizingStorageService.data.elasticRuntimeConfig.azCount);
  };

  iaasService.calculateDiegoCellCount = function() {
    var cell = this.getDiegoCellInfo();
    var ram = this.getTotalAIRam();
    var disk = this.getTotalAIDisk();
    var numbersOfCellsBasedOnRam = ram / (cell.instanceInfo.ram - this.getRamOverhead());
    var numbersOfCellsBasedOnDisk = disk / (this.getUsedCellDisk(cell.instanceInfo));
    cell.instances = Math.ceil(Math.max(numbersOfCellsBasedOnRam, numbersOfCellsBasedOnDisk));
    cell.instances += (sizingStorageService.data.elasticRuntimeConfig.azCount * sizingStorageService.data.elasticRuntimeConfig.extraRunnersPerAZ);

    iaasService.calculateERTVMCount();
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
    return $q(function(resolve, reject) {
      if (iaasService.loadedConfig.iaas === iaas) {
        resolve();
        return;
      }

      var url = ['/instanceTypes', iaas].join('/');
      return $http.get(url)
      .then(function(data) {
        iaasService.instanceTypes = data.data;
        resolve('');
      },function(data) {
        reject("Failed to get PCF Iaas Types");
      });
    });
  };

  iaasService.processTemplates = function(tiles) {
    tiles.forEach(function(t) {
      if (t.tile === 'Elastic Runtime') {

        if (!iaasService.pcfInstallSizes[t.version]) {
          iaasService.pcfInstallSizes[t.version] = [];
        }

        iaasService.pcfInstallSizes[t.version].push({
          size: t.size,
          priority: t.priority,
          displayName: t.display_name,
          description: t.description,
          isDefault: t.is_default,
          avgAIRam: t.avg_ai_ram,
          avgAIDisk: t.avg_ai_disk,
          aiPacks: t.ai_packs,
          azCount: t.az_count,
          extraRunnersPerAZ : t.extra_runners_per_az,
          isDisabled: t.is_disabled,
          canCustomize: t.can_customize
        })
      }

      t.vms.forEach(function(vm) {
        vm.tile = t.tile;
        vm.instanceInfo = {};
        angular.extend(vm.instanceInfo, iaasService.getInstanceTypeInfo(vm.instance_type));
        vm.tshirt = t.size;
        vm.version = t.version;
        iaasService.addTemplateVM(vm);
      });
    });
  };

  iaasService.loadTemplates = function(iaas) {
    return $q(function(resolve, reject) {
      if (iaasService.loadedConfig.iaas === iaas) {
        resolve();
        return;
      }

      var url = ['/v2/tiles', iaas].join('/');
      iaasService.resetVMs();
      iaasService.resetTemplateVMs();
      iaasService.resetInstallSizes();
      return $http.get(url)
      .then(function(data) {
        iaasService.processTemplates(data.data);
        resolve();
      }, function(data) {
        reject("Failed to get PCF Template JSON template");
      });
    });
  };

  return iaasService;
});
