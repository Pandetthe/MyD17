"use strict";

module.exports = {
  register({ strapi }) {
    strapi.customFields.register({
      name: "icon",
      plugin: "strapi-lucide-icons",
      type: "string",
    });
  },
  bootstrap() {},
  destroy() {},
  controllers: {
    icons: ({ strapi }) => ({
      async list(ctx) {
        const iconNames = await strapi
          .plugin("strapi-lucide-icons")
          .service("icons")
          .list();
        ctx.body = { icons: iconNames };
      },
    }),
  },
  routes: {
    "content-api": {
      type: "content-api",
      routes: [
        {
          method: "GET",
          path: "/icons",
          handler: "icons.list",
          config: { policies: [] },
        },
      ],
    },
  },
  services: {
    icons: () => ({
      async list() {
        const { default: dynamicIconImports } = await import(
          "lucide-react/dynamicIconImports"
        );
        return Object.keys(dynamicIconImports);
      },
      normalize(value) {
        return value
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
      },
    }),
  },
};
