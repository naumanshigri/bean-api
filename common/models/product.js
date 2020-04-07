"use strict";
var app = require("../../server/server");
module.exports = function(Product) {
  Product.AllProducts = async function(rest, options) {
    var product = 0;
    try {
      product = await (() => {
        return new Promise((res, rej) => {
          Product.find((err, result) => {
            if (err) return rej(err);
            else res(result);
          });
        });
      })();
    } catch (error) {
      console.log("\n Check After Try", error);
    }

    let response = [];
    product.forEach(e => {
      response.push({
        id: e.id,
        name: e.type,
        description: e.description,
        image: e.image
      });
    });

    // console.log("test", test);
    return response;
  };
  Product.remoteMethod("AllProducts", {
    accepts: [{ arg: "options", type: "object", http: "optionsFromRequest" }],
    returns: { type: "Object", root: true, http: { source: "res" } },
    description: ["Find AllProducts"]
  });

  //list of coffee
  Product.ListOfCoffeeType = async function(rest, options) {
    const cofeetype = app.models.productCoffeeType;
    var product = 0;
    try {
      product = await (() => {
        return new Promise((res, rej) => {
          cofeetype.find((err, result) => {
            if (err) return rej(err);
            else res(result);
          });
        });
      })();
    } catch (error) {
      console.log("\n Check After Try", error);
    }
    return product;
  };
  Product.remoteMethod("ListOfCoffeeType", {
    accepts: [{ arg: "options", type: "object", http: "optionsFromRequest" }],
    returns: { type: "Object", root: true, http: { source: "res" } },
    description: ["List Of Coffee Type"]
  });
  //list of Snacks
  Product.ListOfSnackType = async function(rest, options) {
    const snacktype = app.models.productSnackType;
    var product = 0;
    try {
      product = await (() => {
        return new Promise((res, rej) => {
          snacktype.find((err, result) => {
            if (err) return rej(err);
            else res(result);
          });
        });
      })();
    } catch (error) {
      console.log("\n Check After Try", error);
    }
    return product;
  };
  Product.remoteMethod("ListOfSnackType", {
    accepts: [{ arg: "options", type: "object", http: "optionsFromRequest" }],
    returns: { type: "Object", root: true, http: { source: "res" } },
    description: ["List Of Snack Type"]
  });

  Product.observe("before save", async (ctx, next) => {
    if (!ctx.isNewInstance && ctx.options && ctx.options.accessToken) {
      ctx.data.LastUpdated = new Date();
      ctx.data.UpdatedBy = ctx.options.accessToken.userId;
    }
    next();
  });
};
