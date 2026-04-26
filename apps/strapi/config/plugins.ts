import type { Core } from "@strapi/strapi";

const config = ({
  env,
}: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  documentation: {
    enabled: true,
    config: {
      openapi: "3.0.0",
      info: { version: "1.0.0", title: "MyD17 API" },
    },
  },
});

export default config;
