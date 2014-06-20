var request = require('request');
var config = require('./config');

var url = 'https://icemobile.atlassian.net/rest/api/latest/project';
var callback = function(err, result, body) {
    console.log(err);
    console.log(body);
};

config.setCredentials('user', 'pass');

request.get({
    url: url,
    auth: config.getCredentials()
}, callback);
