const fetch = require("node-fetch")

const HASURA_ENDPOINT = process.env.HASURA_ENDPOINT;
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
};

exports.queryData = queryData;
