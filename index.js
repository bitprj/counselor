/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
var configyml;
var yamlfile;
var progressFile;
var count = 0;
var o = {}
var key = "Progress"
o[key] = []

const yaml = require('js-yaml');

module.exports = (app) => {
 // Your code here
 var start = "";
 app.log.info("Yay, the app was loaded!");
 app.on("push", async (context) => {
   app.log.info("Pushed")
   app.log.info(context.payload.repository.owner.login, context.payload.repository.name)
   try {
    var yamlfile = await context.octokit.repos.getContent({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      path:".bit/config.yml",
    });
    app.log.info("Attempting to get YAML")
   } catch (e) {
     console.log(e)
      return
   }
  
    yamlfile = Buffer.from(yamlfile.data.content, 'base64').toString()
    try {
      let fileContents = yamlfile
      configyml = yaml.load(fileContents);
    } catch (e) {
      console.log("ERROR: " + e);
    }

    // start lab by executing what is in the before portion of config.yml
    let response = await context.octokit.repos.getContent({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      path:`.bit/responses/${configyml.before[0].body}`,
    });

    var data = {
      stepTitle: configyml.steps[0].title,
      time: context.payload.commits[0].timestamp
    }
    o[key].push(data);

    try {
      await context.octokit.repos.createOrUpdateFileContents({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        path: ".bit/.progress",
        message: "Track progress",
        content: Buffer.from(JSON.stringify(o)).toString('base64'),
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
      return
    }

    response = Buffer.from(response.data.content, 'base64').toString()
    return await context.octokit.issues.create({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      title: configyml.before[0].title,
      body: response,
    })
 });


 app.on(['pull_request.closed', 'issue_comment.created'], async (context) => {
   var yamlfile;

   try {
     user = context.payload.sender.login
   } catch (e) {
     user = ""
   }

   app.log.info(user)

   if (user != "bitcampdev[bot]") {
     try {
       const yamlFile = context.issue({
         path: '.bit/config.yml',
       });
       var yamlfile = await context.octokit.repos.getContent(yamlFile);
     } catch (e) {
       process.exit()
     }

     yamlfile = Buffer.from(yamlfile.data.content, 'base64').toString()

     try {
       let fileContents = yamlfile
       configyml = await yaml.load(fileContents);
     } catch (e) {
       console.log("ERROR: " + e);
     }
 
     const campProgress = context.issue({
       path: ".bit/.camp",
     });
 
     var countfile = await context.octokit.repos.getContent(campProgress);
     count = parseInt(Buffer.from(countfile.data.content, 'base64').toString())
     app.log.info(configyml.steps[0])
 
     for (y = 0; y < configyml.steps[count].actions.length; y++) {
       var array = configyml.steps[count].actions[y]
       app.log.info(array)
 
       if (array.type == "respond") {
         const responseFile = context.issue({
           path:`.bit/responses/${array.with}`,
         });
         var response = await context.octokit.repos.getContent(responseFile);
         response = Buffer.from(response.data.content, 'base64').toString()
         const issueComment = context.issue({
           body: response,
           issue_number: array.issue,
         });
         context.octokit.issues.createComment(issueComment)
         app.log.info("Respond")
       }
       if (array.type == "createIssue") {
         const responseBody = context.issue({
           path:`.bit/responses/${array.body}`,
         });
         var response = await context.octokit.repos.getContent(responseBody);
         response = Buffer.from(response.data.content, 'base64').toString()
         const issueBody = context.issue({
           issue_number: array.issue,
           title: array.title,
           body: response,
         });
         app.log.info("createIssue")
         context.octokit.issues.create(issueBody)
       } 
       if (array.type == "closeIssue") {
         const payload = context.issue({
           state: "closed",
           issue_number: array.issue,
         })
         context.octokit.issues.update(payload)
       }
     }
 
     count = parseInt(count)
     count += 1
     app.log.info("Count: " + count)
     app.log.info(JSON.stringify(countfile))
     
     const update = context.issue({
       path: ".bit/.camp",
       message: "Update progress",
       content: Buffer.from(count.toString()).toString('base64'),
       sha: countfile.data.sha,
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

    const newProgress = context.issue({
      path: ".bit/.progress",
    });

    var progressFile = await context.octokit.repos.getContent(newProgress);
    o = JSON.parse(Buffer.from(progressFile.data.content, 'base64').toString())

    try {
      data = {
        stepTitle: configyml.steps[count].title,
        time: context.payload.pull_request.merged_at,
      }
    } catch (e) {
      console.log("should work: " + context.payload.comment.created_at)
      data = {
        stepTitle: configyml.steps[count].title,
        time: context.payload.comment.created_at,
      }
    }

    console.log("Data: " + JSON.stringify(data))
    o[key].push(data); 
    console.log(JSON.stringify(o))
    const progressUpdate = context.issue({
      path: ".bit/.progress",
      message: "Update progress",
      content: Buffer.from(JSON.stringify(o)).toString('base64'),
      sha: progressFile.data.sha,
      committer: {
        name: `bitcampdev`,
        email: "info@bitproject.org",
      },
      author: {
        name: `bitcampdev`,
        email: "info@bitproject.org",
      },
      
    });
    return context.octokit.repos.createOrUpdateFileContents(progressUpdate)
    }
 });
};