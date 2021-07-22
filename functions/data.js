const fetch = require("node-fetch");
const gql = require('./graphql.js');
const yaml = require('js-yaml');

const parseTable = (markdown) => {
  let labContent = ""
  try {
    labContent = markdown.split('---\n')

    if (labContent[2] == null) {
      if (markdown.split('---\r\n')[2] != null) {
        newContent = markdown.split('---\r\n')
        newContent.splice(0, 2);
        newContent = newContent.join('---\n')
        labContent = newContent.toString()
      } else {
        labContent = markdown
      }
    } else {
      labContent.splice(0, 2);
      labContent = labContent.join('---\n')
      labContent = labContent.toString()
    }
  } catch (e) {
    labContent = markdown
  }

  return labContent
}

const issueNo = async (context) => {
  const payload = context.issue({
    state: "open",
  })

  let res = await context.octokit.issues.listForRepo(payload)
  try {
    return res.data[0].number
  } catch (e) {
    return null
  }
}

const typeStep = async (currentStep, configyml, eventTrigger) => {
  const step = configyml.steps[currentStep]

  var stepType = step.stepType;
  var event = configyml.steps[currentStep].event
  console.log(event);
  try {
    var files = step.actions[0].files
    var scripts = step.actions[0].scripts
  } catch (e) {
    var files = "None"
    var scripts = "None"
  }

  if (event != eventTrigger) {
    return null
  }
  return [stepType, files, scripts]
}

const findStep = async (context) => {
  const params = context.issue()

  gqlrequest = `
  query getCount {
      users_progress(where: {repoName: {_eq: "${params.repo}"}, user: {_eq: "${params.owner}"}}, order_by: {startTime: desc}) {
        count
      }
    }      
  `
  // output:
  // {
  //     "data": {
  //       "users_progress": [
  //         {
  //           "count": 3
  //         }
  //       ]
  //     }
  //   }
  let result = await gql.queryData(gqlrequest)
  count = result.data.users_progress[0].count
  return count
}

const yamlFile = async (context) => {
  try {
    console.log("trying to get yaml")

    console.log(context.payload.repository.owner.login)
    console.log(context.payload.repository.name)


    console.log(context);
    console.log(context.octokit);

    var yamlfile = await context.octokit.repos.getContent({
      owner: context.payload.repository.owner.login,
      repo: context.payload.repository.name,
      path: ".bit/config.yml",
    });

    console.log("we got the yaml")
    // console.log(yamlfile)
  } catch (e) {
    console.log("Error with getting content of yaml");
    console.log(e)
    return null
  }
  console.log("got yaml, but no content yet");
  yamlfile = Buffer.from(yamlfile.data.content, 'base64').toString()
  // console.log(yamlfile)
  try {
    let fileContents = yamlfile
    configyml = yaml.load(fileContents);
  } catch (e) {
    const issueBody = context.issue({
      title: "[ERROR] Please read",
      body: `There was an issue parsing the config file of this course. Please contact your counselor and send them the below error.\n${e}`,
    });

    context.octokit.issues.create(issueBody)
    console.log("ERROR: " + e);
    return null
  }
  console.log("returining configyml")
  return configyml;
}

const getFileContent = async (context, content) => {
  const responseBody = context.issue({
    path: content,
  });
  file = await context.octokit.repos.getContent(responseBody);
  body = Buffer.from(file.data.content, 'base64').toString()
  return [file, body];
}

exports.yamlFile = yamlFile
exports.getFileContent = getFileContent
exports.findStep = findStep
exports.typeStep = typeStep
exports.issueNo = issueNo
exports.parseTable = parseTable