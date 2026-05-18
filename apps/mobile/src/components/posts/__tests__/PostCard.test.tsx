import React from "react";
import { PostCard } from "../PostCard.component";
import type { Post, Tag } from "@repo/types";
import { render, screen, fireEvent } from "@testing-library/react-native";

jest.mock("@/lib/apiClient", () => ({
  strapiUrl: (path: string) => (path.startsWith("http") ? path : `http://localhost:1337${path}`),
}));
jest.mock("@/lib/images", () => ({ PostPlaceholder: null }));
jest.mock("@/hooks/usePressAnimation", () => ({
  usePressAnimation: () => ({ animStyle: {}, onPressIn: jest.fn(), onPressOut: jest.fn() }),
}));
jest.mock("expo-image", () => ({ Image: () => null }));
jest.mock("expo-linear-gradient", () => ({
  LinearGradient: ({ children }: { children: React.ReactNode }) => children,
}));

const makePost = (overrides: Partial<Post> = {}): Post =>
  ({
    id: 1,
    title: "Test Post Title",
    description: "A short description",
    likesCount: 42,
    createdAt: "2025-04-15T12:00:00.000Z",
    images: [],
    tags: [],
    content: [],
    ...overrides,
  }) as unknown as Post;

describe("PostCard", () => {
  it("renders the post title", () => {
    render(<PostCard post={makePost()} onPress={jest.fn()} />);
    expect(screen.getByText("Test Post Title")).toBeTruthy();
  });

  it("renders the post description", () => {
    render(<PostCard post={makePost({ description: "Short desc" })} onPress={jest.fn()} />);
    expect(screen.getByText("Short desc")).toBeTruthy();
  });

  it("renders the likes count", () => {
    render(<PostCard post={makePost({ likesCount: 17 })} onPress={jest.fn()} />);
    expect(screen.getByText("17")).toBeTruthy();
  });

  it("renders formatted creation date", () => {
    render(
      <PostCard post={makePost({ createdAt: "2025-04-15T00:00:00.000Z" })} onPress={jest.fn()} />,
    );
    expect(screen.getByText(/kwi/i)).toBeTruthy();
  });

  it("renders author username when present", () => {
    const post = makePost({ author: { username: "jan_kowalski" } as Post["author"] });
    render(<PostCard post={post} onPress={jest.fn()} />);
    expect(screen.getByText("jan_kowalski")).toBeTruthy();
  });

  it("renders tags", () => {
    const tags: Tag[] = [{ id: 1, title: "sport", color: null } as unknown as Tag];
    render(<PostCard post={makePost({ tags })} onPress={jest.fn()} />);
    expect(screen.getByText("#sport")).toBeTruthy();
  });

  it("calls onPress when the card is pressed", () => {
    const onPress = jest.fn();
    render(<PostCard post={makePost()} onPress={onPress} />);
    fireEvent.press(screen.getByText("Test Post Title"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("calls onTagPress when a tag is pressed", () => {
    const onTagPress = jest.fn();
    const tags: Tag[] = [{ id: 5, title: "events", color: null } as unknown as Tag];
    render(<PostCard post={makePost({ tags })} onPress={jest.fn()} onTagPress={onTagPress} />);
    fireEvent.press(screen.getByText("#events"));
    expect(onTagPress).toHaveBeenCalledWith(5);
  });
});
