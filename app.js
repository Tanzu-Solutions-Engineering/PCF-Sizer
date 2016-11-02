'use strict'

const express = require('express');
const app = express();
const glob = require('glob');
const fs = require('fs');
const _ = require('lodash');

app.use(express.static('.'));

app.get('/buildnumber', function(req, res) {
    var vcapApplication = process.env.VCAP_APPLICATION
        || '{ "application_name": "local-dev", "application_uris": [ "localhost:3000" ] }';

    res.send(vcapApplication);
});

app.get('/tiles/:iaas', function(req, res) {
  var runtime = glob.sync('js/data/' + req.params['iaas'] + '/ers/*.json');
  var services = glob.sync('js/data/' + req.params['iaas'] + '/services/*.json');

  var json = [];

  runtime.forEach(function(file) {
    json.push(JSON.parse(fs.readFileSync(file)));
  });

  services.forEach(function(file) {
    json.push(JSON.parse(fs.readFileSync(file)));
  });

  res.status(200).json(json);
});

app.get('/v2/tiles/:iaas', function(req, res) {
  const runtime = glob.sync('js/data/tiles/ert/*.json');
  const iaas = req.params['iaas'];

  const services = glob.sync('js/data/tiles/services/*.json');
  // var services = glob.sync('js/data/' + req.params['iaas'] + '/services/*.json');

  var json = [];

  runtime.forEach(function(file) {
    let tile = JSON.parse(fs.readFileSync(file));
    if (tile.supportedIaaS.indexOf(iaas) === -1) {
      return;
    }
    tile.sizes.forEach((s) => {
      let tileInfo = {
        tile: tile.name,
        version: tile.version,
        size: s.size,
        display_name: s.displayName,
        description: s.description,
        avg_ai_ram: s.avgAIRam,
        avg_ai_disk: s.avgAIDisk,
        ai_packs: s.aiPacks,
        az_count: s.azCount,
        extra_runners_per_az: s.extraRunnersPerAZ,
        is_default: s.isDefault,
        is_disabled: s.isDisabled,
        can_customize: s.canCustomize,
        priority: s.priority,
        vms: []
      };

      tile.jobs.forEach((job) => {
        if (job.iaas[iaas]) {
          let jobInfo = {
            vm: job.vm,
            dynamic_ips: job.dynamicIPs,
            static_ips: job.staticIPs,
            singleton: job.singleton,
            temporary: job.temporary || false,
            instances: getJobInstances(job, s.size),
            persistent_disk: getJobPersistentDisk(job, iaas, s.size),
            instance_type: getJobInstanceType(job, iaas, s.size),
            valid_instance_types: getJobValidInstanceTypes(job, iaas, s.size)
          };
          tileInfo.vms.push(jobInfo);
        }
      });
      json.push(tileInfo);
    });
  });

  services.forEach(function(file) {
    let tile = JSON.parse(fs.readFileSync(file));
    if (tile.supportedIaaS.indexOf(iaas) === -1) {
      return;
    }
    tile.sizes.forEach((s) => {
      let tileInfo = {
        tile: tile.name,
        version: tile.version,
        size: s.size,
        vms: []
      };

      tile.jobs.forEach((job) => {
        if (job.iaas[iaas]) {
          let jobInfo = {
            vm: job.vm,
            dynamic_ips: job.dynamicIPs,
            static_ips: job.staticIPs,
            singleton: job.singleton,
            temporary: job.temporary || false,
            instances: getJobInstances(job, s.size),
            persistent_disk: getJobPersistentDisk(job, iaas, s.size),
            instance_type: getJobInstanceType(job, iaas, s.size),
            valid_instance_types: getJobValidInstanceTypes(job, iaas, s.size)
          };
          tileInfo.vms.push(jobInfo);
        }
      });
      json.push(tileInfo);
    });
  });

  res.status(200).json(json);
});

