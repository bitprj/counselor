const data = require('./data.js');
const gql = require('./graphql.js');
const eval = require('./eval.js');
const newrelic = require('newrelic');

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

}

const updateFiles = async (moveOn, count, configyml, weekno, context) => {
  console.log("Incrementing count")
  console.log(count)
  count += 1
  console.log(count)

  try {
    const responseBody = context.issue({
      path: ".bit/.progress",
      ref: `week${weekno}`
    });
    countfile = await context.octokit.repos.getContent(responseBody);
    console.log(countfile)
    console.log(weekno)
  
    const update = context.issue({
      path: ".bit/.progress",
      message: "Update progress",
      content: Buffer.from(count.toString()).toString('base64'),
      // countfile must request the specific week branch
      sha: countfile.data.sha,
      branch: `week${weekno}`,
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
  } catch (e) {
    console.log("End of week")
  }

  var path = `.bit/responses/${configyml.steps[count-1].actions[0].with}`
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
 console.log(await gql.queryData(gqlrequest))

 // log in newrelic
 const attributes = { type: 'Start New Step', user: moveOn[3], repo: moveOn[2], repoName: moveOn[4], title: configyml.steps[count].title, link: moveOn[1], path: path, count: count }
 newrelic.recordCustomEvent("CabinGithub", attributes)
}

const nextStep = async (count, context, configyml, issueno) => {
  var weekno = ""
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
      weekno = responseFile.charAt(0)

      if (isNaN(weekno)) {
        weekno = configyml.steps[count-1].actions[y].with.charAt(0)
      }

      console.log(weekno)
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
      weekno = responseFile.charAt(0)
      console.log(weekno)
    } 

    if (array.type == "closeIssue") {
      console.log("Closing issue...")
      const payload = context.issue({
        state: "closed",
        issue_number: issueno,
      })

      context.octokit.issues.update(payload)
    }
  }
  
  return weekno
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
    newrelic.recordCustomEvent("CabinGithub", attributes)

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

      //log first step in newrelic
      const attributes = { type: 'Start New Step', user: context.payload.repository.owner.login, repo: context.payload.repository.html_url, repoName: context.payload.repository.name, title: configyml.steps[0].title, path: path, count: 0 }
      newrelic.recordCustomEvent("CabinGithub", attributes)
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


  for (i = 0; i < files.data.length; i++) {
    let body = await data.getFileContent(context, `.bit/workflows/${files.data[i].name}`)
    body = body[0].data.content

    try {
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
    } catch (e) {
      console.log(e)
    }

  }
}

exports.startLab = startLab
exports.workEvaluation = workEvaluation
exports.nextStep = nextStep
exports.workFlow = workFlow
exports.deleteFile = deleteFile
exports.updateFiles = updateFiles
exports.newBranch = newBranch
