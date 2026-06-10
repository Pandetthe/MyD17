import type { Core } from "@strapi/strapi";
import * as admin from "firebase-admin";

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getTags() {
    return strapi.db
      .query("api::tag.tag")
      .findMany({ select: ["id", "title"] });
  },

  async sendNotification(tagIds: number[], title: string, body: string) {
    if (!admin.apps.length) throw new Error("Firebase not initialized");

    const subscribers = (await strapi.db
      .query("api::push-subscriber.push-subscriber")
      .findMany({
        where: { tags: { id: { $in: tagIds } } },
        select: ["pushToken"],
      })) as { pushToken: string }[];

    if (!subscribers.length) return { sent: 0 };

    const tokens = subscribers.map((s) => s.pushToken);
    await admin
      .messaging()
      .sendEachForMulticast({ tokens, notification: { title, body } });
    return { sent: tokens.length };
  },
});

export default service;
