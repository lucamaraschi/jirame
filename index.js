#!/usr/bin/env node

var program = require('commander');
var promptly = require('promptly');
var config = require('./config');

if (!config.getCredentials) {
    login();
}

program
    .command('login')
    .description('Couple jirame to your Jira account')
    .action(function() {
        login();
    });

function login() {
    promptly.prompt('Username: ', function(err, user){
        if (err) {
            return console.log('invalid username');
        }
        promptly.prompt('Password: ', function(err, pass) {
            if (err) {
                return console.log('invalid password');
            }
            config.setCredentials(user, pass);
        });
    });
}

program.parse(process.argv);
