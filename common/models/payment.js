"use strict";

module.exports = function(Payment) {
  Payment.observe("before save", async (ctx, next) => {
    if (!ctx.isNewInstance && ctx.options && ctx.options.accessToken) {
      ctx.data.LastUpdated = new Date();
      ctx.data.UpdatedBy = ctx.options.accessToken.userId;
    }
    next();
  });
};
