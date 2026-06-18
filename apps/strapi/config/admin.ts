import type { Core } from "@strapi/strapi";
import { PREVIEW_ALLOWED_UIDS } from "../src/constants/preview";

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
      async handler(
        uid: string,
        { documentId, status }: { documentId?: string; status?: string },
      ) {
        if (!PREVIEW_ALLOWED_UIDS.has(uid)) return null;

        const secret = env("PREVIEW_SECRET", "change-me-in-production");
        const strapiUrl = env("STRAPI_URL", "http://localhost:1337");
        const expoWebUrl = env("EXPO_WEB_URL", "");
        const docId = documentId ?? "";
        const docStatus = status ?? "draft";

        if (expoWebUrl) {
          // strapiUrl is kept for app versions prior to this rework that still
          // read it from the URL. New builds use EXPO_PUBLIC_STRAPI_URL and
          // ignore this param; they never fetch from an attacker-supplied host.
          const params = new URLSearchParams({
            uid,
            documentId: docId,
            status: docStatus,
            secret,
            strapiUrl,
          });
          return `${expoWebUrl}/preview?${params.toString()}`;
        }

        const params = new URLSearchParams({
          uid,
          documentId: docId,
          status: docStatus,
          secret,
        });
        return `${strapiUrl}/api/preview?${params.toString()}`;
      },
    },
  },
});

export default config;
