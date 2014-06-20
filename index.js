#!/usr/bin/env node

var program = require('commander');
var promptly = require('promptly');
var request = require('request');
var config = require('./config');
var _ = require('underscore');

if (!config.getCredentials) {
    login();
}

program
    .command('login')
    .description('Couple jirame to your Jira account')
    .action(login);

program
    .command('project')
    .description('Choose a project')
    .action(chooseProject);

program
    .command('task')
    .description('List all tasks')
    .action(listTasks);

function login(callback) {
    promptly.prompt('Username: ', function(err, user){
        if (err) {
            if (callback) {
                callback('invalid username');
            }
            return console.log('invalid username');
        }
        promptly.password('Password: ', function(err, pass) {
            if (err) {
                if (callback) {
                    callback('invalid password');
                }
                return console.log('invalid password');
            }
            config.setCredentials(user, pass);
            if (callback) {
                callback();
            }
        });
    });
}

function chooseProject(callback) {
    var url = 'https://icemobile.atlassian.net/rest/api/latest/project';
    var parseResponse = function(err, result, body) {
        projectList = JSON.parse(body);
        console.log('Projects:');
        var projectNames = projectList.map(function(project) {
            var name = project.name;
            console.log('- ' + name);
            return name;
        });
        promptly.choose('Which project are you working on?',
                        projectNames,
                        function(err, chosenProject) {
            if (err) {
                if (callback) {
                    callback('invalid project');
                }
                return console.log('invalid project');
            }
            var project = _.findWhere(projectList, { name: chosenProject });
            var projectId = project.id;
            config.set('projectId', projectId);
            if (callback) {
                callback(null, projectId);
            }
        });
    };

    request.get({
        url: url,
        auth: config.getCredentials()
    }, parseResponse);
}

function listTasks(callback) {
    var projectId = config.get('projectId');
    if (!projectId) {
        return console.log('choose a project to join first!');
    }
    var url = 'https://icemobile.atlassian.net/rest/api/latest/search?jql=project%3D' + projectId +
            '%26Sprint%20in%20openSprints()%26issuetype%20in%20standardIssueTypes()&expand=subtasks';
    var parseResponse = function(err, result, body) {
        if (err) {
            return console.log(err);
        }
        var issueList = JSON.parse(body).issues;
        issueList.forEach(function(issue) {
            console.log('- ' + issue.key + ': ' + issue.fields.summary);
            var subtasks = issue.fields.subtasks;
            if (!subtasks) {
                return;
            }
            subtasks.forEach(function(subtask) {
                var status = subtask.fields.status.name;
                if (status !== 'Closed' && status !== 'Resolved' && status !== 'Verify') {
                    console.log('    * ' + subtask.key + ': ' + subtask.fields.summary);
                }
            });
        });
    };

    request.get({
        url: url,
        auth: config.getCredentials()
    }, parseResponse);
}

program.parse(process.argv);
