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
    .action(function() {
        login();
    });

program
    .command('project')
    .description('Choose a project')
    .action(function() {
        chooseProject();
    });

program
    .command('tasks')
    .description('List all tasks')
    .action(function() {
        listTasks();
    });

program
    .command('start')
    .description('Start a task')
    .action(function() {
        startTask();
    });

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
    var tasks = [];
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
            console.log('- ' + issue.fields.summary);
            var subtasks = issue.fields.subtasks;
            if (!subtasks) {
                return;
            }
            subtasks.forEach(function(subtask) {
                var status = subtask.fields.status.name;
                if (status !== 'Closed' && status !== 'Resolved' && status !== 'Verify') {
                    tasks.push(subtask);
                    console.log('    * ' + subtask.key + ': ' + subtask.fields.summary);
                }
            });
        });
        if (callback) {
            callback(null, tasks);
        }
    };

    request.get({
        url: url,
        auth: config.getCredentials()
    }, parseResponse);
}

function startTask(callback) {
    listTasks(function(err, tasks) {
        if (err) {
            return console.log(err);
        }
        var taskCodes = tasks.map(function(task) {
            return task.key;
        });
        console.log(taskCodes);
        promptly.choose('Which task do you want to start?', taskCodes, function(err, chosenTask) {
            if (err) {
                return console.log('invalid task');
            }
            var task = _.findWhere(tasks, { key: chosenTask });
            var taskId = task.id;
            config.set('taskId', taskId);

            parseResponse = function(err, result) {
                if (err) {
                    return console.log(err);
                }
            };

            getTransitions(taskId, function(err, transitions) {
                var transitionId = transitions['In Progress'];

                if (err) {
                    return console.log(err);
                }

                var url = 'https://icemobile.atlassian.net/rest/api/2/issue/'+taskId+'/transitions';

                var reqBody = {
                    transition: {
                        id: transitionId
                    }
                };

                request.post({
                    url: url,
                    json: reqBody,
                    auth: config.getCredentials()
                }, parseResponse);
                });

        });
    });
}

function getTransitions(issueId, callback) {
    var url = 'https://icemobile.atlassian.net/rest/api/2/issue/'+issueId+'/transitions';

    function parseResponse(err, result, body) {
        body = JSON.parse(body);

        if (err) {
            return callback(err);
        }
        var transitions = {};

        body.transitions.forEach(function(transition) {
            transitions[transition.name] = transition.id;
        });

        callback(null, transitions);
    }

    request.get({
        url: url,
        auth: config.getCredentials()
    }, parseResponse);
}

program.parse(process.argv);
