var request = require('request');
var config = require('./config');

var url = 'https://icemobile.atlassian.net/rest/api/latest/project';
var callback = function(err, result, body) {
    body = JSON.parse(body);
    var test = body.map(function(item) {
        return item.name;
    });
    console.log(test);
};

request.get({
    url: url,
    auth: config.getCredentials()
}, callback);
