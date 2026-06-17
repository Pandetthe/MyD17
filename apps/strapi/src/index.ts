import { promises as fs } from "fs";
import { tmpdir } from "os";
import path from "path";
import type { Core, UID } from "@strapi/strapi";
import * as admin from "firebase-admin";

type AdminPermission = {
  action: string;
  subject?: string | null;
  properties?: Record<string, unknown>;
  conditions?: string[];
};

const CONTENT_TYPES = [
  "api::post.post",
  "api::tag.tag",
  "api::static-information.static-information",
  "api::information-page.information-page",
  "api::contact.contact",
];

const CONTENT_ACTION_IDS = [
  "plugin::content-manager.explorer.create",
  "plugin::content-manager.explorer.read",
  "plugin::content-manager.explorer.update",
  "plugin::content-manager.explorer.delete",
  "plugin::content-manager.explorer.publish",
];

const USERS_PERMISSIONS_ADMIN_ACTIONS = [
  "plugin::users-permissions.roles.create",
  "plugin::users-permissions.roles.read",
  "plugin::users-permissions.roles.update",
  "plugin::users-permissions.roles.delete",
  "plugin::users-permissions.providers.read",
  "plugin::users-permissions.providers.update",
  "plugin::users-permissions.email-templates.read",
  "plugin::users-permissions.email-templates.update",
  "plugin::users-permissions.advanced-settings.read",
  "plugin::users-permissions.advanced-settings.update",
];

type ActionObject = {
  actionId: string;
  subjects: string[];
};

function buildContentPermissions(
  strapi: Core.Strapi,
  contentTypes: string[],
  actionIds: string[],
): AdminPermission[] {
  const { actionProvider } = strapi.service("admin::permission");

  const matchingActions = (actionProvider.values() as ActionObject[])
    .filter((a) => actionIds.includes(a.actionId))
    .map((a) => ({
      ...a,
      subjects: a.subjects.filter((s) => contentTypes.includes(s)),
    }))
    .filter((a) => a.subjects.length > 0);

  return strapi
    .service("admin::content-type")
    .getPermissionsWithNestedFields(matchingActions) as AdminPermission[];
}

function buildUploadPermissions(actions: string[]): AdminPermission[] {
  return actions.map((action) => ({
    action,
    subject: null,
    properties: {},
    conditions: [],
  }));
}

function buildPluginPermissions(actionIds: string[]): AdminPermission[] {
  return actionIds.map((action) => ({
    action,
    subject: null,
    properties: {},
    conditions: [],
  }));
}

type SeedItem = Record<string, unknown>;

export default {
  register({ strapi }: { strapi: Core.Strapi }) {
    strapi.documents.use(async (ctx, next) => {
      const result = await next();

      if (ctx.uid === "api::post.post" && ctx.action === "publish") {
        const documentId = (ctx.params as { documentId?: string }).documentId;
        if (documentId) {
          await sendPushNotificationsForPost(strapi, documentId).catch((err) =>
            strapi.log.error("sendPushNotificationsForPost failed:", err),
          );
        }
      }

      return result;
    });
  },

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    if (!admin.apps.length) {
      try {
        const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT ?? "");
        if (parsed?.project_id) {
          admin.initializeApp({ credential: admin.credential.cert(parsed) });
        } else {
          strapi.log.warn(
            "FIREBASE_SERVICE_ACCOUNT invalid — push notifications disabled",
          );
        }
      } catch {
        strapi.log.warn(
          "FIREBASE_SERVICE_ACCOUNT not set or not valid JSON — push notifications disabled",
        );
      }
    }
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

          const created = await strapi.entityService.create(
            uid as UID.ContentType,
            {
              data: {
                ...itemData,
                ...(imageIds.length > 0 ? { images: imageIds } : {}),
                publishedAt: new Date(),
              },
            },
          );
          createdIds[uid].push((created as { id: number }).id);
        }
        strapi.log.info(`Seeded ${items.length} records for ${uid}`);
      } catch (err) {
        const apiErr = err as {
          details?: { errors?: unknown };
          message?: string;
        };
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
    await seedFromFile("api::contact.contact", "contact.json");

    await setupPublicPermissions(strapi);
    await setupAdminRoles(strapi);
    await seedAdminUsers(strapi);
  },
};

type RoleRecord = { id: number; name: string };

async function upsertRole(
  strapi: Core.Strapi,
  name: string,
  description: string,
  permissions: AdminPermission[],
): Promise<RoleRecord> {
  let role = (await strapi.db
    .query("admin::role")
    .findOne({ where: { name } })) as RoleRecord | null;

  if (role) {
    strapi.log.info(`Role "${name}" already exists — updating permissions`);
    await strapi.service("admin::permission").deleteByRolesIds([role.id]);
  } else {
    role = (await strapi.service("admin::role").create({
      name,
      description,
    })) as RoleRecord;
    strapi.log.info(`Created admin role: ${name}`);
  }

  await strapi.service("admin::role").addPermissions(role.id, permissions);
  return role;
}

