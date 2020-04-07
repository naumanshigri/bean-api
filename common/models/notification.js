"use strict";
const app = require("../../server/server");
module.exports = function(Notification) {
  const { Expo } = require("expo-server-sdk");

  // Create a new Expo SDK client
  let expo = new Expo();
  Notification.sendNotificationByUserId = async function(rest, options) {
    const device = app.models.device;

    let somePushTokens = [];
    try {
      somePushTokens = await (() => {
        return new Promise((res, rej) => {
          device.find({ where: { userId: rest.userId } }, (err, result) => {
            // console.log("testing result", result);

            if (err) return rej(err);
            else res(result[0].deviceId);
          });
        });
      })();
    } catch (error) {
      console.log("\n Check After Try", error);
    }

    let messages = [];

    messages.push({
      to: somePushTokens,
      sound: "default",
      body: "This is test notificatioin",
      data: { withSome: "data" }
    });
    // }

    let chunks = expo.chunkPushNotifications(messages);

    // const device = app.models.device;
    // let tickets = [];
    let ticketChunk;
    console.log("this is ticketChunk", ticketChunk);

    let response;
    // (async () => {
    for (let chunk of chunks) {
      try {
        ticketChunk = await expo.sendPushNotificationsAsync(chunk);

        console.log("ticketChunk in async", ticketChunk);
        if (ticketChunk[0].status == "error") {
          let res = ticketChunk[0].message;
          let ress = res.split('"');
          device.destroyAll({ deviceId: ress[1] }, (err, deleted) => {
            if (err) {
              console.log(" error in deletion", err);
            }
            if (deleted.count > 0) {
              console.log("Device  Deleted", deleted);
            }
          });
        }
        // console.log("this is chanks in async", chunk);
        // console.log("\n ticketChunk:- ", ticketChunk);
        //   console.log("\n ticketChunk ID:- ", ticketChunk);
        //   console.log("\n id", ticketChunk[0].id);
        //   console.log("\n status", ticketChunk[0].status);
        //   console.log("\n message", ticketChunk[0].message);
        //   console.log("\n details", ticketChunk[0].details);

        Notification.create([
          {
            ticketId: ticketChunk[0].id,
            status: ticketChunk[0].status || null,
            message: ticketChunk[0].message || null,
            details: ticketChunk[0].details || null
          }
        ]);
        if (ticketChunk[0].status == "ok") {
          response = {
            status: "ok",
            message: `Notification send successfully to the: ${messages[0].to} : `
          };
        }
        if (ticketChunk[0].status == "error") {
          response = ticketChunk;
          // response = {
          //   status: "error",
          //   message: `${messages[0].to}, is not a registered push notification recipient`
          // };
        }
        //   tickets.push(...ticketChunk);

        // console.log("this is tickets", tickets);
      } catch (error) {
        console.error(error);
      }
      return response;
    }
    // response = "notification send successfully";
    // })();
    // console.log("this is chank after async", ticketChunk);

    return response;
  };
  Notification.remoteMethod("sendNotificationByUserId", {
    accepts: [
      {
        arg: "rest",
        type: "Object",
        http: { source: "body" },
        description: ["sendNotification"]
        // required: true
      },
      { arg: "options", type: "object", http: "optionsFromRequest" }
    ],
    returns: { arg: "response", type: "Object", http: { source: "res" } },
    description: ["Use this for sendNotification"]
  });

  // Remote method for ReciptNotification
  Notification.reciptNotification = async function(rest, options) {
    let uid = options.accessToken.userId;
    const device = app.models.device;
    let tickets = [];
    try {
      tickets = await (() => {
        return new Promise((res, rej) => {
          Notification.find({ where: { status: "error" } }, (err, result) => {
            if (err) return rej(err);
            else res(result);
          });
        });
      })();
    } catch (error) {
      console.log("\n Check After Try", error);
    }
    // console.log("all notification", tickets);

    // console.log("all messages", tickets[0].message);
    let first, second, third, devId;
    // getting device id from  ticket
    // first = tickets[0].message.split(" ");
    // second = first[0];
    first = tickets[0].message.split('"');
    devId = first[1];
    console.log("ExponentPushToken :- ", devId);

    let receiptIds = [];
    // load device model

    // console.log("\n model device \n", Device);

    for (let ticket of tickets) {
      if (ticket.id) {
        receiptIds.push(ticket.ticketId);
      }
    }
    // console.log("this is receiptIds", receiptIds);

    let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    // console.log("this is receiptIdChunks", receiptIdChunks);

    // (async () => {
    for (let chunk of receiptIdChunks) {
      // console.log("this si chunk", chunk);
      let response;
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        // console.log(receipts);
        // console.log("\n receipts", receipts);
        for (const receiptId in receipts) {
          const { status, message, details } = receipts[receiptId];
          console.log("all in one", receipts[receiptId].message);

          // console.log("\nthis is status", status);
          // console.log("\nthis is message", message);
          // console.log("\nthis is details", details);
          if (status === "ok") {
            continue;
          } else if (status === "error") {
            if (details.error) {
              let dId = [];
              try {
                dId = await (() => {
                  return new Promise((res, rej) => {
                    //   Device.find((err, result) => {
                    device.find(
                      { where: { deviceId: devId } },
                      (err, result) => {
                        console.log("this is result", result);

                        if (err) {
                          console.log("error in finding");
                        } else {
                          if (!result) {
                            device.destroyAll(
                              { deviceId: result[0].deviceId },
                              (err, deleted) => {
                                if (err) {
                                  console.log("\n error in deletion", err);
                                }
                                if (deleted.count > 0) {
                                  console.log("Device Deleted", deleted);
                                }
                              }
                            );
                          }
                        }
                      }
                    );
                  });
                })();
              } catch (error) {
                console.log("\n check error after try ", error);
              }
            }
            console.error(
              `There was an error sending a notification: ${message}`
            );
            if (details && details.error) {
              console.error(`The error code is ${details.error}`);
            }
          }

          // for response
          if (ticketChunk[0].status == "ok") {
            response = {
              status: "ok",
              message: `Notification send successfully to the: ${messages[0].to} : `
            };
          }
          if (ticketChunk[0].status == "error") {
            response = ticketChunk;
            // response = {
            //   status: "error",
            //   message: `${messages[0].to}, is not a registered push notification recipient`
            // };
          }
        }
      } catch (error) {
        console.error(error);
      }
      // response here
      return response;
    }
    // })();
  };
  Notification.remoteMethod("reciptNotification", {
    accepts: [
      {
        arg: "rest",
        type: "Object",
        http: { source: "body" },
        description: ["reciptNotification"]
        // required: true
      },
      { arg: "options", type: "object", http: "optionsFromRequest" }
    ],
    returns: { arg: "response", type: "Object", http: { source: "res" } },
    description: ["Use this for reciptNotification"]
  });
  // Remote method for ReciptNotification
  Notification.SentToAll = async function(rest, options) {
    const device = app.models.device;
    // sent to all remote method
    let sentall = [];
    try {
      sentall = await (() => {
        return new Promise((res, rej) => {
          //   Device.find((err, result) => {
          device.find({ where: { deviceStatus: true } }, (err, result) => {
            // console.log("this is result", result);
            if (err) return rej(err);
            else res(result);
          });
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }

    // console.log("this is sent all token", sentall);
    ////////////////////////////////////////
    let somePushTokens = [];

    sentall.forEach((e, i, a) => {
      somePushTokens.push({ deviceId: e.deviceId });
    });
    // console.log("all tokens", somePushTokens);
    let tokens = [];
    somePushTokens.forEach(e => {
      // console.log("after setting", e.deviceId);
      tokens.push(e.deviceId);
    });

    let messages = [];
    for (let pushToken of tokens) {
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }
      messages.push({
        to: pushToken,
        sound: "default",
        body: "BeanBrand Testing Notification",
        data: { withSome: "data" }
      });
    }
    // console.log("this is messgae", messages);

    let chunks = expo.chunkPushNotifications(messages);
    // console.log("this is chanks", chunks);

    let tickets = [];
    let ticketChunk;
    let response;
    // (async () => {
    for (let chunk of chunks) {
      try {
        ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        // console.log("this is chanks in async", chunk);
        console.log("\n ticketChunk:- ", ticketChunk);
        ticketChunk.forEach((e, i, a) => {
          Notification.create([
            {
              ticketId: ticketChunk[i].id,
              status: ticketChunk[i].status || null,
              message: ticketChunk[i].message || null,
              details: ticketChunk[i].details || null
            }
          ]);
          if (a[i].status == "error") {
            let message = ticketChunk[i].message;
            let token = message.split('"');
            console.log("this is token", token[1]);

            const device = app.models.device;
            console.log("in case of error Token", ticketChunk[i].message);

            device.destroyAll({ deviceId: token[1] }, (err, deleted) => {
              if (err) {
                console.log("\n error in deletion", err);
              }
              if (deleted.count > 0) {
                console.log("\n delete success fully", deleted);
                if (deleted) {
                  return `the id is deleted ${message}`;
                  // return (response = `the id is deleted ${message}`);
                }
              }
            });
          }
        });

        Notification.create([
          {
            ticketId: ticketChunk[0].id,
            status: ticketChunk[0].status || null,
            message: ticketChunk[0].message || null,
            details: ticketChunk[0].details || null
          }
        ]);
        //   tickets.push(...ticketChunk);
        if (ticketChunk[0].status == "ok") {
          response = {
            status: "ok",
            message: `Notification send successfully to the: ${messages[0].to} : `
          };
        }
        if (ticketChunk[0].status == "error") {
          response = ticketChunk;
          // response = {
          //   status: "error",
          //   message: `${messages[0].to}, is not a registered push notification recipient`
          // };
        }
      } catch (error) {
        console.error(error);
      }

      return response;
    }
    // })();
  };
  Notification.remoteMethod("SentToAll", {
    accepts: [
      {
        arg: "rest",
        type: "Object",
        http: { source: "body" },
        description: ["SentToAll"]
        // required: true
      },
      { arg: "options", type: "object", http: "optionsFromRequest" }
    ],
    returns: { arg: "response", type: "Object", http: { source: "res" } },
    description: ["Use this for SentToAll"]
  });

  Notification.observe("before save", async (ctx, next) => {
    if (!ctx.isNewInstance && ctx.options && ctx.options.accessToken) {
      ctx.data.LastUpdated = new Date();
      ctx.data.owner = ctx.options.accessToken.userId;
    }
    next();
  });
};
