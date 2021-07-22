const fetch = require("node-fetch")

// const HASURA_ENDPOINT = process.env.HASURA_ENDPOINT;
const HASURA_ENDPOINT = "https://endless-flounder-97.hasura.app/v1/graphql";
// const secret = process.env.HASURA_ADMIN_SECRET;
const secret = "wzurCqQMy8lPycePA6PYolO8c9fTgJ2g";

const queryData = async (queryString) => {
  console.log(queryString)
  const data = await fetch(HASURA_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': secret,
    },
    body: JSON.stringify({ query: queryString })
  });
  const responseData = await data.json();
  console.log(responseData)
  return responseData;
};

exports.queryData = queryData;