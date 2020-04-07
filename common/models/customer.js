"use strict";

var app = require("../../server/server");
var config = require("../../server/config.json");
var path = require("path");
var senderAddress = "nomeapptesting@gmail.com";

module.exports = function (Customer) {
  Customer.validatesLengthOf("password", {
    min: 5,
    message: { min: "Password is too short" },
  });
  // Profile on SignUp
  Customer.observe("after save", async function (ctx, next) {
    const CreateProfile = app.models.Profile;

    if (ctx.isNewInstance) {
      let profile;
      try {
        profile = await (() => {
          return new Promise((res, rej) => {
            CreateProfile.create(
              [
                {
                  fullName: ctx.instance.username || "",
                  phone: ctx.instance.phone || "00000000000",
                  email: ctx.instance.email,
                  image:
                    ctx.instance.image ||
                    "https://i.ya-webdesign.com/images/businessman-png-icon-1.png",
                  franchiseId: 0,
                  userId: ctx.instance.id,
                },
              ],
              function (err, profile) {
                if (err) {
                  return rej(err);
                }
                return res(profile);
              }
            );
          });
        })();
      } catch (error) {
        console.log("\n Error After Try", error);
      }
    } else {
      console.log(
        "Updated %s matching %j",
        ctx.Model.pluralModelName,
        ctx.where
      );
    }
    next();
  });

  Customer.afterRemote("create", function (ctx, Customer, next) {
    var sixdigitsrandom = Math.floor(1000 + Math.random() * 9000);
    // console.log("six digit number", sixdigitsrandom);

    var options = {
      type: "email",
      to: Customer.email,
      from: senderAddress,
      subject: "Thanks for registering.",
      text: " " + sixdigitsrandom,
      template: path.resolve(__dirname, "../../server/views/verify.ejs"),
      redirect: "/verified",
      user: Customer,
      generateVerificationToken: tokenGenerator,
    };
    // console.log("option. user", options.user);

    function tokenGenerator(Customer, cb) {
      cb(null, sixdigitsrandom);
    }

    Customer.verify(options, function (err, response) {
      if (err) {
        next(err);
        return;
      }
      console.log("Account verification email sent to " + options.to);
      next();
    });
  });

  // Method to render
  Customer.afterRemote("prototype.verify", function (context, user, next) {
    context.res.render("response", {
      title:
        "A Link to reverify your identity has been sent " +
        "to your email successfully",
      content:
        "Please check your email and click on the verification link " +
        "before logging in",
      redirectTo: "/",
      redirectToLinkText: "Log in",
    });
  });

  //send password reset link when requested
  Customer.on("resetPasswordRequest", function (info) {
    var url = "http://" + config.host + ":" + config.port + "/reset-password";
    var html =
      'Click <a href="' +
      url +
      "?access_token=" +
      info.accessToken.id +
      '">here</a> to reset your password';

    Customer.app.models.Email.send(
      {
        to: info.email,
        from: senderAddress,
        subject: "Password reset",
        html: html,
      },
      function (err) {
        if (err) return console.log("> error sending password reset email");
        console.log("> sending password reset email to:", info.email);
      }
    );
  });

  //render UI page after password change
  Customer.afterRemote("changePassword", function (context, user, next) {
    context.res.render("response", {
      title: "Password changed successfully",
      content: "Please login again with new password",
      redirectTo: "/",
      redirectToLinkText: "Log in",
    });
  });

  //render UI page after password reset
  Customer.afterRemote("setPassword", function (context, user, next) {
    context.res.render("response", {
      title: "Password reset success",
      content: "Your password has been reset successfully",
      redirectTo: "/",
      redirectToLinkText: "Log in",
    });
  });
  // Role Assinmgent
  /*
  Customer.observe("after save", function setRoleMapping(ctx, next) {
    if (ctx.instance) {
      if (ctx.isNewInstance) {
        var RoleMapping = User.app.models.RoleMapping;
        // var roleId = based on type lookup or static?

        RoleMapping.create(
          {
            principalType: "USER",
            principalId: ctx.instance.id,
            roleId: roleId
          },
          function(err, roleMapping) {
            if (err) {
              return console.log(err);
            }

            // success stuff
          }
        );
      }
    }
    next();
  });
  */
  // end role assingment

  // Start role mapping

  // Customer.observe("after save", function setRoleMapping(ctx, next) {
  //   let RoleMapping = User.app.models.RoleMapping;
  //   let Role = User.app.models.Role;
  //   if (ctx.instance) {
  //     if (ctx.isNewInstance) {
  //       // look up role based on type
  //       //
  //       Role.find({ where: { name: ctx.instance.type } }, function(err, role) {
  //         console.log("This is user role testing", role);

  //         if (err) {
  //           return console.log(err);
  //         }

  //         RoleMapping.create(
  //           {
  //             principalType: "USER",
  //             principalId: ctx.instance.id,
  //             roleId: role.id
  //           },
  //           function(err, roleMapping) {
  //             if (err) {
  //               return console.log(err);
  //             }

  //             console.log(
  //               "User assigned RoleID " +
  //                 role.id +
  //                 " (" +
  //                 ctx.instance.type +
  //                 ")"
  //             );
  //           }
  //         );
  //       });
  //     }
  //   }
  //   next();
  // });

  // this is Resend verification code for registration

  Customer.ResendVerificationCode = async function (info) {
    console.log("this is info", info);

    var resend = 0;
    try {
      resend = await (() => {
        return new Promise((res, rej) => {
          Customer.find((err, result) => {
            console.log("this is result testing snipet", result);

            if (err) return rej(err);
            else res(result);
          });
        });
      })();
    } catch (error) {
      console.log("\n Check After Try", error);
    }
    return response;
  };
  Customer.remoteMethod("ResendVerificationCode", {
    accepts: [
      {
        arg: "rest",
        type: "Object",
        http: { source: "body" },
        description: ["ResendVerificationCode"],
        required: true,
      },
      { arg: "options", type: "object", http: "optionsFromRequest" },
    ],
    returns: { arg: "response", type: "Object", http: { source: "res" } },
    description: ["ResendVerificationCode"],
  });
  Customer.observe("before save", async (ctx, next) => {
    if (!ctx.isNewInstance && ctx.options && ctx.options.accessToken) {
      ctx.data.LastUpdated = new Date();
      ctx.data.UpdatedBy = ctx.options.accessToken.userId;
    }
    next();
  });
};