async function setupAdminRoles(strapi: Core.Strapi) {
  await upsertRole(
    strapi,
    "employee",
    "Full CRUD on all collections, media and users",
    [
      ...buildContentPermissions(strapi, CONTENT_TYPES, CONTENT_ACTION_IDS),
      ...buildUploadPermissions([
        "plugin::upload.read",
        "plugin::upload.configure-view",
        "plugin::upload.assets.create",
        "plugin::upload.assets.update",
        "plugin::upload.assets.download",
        "plugin::upload.assets.copy-link",
      ]),
      ...buildPluginPermissions(USERS_PERMISSIONS_ADMIN_ACTIONS),
    ],
  );
}

async function seedAdminUsers(strapi: Core.Strapi) {
  if (process.env.NODE_ENV === "production") {
    strapi.log.info("Skipping default admin seeding in production");
    return;
  }
  const adminRole = (await strapi.db
    .query("admin::role")
    .findOne({ where: { code: "strapi-super-admin" } })) as RoleRecord | null;

  const employeeRole = (await strapi.db
    .query("admin::role")
    .findOne({ where: { name: "employee" } })) as RoleRecord | null;

  const DEFAULT_USERS = [
    {
      firstname: "Admin",
      lastname: "MYD17",
      email: "admin@myd17.pl",
      password: process.env.STRAPI_ADMIN_PASSWORD ?? "Admin123!",
      role: adminRole,
    },
    {
      firstname: "Employee",
      lastname: "MYD17",
      email: "employee@myd17.pl",
      password: process.env.STRAPI_EMPLOYEE_PASSWORD ?? "Employee123!",
      role: employeeRole,
    },
  ];

  let created = false;
  for (const { firstname, lastname, email, password, role } of DEFAULT_USERS) {
    if (!role) continue;
    if (!password) {
      strapi.log.warn(`Skipping admin user ${email}: password env is not set`);
      continue;
    }

    const existing = await strapi.db
      .query("admin::user")
      .findOne({ where: { email } });

    if (existing) continue;

    await strapi.service("admin::user").create({
      firstname,
      lastname,
      email,
      password,
      roles: [role.id],
      isActive: true,
      registrationToken: null,
    });

    strapi.log.info(`Created admin user: ${email}`);
    created = true;
  }

  if (created) {
    strapi.log.warn(
      "Default admin passwords were set — change them before going to production!",
    );
  }
}

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
    "api::contact.contact.find",
    "api::contact.contact.findOne",
    "api::push-subscriber.push-subscriber.find",
    "api::push-subscriber.push-subscriber.findOne",
    "api::push-subscriber.push-subscriber.create",
    "api::push-subscriber.push-subscriber.update",
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

  // Explicitly revoke permissions that must not be public
  const actionsToRevoke = [
    "plugin::users-permissions.user.find",
    "plugin::users-permissions.user.findOne",
    "plugin::users-permissions.user.me",
    "plugin::users-permissions.user.update",
    "plugin::users-permissions.user.destroy",
  ];

  for (const action of actionsToRevoke) {
    const existing = await strapi.db
      .query("plugin::users-permissions.permission")
      .findOne({ where: { action, role: publicRole.id } });

    if (existing && existing.enabled) {
      await strapi.db
        .query("plugin::users-permissions.permission")
        .update({ where: { id: existing.id }, data: { enabled: false } });
      strapi.log.info(`Revoked public permission: ${action}`);
    }
  }
}

async function sendPushNotificationsForPost(
  strapi: Core.Strapi,
  documentId: string,
) {
  if (!admin.apps.length) return;

  const post = await strapi.documents("api::post.post").findOne({
    documentId,
    populate: ["tags"],
  });

  const tags = (post as { tags?: { id: number }[] } | null)?.tags;
  if (!tags?.length) return;

  const tagIds = tags.map((t) => t.id);

  const subscribers = (await strapi.db
    .query("api::push-subscriber.push-subscriber")
    .findMany({
      where: { tags: { id: { $in: tagIds } } },
      select: ["id", "pushToken"],
    })) as { id: number; pushToken: string }[];

  if (!subscribers.length) return;

  const title = (post as { title?: string } | null)?.title;

  await admin
    .messaging()
    .sendEachForMulticast({
      tokens: subscribers.map((s) => s.pushToken),
      notification: {
        title: "Nowy post na stronie głównej",
        body: title ?? "Check out the post",
      },
      data: { postId: documentId },
    })
    .catch((err) => {
      strapi.log.error("Push send failed:", err);
      return null;
    });
  // }

  strapi.log.info(
    `Push sent to ${subscribers.length} subscribers for post ${documentId}`,
  );
}
