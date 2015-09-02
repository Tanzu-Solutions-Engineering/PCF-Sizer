var express = require('express');
var app = express();
var redis = require('redis');

// parsing rediscloud credentials
var vcap_services = process.env.VCAP_SERVICES;

if (vcap_services) {
  var rediscloud_service = JSON.parse(vcap_services)["rediscloud"][0]
  var credentials = rediscloud_service.credentials;
  var client = redis.createClient(credentials.port, credentials.hostname, {no_ready_check: true});
  client.auth(credentials.password);
}
else {
  // local redis
  //var client = redis.createClient();
}

if (client) {
  client.on("error", function (err) {
      console.log("Error " + err);
  });
  client.set("string key", "string val", redis.print);
  client.hset("hash key", "hashtest 1", "some value", redis.print);
  client.hset(["hash key", "hashtest 2", "some other value"], redis.print);
  client.hkeys("hash key", function (err, replies) {
      console.log(replies.length + " replies:");
      replies.forEach(function (reply, i) {
          console.log("    " + i + ": " + reply);
      });
  });


}

app.use(express.static('.'));

app.get('/buildnumber', function(req, res) {
    var vcapApplication = process.env.VCAP_APPLICATION
        || '{ "application_name": "local-dev", "application_uris": [ "localhost:3000" ] }';

    res.send(vcapApplication);
});

app.get('/ersjson/:version', function(req, res){
    //TODO Is this safe?
    res.redirect('/js/data/ers_vms_single_az_template-' + req.param('version') + '.json')
});

app.get('/requirements/:version', function(req, res){
    //TODO Is this safe?
    res.redirect('/js/data/requirements-' + req.param('version') + '.json')
});
app.get('/servicejson/:service/:version/:plan', function(req, res){
    //TODO Is this safe?
    console.log(req.params)
    res.redirect('/js/data/' + req.param('service') + '_vms_single_az_template-' + req.param('version')  + "-" +req.param('plan') + '.json')
});


app.listen(process.env.PORT || 3000);
