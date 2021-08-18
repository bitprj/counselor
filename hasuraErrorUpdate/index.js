const fetch = require('node-fetch');

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    /*
        This function takes in headers of 
            repo, user, error

        and adds them to the hasura `errors` table
    */
    const repo = req.headers.repo;
    const user = req.headers.user;

    const error = req.headers.error
    context.log(req.headers)

    queryString = `
        mutation insertError {
            insert_users_errors(objects: {repo: "${repo}", user: "${user}", error: "${error}"}) {
            returning {
                error
            }
            }
        }
    `

    let result = await queryData(queryString);

    context.log(result);

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: result
    };
}

async function queryData(queryString) {
    console.log(queryString)


    const HASURA_ENDPOINT = process.env.HASURA_ENDPOINT;
    const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;


    const data = await fetch(HASURA_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': HASURA_ADMIN_SECRET,
        },
        body: JSON.stringify({ query: queryString })
    });
    const responseData = await data.json();
    console.log(responseData)
    return responseData;
}