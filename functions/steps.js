const data = require('./data.js');
const gql = require('./graphql.js');
<<<<<<< HEAD
const eval = require('./eval.js');
const newrelic = require('newrelic');

// grab the Mixpanel factory
var Mixpanel = require('mixpanel');

// create an instance of the mixpanel client
var mixpanel = Mixpanel.init(process.env.MIXPANEL_PROJECT_TOKEN);

const newBranch = async (context, branch, count) => {
  const responseBody = context.issue({
    path: ".bit/.progress",
    ref: branch
  });

  try {
    countfile = await context.octokit.repos.getContent(responseBody);
    console.log(countfile)
  } catch (e) {
    return null
  }


  const update = context.issue({
    path: ".bit/.progress",
    message: "Update progress",
    content: Buffer.from(count.toString()).toString('base64'),
    // countfile must request the specific week branch
    sha: countfile.data.sha,
    branch: branch,
    committer: {
      name: `counselorbot`,
      email: "info@bitproject.org",
    },
    author: {
      name: `counselorbot`,
      email: "info@bitproject.org",
    },
  });
  console.log("Attempting to update...")
  await context.octokit.repos.createOrUpdateFileContents(update)
  console.log("Successfully updated!")  
}

const deleteFile = async (context) => {
  try {
    let file = await data.getFileContent(context, ".github/workflows/main.yml");
    await context.octokit.repos.deleteFile({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      path: ".github/workflows/main.yml",
      message: "Delete workflow",
      sha: file[0].data.sha,
    });
  } catch (e) {
    console.log("Error: had trouble deleting workflow")
  }

=======
const evaluation = require('./evaluation.js');
const fetch = require('node-fetch');
// const // newrelic = require('// newrelic');

// grab the Mixpanel factory
// var Mixpanel = require('mixpanel');

// create an instance of the mixpanel client
// var mixpanel = Mixpanel.init(process.env.MIXPANEL_PROJECT_TOKEN);

const newBranch = async (context, branch, count) => {

  // // code prevents two workflows from running and failing
  // const runs = await context.octokit.actions.listWorkflowRunsForRepo({
  //   owner: context.payload.repository.owner.login,
  //   repo: context.payload.repository.name,
  //   per_page: 1
  // });

  // console.log(JSON.stringify(runs))
  // const id = runs.data.workflow_runs[0].id;

  // await context.octokit.actions.cancelWorkflowRun({
  //   owner: context.payload.repository.owner.login,
  //   repo: context.payload.repository.name,
  //   run_id: id,
  // });

  // console.log(id);


  // // [DELETE] .progress information

  // const responseBody = context.issue({
  //   path: ".github/workflows/README.md",
  //   ref: branch
  // });

  // try {
  //   countfile = await context.octokit.repos.getContent(responseBody);
  //   console.log(countfile)
  // } catch (e) {
  //   return null
  // }


  // const update = context.issue({
  //   path: ".github/workflows/README.md",
  //   message: "Update progress",
  //   // content: Buffer.from(count.toString()).toString('base64'),
  //   content: Buffer.from(" ").toString('base64'),
  //   // countfile must request the specific week branch
  //   sha: countfile.data.sha,
  //   // branch: branch,
  //   committer: {
  //     name: `counselorbot`,
  //     email: "info@bitproject.org",
  //   },
  //   author: {
  //     name: `counselorbot`,
  //     email: "info@bitproject.org",
  //   },
  // });
  // console.log("Attempting to update...")
  // await context.octokit.repos.createOrUpdateFileContents(update)
  // console.log("Successfully updated!")
}

const deleteFile = async (context, installation) => {
  let file = await data.getFileContent(context, ".github/workflows/main.yml");
  try {
    if (installation === "installation") {
      await context.octokit.repos.deleteFile({
        owner: context.payload.installation.account.login,
        repo: context.payload.repositories[0].name,
        path: ".github/workflows/main.yml",
        message: "Delete workflow",
        sha: file[0].data.sha,
      });
    }
    else {
      await context.octokit.repos.deleteFile({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        path: ".github/workflows/main.yml",
        message: "Delete workflow",
        sha: file[0].data.sha,
      });
    }

  } catch (e) {
    console.log("Error: had trouble deleting workflow");
    console.log(e);
  }
>>>>>>> azure-function-bot/main
}

const updateFiles = async (typeOfStep, moveOn, count, configyml, branchName, context) => {
  console.log("Incrementing count")
  console.log(count)
  count += 1
  console.log(count)

  try {
<<<<<<< HEAD
    let mainfile = await data.getFileContent(context, ".bit/.progress")
    const mainupdate = context.issue({
      path: ".bit/.progress",
      message: "Update progress",
      content: Buffer.from(count.toString()).toString('base64'),
=======
    let mainfile = await data.getFileContent(context, ".github/workflows/README.md")
    const mainupdate = context.issue({
      path: ".github/workflows/README.md",
      message: "Update progress",
      // content: Buffer.from(count.toString()).toString('base64'),
      content: Buffer.from(" ").toString('base64'),
>>>>>>> azure-function-bot/main
      // countfile must request the specific week branch
      sha: mainfile[0].data.sha,
      committer: {
        name: `counselorbot`,
        email: "info@bitproject.org",
      },
      author: {
        name: `counselorbot`,
        email: "info@bitproject.org",
      },
    });
    await context.octokit.repos.createOrUpdateFileContents(mainupdate)
    console.log("Successfully updated main branch.")

    if (branchName != null) {
      const responseBody = context.issue({
<<<<<<< HEAD
        path: ".bit/.progress",
        ref: branchName
      });
      countfile = await context.octokit.repos.getContent(responseBody);
      
      const update = context.issue({
        path: ".bit/.progress",
        message: "Update progress",
        content: Buffer.from(count.toString()).toString('base64'),
        // countfile must request the specific week branch
        sha: countfile.data.sha,
        branch: branchName,
=======
        path: ".github/workflows/README.md",
        ref: branchName
      });
      countfile = await context.octokit.repos.getContent(responseBody);

      const update = context.issue({
        path: ".github/workflows/README.md",
        message: "Update progress",
        // content: Buffer.from(count.toString()).toString('base64'),
        content: Buffer.from(" ").toString('base64'),
        // countfile must request the specific week branch
        sha: countfile.data.sha,
        // branch: branchName,
>>>>>>> azure-function-bot/main
        committer: {
          name: `counselorbot`,
          email: "info@bitproject.org",
        },
        author: {
          name: `counselorbot`,
          email: "info@bitproject.org",
        },
      });
      console.log("Attempting to update...")
      await context.octokit.repos.createOrUpdateFileContents(update)
<<<<<<< HEAD
      console.log("Successfully updated!") 
    } 
=======
      console.log("Successfully updated!")
    }
>>>>>>> azure-function-bot/main
  } catch (e) {
    console.log("End of week")
    console.log(e)
  }

<<<<<<< HEAD
  var path = `.bit/responses/${configyml.steps[count-1].actions[0].with}`
=======
  var path = `.bit/responses/${configyml.steps[count - 1].actions[0].with}`
>>>>>>> azure-function-bot/main
  var gqlrequest = ""
  var attributes = ""

  if (typeOfStep[0] == "feedback") {
    var gqlrequest = `
    mutation insertProgress {
     insert_users_progress(
       objects: {
         link: "${moveOn[1]}", 
         feedback: "${moveOn[3]}",
         path: "${path}", 
         repo: "${moveOn[2]}", 
         title: "${configyml.steps[count].title}", 
         user: "${moveOn[4]}",
         count: ${count},
         repoName: "${moveOn[5]}",
       }
     ) {
       returning {
         id
       }
     }
   }
   `
    var attributes = { type: 'Feedback', feedback: moveOn[3], user: moveOn[4], repo: moveOn[2], repoName: moveOn[5], title: configyml.steps[count].title, link: moveOn[1], path: path, count: count }
<<<<<<< HEAD
    mixpanel.track('Feedback', {
      'distinct_id': moveOn[4], 
      'feedback': moveOn[3], 
      'user': moveOn[4], 
      'repo': moveOn[2], 
      'repoName': moveOn[5], 
      'title': configyml.steps[count].title, 
      'link': moveOn[1], 
      'path': path, 
      'count': count 
      });
=======
    // mixpanel.track('Feedback', {
    //   'distinct_id': moveOn[4],
    //   'feedback': moveOn[3],
    //   'user': moveOn[4],
    //   'repo': moveOn[2],
    //   'repoName': moveOn[5],
    //   'title': configyml.steps[count].title,
    //   'link': moveOn[1],
    //   'path': path,
    //   'count': count
    // });
>>>>>>> azure-function-bot/main
  } else {
    var gqlrequest = `
    mutation insertProgress {
     insert_users_progress(
       objects: {
         link: "${moveOn[1]}", 
         path: "${path}", 
         repo: "${moveOn[2]}", 
         title: "${configyml.steps[count].title}", 
         user: "${moveOn[3]}",
         count: ${count},
         repoName: "${moveOn[4]}",
       }
     ) {
       returning {
         id
       }
     }
   }
   `
<<<<<<< HEAD
    
   var trackingName = `Start Step ${count}`;
   var attributes = { type: 'Start New Step', user: moveOn[3], repo: moveOn[2], repoName: moveOn[4], title: configyml.steps[count].title, link: moveOn[1], path: path, count: count }
   mixpanel.track(trackingName, {
    'distinct_id': moveOn[3], 
    'user': moveOn[3], 
    'repo': moveOn[2], 
    'repoName': moveOn[4], 
    'title': configyml.steps[count].title, 
    'link': moveOn[1], 
    'path': path, 
    'count': count 
    });
  }
 
 console.log(await gql.queryData(gqlrequest))

 // log in newrelic
 newrelic.recordCustomEvent("CabinGithub", attributes)
=======

    var trackingName = `Start Step ${count}`;
    var attributes = { type: 'Start New Step', user: moveOn[3], repo: moveOn[2], repoName: moveOn[4], title: configyml.steps[count].title, link: moveOn[1], path: path, count: count }
    // mixpanel.track(trackingName, {
    //   'distinct_id': moveOn[3],
    //   'user': moveOn[3],
    //   'repo': moveOn[2],
    //   'repoName': moveOn[4],
    //   'title': configyml.steps[count].title,
    //   'link': moveOn[1],
    //   'path': path,
    //   'count': count
    // });
  }

  console.log(await gql.queryData(gqlrequest))

  // log in // newrelic
  // // newrelic.recordCustomEvent("CabinGithub", attributes)
>>>>>>> azure-function-bot/main
}

const nextStep = async (count, context, configyml, issueno) => {

  var branchName = ""
  try {
    branchName = configyml.steps[count].branch
  } catch (e) {
    branchName = null
  }
<<<<<<< HEAD
  
=======

  console.log("running checkForMergeNext in nextStep");
  await checkForMergeNext(context, count + 1, configyml);

>>>>>>> azure-function-bot/main
  // update count, update hasura and local file
  for (y = 0; y < configyml.steps[count].actions.length; y++) {
    var array = configyml.steps[count].actions[y]
    console.log("Responding")
    console.log(y)
    console.log(configyml.steps[count].actions.length)

    // Executes an action based on the step in the YAML
    if (array.type == "respond") {
      console.log("Creating comment...")
      let responseFile = array.with
      const response = await data.getFileContent(context, `.bit/responses/${responseFile}`)
      const issueComment = context.issue({
        body: data.parseTable(response[1]),
        issue_number: issueno,
      });
      context.octokit.issues.createComment(issueComment)
    }

    if (array.type == "createIssue") {
      console.log("Creating issue...")
      let responseFile = array.body
      const response = await data.getFileContent(context, `.bit/responses/${responseFile}`)
      const issueBody = context.issue({
        title: array.title,
        body: data.parseTable(response[1]),
      });

      context.octokit.issues.create(issueBody)
<<<<<<< HEAD
    } 

    if (array.type == "closeIssue") {
=======
    }

    if (array.type == "closeIssue") {

      // if this closes an issue, will the context be the same as if we opened a new pull request (that is what my code currently activates on)
>>>>>>> azure-function-bot/main
      console.log("Closing issue...")
      const payload = context.issue({
        state: "closed",
        issue_number: issueno,
      })

      context.octokit.issues.update(payload)
    }
  }
<<<<<<< HEAD
  
  return branchName
}

const workEvaluation = async (typeOfStep, context, configyml) => {
  var res = []
  if (typeOfStep[0] == "checks") {
    console.log("Checking checks")
    res = await eval.checks(context)
  } else if (typeOfStep[0] == "IssueComment") {
    console.log("Checking comment")
    res = await eval.IssueComment(context)
  } else if (typeOfStep[0] == "PRmerge") {
    console.log("Checking PR")
    res = await eval.PRmerge(context, configyml)
  } else if (typeOfStep[0] == "feedback") {
    console.log("Receiving feedback")
    res = await eval.feedback(context)
=======

  return branchName
}

const workEvaluation = async (typeOfStep, context, configyml, count, issueNo) => {
  var res = []
  if (typeOfStep[0] == "checks") {
    console.log("Checking checks")
    res = await evaluation.checks(context, issueNo)
  } else if (typeOfStep[0] == "IssueComment") {
    console.log("Checking comment")
    res = await evaluation.IssueComment(context)
  } else if (typeOfStep[0] == "PRmerge") {
    console.log("Checking PR")
    res = await evaluation.PRmerge(context, configyml, count)
  } else if (typeOfStep[0] == "feedback") {
    console.log("Receiving feedback")
    res = await evaluation.feedback(context)
>>>>>>> azure-function-bot/main
  }
  return res
}

<<<<<<< HEAD
const startLab = async (context, configyml) => {
    var gqlrequest = `
    mutation startCourse {
    insert_course_analytics(
        objects: {
        repo: "${context.payload.repository.html_url}", 
        user: "${context.payload.repository.owner.login}"
=======
const startLab = async (context, configyml, installation) => {
  let owner;
  let repo;
  let install_url;
  if (installation === "installation") {
    owner = context.payload.installation.account.login;
    repo = context.payload.repositories[0].name;
    install_url = context.payload.installation.account.html_url;
  }
  else {
    owner = context.payload.repository.owner.login
    repo = context.payload.repository.name
    install_url = context.payload.repository.html_url;
  }

  var gqlrequest = `
    mutation startCourse {
    insert_course_analytics(
        objects: {
        repo: "${repo}", 
        user: "${owner}"
>>>>>>> azure-function-bot/main
    }) {
        returning {
        id
        }
    }
    }
    `
<<<<<<< HEAD
    console.log(await gql.queryData(gqlrequest))

    const attributes = { type: 'Start Camp', user: context.payload.repository.owner.login, repo: context.payload.repository.html_url }
    newrelic.recordCustomEvent("CabinGithub", attributes)

    mixpanel.track('Start Camp', {
      'distinct_id': context.payload.repository.owner.login,
      'user': context.payload.repository.owner.login, 
      'repo': context.payload.repository.html_url 
     });
    
    try {
        await context.octokit.repos.createOrUpdateFileContents({
          owner: context.payload.repository.owner.login,
          repo: context.payload.repository.name,
          path: ".bit/.progress",
          message: "Track progress",
          content: Buffer.from(JSON.stringify(0)).toString('base64'),
          committer: {
            name: `counselorbot`,
            email: "info@bitproject.org",
          },
          author: {
            name: `counselorbot`,
            email: "info@bitproject.org",
          },
        })
      } catch (e) {
        console.log(e)
      }
    
    console.log("Tracked the progress...")
    try{
      var path = `.bit/responses/${configyml.before[0].body}`
      var gqlrequest = `
=======
  console.log(await gql.queryData(gqlrequest))



  try {
    await context.octokit.repos.createOrUpdateFileContents({
      owner: owner,
      repo: repo,
      path: ".github/workflows/README.md",
      message: "Track progress",
      // content: Buffer.from(JSON.stringify(0)).toString('base64'),
      content: Buffer.from(" ").toString('base64'),
      committer: {
        name: `counselorbot`,
        email: "info@bitproject.org",
      },
      author: {
        name: `counselorbot`,
        email: "info@bitproject.org",
      },
    })
  } catch (e) {
    console.log(e)
  }

  console.log("Tracked the progress...")
  try {
    var path = `.bit/responses/${configyml.before[0].body}`
    var gqlrequest = `
>>>>>>> azure-function-bot/main
      mutation insertProgress {
          insert_users_progress(
          objects: {
              path: "${path}", 
<<<<<<< HEAD
              repo: "${context.payload.repository.html_url}", 
              title: "${configyml.steps[0].title}", 
              user: "${context.payload.repository.owner.login}",
              count: 0,
              repoName: "${context.payload.repository.name}"
=======
              repo: "${install_url}", 
              title: "${configyml.steps[0].title}", 
              user: "${owner}",
              count: 0,
              repoName: "${repo}"
>>>>>>> azure-function-bot/main
          }
          ) {
          returning {
              id
          }
          }
      }
      `
<<<<<<< HEAD
      let res = await gql.queryData(gqlrequest)
      console.log(res)

      //log first step in newrelic
      const attributes = { type: 'Start New Step', user: context.payload.repository.owner.login, repo: context.payload.repository.html_url, repoName: context.payload.repository.name, title: configyml.steps[0].title, path: path, count: 0 }
      newrelic.recordCustomEvent("CabinGithub", attributes)

      //log in mixpanel first step
      mixpanel.track('Start First Step', {
        'distinct_id': context.payload.repository.owner.login,
        'user': context.payload.repository.owner.login, 
        'repo': context.payload.repository.html_url, 
        'repoName': context.payload.repository.name, 
        'title': configyml.steps[0].title, 
        'path': path, 
        'count': 0 
      });
    } catch (e) {
      console.log(e)
    }
    

    console.log("Templated created...")
    console.log("Attempting to get YAML")

    // start lab by executing what is in the before portion of config.yml
    let response = await context.octokit.repos.getContent({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
        path: path,
    });

    response = Buffer.from(response.data.content, 'base64').toString()
    return await context.octokit.issues.create({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      title: configyml.before[0].title,
      body: data.parseTable(response),
    })
}

const workFlow = async (context) => {
  console.log("Getting files")
  let files = await context.octokit.repos.getContent({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    path: ".bit/workflows"
  });


=======
    let res = await gql.queryData(gqlrequest)
    console.log(res)

    //log first step in // newrelic

  } catch (e) {
    console.log(e)
  }


  console.log("Templated created...")
  console.log("Attempting to get YAML")

  // start lab by executing what is in the before portion of config.yml
  let response = await context.octokit.repos.getContent({
    owner: owner,
    repo: repo,
    path: path,
  });

  response = Buffer.from(response.data.content, 'base64').toString()
  return await context.octokit.issues.create({
    owner: owner,
    repo: repo,
    title: configyml.before[0].title,
    body: data.parseTable(response),
  })
}

const workFlow = async (context, installation) => {
  let owner;
  let repo;
  if (installation === "installation") {
    owner = context.payload.installation.account.login
    repo = context.payload.repositories[0].name
  }
  else {
    owner = context.payload.repository.owner.login
    repo = context.payload.repository.name
  }
  console.log("Getting files")
  let files = await context.octokit.repos.getContent({
    owner: owner,
    repo: repo,
    path: ".bit/workflows"
  });

  console.log(files)
  console.log(files.data.length);
>>>>>>> azure-function-bot/main
  for (i = 0; i < files.data.length; i++) {
    let body = await data.getFileContent(context, `.bit/workflows/${files.data[i].name}`)
    body = body[0].data.content

    try {
<<<<<<< HEAD
      await context.octokit.repos.createOrUpdateFileContents({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
=======
      console.log("Getting file " + i)
      console.log(files.data[i])
      await context.octokit.repos.createOrUpdateFileContents({
        owner: owner,
        repo: repo,
>>>>>>> azure-function-bot/main
        path: `.github/workflows/${files.data[i].name}`,
        message: "Start workflows",
        content: body,
        committer: {
          name: `counselorbot`,
          email: "info@bitproject.org",
        },
        author: {
          name: `counselorbot`,
          email: "info@bitproject.org",
        },
      })
<<<<<<< HEAD
    } catch (e) {
      console.log(e)
    }
=======
      console.log("Got workfow files");
    } catch (e) {
      console.log("Error in getting workflow files")
      console.log(e)
    }
  }
}

const approvePr = async (context) => {
  try {
    let issueNo = await data.issueNo(context);
    comments = [
      { body: 'Great job!' },
    ]
    options = { event: 'APPROVE', comments: comments }

    console.log("approving")
    await context.octokit.pulls.createReview({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      pull_number: issueNo,
      event: "APPROVE",
    })
  }
  catch (e) {
    console.log("APPROVE ERROR: ")
    console.log(e)
  }
}

const checkForMergeNext = async (context, count, configyml) => {
  console.log("Running check for merge next");
  console.log("Count: " + count);


  console.log("STEPS YAML: ");
  console.log(configyml.steps[count])

  if (configyml.steps[count].stepType == "PRmerge") {
    await approvePr(context);
  }
}

const protectBranch = async (context, installation) => {
  let owner;
  let repo;
  if (installation === "installation") {
    owner = context.payload.installation.account.login
    repo = context.payload.repositories[0].name
  }
  else {
    owner = context.payload.repository.owner.login
    repo = context.payload.repository.name
  }
  console.log("protecting")
  await context.octokit.repos.updateBranchProtection({
    "owner": owner,
    "repo": repo,
    "branch": "main",
    "required_status_checks": null,
    "required_status_checks.strict": null,
    "required_status_checks.contexts": null,
    "enforce_admins": null,
    "required_pull_request_reviews": { true: true }, // using true by itself won't work
    "restrictions": null,
    "restrictions.users": [context.payload.repository.owner.login],
    "restrictions.teams": ["bitprj"]
  })
}

const cancelRecentWorkflow = async (context) => {
  // list recent workflow runs
  await context.octokit.actions.listWorkflowRuns({
    owner: context.payload.repository.owner.name,
    repo: context.payload.repository.name,
    workflow_id,
  });
}


const provideHelp = async (context) => {
  const endpoint = process.env.QNA_ENDPOINT;
  let commentBody = context.payload.comment.body;
  let ask = commentBody.substring("@counselorbot ".length);

  let body = {
    question: ask
  };

  let resp = await fetch(endpoint, {
    body: JSON.stringify(body),
    headers: {
      Authorization: `EndpointKey ${process.env.QNA_ENDPOINT_KEY}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  })
  let data = await resp.json();
  let answer = data.answers[0].answer;
  // throw new Error(answer);

  // create the issue comment

  if (answer === "No good match found in KB.") {
    // ask instructor for help
    context.octokit.issues.createComment({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      issue_number: context.payload.issue.number,
      body: `[ANSWER] Please contact your instructor on Slack for help!`,
    });
  }
  else {
    context.octokit.issues.createComment({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      issue_number: context.payload.issue.number,
      body: `[ANSWER] ${answer}`,
    });
  }
}

const checkIssueClosed = async (context) => {
  if (context.payload.sender.login != "counselorbot-serverless-pro-max[bot]") {
    // list all issue comments
    const issuesComments = await context.octokit.issues.listComments({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      issue_number: context.payload.issue.number,
    });


    // reopen the issue of the last comment is not closed via oauth
    try {
      if (issuesComments.data.length == 0 || issuesComments.data[issuesComments.data.length - 1].body != "closed via oauth") {
        await context.octokit.issues.update({
          owner: context.payload.repository.owner.login,
          repo: context.payload.repository.name,
          issue_number: context.payload.issue.number,
          state: "open"
        })
      }
    }
    catch (e) {
      console.log("error!!!")
    }
>>>>>>> azure-function-bot/main

  }
}

<<<<<<< HEAD
=======
const closeCurrentIssue = async (context) => {
  // close the current issue
  await context.octokit.issues.update({
    owner: context.payload.repository.owner.login,
    repo: context.payload.repository.name,
    issue_number: context.payload.issue.number,
    state: "closed"
  });
}

>>>>>>> azure-function-bot/main
exports.startLab = startLab
exports.workEvaluation = workEvaluation
exports.nextStep = nextStep
exports.workFlow = workFlow
exports.deleteFile = deleteFile
exports.updateFiles = updateFiles
exports.newBranch = newBranch
<<<<<<< HEAD
=======
exports.protectBranch = protectBranch
exports.checkForMergeNext = checkForMergeNext
exports.cancelRecentWorkflow = cancelRecentWorkflow
exports.provideHelp = provideHelp;
exports.checkIssueClosed = checkIssueClosed;
exports.closeCurrentIssue = closeCurrentIssue;
>>>>>>> azure-function-bot/main
