const fetch = require("node-fetch")

const HASURA_ENDPOINT = process.env.HASURA_ENDPOINT;
<<<<<<< HEAD
const secret = process.env.HASURA_ADMIN_SECRET;

const queryData = async (queryString) => {
    console.log(queryString)
    const data = await fetch(HASURA_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hasura-admin-secret': secret,
        },
        body: JSON.stringify({query: queryString})
    });
    const responseData = await data.json();
    console.log(responseData)
    return responseData;
=======
const HASURA_ADMIN_SECRET = process.env.HASURA_ADMIN_SECRET;

const queryData = async (queryString) => {
  console.log(queryString)
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
>>>>>>> azure-function-bot/main
};

exports.queryData = queryData;