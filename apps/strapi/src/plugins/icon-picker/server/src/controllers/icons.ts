import type { Core } from "@strapi/strapi";
import type { Context } from "koa";
import { PLUGIN_ID } from "../pluginId";

const icons = ({ strapi }: { strapi: Core.Strapi }) => ({
  async list(ctx: Context) {
    const iconNames = await strapi.plugin(PLUGIN_ID).service("icons").list();
    ctx.body = { icons: iconNames };
  },
});

export default icons;
