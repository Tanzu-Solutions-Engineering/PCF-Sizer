#Getting Started
#Overview
We use a node app to hand out static content ([app.js](https://github.com/pivotalservices/shekel/blob/master/app.js)). 
Fire it up (`node app.js`) and browse to http://localhost:3000, bask in the warm glow that is Shekel.

##Testing
We're using jasmine and karma. Get those installed via NPM. 

This [page](http://techportal.inviqa.com/2014/10/28/testing-javascript-get-started-with-jasmine/) is helpful for getting up to speed and figuring out which way is up. 

For this project you don't need to run the generators, as we've done that for you. In a nutshell: 

```
brew install npm
npm install -g yo
npm install -g bower
npm install -g karma
npm install -g karma-jasmine --save-dev
npm install -g karma-phantomjs-launcher
```
Tests are located in `test/spec`. 

To run them we use `karma`. 

Assuming you're on a mac, and it acts like mine: 

```
cd ~/git/shekel
/usr/local/lib/node_modules/karma/bin/karma start test/karma.conf.js
``` 

That should get you going. If you can't find karma run `npm -g list` and make sure it's installed. 
Coverage is lackluster, help us make it better if you like. 

