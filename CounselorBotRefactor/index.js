/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */


module.exports = async function (context, req) {

    context.log('JavaScript HTTP trigger function processed a request.');

    context.log(req);
  
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: "executed"
    };
}