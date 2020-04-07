"use strict";

module.exports = function(Device) {
  const { Expo } = require("expo-server-sdk");
  // Create a new Expo SDK client
  let expo = new Expo();
  Device.RegisterDevice = async function(rest, options) {
    // let uid = options.accessToken.userId;
    console.log("\n in register Device", rest);

    let response;
    if (!rest.deviceId) {
      // return (response = "device Id required");
      response = {
        status: "error",
        message: `Device is required`
      };
      return response;
    }
    if (!Expo.isExpoPushToken(rest.deviceId)) {
      console.log(`Push token ${rest.deviceId} is not a valid Expo push token`);
      response = {
        status: "error",
        message: `Push token ${rest.deviceId} is not a valid Expo push token`
      };
      return response;
    }
    let device = 0;
    try {
      device = await (() => {
        return new Promise((res, rej) => {
          Device.findOrCreate(
            { where: { deviceId: rest.deviceId } },
            {
              deviceId: rest.deviceId,
              deviceStatus: rest.deviceStatus || 0,
              userId: rest.userId || null
            },
            (err, result) => {
              if (err) {
                console.log("error in Device register");
              } else {
                Device.updateAll(
                  { deviceId: rest.deviceId },
                  {
                    deviceStatus: rest.deviceStatus || 0
                  },
                  (err, result) => {
                    if (err) return rej(err);
                    else res(result);
                  }
                );
              }
            }
          );
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    } // end device register
    response = {
      status: "ok",
      message: `Your Device is registered successfully with the token ${rest.deviceId}`
    };

    return response;
  };
  Device.remoteMethod("RegisterDevice", {
    accepts: [
      {
        arg: "rest",
        type: "Object",
        http: { source: "body" },
        description: ["register device"],
        required: true
      },
      { arg: "options", type: "object", http: "optionsFromRequest" }
    ],
    returns: { arg: "response", type: "Object", http: { source: "res" } },
    description: ["RegisterDevice"]
  });
  Device.observe("before save", async (ctx, next) => {
    if (!ctx.isNewInstance && ctx.options && ctx.options.accessToken) {
      ctx.data.LastUpdated = new Date();
      ctx.data.UpdatedBy = ctx.options.accessToken.userId;
    }
    next();
  });
};
