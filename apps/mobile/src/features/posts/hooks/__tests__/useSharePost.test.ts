import type { Post } from "@repo/types";

const mockShare = jest.fn().mockResolvedValue({ action: "sharedAction" });

jest.mock("react-native", () => ({
  Share: { share: mockShare },
}));

const makePost = (overrides: Partial<Post> = {}): Post =>
  ({ documentId: "abc123", title: "Test Post", ...overrides }) as unknown as Post;

describe("useSharePost — with EXPO_PUBLIC_STRAPI_URL set", () => {
  let useSharePost: (post: Post) => () => Promise<void>;

  beforeAll(() => {
    process.env.EXPO_PUBLIC_STRAPI_URL = "https://test.example.com";
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      ({ useSharePost } = require("../useSharePost"));
    });
  });

  beforeEach(() => {
    mockShare.mockClear();
  });

  it("returns a function", () => {
    const result = useSharePost(makePost());
    expect(typeof result).toBe("function");
  });

  it("calls Share.share with the post URL", async () => {
    await useSharePost(makePost({ documentId: "xyz99" }))();
    expect(mockShare).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("xyz99") }),
    );
  });

  it("uses EXPO_PUBLIC_STRAPI_URL as base URL", async () => {
    await useSharePost(makePost({ documentId: "xyz99" }))();
    expect(mockShare).toHaveBeenCalledWith(
      expect.objectContaining({ message: "https://test.example.com/api/share/post/xyz99" }),
    );
  });

  it("passes post.title as the share title", async () => {
    await useSharePost(makePost({ title: "My Event" }))();
    expect(mockShare).toHaveBeenCalledWith(expect.objectContaining({ title: "My Event" }));
  });
});

describe("useSharePost — without EXPO_PUBLIC_STRAPI_URL", () => {
  let useSharePost: (post: Post) => () => Promise<void>;

  beforeAll(() => {
    delete process.env.EXPO_PUBLIC_STRAPI_URL;
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      ({ useSharePost } = require("../useSharePost"));
    });
  });

  beforeEach(() => {
    mockShare.mockClear();
  });

  it("falls back to http://localhost:1337 as base URL", async () => {
    await useSharePost(makePost({ documentId: "fallback1" }))();
    expect(mockShare).toHaveBeenCalledWith(
      expect.objectContaining({ message: "http://localhost:1337/api/share/post/fallback1" }),
    );
  });
});
