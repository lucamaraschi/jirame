jira #prompts for login
jira project start bac #sets bac as current project
jira task start AC-42 #sets AC-42 as current task. Task is marked as 'in progress'.
jira task start AC-42 --verify #sets AC-42 as current task. Task is marked as 'verify'.
jira task stop #stop working on active task. Task is moved back to 'to do'.
jira task done #stop working on active task. Task is moved to done.
jira task done --verify #stops working on active task. Task is moved to verify.
jira list #show list of tasks in current sprint.
jira list --all #show list of all tasks (in sprint and out).
