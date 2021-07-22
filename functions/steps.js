const data = require('./data.js');
const gql = require('./graphql.js');
const evaluation = require('./evaluation.js');
// const // newrelic = require('// newrelic');

// grab the Mixpanel factory
// var Mixpanel = require('mixpanel');

// create an instance of the mixpanel client
// var mixpanel = Mixpanel.init(process.env.MIXPANEL_PROJECT_TOKEN);

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
    console.log("Error: had trouble deleting workflow");
    console.log(e);
  }

}

const updateFiles = async (typeOfStep, moveOn, count, configyml, branchName, context) => {
  console.log("Incrementing count")
  console.log(count)
  count += 1
  console.log(count)

  try {
    let mainfile = await data.getFileContent(context, ".bit/.progress")
    const mainupdate = context.issue({
      path: ".bit/.progress",
      message: "Update progress",
      content: Buffer.from(count.toString()).toString('base64'),
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
  } catch (e) {
    console.log("End of week")
    console.log(e)
  }

  var path = `.bit/responses/${configyml.steps[count - 1].actions[0].with}`
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
}

const nextStep = async (count, context, configyml, issueno) => {

  var branchName = ""
  try {
    branchName = configyml.steps[count].branch
  } catch (e) {
    branchName = null
  }

  console.log("running checkForMergeNext in nextStep");
  await checkForMergeNext(context, count + 1, configyml);

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
    }

    if (array.type == "closeIssue") {

      // if this closes an issue, will the context be the same as if we opened a new pull request (that is what my code currently activates on)
      console.log("Closing issue...")
      const payload = context.issue({
        state: "closed",
        issue_number: issueno,
      })

      context.octokit.issues.update(payload)
    }
  }

  return branchName
}

const workEvaluation = async (typeOfStep, context, configyml, count) => {
  var res = []
  if (typeOfStep[0] == "checks") {
    console.log("Checking checks")
    res = await evaluation.checks(context)

  } else if (typeOfStep[0] == "IssueComment") {
    console.log("Checking comment")
    res = await evaluation.IssueComment(context)
  } else if (typeOfStep[0] == "PRmerge") {
    console.log("Checking PR")
    res = await evaluation.PRmerge(context, configyml, count)
  } else if (typeOfStep[0] == "feedback") {
    console.log("Receiving feedback")
    res = await evaluation.feedback(context)
  }
  return res
}

const startLab = async (context, configyml) => {
  var gqlrequest = `
    mutation startCourse {
    insert_course_analytics(
        objects: {
        repo: "${context.payload.repository.html_url}", 
        user: "${context.payload.repository.owner.login}"
    }) {
        returning {
        id
        }
    }
    }
    `
  console.log(await gql.queryData(gqlrequest))

  const attributes = { type: 'Start Camp', user: context.payload.repository.owner.login, repo: context.payload.repository.html_url }
  // // newrelic.recordCustomEvent("CabinGithub", attributes)

  // mixpanel.track('Start Camp', {
  //   'distinct_id': context.payload.repository.owner.login,
  //   'user': context.payload.repository.owner.login,
  //   'repo': context.payload.repository.html_url
  // });

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
  try {
    var path = `.bit/responses/${configyml.before[0].body}`
    var gqlrequest = `
      mutation insertProgress {
          insert_users_progress(
          objects: {
              path: "${path}", 
              repo: "${context.payload.repository.html_url}", 
              title: "${configyml.steps[0].title}", 
              user: "${context.payload.repository.owner.login}",
              count: 0,
              repoName: "${context.payload.repository.name}"
          }
          ) {
          returning {
              id
          }
          }
      }
      `
    let res = await gql.queryData(gqlrequest)
    console.log(res)

    //log first step in // newrelic
    const attributes = { type: 'Start New Step', user: context.payload.repository.owner.login, repo: context.payload.repository.html_url, repoName: context.payload.repository.name, title: configyml.steps[0].title, path: path, count: 0 }
    // newrelic.recordCustomEvent("CabinGithub", attributes)

    //log in mixpanel first step
    // mixpanel.track('Start First Step', {
    //   'distinct_id': context.payload.repository.owner.login,
    //   'user': context.payload.repository.owner.login,
    //   'repo': context.payload.repository.html_url,
    //   'repoName': context.payload.repository.name,
    //   'title': configyml.steps[0].title,
    //   'path': path,
    //   'count': 0
    // });
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

  console.log(files)
  console.log(files.data.length);
  for (i = 0; i < files.data.length; i++) {
    let body = await data.getFileContent(context, `.bit/workflows/${files.data[i].name}`)
    body = body[0].data.content

    try {
      console.log("Getting file " + i)
      console.log(files.data[i])
      await context.octokit.repos.createOrUpdateFileContents({
        owner: context.payload.repository.owner.login,
        repo: context.payload.repository.name,
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
      console.log("Got workfow files");
    } catch (e) {
      console.log("Error in getting workflow files")
      console.log(e)
    }
  }
}


/*
0) get into the cloudwatch logs for this lambda
1) replace all of the .bit/workflows with the first file copied several times and see if succeeds
2) replace the first file with one 100x larger and see if it fails
3) increase the memory allocation for the Lambda
*/


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


const protectBranch = async (context) => {
  console.log("protecting")
  await context.octokit.repos.updateBranchProtection({
    "owner": context.payload.repository.owner.name,
    "repo": context.payload.repository.name,
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

exports.startLab = startLab
exports.workEvaluation = workEvaluation
exports.nextStep = nextStep
exports.workFlow = workFlow
exports.deleteFile = deleteFile
exports.updateFiles = updateFiles
exports.newBranch = newBranch
exports.protectBranch = protectBranch
exports.checkForMergeNext = checkForMergeNext