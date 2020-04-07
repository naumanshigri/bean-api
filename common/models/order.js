"use strict";
const app = require("../../server/server");
module.exports = function(Order) {
  Order.makeOrder = async function(rest, options) {
    let uid = options.accessToken.userId;

    var orderId = 0;
    try {
      orderId = await (() => {
        return new Promise((res, rej) => {
          Order.create(
            [
              {
                orderStatus: "Pending",
                paymentStatus: "Pending",
                franchiseId: rest.franchiseId,
                userId: uid
              }
            ],
            function(err, orders) {
              if (err) {
                rej(err);
                return;
              }
              res(orders[0].id);
            }
          );
        });
      })();
    } catch (error) {
      console.log("\norderId error>>\n", error);
    }
    const orderProduct = app.models.orderProduct;
    let ordProdVal = [];
    let orprId;
    try {
      ordProdVal = await (() => {
        return new Promise((res, rej) => {
          var result = [];

          rest.products.forEach(async p => {
            const op = await (() => {
              return new Promise((res, rej) => {
                orderProduct.create(
                  [
                    {
                      orderId: orderId,
                      franchiseId: p.franchiseId || 0,
                      title: p.title || null,
                      type: p.type || null,
                      subtype: p.subtype || null,
                      description: p.description || null,
                      quantity: p.quantity || 1,
                      size: p.size || null,
                      brownSugar: p.brownSugar || null,
                      extrainstructions: p.extrainstructions || null,
                      cups: p.cups || null,
                      miligram: p.miligram || 0,
                      here: p.here || false,
                      regular: p.regular || null,
                      body: p.body || null,
                      decaf: p.decaf || false,
                      whippedCream: p.whippedCream || false,
                      tobeGranded: p.tobeGranded || false,
                      extraHot: p.extraHot || false,
                      extraShot: p.extraShot || false,
                      extraPocket: p.extraPocket || false,
                      smoothes: p.smoothes || false,
                      foam: p.foam || false,
                      Temperature: p.Temperature || false,
                      roomTemperature: p.roomTemperature || false,
                      milkType: p.milkType || null,
                      soucesType: p.soucesType || null,
                      flavoursType: p.flavoursType || null,
                      CreamsType: p.CreamsType || null,
                      pickUpSlots: p.pickUpSlots || null,
                      Addmore: p.Addmore || null,
                      totalPrice: p.totalPrice || 0,
                      productId: p.productId || 0
                    }
                  ],
                  function(err, ordersProduct) {
                    orprId = ordersProduct[0].id;

                    if (err) {
                      rej(err);
                      return;
                    }
                    res(ordersProduct);
                  }
                );
              });
            })();
            result.push(op);
          });
          res(result);
        });
      })();
    } catch (error) {
      console.log("\nordersProduct error>>\n", error);
    }

    const Profile = app.models.Profile;
    let rewards = 0;
    try {
      rewards = await (() => {
        return new Promise((res, rej) => {
          Profile.find({ where: { userId: uid } }, (err, result) => {
            console.log("this is rewards result", result);
            // some error handle for unknown user
            if (err) return rej(err);
            else res(result[0].rewardsPoint);
          });
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }
    // Add 20 rewards Point on Every Order
    rewards = 200 + rewards;

    let AddRewards = 0;
    try {
      AddRewards = await (() => {
        return new Promise((res, rej) => {
          Profile.updateAll(
            { userId: uid },
            {
              rewardsPoint: rewards
            },
            (err, result) => {
              if (err) return rej(err);
              else res(result);
            }
          );
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    } // end Rewards

    return orderId;
  };
  Order.remoteMethod("makeOrder", {
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
    description: ["makeOrder Function", "use this to make Order."]
  });

  Order.observe("before save", async (ctx, next) => {
    if (!ctx.isNewInstance && ctx.options && ctx.options.accessToken) {
      ctx.data.LastUpdated = new Date();
      ctx.data.UpdatedBy = ctx.options.accessToken.userId;
    }
    next();
  });
};
