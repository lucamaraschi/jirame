var request = require('request');
var auth = require('./config.json').auth;

var url = 'https://icemobile.atlassian.net/rest/api/latest/project';
var callback = function(err, result, body) {
    console.log(err);
    console.log(body);
};

request.get({
    url: url,
    auth: auth
}, callback);
