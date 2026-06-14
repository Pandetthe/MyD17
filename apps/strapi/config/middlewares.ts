import type { Core } from "@strapi/strapi";

const config: Core.Config.Middlewares = [
  "strapi::logger",
  "strapi::errors",
  {
    name: "strapi::security",
    config: {
      frameguard: { action: "sameorigin" },
      hidePoweredBy: true,
    },
  },
  {
    name: "strapi::cors",
    config: {
      origin: (process.env.CORS_ALLOWED_ORIGINS ?? "http://localhost:1337")
        .split(",")
        .map((o) => o.trim()),
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
      headers: ["Content-Type", "Authorization", "Origin", "Accept"],
      keepHeaderOnError: true,
    },
  },
  // "strapi::poweredBy" intentionally removed — exposes platform identity
  "strapi::query",
  "strapi::body",
  "strapi::session",
  "strapi::favicon",
  "strapi::public",
];

export default config;
