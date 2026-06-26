import { useGuardedRouter } from "../useGuardedRouter";
import { renderHook } from "@testing-library/react-native";

const mockPush = jest.fn();
const mockNavigate = jest.fn();
const mockReplace = jest.fn();
const mockBack = jest.fn();

let mockFocused = true;

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    navigate: mockNavigate,
    replace: mockReplace,
    back: mockBack,
  }),
  useNavigation: () => ({ isFocused: () => mockFocused }),
}));

beforeEach(() => {
  mockFocused = true;
  mockPush.mockClear();
  mockNavigate.mockClear();
  mockReplace.mockClear();
  mockBack.mockClear();
});

describe("useGuardedRouter — when screen is focused", () => {
  it("push() calls the underlying router.push", () => {
    const { result } = renderHook(() => useGuardedRouter());
    result.current.push("/some-route");
    expect(mockPush).toHaveBeenCalledWith("/some-route");
  });

  it("navigate() calls the underlying router.navigate", () => {
    const { result } = renderHook(() => useGuardedRouter());
    result.current.navigate("/target");
    expect(mockNavigate).toHaveBeenCalledWith("/target");
  });

  it("replace() calls the underlying router.replace", () => {
    const { result } = renderHook(() => useGuardedRouter());
    result.current.replace("/new-route");
    expect(mockReplace).toHaveBeenCalledWith("/new-route");
  });
});

describe("useGuardedRouter — when screen is NOT focused", () => {
  beforeEach(() => {
    mockFocused = false;
  });

  it("push() is ignored to prevent double-navigation", () => {
    const { result } = renderHook(() => useGuardedRouter());
    result.current.push("/some-route");
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("navigate() is ignored", () => {
    const { result } = renderHook(() => useGuardedRouter());
    result.current.navigate("/target");
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("replace() is ignored", () => {
    const { result } = renderHook(() => useGuardedRouter());
    result.current.replace("/new-route");
    expect(mockReplace).not.toHaveBeenCalled();
  });
});

describe("useGuardedRouter — unguarded methods pass through", () => {
  it("back() is available on the returned object", () => {
    const { result } = renderHook(() => useGuardedRouter());
    expect(typeof result.current.back).toBe("function");
  });
});
