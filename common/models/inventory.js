"use strict";
const app = require("../../server/server");

module.exports = function(Inventory) {
  Inventory.addInventory = async function(rest, options) {
    let uid = options.accessToken.userId;
    console.log("user id", uid);

    const Customer = app.models.Customer;
    let user = 0;
    try {
      user = await (() => {
        return new Promise((res, rej) => {
          Customer.find({ where: { id: uid } }, (err, result) => {
            // console.log("User result", result);
            if (err) return rej(err);
            else res(result);
          });
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }

    let response = {
      message: "some thing.."
    };
    console.log(
      "this is testing for  user[0].franchiseId",
      user[0].franchiseId
    );

    let newFranchaisAdmin = user[0].franchiseId;
    if (newFranchaisAdmin == 0) {
      response = {
        message:
          "Your Are Not permited to Change Stock. Only Super Admin & Relevent Franchise Admin can changes"
      };
      return response;
    }

    //rolemapping
    const RoleMapping = app.models.RoleMapping;
    let rolemap = 0;
    try {
      rolemap = await (() => {
        return new Promise((res, rej) => {
          RoleMapping.find({ principalId: user[0].id }, (err, result) => {
            if (err) return rej(err);
            else res(result);
          });
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }

    let roleUser;
    rolemap.forEach((e, i, a) => {
      let userid = parseInt(rolemap[i].principalId);
      if (userid === uid) {
        roleUser = e;
      }
    });
    if (roleUser.roleId !== 1 && roleUser.roleId !== 2) {
      response = {
        message:
          "Your Are Not permited to Add Stock. Only Super Admin & Franchise Admin can Add"
      };
      return response;
    }
    // check if preduct is already add in the store
    let alreadyAddPro = 0;
    console.log(
      "this is store id for testing user[0].franchiesId",
      user[0].franchiseId
    );

    try {
      alreadyAddPro = await (() => {
        return new Promise((res, rej) => {
          Inventory.find(
            { where: { franchiseId: user[0].franchiseId } },
            (err, result) => {
              // console.log("this is enventory test ", result);

              if (err) return rej(err);
              else res(result);
            }
          );
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }
    let tuntun;
    console.log("this is testing check alreadyAddPro", alreadyAddPro);
    alreadyAddPro.forEach((e, i, a) => {
      console.log("alreadyAddPro", e.productId);

      if (e.productId === rest.productId) {
        tuntun = 1;
      }
    });
    console.log("rest.productId", rest.productId);
    console.log("the vlue of tuntun", tuntun);

    if (tuntun === 1) {
      response = {
        message: "Product already Added"
      };
      return response;
    }
    var addInventory = 0;
    try {
      addInventory = await (() => {
        return new Promise((res, rej) => {
          Inventory.create(
            [
              {
                inStock: rest.inStock || 0,
                quantity: rest.quantity || 0,
                productId: rest.productId,
                franchiseId: user[0].franchiseId,
                userId: uid
              }
            ],
            function(err, inventory) {
              if (err) {
                rej(err);
                return;
              }
              res(inventory);
            }
          );
        });
      })();
    } catch (error) {
      console.log("\n error after catch", error);
    }
    // console.log("addInventory", addInventory);
    if (addInventory == 0) {
      response = {
        message: "OOPs.. !! Product Not Added. Some thing went worng"
      };

      return response;
    }
    response = {
      message: "Product Added Successfully"
    };

    // response = "Added successfully..."
    return response;
  };

  Inventory.remoteMethod("addInventory", {
    accepts: [
      {
        arg: "rest",
        type: "Object",
        http: { source: "body" },
        description: ["addInventory"],
        required: true
      },
      { arg: "options", type: "object", http: "optionsFromRequest" }
    ],
    returns: { arg: "response", type: "Object", http: { source: "res" } },
    description: ["addInventory"]
  });
  // hock for auto insert userId and time stamp on update
  Inventory.observe("before save", async (ctx, next) => {
    if (!ctx.isNewInstance && ctx.options && ctx.options.accessToken) {
      ctx.data.LastUpdated = new Date();
      ctx.data.UpdatedBy = ctx.options.accessToken.userId;
    }
    next();
  });

  Inventory.ProductDetail = async function(rest, options) {
    const Customer = app.models.Customer;
    let uid = options.accessToken.userId;

    let storeId = 0;
    try {
      storeId = await (() => {
        return new Promise((res, rej) => {
          Customer.find({ where: { id: uid } }, (err, result) => {
            // console.log("result", result);
            if (err) return rej(err);
            else res(result[0].franchiseId);
          });
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }

    // console.log("store Id", storeId);
    // method to get inventories by store Id
    let invent = 0;
    try {
      invent = await (() => {
        return new Promise((res, rej) => {
          Inventory.find({ where: { franchiseId: storeId } }, (err, result) => {
            // console.log(`All inventery in store ${storeId}`, result);
            if (err) return rej(err);
            else res(result);
          });
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }
    // console.log("inventery detail", invent);
    let productId = [];
    invent.forEach(e => {
      productId.push({ id: e.productId });
    });

    // console.log("this is product Id", productId);

    // method to get product detail by product Id
    const Product = app.models.Product;
    let product = 0;
    try {
      product = await (() => {
        return new Promise((res, rej) => {
          Product.find({ where: { or: productId } }, (err, result) => {
            // console.log(`All Product details`, result);
            if (err) return rej(err);
            else res(result);
          });
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }

    return product;
  };
  Inventory.remoteMethod("ProductDetail", {
    accepts: [
      {
        arg: "rest",
        type: "Object",
        // http: { source: "body" },
        description: ["ProductDetail"]
        // required: true
      },
      { arg: "options", type: "object", http: "optionsFromRequest" }
    ],
    returns: { arg: "response", type: "Object", http: { source: "res" } },
    description: ["ProductDetail"],
    http: { path: "/ProductDetail", verb: "post" }
  });

  Inventory.updateStock = async function(rest, options) {
    // console.log("userId", uid);
    let uid = options.accessToken.userId;
    const Customer = app.models.Customer;
    let franchiseId = 0;
    try {
      franchiseId = await (() => {
        return new Promise((res, rej) => {
          Customer.find({ where: { id: uid } }, (err, result) => {
            console.log("update stock user", result);
            if (err) return rej(err);
            else res(result);
          });
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }
    let response = {
      message: "nothing.."
    };

    console.log(
      "testing franchiseId[0].franchiseId",
      franchiseId[0].franchiseId
    );

    let newFranchaisAdmin = franchiseId[0].franchiseId;
    if (!newFranchaisAdmin) {
      response = {
        message:
          "Your Are Not permited to Change Stock. Only Super Admin & Relevent Franchise Admin can changes"
      };
      return response;
    }

    // console.log(" franchiseId", franchiseId);
    // console.log(" franchiseId:", franchiseId[0].franchiseId);
    //rolemapping
    const RoleMapping = app.models.RoleMapping;
    let userid = franchiseId[0].id;
    let rolemap = 0;
    try {
      rolemap = await (() => {
        return new Promise((res, rej) => {
          RoleMapping.find({ principalId: userid }, (err, result) => {
            if (err) return rej(err);
            else res(result);
          });
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }

    let roleUser;
    rolemap.forEach((e, i, a) => {
      // let usid = String(uid);
      let userid = parseInt(rolemap[i].principalId);
      if (userid === uid) {
        // console.log("this is mr EEE", e);
        roleUser = e;
      }
    });
    // console.log("after for each", roleUser);
    if (roleUser.roleId !== 1 && roleUser.roleId !== 2) {
      response = {
        message:
          "Your Are Not permited to Change Stock. Only Super Admin & Franchise Admin can Changes"
      };
      return response;
    }
    // check isStock or not
    franchiseId = franchiseId[0].franchiseId;
    // set logic to check record for franchies
    let checkstock;
    try {
      checkstock = await (() => {
        return new Promise((res, rej) => {
          Inventory.find(
            { where: { franchiseId: franchiseId } },
            (err, result) => {
              if (err) return rej(err);
              else res(result);
            }
          );
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }
    // console.log("this is testing for updating", checkstock);

    let inventId = [];
    let rId = parseInt(rest.id);
    // get the product Id from inventory of a the store
    checkstock.forEach((e, i, a) => {
      inventId.push({ id: e.id });
    });

    // console.log("testing for invent", inventId);

    let brk;
    // checking if the product in the franchies or not
    for (let el of inventId) {
      if (el.id === rId) {
        brk = 1;
      }
    }
    // if product not found in the franchies then terminate the process and send response the below message
    if (!brk) {
      response = { message: "Product Not found in Your inventory" };
      return response;
    }
    // if record found in the franchies then update according the inventory Id
    let updatestock = 0;
    try {
      updatestock = await (() => {
        return new Promise((res, rej) => {
          Inventory.find({ where: { franchiseId: userid } }, (err, result) => {
            // console.log(`inventory of store ${user}`, result);
            if (err) {
              console.log("error in product updation");
            } else {
              Inventory.updateAll(
                { id: rest.id },
                {
                  inStock: rest.inStock,
                  quantity: rest.quantity
                },
                (err, result) => {
                  if (err) return rej(err);
                  else res(result);
                }
              );
            }
          });
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }
    // let response;
    if (updatestock.count == 1) {
      response = { message: "Recored Update Successfully" };
    } else {
      response = { message: "OOPs some thing went woring" };
    }
    // the finnal response for remote method
    return response;
  };
  Inventory.remoteMethod("updateStock", {
    accepts: [
      {
        arg: "rest",
        type: "Object",
        http: { source: "body" },
        description: ["updateStock"]
        // required: true
      },
      { arg: "options", type: "object", http: "optionsFromRequest" }
    ],
    returns: { arg: "response", type: "Object", http: { source: "res" } },
    description: ["updateStock"],
    http: { path: "/updateStock", verb: "post" }
  });

  Inventory.deleteStock = async function(rest, options) {
    let uid = options.accessToken.userId;
    const Customer = app.models.Customer;
    let user = 0;
    try {
      user = await (() => {
        return new Promise((res, rej) => {
          Customer.find({ where: { id: uid } }, (err, result) => {
            // console.log("delete stock", result);
            if (err) return rej(err);
            else res(result);
          });
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }
    let response = {
      message: "nothing.."
    };
    let newFranchaisAdmin = user[0].franchiseId;
    if (!newFranchaisAdmin) {
      response = {
        message:
          "Your Are Not permited to Change Stock. Only Super Admin & Relevent Franchise Admin can changes"
      };
      return response;
    }
    //rolemapping
    user = user[0].id;
    console.log("test for user", user);

    const RoleMapping = app.models.RoleMapping;
    let rolemap = 0;
    try {
      rolemap = await (() => {
        return new Promise((res, rej) => {
          // rolemapping.find({ where: { id: uid } }, (err, result) => {
          RoleMapping.find({ principalId: user }, (err, result) => {
            // console.log("result of rolemapping", result);
            if (err) return rej(err);
            else res(result);
          });
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }

    let roleUser;
    rolemap.forEach((e, i, a) => {
      // let usid = String(uid);
      let userid = parseInt(rolemap[i].principalId);
      if (userid === uid) {
        // console.log("this is mr EEE", e);
        roleUser = e;
      }
    });
    // console.log("after for each", roleUser);
    if (roleUser.roleId !== 1 && roleUser.roleId !== 2) {
      response = {
        message:
          "Your Are Not permited to Change Stock. Only Super Admin & Franchise Admin can Changes"
      };
      return response;
    }
    // check if isStock or not

    // let franchiseId = newFranchaisAdmin;
    let checkstock;
    try {
      checkstock = await (() => {
        return new Promise((res, rej) => {
          Inventory.find(
            { where: { franchiseId: newFranchaisAdmin } },
            (err, result) => {
              if (err) return rej(err);
              else res(result);
            }
          );
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }

    let inventId = [];
    let rId = parseInt(rest.id);
    // get the product Id from inventory of a the store
    checkstock.forEach((e, i, a) => {
      inventId.push({ id: e.id });
    });

    let brk;
    // checking if the product in the franchies or not
    for (let el of inventId) {
      if (el.id === rId) {
        brk = 1;
      }
    }
    // if product not found in the franchies then terminate the process and send response the below message
    if (!brk) {
      response = { message: "Product Not found in Your inventory" };
      return response;
    }
    // is Stock close
    let invent = 0;
    try {
      invent = await (() => {
        return new Promise((res, rej) => {
          Inventory.find({ where: { franchiseId: user } }, (err, result) => {
            console.log("result", result);
            if (err) {
              console.log("error in Device register");
            } else {
              Inventory.destroyAll({ id: rest.id }, (err, result) => {
                // console.log("delete result", result);

                if (err) return rej(err);
                else res(result);
              });
              // console.log("deleted");
            }
          });
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }
    // let response;
    if (invent.count == 1) {
      response = { message: "Record delete successfully" };
    } else {
      response = { message: "OOPs some thing went wrong" };
    }
    return response;
  };
  Inventory.remoteMethod("deleteStock", {
    accepts: [
      {
        arg: "rest",
        type: "Object",
        http: { source: "body" },
        description: ["deleteStock"],
        required: true
      },
      { arg: "options", type: "object", http: "optionsFromRequest" }
    ],
    returns: { arg: "response", type: "Object", http: { source: "res" } },
    description: ["deleteStock"],
    http: { path: "/deleteStock", verb: "post" }
  });
  Inventory.CheckStock = async function(rest, options) {
    const Customer = app.models.Customer;
    let uid = options.accessToken.userId;

    let franchiseId = 0;
    try {
      franchiseId = await (() => {
        return new Promise((res, rej) => {
          Customer.find({ where: { id: uid } }, (err, result) => {
            // console.log("result", result);
            if (err) return rej(err);
            else res(result[0].franchiseId);
          });
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }

    // console.log("store Id", storeId);
    // method to get inventories by store Id
    let invent = 0;
    try {
      invent = await (() => {
        return new Promise((res, rej) => {
          Inventory.find(
            { where: { franchiseId: franchiseId } },
            (err, result) => {
              // console.log(`All inventery in store ${storeId}`, result);
              if (err) return rej(err);
              else res(result);
            }
          );
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }
    console.log("inventery detail", invent);

    return invent;
  };
  Inventory.remoteMethod("CheckStock", {
    accepts: [
      {
        arg: "rest",
        type: "Object",
        // http: { source: "body" },
        description: ["checkStock"]
        // required: true
      },
      { arg: "options", type: "object", http: "optionsFromRequest" }
    ],
    returns: { arg: "response", type: "Object", http: { source: "res" } },
    description: ["checkStock"],
    http: { path: "/checkStock", verb: "post" }
  });
};
