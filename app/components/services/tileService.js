var tileService = shekelApp.factory('tileService', function (iaasService, sizingStorageService, $http) {
  var elasticRuntimeConfig = sizingStorageService.data.elasticRuntimeConfig;
  var tileService = {
    ersName: "Elastic Runtime",
    tiles: [],
    addTile: function(name, version, template) {
      var idx = this.getIndexOfTile(name);
      var initial = {
        name: name,
        version: version,
        template: template,
        enabled: false
      };
      if ( -1 == idx ) {
        this.tiles.push(initial);
      } else {
        //this.tiles.splice(idx, initial );
        this.tiles.splice(idx,1,initial);
      }
    },
    disableTile: function(name) {
      var tile = this.getTile(name);
      tile.enabled = false;
      tile.currentConfig = undefined;
    },
    enableTile: function(name) {
      this.getTile(name).enabled = true;
    },
    getIndexOfTile: function(name) {
      for(var idx=0; idx < this.tiles.length; idx++) {
        if ( this.tiles[idx].name == name) {
          return idx
        }
      }
      return -1;
    },
    getTile: function (name) {
      return this.tiles[this.getIndexOfTile(name)];
    },

    // For all Tiles, applyTemplate
    applyTemplate: function () {
      var t = this;
      iaasService.resetVMs();
      iaasService.resetTemplateVMs();
      tileService.tiles.forEach(function (tile) {
          t.applyTileTemplate(tile.name)
      });
    },

    // Apply Template for a specific Tile
    applyTileTemplate: function (name) {
      var t = this;
      var tile = t.getTile(name);
      if (!tile.enabled) {
          return;
      }

      //templates == jobs
      Object.keys(tile.template).forEach(function(size) {
        var vms = tile.template[size];
        vms.forEach(function(vm) {
          vm.instanceInfo = iaasService.getInstanceTypeInfo(vm.instance_type);
          vm.tshirt = size;
          iaasService.addTemplateVM(vm);
        });
      });
    }
  };

  // tileService.loadERSTemplates = function(iaas, ersVersion) {
  //   var t = this;
  //   var url = ['/ersjson', iaas, ersVersion].join('/');
  //   return $http.get(url)
  //   .success(function(data) {
  //     tileService.addTile(t.ersName, ersVersion, data);
  //     tileService.enableTile(t.ersName);
  //     tileService.applyTemplate();
  //   }).error(function(data) {
  //     alert("Failed to get PCF AZ Template JSON template");
  //   });
  // };
  return tileService;
});
