import type { Core } from "@strapi/strapi";

const config = ({
  env,
}: Core.Config.Shared.ConfigParams): Core.Config.Admin => ({
  auth: {
    secret: env("ADMIN_JWT_SECRET"),
    sessions: {
      maxRefreshTokenLifespan: env.int(
        "MAX_REFRESH_TOKEN_LIFESPAN",
        7 * 24 * 60 * 60,
      ),
      maxSessionLifespan: env.int("MAX_SESSION_LIFESPAN", 24 * 60 * 60),
    },
  },
  apiToken: {
    salt: env("API_TOKEN_SALT"),
  },
  transfer: {
    token: {
      salt: env("TRANSFER_TOKEN_SALT"),
    },
  },
  secrets: {
    encryptionKey: env("ENCRYPTION_KEY"),
  },
  flags: {
    nps: env.bool("FLAG_NPS", true),
    promoteEE: env.bool("FLAG_PROMOTE_EE", false),
  },
  preview: {
    enabled: true,
    config: {
      async handler(uid: string, { documentId, status }: { documentId?: string; status?: string }) {
        const secret = env("PREVIEW_SECRET", "change-me-in-production");
        const strapiUrl = env("STRAPI_URL", "http://localhost:1337");
        const params = new URLSearchParams({
          uid,
          documentId: documentId ?? "",
          status: status ?? "draft",
          secret,
        });
        return `${strapiUrl}/api/preview?${params.toString()}`;
      },
    },
  },
});

export default config;
