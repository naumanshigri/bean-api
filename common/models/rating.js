"use strict";

const app = require("../../server/server");
module.exports = function(Rating) {
  Rating.RateProduct = async function(rest, options) {
    let uid = options.accessToken.userId;
    let rate = 0;
    try {
      rate = await (() => {
        return new Promise((res, rej) => {
          Rating.findOrCreate(
            { where: { productId: rest.product } },
            {
              rate: rest.rate,
              productId: rest.product,
              userId: uid
            },
            (err, result) => {
              if (err) {
                console.log("error in Rating");
              } else {
                Rating.updateAll(
                  { userId: uid },
                  {
                    rate: rest.rate
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
    } // end Rewards

    return rate;
  };
  Rating.remoteMethod("RateProduct", {
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
    description: ["Rating"]
  });

  Rating.observe("before save", async (ctx, next) => {
    if (!ctx.isNewInstance && ctx.options && ctx.options.accessToken) {
      ctx.data.LastUpdated = new Date();
      ctx.data.UpdatedBy = ctx.options.accessToken.userId;
    }
    next();
  });
};
