/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */

const newrelic = require('newrelic');

var count = 0;
var prcount = 0;
var issueno = 0;
var start;
var tracker = {}
var counter = {}
var key = "Progress"
var respond = false;
tracker[key] = []

const functions = require('./helpers');


module.exports = (app) => {
 app.log.info("Yay, the app was loaded!");
 app.on("push", async (context) => {
  tracker[key] = []
  // Executes for a push event on a repository with .bit
  app.log.info("Event: push")

  // Testing to see if this is the first time a template is created
  try {
    start = context.payload.commits[0].added[0].substring(0,4)
  } catch (e) {
    start = ""
  }


  if (start == ".bit") {
    // Record data in newrelic
    const attributes = { type: 'Start Camp', user: context.payload.repository.owner.login, repo: context.payload.repository.html_url }
    newrelic.recordCustomEvent("CabinGithub", attributes)

    app.log.info("Templated created...")
    app.log.info("Attempting to get YAML")
    var configyml = await functions.yamlFile(context)
    
    // start lab by executing what is in the before portion of config.yml
    let response = await context.octokit.repos.getContent({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      path:`.bit/responses/${configyml.before[0].body}`,
    });

    // Creating the .progress file that contains date and step
    var data = {
      stepTitle: configyml.steps[0].title,
      time: context.payload.commits[0].timestamp
    }
    tracker[key].push(data);

      try {
        await context.octokit.repos.createOrUpdateFileContents({
          owner: context.payload.repository.owner.login,
          repo: context.payload.repository.name,
          path: ".bit/.progress",
          message: "Track progress",
          content: Buffer.from(JSON.stringify(tracker)).toString('base64'),
          committer: {
            name: `bitcampdev`,
            email: "info@bitproject.org",
          },
          author: {
            name: `bitcampdev`,
            email: "info@bitproject.org",
          },
        })
      } catch (e) {
        console.log(e)
        return
      }

      response = Buffer.from(response.data.content, 'base64').toString()
      return await context.octokit.issues.create({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        title: configyml.before[0].title,
        body: response,
      })
   }
 });

// Triggers when a pull_request is closed or comment is created
 app.on(['pull_request.closed', 'issue_comment.created'], async (context) => {
   tracker = {};
   counter = {};
   count = 0;
   prcount = 0;
   var add = 0;
   respond = false

   try {
     user = context.payload.sender.login
   } catch (e) {
     user = ""
   }

   app.log.info(user)

   // Tests if the user created a comment, not the bot
   if (user != "bitcampdev[bot]") {

    var configyml = await functions.yamlFile(context)
    var countfile = await functions.getFileContent(context, ".bit/.camp")
    app.log.info(countfile[1])
    counter = JSON.parse(countfile[1])
    count = parseInt(counter.count)
    prcount = parseInt(counter.prcount)
    issueno = parseInt(counter.issue)
    
     // Record step progression in new relic
     var repoLink = context.payload.repository.html_url
     try {
       var issueLink = context.payload.issue.html_url
     } catch (e) {
       var issueLink = context.payload.pull_request.html_url
     }
     const attributes = { type: 'Completed Step', user: user, repo: repoLink, title: configyml.steps[count].title, path: `.bit/responses/${configyml.steps[count].actions[0].with}`, link: issueLink}
     newrelic.recordCustomEvent("CabinGithub", attributes)

    app.log.info("Count before: " + count)
    app.log.info(configyml.steps[count].event, context.payload.pull_request)
    app.log.info("Count: " + count)

    if (configyml.steps[count].event == "pull_request.closed" && context.payload.pull_request) {
      app.log.info("Count: " + count)
      var test2Array = []
      var testArray = []
      const fileCommits = context.issue({
        pull_number: context.payload.pull_request.number,
      })
      var pullFiles = await context.octokit.pulls.listFiles(fileCommits)

      for (i = 0; i < configyml.steps[count].actions[0].files.length; i++) {
        test2Array.push(configyml.steps[count].actions[0].files[i])
        for (y = 0; y < pullFiles.data.length; y++) {
          if (configyml.steps[count].actions[0].files[i] == pullFiles.data[y].filename) {
            testArray.push(pullFiles.data[y].filename)
          }
        }
      }

      app.log.info(test2Array)
      app.log.info(testArray)
      if (test2Array.length == testArray.length) {

        respond = true
      }
      // app.log.info(JSON.stringify(pullFiles.data[0].filename))
    } else {
      respond = true
    }
 
     for (y = 0; y < configyml.steps[count].actions.length; y++) {
       var array = configyml.steps[count].actions[y]
       app.log.info(array)
      
      // Executes an action based on the step in the YAML
      app.log.info("Respond: " + respond)
       if (array.type == "respond" && respond == true) {
         const response = await functions.getFileContent(context, `.bit/responses/${array.with}`)
         const issueComment = context.issue({
           body: response[1],
           issue_number: issueno,
         });
         context.octokit.issues.createComment(issueComment)
         app.log.info("Respond")
         add = 1
       }
       if (array.type == "createIssue" && configyml.steps[count].event == "issue_comment.created") {
         const response = await functions.getFileContent(context, `.bit/responses/${array.body}`)
         const issueBody = context.issue({
           issue_number: issueno + prcount,
           title: array.title,
           body: response[1],
         });
         app.log.info("createIssue")
         context.octokit.issues.create(issueBody)
         prcount += 1
       } 
       if (array.type == "closeIssue" && configyml.steps[count].event == "issue_comment.created") {
         const payload = context.issue({
           state: "closed",
           issue_number: issueno,
         })
         issueno = issueno + prcount
         prcount = 0
         context.octokit.issues.update(payload)
       }
     }
    
    if (context.payload.pull_request) {
      prcount += 1
    }
 
     
     // Increment the count
     app.log.info("Add: " + add)
     count += add
     app.log.info("Count: " + count)
     app.log.info("PRCount: " + prcount)
     app.log.info("Issue: " + issueno)
     counter.count = count
     counter.prcount = prcount
     counter.issue = issueno
     
     // Update the .camp file with new count
     const update = context.issue({
       path: ".bit/.camp",
       message: "Update progress",
       content: Buffer.from(JSON.stringify(counter)).toString('base64'),
       sha: countfile[0].data.sha,
       committer: {
         name: `bitcampdev`,
         email: "info@bitproject.org",
       },
       author: {
         name: `bitcampdev`,
         email: "info@bitproject.org",
       },
     });
     context.octokit.repos.createOrUpdateFileContents(update)
    
     if (respond == true) {
          // Retrieve .progress and append new step time/data 
    var progressFile = await functions.getFileContent(context, ".bit/.progress")
    tracker = JSON.parse(Buffer.from(progressFile[0].data.content, 'base64').toString())

    try {
      data = {
        stepTitle: configyml.steps[count].title,
        time: context.payload.pull_request.merged_at,
      }
    } catch (e) {
      data = {
        stepTitle: configyml.steps[count].title,
        time: context.payload.comment.created_at,
      }
    }

    const getLink = context.issue({})
    var links = await context.octokit.repos.get(getLink)

    console.log("[" + user + ", " + JSON.stringify(data) + ", " + links.data.html_url + "]")
    // + ", " + links.data.template_repository.html_url
    tracker[key].push(data); 
    console.log(JSON.stringify(tracker))
    const progressUpdate = context.issue({
      path: ".bit/.progress",
      message: "Update progress",
      content: Buffer.from(JSON.stringify(tracker)).toString('base64'),
      sha: progressFile[0].data.sha,
      committer: {
        name: `bitcampdev`,
        email: "info@bitproject.org",
      },
      author: {
        name: `bitcampdev`,
        email: "info@bitproject.org",
      },
      
    });
    return await context.octokit.repos.createOrUpdateFileContents(progressUpdate)
    }
  }

 });
};