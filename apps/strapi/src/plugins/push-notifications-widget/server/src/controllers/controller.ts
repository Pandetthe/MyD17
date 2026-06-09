import type { Core } from "@strapi/strapi";

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getTags(ctx: any) {
    ctx.body = await strapi
      .plugin("push-notifications-widget")
      .service("service")
      .getTags();
  },

  async sendNotification(ctx: any) {
    const { tagIds, title, body } = ctx.request.body;
    if (!Array.isArray(tagIds) || !title || !body) {
      return ctx.badRequest("tagIds, title, and body are required");
    }
    ctx.body = await strapi
      .plugin("push-notifications-widget")
      .service("service")
      .sendNotification(tagIds, title, body);
  },
});

export default controller;