#Getting Started
#Overview
We use a node app to hand out static content ([app.js](https://github.com/Pivotal-Field-Engineering/PCF-Sizer/blob/master/app.js)).
Fire it up (`node app.js`) and browse to http://localhost:3000, bask in the warm glow that is PCF Sizer.

##Testing
We're using jasmine and karma. Get those installed via NPM.

This [page](http://techportal.inviqa.com/2014/10/28/testing-javascript-get-started-with-jasmine/) is helpful for getting up to speed and figuring out which way is up.

For this project you don't need to run the generators, as we've done that for you. In a nutshell:

Prerequisite

1. brew install npm
2. Clone this repo to run it locally.
3. npm install -g bower karma gulp
4. npm install
4. bower install

In case you see issues with testing, you can install the dependencies globally
`npm install` should deal with this now
```
brew install npm
npm install -g yo
npm install -g bower
npm install -g karma
npm install -g karma-jasmine --save-dev
npm install -g karma-phantomjs-launcher
npm install gulp
```
Tests are located in `test/spec`.

To run them we use `karma`.

Assuming you're on a mac, and it acts like mine:

```
cd ~/git/PCF-Sizer
gulp test
```

We've also got some server tests that can be ran w/ `npm test`

That should get you going. If you can't find karma run `npm -g list` and make sure it's installed.
Coverage is lackluster, help us make it better if you like.

#Adding services
Check out the tile converter at https://github.com/pivotalservices/shekel-tile-parser. After that drop your service json in `js/data/services` and make sure to respect the naming convention of `<service>-<version>.json`. **NOTE** this tool does not currently catch singleton jobs!
