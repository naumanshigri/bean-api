"use strict";
const app = require("../../server/server");
module.exports = function(Admin) {
  Admin.UserRoleAssign = async function(rest, options) {
    const rolemapping = app.models.RoleMapping;
    console.log("this is the user Id form rest", rest.userId);

    let rolemap;
    let response;
    try {
      rolemap = await (() => {
        return new Promise((res, rej) => {
          rolemapping.findOrCreate(
            { where: { principalId: rest.userId } },
            [
              {
                principalType: "USER",
                principalId: rest.userId,
                roleId: rest.roleId
              }
            ],
            (err, result, created) => {
              if (created) {
                console.log("role maping detail", result);
                response = `Role is assigned for User ${rest.userId}`;
              } else {
                console.log("already assed role for this user");
                response = "already assed role for this user";
              }

              if (err) return rej(err);
              else res(result);
            }
          );
        });
      })();
    } catch (error) {
      console.log("\n Check After Try", error);
    }
    return response;
  };
  Admin.remoteMethod("UserRoleAssign", {
    accepts: [
      {
        arg: "rest",
        type: "Object",
        http: { source: "body" },
        description: ["UserRoleAssign"],
        required: true
      },
      { arg: "options", type: "object", http: "optionsFromRequest" }
    ],
    returns: { arg: "response", type: "Object", http: { source: "res" } },
    description: ["Use this function to AssignUserRole."]
  });
  Admin.observe("before save", async (ctx, next) => {
    if (!ctx.isNewInstance && ctx.options && ctx.options.accessToken) {
      ctx.data.LastUpdated = new Date();
      ctx.data.UpdatedBy = ctx.options.accessToken.userId;
    }
    next();
  });

  Admin.AssignFranchies = async function(rest, options) {
    const Customer = app.models.Customer;
    let response = "nothing to perfrom";
    // console.log("this is the user Id form rest", rest.userId);
    let checkUser;
    try {
      checkUser = await (() => {
        return new Promise((res, rej) => {
          Customer.find({ where: { id: rest.userId } }, (err, result) => {
            // console.log("this is the result", result);

            if (err) return rej(err);
            else res(result);
          });
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }
    // console.log("out of the box check user", checkUser);
    if (checkUser[0].franchiseId == rest.franchiseId) {
      response = {
        message: "Already have Franchise"
      };
      return response;
    }
    let assignfranchies = 0;
    try {
      assignfranchies = await (() => {
        return new Promise((res, rej) => {
          Customer.updateAll(
            { id: rest.userId },
            {
              franchiseId: rest.franchiseId
            },
            (err, result) => {
              // console.log("this is testing for franchies", result);

              if (err) return rej(err);
              else res(result.count);
            }
          );
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    } // end Rewards
    // console.log("this is testing ", assignfranchies);
    if (assignfranchies === 1) {
      response = {
        message: `Successfully assing the franchise to the User`
      };
    }
    return response;
    // if
    /*
    let rolemap;
    let response;
    try {
      rolemap = await (() => {
        return new Promise((res, rej) => {
          Customer.findOrCreate(
            { where: { id: rest.userId } },
            [
              {
                franchiseId: rest.franchiseId
              }
            ],
            (err, result, created) => {
              console.log("This is result ", result);
              if (created) {
                console.log("role maping detail", result);
                response = `Role is assigned for User ${rest.userId}`;
              } else {
                console.log("already assed role for this user");
                response = "already assed role for this user";
              }

              if (err) return rej(err);
              else res(result);
            }
          );
        });
      })();
    } catch (error) {
      console.log("\n Check After Try", error);
    }
    return response;*/
  };
  Admin.remoteMethod("AssignFranchies", {
    accepts: [
      {
        arg: "rest",
        type: "Object",
        http: { source: "body" },
        description: ["AssignFranchies"],
        required: true
      },
      { arg: "options", type: "object", http: "optionsFromRequest" }
    ],
    returns: { arg: "response", type: "Object", http: { source: "res" } },
    description: ["Use this function to AssignFranchies."]
  });
};
