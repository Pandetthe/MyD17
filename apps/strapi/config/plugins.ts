import fs from "fs";
import path from "path";
import type { Core } from "@strapi/strapi";

const config = ({
  env,
}: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  documentation: {
    enabled: true,
    config: {
      openapi: "3.0.0",
      info: { version: "1.0.0", title: "MyD17 API" },
      "x-strapi-config": {
        mutateDocumentation: (draft: any) => {
          const docPath = path.join(
            process.cwd(),
            "src/extensions/documentation/documentation/1.0.0/full_documentation.json",
          );
          try {
            const existing = JSON.parse(fs.readFileSync(docPath, "utf-8"));
            const oldDate = existing.info["x-generation-date"];
            const withoutDate = (doc: any) => {
              const { "x-generation-date": _, ...info } = doc.info;
              return JSON.stringify({ ...doc, info });
            };
            if (withoutDate(existing) === withoutDate(draft)) {
              draft.info["x-generation-date"] = oldDate;
            }
          } catch {}
        },
      },
    },
  },
  "strapi-lucide-icons": {
    enabled: true,
    resolve: "./src/plugins/icon-picker",
  },
  "color-picker": {
    enabled: true,
    resolve: "./src/plugins/color-picker",
  },
  "push-notifications-widget": {
    enabled: true,
    resolve: "./src/plugins/push-notifications-widget",
  },
});

export default config;
