const {
  createProbot,
  createAzureFunction,
} = require("@probot/adapter-azure-functions");
const app = require("../app");

const Sentry = require("@sentry/node");
Sentry.init({
  dsn: process.env.SENTRY_DSN,
});
// test


module.exports = createAzureFunction(app, { probot: createProbot() });
