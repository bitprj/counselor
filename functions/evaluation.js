const gql = require('./graphql.js');

const checks = async (context, issueNo) => {
  let repolink = context.payload.repository.html_url
  let reslink = context.payload.workflow_run.html_url;

  let repo = context.payload.repository.name;
  let user = context.payload.repository.owner.login;

  let success = false;

  if (context.payload.workflow_run.conclusion != "failure") {
    console.log("Success!")
    success = true;
  }
  else {

    // the check failed
    let queryString = `
    query getError {
      users_errors(order_by: {updated_at: desc}, where: {repo: {_eq: "${repo}"}, user: {_eq: "${user}"}}) {
        error
      }
    }
    `

    let result = await gql.queryData(queryString);
    let error = "";

    try {
      error = await result.data.users_errors[0].error;
    } catch (e) {
      error = "Oops! Something went wrong 😅! Please check the GitHub action run for more information.";
    }

    console.log(error);

    // will not allow you to only have `error` as the body
    await context.octokit.issues.createComment({
      owner: user,
      repo: repo,
      issue_number: issueNo,
      body: `🛑 There was an error: ${error} 🛑`,
    });

  }

  return [success, reslink, repolink, context.issue().owner, context.issue().repo]
}

const feedback = async (context) => {
  let repolink = context.payload.repository.html_url
  let reslink = context.payload.comment.html_url;
  let feedback = context.payload.comment.body;
  let success = true;
  return [success, reslink, repolink, feedback, context.issue().owner, context.issue().repo]
}

const IssueComment = async (context) => {
  let repolink = context.payload.repository.html_url
  let reslink = context.payload.comment.html_url;
  let success = true;
  return [success, reslink, repolink, context.issue().owner, context.issue().repo]
}

const PRmerge = async (context, configyml, count) => {
  let repolink = context.payload.repository.html_url
  let reslink = context.payload.pull_request.html_url;
  let success = false;

  var test2Array = []
  var testArray = []

  const fileCommits = context.issue({
    pull_number: context.payload.pull_request.number,
  })
  console.log("CONFIG YAML");
  // console.log(configyml);

  var pullFiles = await context.octokit.pulls.listFiles(fileCommits)

  // adding try catch to catch the exception where the `files` field on config.yml for PR merges is not there
  try {
    if (configyml.steps[count].actions[0].files[0] != 'n/a') {
      for (i = 0; i < configyml.steps[count].actions[0].files.length; i++) {
        test2Array.push(configyml.steps[count].actions[0].files[i])
        for (y = 0; y < pullFiles.data.length; y++) {
          if (configyml.steps[count].actions[0].files[i] == pullFiles.data[y].filename) {
            testArray.push(pullFiles.data[y].filename)
          }
        }
      }
  
      if (test2Array.length == testArray.length) {
        console.log("Success!")
        success = true
      } else {
        console.log("Fail")
        success = false
      }
    } else {
      success = true
    }
  } catch (e) {
    success = true
  }


  return [success, reslink, repolink, context.issue().owner, context.issue().repo]
}

exports.checks = checks
exports.IssueComment = IssueComment
exports.PRmerge = PRmerge
exports.feedback = feedback