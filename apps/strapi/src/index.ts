// import type { Core } from '@strapi/strapi';
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
    const seedIfNeeded = async (uid: string, items: any[]) => {
      try {
        const count = await strapi.db.query(uid).count();
        if (count > 0) {
          strapi.log.info(
            `Skipping seeding for ${uid}: ${count} records present`,
          );
          return;
        }

        for (const item of items) {
          await strapi.entityService.create(uid, { data: item });
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

    const seedFromFile = async (uid: string, filename: string) => {
      const filePath = path.join(seedsDir, filename);
      try {
        const raw = await fs.readFile(filePath, "utf-8");
        const items = JSON.parse(raw);
        await seedIfNeeded(uid, items);
      } catch (err) {
        strapi.log.error(`Seeding failed for ${uid}: ${err}`);
      }
    };

    // order matters if there are relations between content types
    await seedFromFile("plugin::users-permissions.user", "users.json");
    await seedFromFile("api::tag.tag", "tags.json");
    await seedFromFile("api::post.post", "posts.json");
    await seedFromFile(
      "api::static-information.static-information",
      "static-information.json",
    );
  },
};
