module.exports = function (app) {
  var path = require("path");
  var models = require(path.resolve(__dirname, "../model-config.json"));
  var datasources = require(path.resolve(__dirname, "../datasources.json"));

  const myDataSource = "MySql";

  function autoUpdateModels() {
    console.log("Performed auto Update.");
    Object.keys(models).forEach(function (key) {
      if (typeof models[key].dataSource != "undefined") {
        if (
          typeof datasources[models[key].dataSource] != "undefined" &&
          models[key].dataSource == myDataSource
        ) {
          app.dataSources[models[key].dataSource].isActual(key, function (
            err,
            actual
          ) {
            if (!actual) {
              app.dataSources[models[key].dataSource].autoupdate(key, function (
                err
              ) {
                if (err) throw err;
                console.log("\nModel " + key + " updated");
              });
            } else {
            }
          });
        }
      }
    });
  }

  function autoMigrateAll() {
    console.log("Performed auto migration.");
    Object.keys(models).forEach(function (key) {
      if (typeof models[key].dataSource != "undefined") {
        if (
          typeof datasources[models[key].dataSource] != "undefined" &&
          models[key].dataSource == myDataSource
        ) {
          app.dataSources[models[key].dataSource].automigrate(key, function (
            err
          ) {
            if (err) throw err;
            console.log("Model " + key + " migrated");
          });
        }
      }
    });
  }

  autoUpdateModels();

  //   autoMigrateAll();
};
