"use strict";

module.exports = {
  services: {
    service: ({ strapi }) => ({
      async getTags() {
        return strapi.db
          .query("api::tag.tag")
          .findMany({ select: ["id", "title"] });
      },

      async sendNotification(tagIds, title, body) {
        const admin = require("firebase-admin");
        if (!admin.apps.length) throw new Error("Firebase not initialized");

        const subscribers = await strapi.db
          .query("api::push-subscriber.push-subscriber")
          .findMany({
            where: { tags: { id: { $in: tagIds } } },
            select: ["pushToken"],
          });

        if (!subscribers.length) return { sent: 0 };

        const tokens = subscribers.map((s) => s.pushToken);
        await admin
          .messaging()
          .sendEachForMulticast({ tokens, notification: { title, body } });
        return { sent: tokens.length };
      },
    }),
  },

  controllers: {
    controller: ({ strapi }) => ({
      async getTags(ctx) {
        ctx.body = await strapi
          .plugin("push-notifications-widget")
          .service("service")
          .getTags();
      },

      async sendNotification(ctx) {
        const { tagIds, title, body } = ctx.request.body;
        if (!Array.isArray(tagIds) || !title || !body) {
          return ctx.badRequest("tagIds, title, and body are required");
        }
        ctx.body = await strapi
          .plugin("push-notifications-widget")
          .service("service")
          .sendNotification(tagIds, title, body);
      },
    }),
  },

  routes: {
    admin: {
      type: "admin",
      routes: [
        {
          method: "GET",
          path: "/tags",
          handler: "controller.getTags",
          config: { policies: [], auth: false },
        },
        {
          method: "POST",
          path: "/send",
          handler: "controller.sendNotification",
          config: { policies: [] },
        },
      ],
    },
  },
};
