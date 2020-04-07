"use strict";

module.exports = function(Wishlist) {
  Wishlist.deleteProduct = async function(rest, options) {
    let response;
    let uid = options.accessToken.userId;
    let delwish;
    try {
      delwish = await (() => {
        return new Promise((res, rej) => {
          Wishlist.destroyAll(
            { userId: uid, productId: rest.productId },
            function(err, result) {
              if (err) return rej(err);
              else res(result);

              // if (deleted.count) {
              //   response = "deleted successfully";
              // }

              // if (err) {
              //   console.log("\n error in deletion", err);
              // }
              // if (deleted.count > 0) {
              //   // console.log("\n product Deleted", deleted);
              //   return (response = "Item Deleted Successfully");
              // }
            }
          );
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }
    // console.log("this is rate", rate);
    console.log("this is number", delwish.count);

    if (delwish.count == 1) {
      response = "delete item successfully ";
    } else if (delwish.count == 0) {
      response = "item not found";
    } else {
      response = "some thing went worng";
    }

    // return "Item Deleted Successfully";
    return response;
  };
  Wishlist.remoteMethod("deleteProduct", {
    accepts: [
      { arg: "rest", type: "Object", http: { source: "body" } },
      { arg: "options", type: "object", http: "optionsFromRequest" }
    ],
    returns: { type: "string", root: true }
  });

  Wishlist.observe("before save", async (ctx, next) => {
    if (!ctx.isNewInstance && ctx.options && ctx.options.accessToken) {
      ctx.data.LastUpdated = new Date();
      ctx.data.UpdatedBy = ctx.options.accessToken.userId;
    }
    next();
  });
};
