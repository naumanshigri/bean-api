"use strict";

module.exports = function(Getintouch) {
  Getintouch.getIntouch = async function(rest, options) {
    let uid = options.accessToken.userId;
    var getIntouch = 0;
    try {
      getIntouch = await (() => {
        return new Promise((res, rej) => {
          Getintouch.create(
            [
              {
                name: rest.name,
                phone: rest.phone,
                mail: rest.mail,
                message: rest.message,
                userId: uid
              }
            ],
            function(err, getintouch) {
              if (err) {
                rej(err);
                return;
              }
              res(getintouch);
            }
          );
        });
      })();
    } catch (error) {
      console.log("\n error after catch", error);
    }

    let response;
    if (!getIntouch) {
      response = {
        status: "Error",
        message: `Sorry..!!! Mr ${getIntouch[0].name} Your message Not sended`
      };
    } else {
      response = {
        status: "oky",
        message: `Hi mr ${getIntouch[0].name} Your message send by ${getIntouch[0].mail}`
      };
    }
    return response;
  };
  Getintouch.remoteMethod("getIntouch", {
    accepts: [
      {
        arg: "rest",
        type: "Object",
        http: { source: "body" },
        description: ["creates an order"],
        required: true
      },
      { arg: "options", type: "object", http: "optionsFromRequest" }
    ],
    returns: { arg: "response", type: "Object", http: { source: "res" } },
    description: ["getInTouch for authenticate User"]
  });
  Getintouch.observe("before save", async (ctx, next) => {
    if (!ctx.isNewInstance && ctx.options && ctx.options.accessToken) {
      ctx.data.LastUpdated = new Date();
      ctx.data.UpdatedBy = ctx.options.accessToken.userId;
    }
    next();
  });
};
