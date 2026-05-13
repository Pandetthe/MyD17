import { getPostDescription, getPostFirstImage, getPostHeroImage } from "../postHelpers";
import type { Post } from "@repo/types";

type PostImage = NonNullable<Post["images"]>[number];

jest.mock("@/lib/apiClient", () => ({
  strapiUrl: (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `http://localhost:1337${path}`;
  },
}));

const makePost = (overrides: Partial<Post> = {}): Post =>
  ({ id: 1, title: "Test Post", ...overrides }) as Post;

describe("getPostDescription", () => {
  it("returns description when present", () => {
    expect(getPostDescription(makePost({ description: "Hello world" }))).toBe("Hello world");
  });

  it("returns empty string when description is undefined", () => {
    expect(getPostDescription(makePost())).toBe("");
  });

  it("returns empty string when description is null", () => {
    expect(getPostDescription(makePost({ description: null as unknown as string }))).toBe("");
  });
});

describe("getPostFirstImage", () => {
  it("returns null when images array is empty", () => {
    expect(getPostFirstImage(makePost({ images: [] }))).toBeNull();
  });

  it("returns null when images is undefined", () => {
    expect(getPostFirstImage(makePost())).toBeNull();
  });

  it("returns medium format url when available", () => {
    const post = makePost({
      images: [
        {
          url: "/raw.jpg",
          formats: { medium: { url: "/med.jpg", width: 500, height: 300 } },
        } as unknown as PostImage,
      ],
    });
    expect(getPostFirstImage(post)).toBe("http://localhost:1337/med.jpg");
  });

  it("falls back to raw url when no medium format", () => {
    const post = makePost({
      images: [{ url: "/raw.jpg", formats: null } as unknown as PostImage],
    });
    expect(getPostFirstImage(post)).toBe("http://localhost:1337/raw.jpg");
  });

  it("passes absolute urls through strapiUrl unchanged", () => {
    const post = makePost({
      images: [{ url: "https://cdn.example.com/img.jpg", formats: null } as unknown as PostImage],
    });
    expect(getPostFirstImage(post)).toBe("https://cdn.example.com/img.jpg");
  });
});

describe("getPostHeroImage", () => {
  it("returns large format url when available", () => {
    const post = makePost({
      images: [
        {
          url: "/raw.jpg",
          formats: { large: { url: "/large.jpg", width: 1200, height: 800 } },
        } as unknown as PostImage,
      ],
    });
    expect(getPostHeroImage(post)).toBe("http://localhost:1337/large.jpg");
  });

  it("falls back to raw url when no large format", () => {
    const post = makePost({
      images: [
        {
          url: "/raw.jpg",
          formats: { medium: { url: "/med.jpg", width: 500, height: 300 } },
        } as unknown as PostImage,
      ],
    });
    expect(getPostHeroImage(post)).toBe("http://localhost:1337/raw.jpg");
  });

  it("returns null when images array is empty", () => {
    expect(getPostHeroImage(makePost({ images: [] }))).toBeNull();
  });
});
