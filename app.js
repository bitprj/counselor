/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */

const data = require('./functions/data.js');
const steps = require('./functions/steps.js');

var start;

module.exports = (app) => {
  // console.log("Yay! The app was loaded")
  app.on("push", async (context) => {
    console.log("Push event");
    try {
      if (context.payload.commits[context.payload.commits.length - 1].added.includes(".bit/course-details.md")) {
        console.log("True");
        start = true
      } else {
        console.log("False");
        start = false
      }

      console.log(context.payload.commits[0])

      if (start && context.payload.commits[0].added[0] != ".bit/.progress") {
        let configData = await data.yamlFile(context);
        console.log("protecting")
        console.log("Deleting file...")
        await steps.deleteFile(context);
        await steps.startLab(context, configData);
        console.log("Committing workflow files")
        await steps.workFlow(context);
        await steps.protectBranch(context); // can't merge
      }
    }
    catch (e) {
      console.log("ERROR IN PUSH")
      console.log(e)
    }
  });

  app.on('pull_request.ready_for_review', async (context) => {
    console.log("pull request ready")
    main(context, "pull_request.ready_for_review");
  })

  app.on('pull_request.closed', async (context) => {
    console.log("Pull request closed")
    main(context, 'pull_request.closed');
  });

  app.on('issue_comment.created', async (context) => {
    console.log("Issue comment created")
    if (context.payload.sender.login != "counselorbot[bot]") {
      main(context, 'issue_comment.created');
    }
  });

  app.on('workflow_run.completed', async (context) => {
    console.log("Workflow run")
    console.log(context.payload.workflow_run.name)
    if (context.payload.workflow_run.name != "Syncing Your Cabin" && context.payload.workflow_run.head_commit.message != "Start workflows" && context.payload.workflow_run.head_commit.message != "Track progress" && context.payload.workflow_run.head_commit.message != "Update progress") {
      main(context, 'workflow_run.completed');
    }
  });

  // mark ready for review which triggers check for next step

  app.on('create', async (context) => {
    console.log("Branch created")
    main(context, 'create')
  });
};

async function main(context, event) {
  console.log("entering main")
  console.log(event);

  let currentStep = ""
  let configData = await data.yamlFile(context);
  console.log(configData)
  if (configData == null) {
    console.log("null config data");
    return
  }

  console.log("got config yml")
  try {
    console.log("Getting current step!")
    currentStep = await data.findStep(context);
    console.log(currentStep);

  } catch (e) {
    console.log(e)
    console.log("no current step");
    return;

  }

  console.log("running event checks");
  console.log(event)

  if (event == 'create') {
    console.log("create event")
    let condition = await steps.newBranch(context, context.payload.ref, currentStep)
    if (condition == null) {
      return
    }
  }
  else if (event == "pull_request.ready_for_review") {
    // for starting off step 1 ready for review
    console.log("Calling checkForMergenext in app.js")
    await steps.checkForMergeNext(context, currentStep, configData);
  }
  else {
    // console.log(currentStep, configData, event)
    console.log(event)
    let typeOfStep = await data.typeStep(currentStep, configData, event);

    if (typeOfStep == null) {
      console.log("null type")
      return
    }

    console.log("The type: " + typeOfStep)

    let issueNo = await data.issueNo(context);
    let moveOn = await steps.workEvaluation(typeOfStep, context, configData, currentStep, issueNo);
    console.log("moveOn: " + moveOn)

    console.log("Successfully evaluated")
    console.log("Next Step function executing")

    if (issueNo == null) {
      return
    }

    if (moveOn[0] == true) {
      let branchName = await steps.nextStep(currentStep, context, configData, issueNo);
      await steps.updateFiles(typeOfStep, moveOn, currentStep, configyml, branchName, context)
    }
  }
}
