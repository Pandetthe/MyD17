import { promises as fs } from "fs";
import { tmpdir } from "os";
import path from "path";
import type { Core, UID } from "@strapi/strapi";

type SeedItem = Record<string, unknown>;

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const createdIds: Record<string, number[]> = {};

    const uploadImageFromUrl = async (url: string): Promise<number | null> => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const buffer = Buffer.from(await response.arrayBuffer());
        const contentType =
          response.headers.get("content-type") || "image/jpeg";
        const ext = contentType.split("/")[1] ?? "jpg";
        const filename = `seed-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const tmpPath = path.join(tmpdir(), filename);

        await fs.writeFile(tmpPath, buffer);
        const [uploaded] = await strapi.plugins[
          "upload"
        ].services.upload.upload({
          data: {},
          files: {
            name: filename,
            originalFilename: filename,
            path: tmpPath,
            filepath: tmpPath,
            mimetype: contentType,
            size: buffer.length / 1000,
          },
        });
        await fs.unlink(tmpPath).catch(() => {});

        return (uploaded as { id: number } | undefined)?.id ?? null;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        strapi.log.warn(`Image upload failed for ${url}: ${message}`);
        return null;
      }
    };

    const seedIfNeeded = async (
      uid: string,
      items: SeedItem[],
      relations?: Record<string, string>,
    ) => {
      try {
        const count = await strapi.db.query(uid).count();
        if (count > 0) {
          strapi.log.info(
            `Skipping seeding for ${uid}: ${count} records present`,
          );
          return;
        }

        let processedItems = items;
        if (relations) {
          processedItems = JSON.parse(JSON.stringify(items)) as SeedItem[];
          for (const item of processedItems) {
            for (const [fieldName, relationUid] of Object.entries(relations)) {
              if (Array.isArray(item[fieldName]) && createdIds[relationUid]) {
                item[fieldName] = (item[fieldName] as number[]).map(
                  (index) => createdIds[relationUid][index - 1],
                );
              }
            }
          }
        }

        createdIds[uid] = [];
        for (const item of processedItems) {
          const { _imageUrls, ...itemData } = item;
          const imageIds: number[] = [];
          if (Array.isArray(_imageUrls) && _imageUrls.length > 0) {
            for (const url of _imageUrls) {
              const id = await uploadImageFromUrl(url as string);
              if (id !== null) {
                imageIds.push(id);
              }
            }
          }

          const created = await strapi.entityService.create(uid as UID.ContentType, {
            data: {
              ...itemData,
              ...(imageIds.length > 0 ? { images: imageIds } : {}),
              publishedAt: new Date(),
            },
          });
          createdIds[uid].push((created as { id: number }).id);
        }
        strapi.log.info(`Seeded ${items.length} records for ${uid}`);
      } catch (err) {
        const apiErr = err as { details?: { errors?: unknown }; message?: string };
        const details = apiErr.details?.errors
          ? JSON.stringify(apiErr.details.errors, null, 2)
          : apiErr.message;
        strapi.log.error(`Seeding failed for ${uid}: \n${details}`);
      }
    };

    const seedsDir = path.join(process.cwd(), "seeds");

    const seedFromFile = async (
      uid: string,
      filename: string,
      relations?: Record<string, string>,
    ) => {
      const filePath = path.join(seedsDir, filename);
      try {
        const raw = await fs.readFile(filePath, "utf-8");
        const items = JSON.parse(raw) as SeedItem[];
        await seedIfNeeded(uid, items, relations);
      } catch (err) {
        strapi.log.error(`Seeding failed for ${uid}: ${err}`);
      }
    };

    await seedFromFile("plugin::users-permissions.user", "users.json");
    await seedFromFile("api::tag.tag", "tags.json");
    await seedFromFile("api::post.post", "posts.json", {
      tags: "api::tag.tag",
    });
    await seedFromFile(
      "api::static-information.static-information",
      "static-information.json",
    );
    await seedFromFile(
      "api::information-page.information-page",
      "information-page.json",
      {
        staticInformation: "api::static-information.static-information",
      },
    );

    await setupPublicPermissions(strapi);
  },
};

async function setupPublicPermissions(strapi: Core.Strapi) {
  const publicRole = await strapi.db
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: "public" } });

  if (!publicRole) {
    strapi.log.warn("Public role not found, skipping permission setup");
    return;
  }

  const publicActions = [
    "api::post.post.find",
    "api::post.post.findOne",
    "api::tag.tag.find",
    "api::tag.tag.findOne",
    "api::information-page.information-page.find",
    "api::information-page.information-page.findOne",
    "api::static-information.static-information.find",
    "api::static-information.static-information.findOne",
    // required for populate[author] to work in public post queries;
    // sensitive user fields (email, password, tokens, confirmed, blocked) are marked private in the schema
    "plugin::users-permissions.user.find",
  ];

  for (const action of publicActions) {
    const permission = await strapi.db
      .query("plugin::users-permissions.permission")
      .findOne({ where: { action, role: publicRole.id } });

    if (!permission) {
      await strapi.db
        .query("plugin::users-permissions.permission")
        .create({ data: { action, role: publicRole.id, enabled: true } });
      strapi.log.info(`Created public permission: ${action}`);
    } else if (!permission.enabled) {
      await strapi.db
        .query("plugin::users-permissions.permission")
        .update({ where: { id: permission.id }, data: { enabled: true } });
      strapi.log.info(`Enabled public permission: ${action}`);
    }
  }
}
