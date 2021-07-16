const checks = async (context) => {
    let repolink = context.payload.repository.html_url
    let reslink = context.payload.workflow_run.html_url;
    let success = false;

    if (context.payload.workflow_run.conclusion != "failure") {
      console.log("Success!")
        success = true;
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
    console.log(configyml);

    var pullFiles = await context.octokit.pulls.listFiles(fileCommits)

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

    return [success, reslink, repolink, context.issue().owner, context.issue().repo]
}

exports.checks = checks
exports.IssueComment = IssueComment
exports.PRmerge = PRmerge
exports.feedback = feedback