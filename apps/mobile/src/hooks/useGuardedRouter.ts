import { useNavigation, useRouter } from "expo-router";

/**
 * A router whose `push` is guarded against rapid double-taps.
 *
 * Pushing a screen defocuses the current one, so any further taps that fire
 * before the navigation transition completes hit `isFocused() === false` and
 * are ignored. This prevents the "tapped twice → two screens stacked → have to
 * press back N times" problem on posts, settings, and any other slide windows.
 */
export function useGuardedRouter() {
  const router = useRouter();
  const navigation = useNavigation();

  const push: typeof router.push = (...args) => {
    if (navigation.isFocused()) {
      router.push(...args);
    }
  };

  return { ...router, push };
}
