import React from "react";
import { PostDetail } from "../PostDetail.component";
import type { Post, Tag } from "@repo/types";
import { render, screen, fireEvent } from "@testing-library/react-native";

const mockBack = jest.fn();
const mockLikePost = jest.fn();
const mockHandleShare = jest.fn();

jest.mock("@/hooks/useGuardedRouter", () => ({
  useGuardedRouter: () => ({
    back: mockBack,
    push: jest.fn(),
    navigate: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock("@/features/posts/api/useLikePost", () => ({
  useLikePost: () => ({ likePost: mockLikePost, liked: false, likesCount: 5 }),
}));

jest.mock("@/features/posts/hooks/useSharePost", () => ({
  useSharePost: () => mockHandleShare,
}));

jest.mock("@/features/posts/utils/postHelpers", () => ({
  getPostHeroImage: () => null,
  getPostDescription: (post: Post) => post.description ?? "",
}));

jest.mock("@/lib/tagColor", () => ({ tagColor: () => "primary" }));
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock("expo-image", () => ({ Image: () => null }));
jest.mock("@/components/posts/PostDetail/HeroImage.component", () => ({
  HeroImage: () => null,
}));
jest.mock("@/components/ContentRenderer", () => ({
  ContentRenderer: () => null,
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("react-native-gesture-handler", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View, ScrollView } = require("react-native");
  return {
    ScrollView,
    Gesture: {
      Pan: () => ({ activeOffsetX: () => ({ failOffsetY: () => ({ onEnd: () => ({}) }) }) }),
    },
    GestureDetector: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});
jest.mock("react-native-svg", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    default: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    Svg: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
    Defs: () => null,
    Ellipse: () => null,
    RadialGradient: () => null,
    Stop: () => null,
  };
});
jest.mock("@/hooks/usePressAnimation", () => ({
  usePressAnimation: () => ({ animStyle: {}, onPressIn: jest.fn(), onPressOut: jest.fn() }),
}));

const makePost = (overrides: Partial<Post> = {}): Post =>
  ({
    documentId: "post-1",
    title: "My Post Title",
    description: "A description",
    likesCount: 5,
    images: [],
    tags: [],
    content: [],
    createdAt: "2025-06-01T10:00:00.000Z",
    ...overrides,
  }) as unknown as Post;

beforeEach(() => {
  mockBack.mockClear();
  mockLikePost.mockClear();
  mockHandleShare.mockClear();
});

describe("PostDetail", () => {
  it("renders the post title", () => {
    render(<PostDetail post={makePost()} />);
    expect(screen.getByText("My Post Title")).toBeTruthy();
  });

  it("renders the post description", () => {
    render(<PostDetail post={makePost({ description: "Interesting content here" })} />);
    expect(screen.getByText("Interesting content here")).toBeTruthy();
  });

  it("renders the likes count", () => {
    render(<PostDetail post={makePost({ likesCount: 42 })} />);
    expect(screen.getByText("5")).toBeTruthy();
  });

  it("renders the back button in normal mode", () => {
    render(<PostDetail post={makePost()} />);
    expect(screen.getByTestId("post-detail-back-btn")).toBeTruthy();
  });

  it("hides the back button in preview mode", () => {
    render(<PostDetail post={makePost()} preview />);
    expect(screen.queryByTestId("post-detail-back-btn")).toBeNull();
  });

  it("calls router.back when the back button is pressed", () => {
    render(<PostDetail post={makePost()} />);
    fireEvent.press(screen.getByTestId("post-detail-back-btn"));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("calls handleShare when the share button is pressed", () => {
    render(<PostDetail post={makePost()} />);
    fireEvent.press(screen.getByTestId("post-detail-share-btn"));
    expect(mockHandleShare).toHaveBeenCalledTimes(1);
  });

  it("calls likePost when the like button is pressed", () => {
    render(<PostDetail post={makePost()} />);
    fireEvent.press(screen.getByTestId("post-detail-like-btn"));
    expect(mockLikePost).toHaveBeenCalledTimes(1);
  });

  it("renders tags when present and no hero image", () => {
    const tags: Tag[] = [{ id: 1, title: "sport", color: null } as unknown as Tag];
    render(<PostDetail post={makePost({ tags })} />);
    expect(screen.getByText("#sport")).toBeTruthy();
  });

  it("renders without crashing when description is empty", () => {
    expect(() => render(<PostDetail post={makePost({ description: "" })} />)).not.toThrow();
  });
});
