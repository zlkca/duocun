module.exports = {
  host: process.env.OPENSHIFT_NODEJS_IP ||
    process.env.ip ||
    undefined,

  // Server port
  port: process.env.OPENSHIFT_NODEJS_PORT ||
    process.env.PORT ||
    8080,
};