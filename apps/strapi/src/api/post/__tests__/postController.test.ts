let controllerFactory: ((deps: { strapi: any }) => { like: (ctx: any) => Promise<void> }) | undefined;

jest.mock("@strapi/strapi", () => ({
  factories: {
    createCoreController: (_uid: string, fn: (deps: any) => any) => {
      controllerFactory = fn;
      return {};
    },
  },
}));

// Import triggers the jest.mock above, capturing controllerFactory
require("../controllers/post");

const makeStrapi = (post: { likesCount: number } | null) => ({
  documents: jest.fn().mockReturnValue({
    findOne: jest.fn().mockResolvedValue(post),
  }),
  db: {
    query: jest.fn().mockReturnValue({
      updateMany: jest.fn().mockResolvedValue({}),
    }),
  },
});

const makeCtx = (documentId: string, action: string) => ({
  params: { documentId },
  request: { body: { action } },
  status: 200,
  body: null as any,
});

describe("like controller", () => {
  it("returns 404 when post is not found", async () => {
    const strapi = makeStrapi(null);
    const controller = controllerFactory!({ strapi });
    const ctx = makeCtx("nonexistent", "like");

    await controller.like(ctx);

    expect(ctx.status).toBe(404);
    expect(ctx.body).toEqual({ error: "Not found" });
  });

  it("increments likesCount by 1 on action 'like'", async () => {
    const strapi = makeStrapi({ likesCount: 5 });
    const controller = controllerFactory!({ strapi });
    const ctx = makeCtx("post-1", "like");

    await controller.like(ctx);

    expect(ctx.body).toEqual({ likesCount: 6 });
  });

  it("decrements likesCount by 1 on action 'unlike'", async () => {
    const strapi = makeStrapi({ likesCount: 5 });
    const controller = controllerFactory!({ strapi });
    const ctx = makeCtx("post-1", "unlike");

    await controller.like(ctx);

    expect(ctx.body).toEqual({ likesCount: 4 });
  });

  it("floors likesCount at 0 — never goes negative", async () => {
    const strapi = makeStrapi({ likesCount: 0 });
    const controller = controllerFactory!({ strapi });
    const ctx = makeCtx("post-1", "unlike");

    await controller.like(ctx);

    expect(ctx.body).toEqual({ likesCount: 0 });
  });

  it("calls updateMany with the correct documentId and new likesCount", async () => {
    const strapi = makeStrapi({ likesCount: 3 });
    const controller = controllerFactory!({ strapi });
    const ctx = makeCtx("post-abc", "like");

    await controller.like(ctx);

    const updateMany = strapi.db.query().updateMany;
    expect(updateMany).toHaveBeenCalledWith({
      where: { documentId: "post-abc", publishedAt: { $notNull: true } },
      data: { likesCount: 4 },
    });
  });

  it("sets ctx.body to { likesCount } on success", async () => {
    const strapi = makeStrapi({ likesCount: 7 });
    const controller = controllerFactory!({ strapi });
    const ctx = makeCtx("post-1", "like");

    await controller.like(ctx);

    expect(ctx.body).toEqual({ likesCount: 8 });
  });
});
