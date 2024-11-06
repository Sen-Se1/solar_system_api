const solarRoute = require("./solarRoute");

const mountRoutes = (app) => {
  app.use("/api/solar", solarRoute);
};

module.exports = mountRoutes;