app.get('/missingInstanceTypeCheck', function(req, res) {
  const runtime = glob.sync('js/data/tiles/ert/*.json');
  const services = glob.sync('js/data/tiles/services/*.json');
  const instanceTypes = JSON.parse(fs.readFileSync('js/data/instance_types.json'));

  var vmTypes = [];
  Object.keys(instanceTypes).forEach((iaas) => {
    runtime.forEach((file) => {
      let tile = JSON.parse(fs.readFileSync(file));
      if (tile.supportedIaaS.indexOf(iaas) === -1) {
        return;
      }

      tile.sizes.forEach((s) => {
        tile.jobs.forEach((job) => {
          if (job.iaas[iaas]) {
            if (!_.find(instanceTypes[iaas], {name: getJobInstanceType(job, iaas, s.size)})) {
              vmTypes.push("IaaS: " + iaas + ", Job: " + job.vm + ", Instance Type " + getJobInstanceType(job, iaas, s.size) + ", Tile: " + tile.name);
            }

            if (getJobValidInstanceTypes(job, iaas, s.size)) {
              getJobValidInstanceTypes(job, iaas, s.size).forEach((vm) => {
                if (!_.find(instanceTypes[iaas], {name: vm})){
                  vmTypes.push("IaaS: " + iaas + ", Instance Type: " + vm + ", Tile: " + tile.name);
                }
              });
            }
          }
        });
      });
    });

    services.forEach(function(file) {
      let tile = JSON.parse(fs.readFileSync(file));
      if (tile.supportedIaaS.indexOf(iaas) === -1) {
        return;
      }

      tile.sizes.forEach((s) => {
        tile.jobs.forEach((job) => {
          if (job.iaas[iaas]) {
            if (!_.find(instanceTypes[iaas], {name: getJobInstanceType(job, iaas, s.size)})) {
              vmTypes.push("IaaS: " + iaas + ", Job: " + job.vm + ", Instance Type " + getJobInstanceType(job, iaas, s.size) + ", Tile: " + tile.name);
            }

            if (getJobValidInstanceTypes(job, iaas, s.size)) {
              getJobValidInstanceTypes(job, iaas, s.size).forEach((vm) => {
                if (!_.find(instanceTypes[iaas], {name: vm})) {
                  vmTypes.push("IaaS: " + iaas + ", Instance Type: " + vm + ", Tile: " + tile.name);
                }
              });
            }
          }
        });
      });
    });
  })



  res.status(200).json(_.uniq(vmTypes));
});

app.get('/instanceTypes/:iaas', function(req, res) {
    const instanceTypes = JSON.parse(fs.readFileSync('js/data/instance_types.json'));
    const iaas = req.params['iaas'];

    res.status(200).json(instanceTypes[iaas]);
});

function getJobInstances(job, size) {
  let instances = 0;

  //check default all
  if (job.defaults.all && job.defaults.all.instances) {
    instances = job.defaults.all.instances;
  }

  //check default size
  if (job.defaults[size] && job.defaults[size].instances) {
    instances = job.defaults[size].instances;
  }

  return instances;
}

function getJobPersistentDisk(job, iaas, size) {
  let disk = 0;

  //check default all
  if (job.defaults.all && job.defaults.all.persistentDisk) {
    disk = job.defaults.all.persistentDisk;
  }

  //check default size
  if (job.defaults[size] && job.defaults[size].persistentDisk) {
    disk = job.defaults[size].persistentDisk;
  }

  if (job.iaas[iaas] && job.iaas[iaas].all && job.iaas[iaas].all.persistentDisk) {
    disk = job.iaas[iaas].all.persistentDisk;
  }

  if (job.iaas[iaas] && job.iaas[iaas][size] && job.iaas[iaas][size].persistentDisk) {
    disk = job.iaas[iaas][size].persistentDisk;
  }

  return disk;
}

function getJobInstanceType(job, iaas, size) {
  let type = null;

  if (job.iaas[iaas] && job.iaas[iaas].all && job.iaas[iaas].all.instanceType) {
    type = job.iaas[iaas].all.instanceType;
  }

  if (job.iaas[iaas] && job.iaas[iaas][size] && job.iaas[iaas][size].instanceType) {
    type = job.iaas[iaas][size].instanceType;
  }

  return type;
}

function getJobValidInstanceTypes(job, iaas, size) {
  let types = null;

  if (job.iaas[iaas] && job.iaas[iaas].all && job.iaas[iaas].all.validInstanceTypes) {
    types = job.iaas[iaas].all.validInstanceTypes;
  }

  if (job.iaas[iaas] && job.iaas[iaas][size] && job.iaas[iaas][size].validInstanceTypes) {
    types = job.iaas[iaas][size].validInstanceTypes;
  }

  return types;
}

var port = process.env.PORT||3000;
console.log("PCF Sizer:: " + "Starting App on port :" + port);
app.listen(port);
