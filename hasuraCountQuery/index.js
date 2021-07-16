const fetch = require("node-fetch");

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const repo = req.headers.repo;
    const owner = req.headers.owner;

    // const HASURA_ENDPOINT = process.env.HASURA_ENDPOINT;
    // const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;
    
    gqlrequest = `
    query getCount {
        users_progress(where: {repoName: {_eq: "${repo}"}, user: {_eq: "${owner}"}}, order_by: {startTime: desc}) {
          count
        }
      }      
    `
    const step = await queryData(gqlrequest);

exports.queryData = queryData;
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: {step}
    };
}

const queryData = async (queryString) => {
    const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;
    const HASURA_ENDPOINT = process.env.HASURA_ENDPOINT;

    console.log(queryString)
    const data = await fetch(HASURA_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
        },
        body: JSON.stringify({query: queryString})
    });
    const responseData = await data.json();
    console.log(responseData)

    return responseData.data.users_progress[0].count;
};
