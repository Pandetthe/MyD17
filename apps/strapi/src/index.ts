import { promises as fs } from "fs";
import path from "path";

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }: { strapi: any }) {
    const createdIds: Record<string, number[]> = {};

    const seedIfNeeded = async (
      uid: string,
      items: any[],
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

        // replace relation indices with actual IDs
        let processedItems = items;
        if (relations) {
          processedItems = JSON.parse(JSON.stringify(items));
          for (const item of processedItems) {
            for (const [fieldName, relationUid] of Object.entries(relations)) {
              if (Array.isArray(item[fieldName]) && createdIds[relationUid]) {
                item[fieldName] = item[fieldName].map(
                  (index: number) => createdIds[relationUid][index - 1],
                );
              }
            }
          }
        }

        createdIds[uid] = [];
        for (const item of processedItems) {
          const created = await strapi.entityService.create(uid, {
            data: {
              ...item,
              publishedAt: new Date(),
            },
          });
          createdIds[uid].push(created.id);
        }
        strapi.log.info(`Seeded ${items.length} records for ${uid}`);
      } catch (err) {
        const details = err.details?.errors
          ? JSON.stringify(err.details.errors, null, 2)
          : err.message;

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
        const items = JSON.parse(raw);
        await seedIfNeeded(uid, items, relations);
      } catch (err) {
        strapi.log.error(`Seeding failed for ${uid}: ${err}`);
      }
    };

    // order matters if there are relations between content types
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

    strapi.db.createdIds = createdIds;

    await setupPublicPermissions(strapi);
  },
};

async function setupPublicPermissions(strapi: any) {
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
