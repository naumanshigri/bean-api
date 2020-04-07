"use strict";
var app = require("../../server/server");
var config = require("../../server/config.json");
var path = require("path");
var senderAddress = "nomeapptesting@gmail.com";

module.exports = function (Profile) {
  Profile.UpdateUserProfile = async function (rest, options) {
    let uid = options.accessToken.userId;
    let userProfileUpdate = 0;
    try {
      userProfileUpdate = await (() => {
        return new Promise((res, rej) => {
          Profile.updateAll(
            { userId: uid },
            { fullName: rest.fullName, phone: rest.phone, image: rest.image },
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
    let response;
    if (userProfileUpdate.count == 1) {
      response = "Profile Update Successfully";
    }
    return response;
  };
  Profile.remoteMethod("UpdateUserProfile", {
    accepts: [
      {
        arg: "rest",
        type: "Object",
        http: { source: "body" },
        description: ["UpdateUserProfile"],
      },
      { arg: "options", type: "object", http: "optionsFromRequest" },
    ],
    returns: { arg: "response", type: "Object", http: { source: "res" } },
    description: ["UpdateUserProfile", "use this to UpdateUserProfile."],
  });
  // resend user verification code
  Profile.ResendVerification = async function (rest, options) {
    var NewVerificationCode = Math.floor(100000 + Math.random() * 900000);
    var nodemailer = require("nodemailer");
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "nomeapptesting@gmail.com",
        pass: "nomege1234",
      },
    });
    var mailOptions = {
      from: senderAddress,
      to: rest.email,
      subject: `Thankx For Registering `,
      text: `Your verification Code is  ${NewVerificationCode}`,
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
      }
    });
    const Customer = app.models.Customer;
    let oldVCode = 0;
    try {
      oldVCode = await (() => {
        return new Promise((res, rej) => {
          Customer.find({ where: { email: rest.email } }, (err, result) => {
            if (err) return rej(err);
            else res(result);
          });
        });
      })();
    } catch (error) {
      console.log("\n check error after try ", error);
    }
    // console.log("testing", oldVCode);
    if (oldVCode == 0) {
      return "The email You entered is not correct please Check it agin";
    }

    // console.log("verificaton code", oldVCode[0].verificationToken);
    let sendNewCode = 0;
    try {
      sendNewCode = await (() => {
        return new Promise((res, rej) => {
          Customer.updateAll(
            { email: rest.email },
            { verificationToken: NewVerificationCode },
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
    // console.log("this is finnal testing", sendNewCode.count);
    if (sendNewCode.count == 1) {
      return "Resend verification Code Successfully ... ";
    } else {
      return "The email You entered is not correct please Check it agin";
    }
  };

  Profile.remoteMethod("ResendVerification", {
    accepts: [
      {
        arg: "rest",
        type: "Object",
        http: { source: "body" },
        description: ["UpdateUserProfile"],
        required: true,
      },
      { arg: "options", type: "object", http: "optionsFromRequest" },
    ],
    returns: { arg: "response", type: "Object", http: { source: "res" } },
    description: ["UpdateUserProfile", "use this to UpdateUserProfile."],
  });

  // resend verifcation code
  Profile.ResendVerification = async function (rest) {
    const Customer = app.models.Customer;
    console.log(" testing for rest", rest);
    let user;
    let emailSent = false;
    try {
      user = await (() => {
        return new Promise((res, rej) => {
          Customer.findOne({ where: { email: rest } }, function (err, result) {
            if (err) return rej(err);
            else res(result);
          });
        });
      })();
    } catch (error) {
      console.log("Error in resend verification", error);
    }
    if (user === null) {
      return "Email not found";
    } else {
      if (user.emailVerified) return "Account is already verified";

      let sixdigitsrandom = Math.floor(1000 + Math.random() * 9000);
      var options = {
        type: "email",
        to: user.email,
        from: senderAddress,
        subject: "Verification Code.",
        text: "" + sixdigitsrandom,
        template: path.resolve(__dirname, "../../server/views/verify.ejs"),
        redirect: "/verified",
        user: Customer,
        generateVerificationToken: tokenGenerator,
      };

      function tokenGenerator(Customer, cb) {
        cb(null, sixdigitsrandom);
      }
      try {
        emailSent = await (() => {
          return new Promise((res, rej) => {
            user.verify(options, function (err, result) {
              if (err) {
                return rej(err);
              } else {
                console.log("Verification code sent to " + options.to);
                return res(true);
              }
            });
          });
        })();
      } catch (error) {
        console.log("Error in  resend verification code ", error);
      }
    }
    if (emailSent) {
      return "Verification code sent.";
    } else {
      return "Error in sending email. Please try again";
    }
  };
  Profile.remoteMethod("ResendVerification", {
    http: {
      path: "/resendVerification",
      verb: "post",
    },
    accepts: {
      arg: "email",
      type: "string",
      required: true,
    },
    returns: {
      arg: "status",
      type: "string",
    },
  });
  Profile.observe("before save", async (ctx, next) => {
    if (!ctx.isNewInstance && ctx.options && ctx.options.accessToken) {
      ctx.data.LastUpdated = new Date();
      ctx.data.UpdatedBy = ctx.options.accessToken.userId;
    }
    next();
  });
};
