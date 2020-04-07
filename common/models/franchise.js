"use strict";
var app = require("../../server/server");
module.exports = function(Franchise) {
  Franchise.addItem = async function(rest, options) {
    let response = "Added successfully...";

    let uid = options.accessToken.userId;
    // console.log("user id in add", uid);
    const Customer = app.models.Customer;

    let users = 0;
    try {
      users = await (() => {
        return new Promise((res, rej) => {
          Customer.find({ where: { id: uid } }, (err, result) => {
            // console.log("this si testing user ", result);
            if (err) return rej(err);
            else res(result);
          });
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }
    let franchiseId = users[0].franchiseId;
    let UserName = users[0].username;
    // console.log("this is user Name", UserName);

    // console.log("this is franchies id for testing", franchiseId);

    if (!rest.title) {
      response = "Title field is empty";
      return response;
    } else if (!rest.type) {
      response = "Type field is empty";
      return response;
    } else if (!rest.image) {
      response = "Image field is empty";
      return response;
    }
    const Product = app.models.Product;
    let orderId = 0;
    try {
      orderId = await (() => {
        return new Promise((res, rej) => {
          Product.create(
            [
              {
                title: rest.title,
                type: rest.type,
                subtype: rest.subtype || "Null",
                image: rest.image,
                addedBy: uid,
                franchiesId: franchiseId
              }
            ],
            function(err, orders) {
              if (err) {
                rej(err);
                return;
              }
              res(orders);
            }
          );
        });
      })();
    } catch (error) {
      console.log("\norderId error>>\n", error);
    }
    // console.log("this is testing result of the franches ", orderId);
    response = {
      status: "Success",
      message: `Insert Producct Susseccfully by  : ${UserName} `
    };
    return response;
  };

  Franchise.remoteMethod("addItem", {
    accepts: [
      {
        arg: "rest",
        type: "Object",
        http: { source: "body" },
        description: ["addItem"]
        // required: true
      },
      { arg: "options", type: "object", http: "optionsFromRequest" }
    ],
    returns: { arg: "response", type: "Object", http: { source: "res" } },
    description: ["addItem"]
  });
  //Chect Product in Franchies
  Franchise.showItem = async function(rest, options) {
    let response = "Added successfully...";

    let uid = options.accessToken.userId;
    // console.log("user id in show", uid);
    const Customer = app.models.Customer;

    let users = 0;
    try {
      users = await (() => {
        return new Promise((res, rej) => {
          Customer.find({ where: { id: uid } }, (err, result) => {
            // console.log("this si testing user ", result);
            if (err) return rej(err);
            else res(result);
          });
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }
    let franchiseId = users[0].franchiseId;
    let UserName = users[0].username;
    // console.log("this is user Name", UserName);
    if (!franchiseId) {
      response = {
        status: "Rejected",
        message: `Sorry Franchises is no found `
      };

      return response;
    }
    // console.log("franchiseId", franchiseId);

    const Product = app.models.Product;
    let products = 0;
    // method for extract default menu
    try {
      products = await (() => {
        return new Promise((res, rej) => {
          Product.find({ where: { franchiesId: 0 } }, (err, result) => {
            // console.log("Default manu ", result);
            if (err) return rej(err);
            else res(result);
          });
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }
    // console.log("this is test", products);

    // Method extract for extract data from relevent Franchises
    let franchsiesItem;
    try {
      franchsiesItem = await (() => {
        return new Promise((res, rej) => {
          Product.find(
            { where: { franchiesId: franchiseId } },
            (err, result) => {
              // console.log("Franchises ", result);
              if (err) return rej(err);
              else res(result);
            }
          );
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }

    if (franchsiesItem == "") {
      return products;
    }
    console.log(franchsiesItem);
    const combined2 = [...products, ...franchsiesItem];

    return combined2;
  };

  Franchise.remoteMethod("showItem", {
    accepts: [
      {
        arg: "rest",
        type: "Object",
        http: { source: "body" },
        description: ["addItem"]
        // required: true
      },
      { arg: "options", type: "object", http: "optionsFromRequest" }
    ],
    returns: { arg: "response", type: "Object", http: { source: "res" } },
    description: ["addItem"]
  });
  // Auto insertOnUpdate
  Franchise.observe("before save", async (ctx, next) => {
    if (!ctx.isNewInstance && ctx.options && ctx.options.accessToken) {
      ctx.data.LastUpdated = new Date();
      ctx.data.UpdatedBy = ctx.options.accessToken.userId;
    }
    next();
  });
};
