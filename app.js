var express = require('express');
var app = express();
var glob = require('glob');
var fs = require('fs');

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

app.get('/instanceTypes/:iaas', function(req, res) {
    var filePath = '/js/data/' + req.params['iaas'] + "/instance_types.json";
    res.contentType('application/json').redirect(filePath);
});


var port = process.env.PORT||3000;
console.log("PCF Sizer:: " + "Starting App on port :" + port);
app.listen(port);
