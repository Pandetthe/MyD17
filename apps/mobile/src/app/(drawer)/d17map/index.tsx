import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import roomData1 from "@/assets/map/floor1/roomCoordinates.json";
import roomData2 from "@/assets/map/floor2/roomCoordinates.json";
import roomData3 from "@/assets/map/floor3/roomCoordinates.json";
import roomData4 from "@/assets/map/floor4/roomCoordinates.json";
import D17MapView, { FloorPayload } from "@/components/D17MapView";
import { Card } from "@/components/core/Card.component";
import IconPrimitive from "@/components/core/Icon.component";
import TextCore from "@/components/core/Text.component";
import { MAP_ASSETS, ROOM_KEYS } from "@/generated/mapBundle";
import { colors, palette } from "@/styles/colors";
import type { PaletteColor } from "@/styles/themes/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams } from "expo-router";
import {
  ChevronDown,
  ChevronLeft,
  Coffee,
  DoorOpen,
  Footprints,
  GraduationCap,
  MoveVertical,
  SearchIcon,
  Toilet,
  XIcon,
} from "lucide-react-native";
import type { LucideIcon } from "lucide-react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScopedTheme, StyleSheet, useUnistyles } from "react-native-unistyles";

const ROOM_KEYS_SET = new Set(ROOM_KEYS);

const GLB_BASE64S: Record<string, string> = {
  "1": MAP_ASSETS["glb_1"],
  "2": MAP_ASSETS["glb_2"],
  "3": MAP_ASSETS["glb_3"],
  "4": MAP_ASSETS["glb_4"],
};

type RoomCoords = Record<string, { x: number; y: number }>;

const ROOM_COORDS_BY_FLOOR: Record<string, RoomCoords> = {
  "1": roomData1 as RoomCoords,
  "2": roomData2 as RoomCoords,
  "3": roomData3 as RoomCoords,
  "4": roomData4 as RoomCoords,
};

// Rooms whose key prefix does not match their primary/lowest floor.
const ROOM_CANONICAL_FLOOR: Record<string, string> = {
  "3.59": "4",
  "3.61": "4",
  "3.62": "4",
};

// Rooms that also appear on floors beyond their canonical floor.
const ROOM_EXTRA_FLOORS: Record<string, string[]> = {
  "1.38": ["2"],
  "3.56": ["4"],
};

function getCanonicalFloor(key: string): string {
  return ROOM_CANONICAL_FLOOR[key] ?? key.split(".")[0];
}

function roomHasFloor(key: string, floor: string): boolean {
  return getCanonicalFloor(key) === floor || (ROOM_EXTRA_FLOORS[key] ?? []).includes(floor);
}

// Build the full room key from a (floor, suffix) pair from the picker.
// Handles exceptions like floor "4" + suffix "59" → "3.59".
function getRoomKey(floor: string, suffix: string): string {
  const candidate = `${floor}.${suffix}`;
  if (ROOM_KEYS_SET.has(candidate)) return candidate;
  // Fallback: find a key in ROOM_CANONICAL_FLOOR whose canonical is this floor and suffix matches.
  const override = Object.keys(ROOM_CANONICAL_FLOOR).find(
    (k) => ROOM_CANONICAL_FLOOR[k] === floor && k.slice(k.indexOf(".") + 1) === suffix,
  );
  return override ?? candidate;
}

function getRoomTextureBase64(key: string, floor: string): string {
  // Cross-floor textures are stored with "xf_{floor}_{key}" prefix in MAP_ASSETS.
  return (
    MAP_ASSETS[`xf_${floor}_${key}`] ??
    MAP_ASSETS[key] ??
    MAP_ASSETS[`none_${floor}`] ??
    MAP_ASSETS["none_1"]
  );
}

function parseFloorRooms(): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const key of ROOM_KEYS) {
    const dot = key.indexOf(".");
    if (dot === -1) continue;
    // Use the number prefix for picker placement (e.g. 3.62 → floor 3 picker).
    // getCanonicalFloor is used separately at confirm time for navigation.
    const floor = key.slice(0, dot);
    const suffix = key.slice(dot + 1);
    (result[floor] ??= []).push(suffix);
  }
  for (const f of Object.keys(result)) {
    result[f].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
  }
  return result;
}

const FLOOR_ROOMS = parseFloorRooms();
const FLOORS = Object.keys(FLOOR_ROOMS).sort();

// Human-readable floor labels
const FLOOR_LABEL: Record<string, { short: string; full: string }> = {
  "1": { short: "Parter", full: "Piętro 1 (parter)" },
  "2": { short: "Piętro 2", full: "Piętro 2" },
  "3": { short: "Piętro 3", full: "Piętro 3" },
  "4": { short: "Piętro 4", full: "Piętro 4" },
};

const ITEM_H = 52;
const VISIBLE = 5;
const PICKER_H = ITEM_H * VISIBLE;

function SlotPicker({
  items,
  initialIndex,
  onIndexChange,
}: {
  items: string[];
  initialIndex: number;
  onIndexChange: (i: number) => void;
}) {
  const flatListRef = useRef<FlatList>(null);

  const clamp = (i: number) => Math.max(0, Math.min(i, items.length - 1));

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      onIndexChange(clamp(Math.round(e.nativeEvent.contentOffset.y / ITEM_H)));
    },
    [items.length, onIndexChange],
  );

  const handleItemPress = useCallback(
    (index: number) => {
      flatListRef.current?.scrollToIndex({ index, animated: true });
      onIndexChange(index);
    },
    [onIndexChange],
  );

  return (
    <View style={{ height: PICKER_H, overflow: "hidden", width: "100%" }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: ITEM_H * 2,
          left: 12,
          right: 12,
          height: ITEM_H,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: "rgba(255,255,255,0.5)",
          backgroundColor: "rgba(255,255,255,0.15)",
          borderRadius: 10,
          zIndex: 0,
        }}
      />
      <FlatList
        ref={flatListRef}
        data={items}
        keyExtractor={(item) => item}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        contentContainerStyle={{ paddingVertical: ITEM_H * 2 }}
        getItemLayout={(_, index) => ({ length: ITEM_H, offset: ITEM_H * index, index })}
        onScrollEndDrag={handleScrollEnd}
        onMomentumScrollEnd={handleScrollEnd}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleItemPress(index)}
            style={{ height: ITEM_H, justifyContent: "center", alignItems: "center", zIndex: 1 }}
          >
            <Text
              style={{
                color: index === initialIndex ? colors.white : "rgba(255,255,255,0.4)",
                fontSize: index === initialIndex ? 22 : 16,
                fontWeight: index === initialIndex ? "700" : "500",
                letterSpacing: index === initialIndex ? 0.4 : 0,
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

// ── Map Controls: floor pill + search pill ────────────────────────────────────
// Two separate pills side by side at the top. The floor pill shows the active
// floor and springs open a dropdown list when tapped. Works for any number of
// floors — the dropdown grows as needed. The search pill replaces the old FAB.

const PILL_H = 44;
const DROP_ITEM_H = 44;
const DROP_BADGE = 26;
const MAP_CTRL_SPRING = { stiffness: 380, damping: 30, mass: 0.9 } as const;

function getFloorDisplayName(floor: string): string {
  return FLOOR_LABEL[floor]?.short ?? `Piętro ${floor}`;
}

function FloorPill({
  floors,
  activeFloor,
  loadedFloors,
  onFloorChange,
  onOpenChange,
  closeRef,
}: {
  floors: string[];
  activeFloor: string;
  loadedFloors: Record<string, boolean>;
  onFloorChange: (f: string) => void;
  onOpenChange: (open: boolean) => void;
  closeRef?: React.MutableRefObject<(() => void) | null>;
}) {
  const { theme } = useUnistyles();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownFloors = useMemo(() => [...floors].reverse(), [floors]);
  const fullH = floors.length * DROP_ITEM_H;

  const dropH = useSharedValue(0);
  const dropOpacity = useSharedValue(0);
  const chevronAngle = useSharedValue(0);
  const pillPressP = useSharedValue(0);

  const close = useCallback(() => {
    setIsOpen(false);
    onOpenChange(false);
    dropH.value = withSpring(0, MAP_CTRL_SPRING);
    dropOpacity.value = withTiming(0, { duration: 130 });
    chevronAngle.value = withSpring(0, MAP_CTRL_SPRING);
  }, [onOpenChange, dropH, dropOpacity, chevronAngle]);

  useEffect(() => {
    if (closeRef) closeRef.current = close;
  });

  const toggle = useCallback(() => {
    const next = !isOpen;
    setIsOpen(next);
    onOpenChange(next);
    dropH.value = withSpring(next ? fullH : 0, MAP_CTRL_SPRING);
    dropOpacity.value = withTiming(next ? 1 : 0, { duration: next ? 180 : 130 });
    chevronAngle.value = withSpring(next ? 1 : 0, MAP_CTRL_SPRING);
  }, [isOpen, fullH, onOpenChange, dropH, dropOpacity, chevronAngle]);

  const select = useCallback(
    (floor: string) => {
      if (!loadedFloors[floor]) return;
      onFloorChange(floor);
      close();
    },
    [loadedFloors, onFloorChange, close],
  );

  const dropStyle = useAnimatedStyle(() => ({
    height: dropH.value,
    opacity: dropOpacity.value,
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(chevronAngle.value, [0, 1], [0, 180])}deg` }],
  }));

  const pillPressStyle = useAnimatedStyle(() => ({
    opacity: 1 - pillPressP.value * 0.12,
    transform: [{ scale: 1 - pillPressP.value * 0.02 }],
  }));

  return (
    <View>
      {/* ── Pill ── */}
      <Pressable
        onPress={toggle}
        onPressIn={() => {
          pillPressP.value = withTiming(1, { duration: 25, easing: Easing.out(Easing.quad) });
        }}
        onPressOut={() => {
          pillPressP.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.quad) });
        }}
        style={pillStyles.pill}
      >
        <Animated.View style={[pillStyles.pillRow, pillPressStyle]}>
          <View style={pillStyles.badge}>
            <Text style={pillStyles.badgeNum}>{activeFloor}</Text>
          </View>
          <Text style={pillStyles.pillText} numberOfLines={1}>
            {getFloorDisplayName(activeFloor)}
          </Text>
          <Animated.View style={chevronStyle}>
            <ChevronDown size={13} color={theme.colors.dark.text} strokeWidth={2.5} />
          </Animated.View>
        </Animated.View>
      </Pressable>

      {/* ── Dropdown ── */}
      <Animated.View style={[pillStyles.dropdown, dropStyle]}>
        {dropdownFloors.map((floor, idx) => {
          const isActive = floor === activeFloor;
          const isLoaded = loadedFloors[floor];
          const isLast = idx === dropdownFloors.length - 1;
          return (
            <Pressable
              key={floor}
              onPress={() => select(floor)}
              style={[
                pillStyles.dropItem,
                isActive && pillStyles.dropItemActive,
                !isLast && pillStyles.dropItemBorder,
              ]}
            >
              <View style={[pillStyles.dropBadge, isActive && pillStyles.dropBadgeActive]}>
                <Text style={[pillStyles.dropBadgeNum, isActive && pillStyles.dropBadgeNumActive]}>
                  {floor}
                </Text>
              </View>
              <Text
                style={[pillStyles.dropText, isActive && pillStyles.dropTextActive]}
                numberOfLines={1}
              >
                {getFloorDisplayName(floor)}
              </Text>
              {!isLoaded && <ActivityIndicator size="small" color="rgba(255,255,255,0.4)" />}
            </Pressable>
          );
        })}
      </Animated.View>
    </View>
  );
}

function ResetPill({ onPress }: { onPress: () => void }) {
  const { theme } = useUnistyles();
  const pressP = useSharedValue(0);

  const pressStyle = useAnimatedStyle(() => ({
    opacity: 1 - pressP.value * 0.2,
    transform: [{ scale: 1 - pressP.value * 0.06 }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        pressP.value = withTiming(1, { duration: 25, easing: Easing.out(Easing.quad) });
      }}
      onPressOut={() => {
        pressP.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.quad) });
      }}
      style={[
        pillStyles.searchPill,
        { backgroundColor: theme.mode === "dark" ? palette.red.dark : palette.red.main },
      ]}
    >
      <Animated.View style={[pillStyles.searchInner, pressStyle]}>
        <XIcon size={18} color={colors.white} strokeWidth={2.2} />
      </Animated.View>
    </Pressable>
  );
}

function SearchPill({ onPress }: { onPress: () => void }) {
  const { theme } = useUnistyles();
  const pressP = useSharedValue(0);

  const pressStyle = useAnimatedStyle(() => ({
    opacity: 1 - pressP.value * 0.2,
    transform: [{ scale: 1 - pressP.value * 0.06 }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        pressP.value = withTiming(1, { duration: 25, easing: Easing.out(Easing.quad) });
      }}
      onPressOut={() => {
        pressP.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.quad) });
      }}
      style={pillStyles.searchPill}
    >
      <Animated.View style={[pillStyles.searchInner, pressStyle]}>
        <SearchIcon size={18} color={theme.colors.dark.text} strokeWidth={2.2} />
      </Animated.View>
    </Pressable>
  );
}

const pillStyles = StyleSheet.create((theme) => ({
  // ── Floor pill: elongated, wide ──
  // Uses the same dark.main / dark.text tokens as Button color="dark"
  pill: {
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.dark.main,
    shadowColor: colors.core.extraDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  pillRow: {
    flexDirection: "row",
    alignItems: "center",
    height: PILL_H,
    width: 160,
    paddingHorizontal: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  badge: {
    width: DROP_BADGE,
    height: DROP_BADGE,
    borderRadius: DROP_BADGE / 2,
    backgroundColor: theme.colors.primary.main,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeNum: {
    fontSize: 12,
    fontFamily: theme.fonts.bold,
    color: colors.white,
    lineHeight: 14,
  },
  pillText: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.fonts.semiBold,
    color: theme.colors.dark.text,
    letterSpacing: 0.1,
  },
  // ── Search pill: compact circle ──
  searchPill: {
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.dark.main,
    shadowColor: colors.core.extraDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  searchInner: {
    width: PILL_H,
    height: PILL_H,
    justifyContent: "center",
    alignItems: "center",
  },
  // ── Dropdown: same dark.main token as the pill so they match in every theme ──
  dropdown: {
    marginTop: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.dark.main,
    borderWidth: 1,
    borderColor: theme.mode === "dark" ? "rgba(33,44,63,0.18)" : colors.core.extraDark,
    overflow: "hidden",
    shadowColor: colors.core.extraDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  dropItem: {
    flexDirection: "row",
    alignItems: "center",
    height: DROP_ITEM_H,
    paddingHorizontal: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  dropItemActive: {
    backgroundColor: theme.mode === "dark" ? "rgba(33,44,63,0.14)" : colors.core.extraDark,
  },
  dropItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.mode === "dark" ? "rgba(33,44,63,0.12)" : colors.core.extraDark,
  },
  dropBadge: {
    width: DROP_BADGE,
    height: DROP_BADGE,
    borderRadius: DROP_BADGE / 2,
    backgroundColor: theme.mode === "dark" ? "rgba(33,44,63,0.18)" : colors.core.extraDark,
    justifyContent: "center",
    alignItems: "center",
  },
  dropBadgeActive: {
    backgroundColor: theme.colors.primary.main,
  },
  dropBadgeNum: {
    fontSize: 12,
    fontFamily: theme.fonts.bold,
    color: theme.mode === "dark" ? "rgba(33,44,63,0.55)" : colors.core.extraLight,
    lineHeight: 14,
  },
  dropBadgeNumActive: {
    color: colors.white,
  },
  dropText: {
    flex: 1,
    fontSize: 14,
    fontFamily: theme.fonts.semiBold,
    color: theme.mode === "dark" ? "rgba(33,44,63,0.55)" : colors.core.extraLight,
    letterSpacing: 0.1,
  },
  dropTextActive: {
    color: theme.colors.dark.text,
  },
}));

// ── Category Tile ────────────────────────────────────────────────────────────

function CategoryTile({
  icon,
  label,
  color,
  wide = false,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  color: PaletteColor;
  wide?: boolean;
  onPress: () => void;
}) {
  const c = palette[color];
  return (
    <Card
      color={color}
      circle="fixed"
      gradient={[c.extraDark, c.extraDark]}
      onPress={onPress}
      style={wide ? tileStyles.pressableWide : tileStyles.pressable}
      contentStyle={tileStyles.card}
    >
      <IconPrimitive icon={icon} bg={c.dark} fg={c.extraLight} />
      <Text style={[tileStyles.label, { color: c.extraLight }]}>{label}</Text>
    </Card>
  );
}

const tileStyles = StyleSheet.create((theme) => ({
  pressable: {
    flex: 1,
  },
  pressableWide: {
    width: "100%",
  },
  card: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
}));

// ── Main Screen ─────────────────────────────────────────────────────────────

const SPRING = { stiffness: 1000, damping: 500, mass: 3, overshootClamping: true } as const;
const CLOSE_TIMING = { duration: 300, easing: Easing.in(Easing.ease) } as const;
const CLOSE_THRESHOLD = 100;
const CLOSE_VELOCITY = 0.5;
const FAB_SIZE = 52; // kept for the unused styles.fab entry — safe to remove with styles cleanup

export default function D17MapScreen() {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();
  const { room } = useLocalSearchParams<{ room?: string }>();
  const routeRoom = typeof room === "string" && ROOM_KEYS_SET.has(room) ? room : undefined;

  const [textureBase64, setTextureBase64] = useState(() => MAP_ASSETS["none_1"]);
  const [floorPayload, setFloorPayload] = useState<FloorPayload | null>(null);
  const [searchTarget, setSearchTarget] = useState<{ x: number; z: number } | undefined>();

  const [activeFloor, setActiveFloor] = useState("1");
  const [appliedFloor, setAppliedFloor] = useState<number | null>(null);
  const [appliedRoom, setAppliedRoom] = useState<number | null>(null);
  const [searchKey, setSearchKey] = useState<string | undefined>(undefined);

  const [drawerModalVisible, setDrawerModalVisible] = useState(false);
  const [drawerView, setDrawerView] = useState<"menu" | "rooms">("menu");
  const [openSeq, setOpenSeq] = useState(0);
  const [cameraReset, setCameraReset] = useState(0);

  const [pendingFloor, setPendingFloor] = useState(0);
  const [pendingRoom, setPendingRoom] = useState(0);
  const pendingFloorRef = useRef(0);
  const [specialType, setSpecialType] = useState<"bathrooms" | "lifts" | "stairs" | null>(null);
  const [floorDropdownOpen, setFloorDropdownOpen] = useState(false);
  const floorPillCloseRef = useRef<(() => void) | null>(null);

  const translateY = useSharedValue(800);

  const loadedFloors = useMemo(() => Object.fromEntries(FLOORS.map((f) => [f, true])), []);

  const handleFloorSwitch = useCallback(
    (newFloor: string) => {
      if (newFloor === activeFloor) return;

      const currentIdx = FLOORS.indexOf(activeFloor);
      const newIdx = FLOORS.indexOf(newFloor);
      const direction = newIdx > currentIdx ? 1 : -1;

      const noneTexture = MAP_ASSETS[`none_${newFloor}`] ?? MAP_ASSETS["none_1"];

      let texToSet = noneTexture;
      let newSearchTarget: { x: number; z: number } | undefined;

      if (searchKey) {
        // Room is selected — show its texture on the new floor if it exists there,
        // otherwise fall back to none. Either way the selection is never cleared.
        if (roomHasFloor(searchKey, newFloor)) {
          texToSet = getRoomTextureBase64(searchKey, newFloor);
        }
        const coords = (ROOM_COORDS_BY_FLOOR[newFloor] as RoomCoords)?.[searchKey];
        if (coords) newSearchTarget = { x: coords.x, z: coords.y };
      } else if (specialType) {
        texToSet = MAP_ASSETS[`sp_${newFloor}_${specialType}`] ?? noneTexture;
      }

      setActiveFloor(newFloor);
      // Never clear the room selection on a floor switch.
      if (!searchKey) {
        setAppliedFloor(newIdx);
        setAppliedRoom(null);
        setPendingFloor(newIdx);
        pendingFloorRef.current = newIdx;
        setPendingRoom(0);
      }
      setSearchTarget(newSearchTarget);
      setTextureBase64(texToSet);
      setFloorPayload({
        glb: GLB_BASE64S[newFloor],
        direction,
        roomCoords: ROOM_COORDS_BY_FLOOR[newFloor] ?? {},
        noneTexture: texToSet,
        selectedKey: searchKey ?? null,
      });
    },
    [activeFloor, searchKey, specialType],
  );

  const finishClose = useCallback(() => {
    setDrawerModalVisible(false);
  }, []);

  const closeDrawer = useCallback(() => {
    translateY.value = withTiming(800, CLOSE_TIMING, (finished) => {
      if (finished) runOnJS(finishClose)();
    });
  }, [finishClose, translateY]);

  const openDrawer = useCallback(() => {
    floorPillCloseRef.current?.();
    const initF = appliedFloor ?? FLOORS.indexOf(activeFloor);
    const initR = appliedRoom ?? 0;
    setPendingFloor(initF);
    setPendingRoom(initR);
    pendingFloorRef.current = initF;
    setDrawerView("menu");
    setOpenSeq((s) => s + 1);
    setDrawerModalVisible(true);
    translateY.value = withSpring(0, SPRING);
  }, [appliedFloor, appliedRoom, activeFloor, translateY]);

  const panGesture = Gesture.Pan()
    .activeOffsetY([-5, 5])
    .onChange((e) => {
      if (e.translationY > 0) translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (
        e.translationY > CLOSE_THRESHOLD ||
        e.velocityY > CLOSE_VELOCITY * 1000 ||
        e.translationY < -CLOSE_THRESHOLD ||
        e.velocityY < -CLOSE_VELOCITY * 1000
      ) {
        runOnJS(closeDrawer)();
      } else {
        translateY.value = withSpring(0, SPRING);
      }
    });

  // Shared logic for any non-scrollable content area — tracks finger downward, springs back or closes.
  const makeSheetPan = () =>
    Gesture.Pan()
      .activeOffsetY(5)
      .failOffsetY(-5)
      .onChange((e) => {
        if (e.translationY > 0) translateY.value = e.translationY;
      })
      .onEnd((e) => {
        if (e.translationY > CLOSE_THRESHOLD || e.velocityY > CLOSE_VELOCITY * 1000) {
          runOnJS(closeDrawer)();
        } else {
          translateY.value = withSpring(0, SPRING);
        }
      });

  const menuContentPan = makeSheetPan();

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, 800], [1, 0], Extrapolation.CLAMP),
  }));

  useEffect(() => {
    if (!routeRoom) {
      setAppliedFloor(null);
      setAppliedRoom(null);
      setSearchTarget(undefined);
      setSearchKey(undefined);
      setSpecialType(null);
      setTextureBase64(MAP_ASSETS["none_1"]);
      return;
    }

    const canonicalFloor = getCanonicalFloor(routeRoom);
    const floorIndex = FLOORS.indexOf(canonicalFloor);
    const suffix = routeRoom.slice(routeRoom.indexOf(".") + 1);
    const roomIndex = (FLOOR_ROOMS[canonicalFloor] ?? []).indexOf(suffix);
    const tex = getRoomTextureBase64(routeRoom, canonicalFloor);

    if (floorIndex !== -1 && roomIndex !== -1) {
      setAppliedFloor(floorIndex);
      setAppliedRoom(roomIndex);
      setPendingFloor(floorIndex);
      pendingFloorRef.current = floorIndex;
      setPendingRoom(roomIndex);
    }

    setSearchKey(routeRoom);
    setSpecialType(null);
    const coords = (ROOM_COORDS_BY_FLOOR[canonicalFloor] as RoomCoords)?.[routeRoom];
    if (coords) setSearchTarget({ x: coords.x, z: coords.y });
    setTextureBase64(tex);

    if (canonicalFloor !== activeFloor) {
      const currentIdx = FLOORS.indexOf(activeFloor);
      const targetIdx = FLOORS.indexOf(canonicalFloor);
      const direction = targetIdx > currentIdx ? 1 : -1;
      setActiveFloor(canonicalFloor);
      setFloorPayload({
        glb: GLB_BASE64S[canonicalFloor],
        direction,
        roomCoords: ROOM_COORDS_BY_FLOOR[canonicalFloor] ?? {},
        noneTexture: tex,
        selectedKey: routeRoom,
      });
    }
  }, [routeRoom]);

  const handleConfirm = useCallback(() => {
    const pickerFloor = FLOORS[pendingFloor];
    const suffix = (FLOOR_ROOMS[pickerFloor] ?? [])[pendingRoom];

    if (pickerFloor && suffix) {
      const key = getRoomKey(pickerFloor, suffix);
      const canonicalFloor = getCanonicalFloor(key);
      const tex = getRoomTextureBase64(key, canonicalFloor);

      // Always navigate to the lowest floor that has this room.
      if (canonicalFloor !== activeFloor) {
        const currentIdx = FLOORS.indexOf(activeFloor);
        const targetIdx = FLOORS.indexOf(canonicalFloor);
        const direction = targetIdx > currentIdx ? 1 : -1;
        setActiveFloor(canonicalFloor);
        setFloorPayload({
          glb: GLB_BASE64S[canonicalFloor],
          direction,
          roomCoords: ROOM_COORDS_BY_FLOOR[canonicalFloor] ?? {},
          noneTexture: tex,
          selectedKey: key,
        });
      }

      setTextureBase64(tex);
      const coords = (ROOM_COORDS_BY_FLOOR[canonicalFloor] as RoomCoords)?.[key];
      if (coords) setSearchTarget({ x: coords.x, z: coords.y });
      setSearchKey(key);
      setSpecialType(null);
      setAppliedFloor(pendingFloor);
      setAppliedRoom(pendingRoom);
      setActiveFloor(canonicalFloor);
    }
    closeDrawer();
  }, [pendingFloor, pendingRoom, activeFloor, closeDrawer]);

  const handleReset = useCallback(() => {
    floorPillCloseRef.current?.();
    setAppliedFloor(null);
    setAppliedRoom(null);
    setSearchTarget(undefined);
    setSearchKey(undefined);
    setSpecialType(null);
    setCameraReset((n) => n + 1);
    setTextureBase64(MAP_ASSETS[`none_${activeFloor}`] ?? MAP_ASSETS["none_1"]);
    closeDrawer();
  }, [activeFloor, closeDrawer]);

  const handleSpecial = useCallback(
    (type: "bathrooms" | "lifts" | "stairs") => {
      if (specialType === type) {
        // Tapping the active special toggles it off.
        handleReset();
        return;
      }
      const tex = MAP_ASSETS[`sp_${activeFloor}_${type}`];
      if (tex) setTextureBase64(tex);
      setSearchKey(undefined);
      setSearchTarget(undefined);
      setAppliedFloor(null);
      setAppliedRoom(null);
      setSpecialType(type);
      setCameraReset((n) => n + 1);
      closeDrawer();
    },
    [activeFloor, closeDrawer, specialType, handleReset],
  );

  const handleSelectRoom = useCallback(
    (key: string) => {
      const canonicalFloor = getCanonicalFloor(key);
      const floorIndex = FLOORS.indexOf(canonicalFloor);
      const suffix = key.slice(key.indexOf(".") + 1);
      const roomIndex = (FLOOR_ROOMS[canonicalFloor] ?? []).indexOf(suffix);
      const tex = getRoomTextureBase64(key, canonicalFloor);

      if (canonicalFloor !== activeFloor) {
        const direction = floorIndex > FLOORS.indexOf(activeFloor) ? 1 : -1;
        setActiveFloor(canonicalFloor);
        setFloorPayload({
          glb: GLB_BASE64S[canonicalFloor],
          direction,
          roomCoords: ROOM_COORDS_BY_FLOOR[canonicalFloor] ?? {},
          noneTexture: tex,
          selectedKey: key,
        });
      }

      setTextureBase64(tex);
      const coords = (ROOM_COORDS_BY_FLOOR[canonicalFloor] as RoomCoords)?.[key];
      if (coords) setSearchTarget({ x: coords.x, z: coords.y });
      setSearchKey(key);
      setSpecialType(null);
      if (floorIndex !== -1 && roomIndex !== -1) {
        setAppliedFloor(floorIndex);
        setAppliedRoom(roomIndex);
      }
      setActiveFloor(canonicalFloor);
      closeDrawer();
    },
    [activeFloor, closeDrawer],
  );

  const handlePendingFloorChange = useCallback((idx: number) => {
    pendingFloorRef.current = idx;
    setPendingFloor(idx);
    setPendingRoom(0);
  }, []);

  const handlePendingRoomChange = useCallback((idx: number) => {
    setPendingRoom(idx);
  }, []);

  const handleMapRoomClick = useCallback(
    (key: string) => {
      // Stay on the current floor — select the room here.
      // appliedFloor/Room track the canonical floor for the picker.
      const canonicalFloor = getCanonicalFloor(key);
      const floorIndex = FLOORS.indexOf(canonicalFloor);
      const suffix = key.slice(key.indexOf(".") + 1);
      const roomIndex = (FLOOR_ROOMS[canonicalFloor] ?? []).indexOf(suffix);

      if (floorIndex !== -1 && roomIndex !== -1) {
        setAppliedFloor(floorIndex);
        setAppliedRoom(roomIndex);
        setPendingFloor(floorIndex);
        pendingFloorRef.current = floorIndex;
        setPendingRoom(roomIndex);
      }

      setSearchKey(key);
      setSpecialType(null);
      const coords = (ROOM_COORDS_BY_FLOOR[activeFloor] as RoomCoords)?.[key];
      if (coords) setSearchTarget({ x: coords.x, z: coords.y });
      setTextureBase64(getRoomTextureBase64(key, activeFloor));
    },
    [activeFloor],
  );

  const currentPendingRooms = FLOOR_ROOMS[FLOORS[pendingFloor]] ?? [];
  const activeRoomCoords = ROOM_COORDS_BY_FLOOR[activeFloor] ?? {};

  return (
    <View testID="d17map-screen" style={styles.root}>
      <View style={StyleSheet.absoluteFill}>
        <D17MapView
          glbBase64={GLB_BASE64S["1"]}
          textureBase64={textureBase64}
          floorPayload={floorPayload}
          cameraReset={cameraReset}
          searchTargetX={searchTarget?.x}
          searchTargetZ={searchTarget?.z}
          onRoomPress={handleMapRoomClick}
          roomCoords={
            Object.fromEntries(
              Object.entries(activeRoomCoords).filter(([k]) => ROOM_KEYS_SET.has(k)),
            ) as RoomCoords
          }
          searchKey={searchKey}
        />
      </View>

      <>
        {floorDropdownOpen && (
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => floorPillCloseRef.current?.()}
          />
        )}
        <LinearGradient
          colors={[theme.colors.surface, theme.colors.surface + "00"]}
          style={[styles.topGradient, { height: insets.top + 80 }]}
          pointerEvents="none"
        />
        <View
          style={{ position: "absolute", top: 12, left: 0, right: 0, alignItems: "center" }}
          pointerEvents="box-none"
        >
          <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start" }}>
            <FloorPill
              floors={FLOORS}
              activeFloor={activeFloor}
              loadedFloors={loadedFloors}
              onFloorChange={handleFloorSwitch}
              onOpenChange={setFloorDropdownOpen}
              closeRef={floorPillCloseRef}
            />
            <SearchPill onPress={openDrawer} />
            {((appliedFloor !== null && appliedRoom !== null) || specialType !== null) && (
              <ResetPill onPress={handleReset} />
            )}
          </View>
        </View>
      </>

      <Modal
        transparent
        visible={drawerModalVisible}
        animationType="none"
        onRequestClose={closeDrawer}
      >
        <ScopedTheme name="dark">
          <GestureHandlerRootView style={styles.modalRoot}>
            <Animated.View style={[styles.backdrop, backdropStyle]}>
              <Pressable style={styles.backdropPressable} onPress={closeDrawer} />
            </Animated.View>

            <Animated.View
              style={[
                styles.sheet,
                sheetStyle,
                { paddingBottom: theme.spacing.lg + insets.bottom },
              ]}
            >
              <GestureDetector gesture={panGesture}>
                <View style={styles.handleArea}>
                  <View style={styles.handle} />
                </View>
              </GestureDetector>

              {drawerView === "menu" ? (
                <GestureDetector gesture={menuContentPan}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.sectionTitleWrapper}>
                      <TextCore variant="h1" weight="bold" color={colors.white}>
                        Wyszukaj
                      </TextCore>
                    </View>

                    <View style={styles.tilesGrid}>
                      <View style={styles.tilesRow}>
                        <CategoryTile
                          icon={DoorOpen}
                          label="Sale"
                          color="teal"
                          onPress={() => setDrawerView("rooms")}
                        />
                        <CategoryTile
                          icon={GraduationCap}
                          label="Dziekanat"
                          color="pink"
                          onPress={() => handleSelectRoom("1.4")}
                        />
                      </View>
                      <View style={styles.tilesRow}>
                        <CategoryTile
                          icon={Toilet}
                          label="Łazienki"
                          color="purple"
                          onPress={() => handleSpecial("bathrooms")}
                        />
                        <CategoryTile
                          icon={MoveVertical}
                          label="Windy"
                          color="red"
                          onPress={() => handleSpecial("lifts")}
                        />
                      </View>
                      <View style={styles.tilesRow}>
                        <CategoryTile
                          icon={Footprints}
                          label="Schody"
                          color="green"
                          onPress={() => handleSpecial("stairs")}
                        />
                        <CategoryTile
                          icon={Coffee}
                          label="Pomarańczowe bistro"
                          color="amber"
                          onPress={() => handleSelectRoom("1.33")}
                        />
                      </View>
                    </View>
                  </View>
                </GestureDetector>
              ) : (
                <View style={{ flex: 1 }}>
                  {/* Room selection: body swipes are ignored — only the handle grabs the drawer. */}
                  <View style={styles.sheetHeader}>
                    <TouchableOpacity
                      onPress={() => setDrawerView("menu")}
                      hitSlop={8}
                      style={styles.backBtn}
                    >
                      <ChevronLeft color="rgba(255,255,255,0.7)" size={26} strokeWidth={2.2} />
                      <Text style={styles.backText}>Wyszukaj</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.pickersRow}>
                    <View style={styles.pickerCol}>
                      <Text style={styles.pickerLabel}>Piętro</Text>
                      <SlotPicker
                        key={`floor-${openSeq}`}
                        items={FLOORS}
                        initialIndex={pendingFloor}
                        onIndexChange={handlePendingFloorChange}
                      />
                    </View>

                    <View style={styles.pickerDivider} />

                    <View style={styles.pickerCol}>
                      <Text style={styles.pickerLabel}>Sala</Text>
                      <SlotPicker
                        key={`room-${openSeq}-${pendingFloor}`}
                        items={currentPendingRooms}
                        initialIndex={pendingRoom}
                        onIndexChange={handlePendingRoomChange}
                      />
                    </View>
                  </View>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.btnDiscard}
                      onPress={closeDrawer}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.btnDiscardText}>Odrzuć</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnSelect}
                      onPress={handleConfirm}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.btnSelectText}>Wybierz</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Animated.View>
          </GestureHandlerRootView>
        </ScopedTheme>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  topGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  loadingText: {
    fontSize: 15,
    fontWeight: "600",
  },
  retryBtn: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary.main,
  },
  retryText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    right: 20,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  backdropPressable: {
    flex: 1,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.core.dark,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: theme.spacing.md,
    shadowColor: colors.core.extraDark,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 1,
    shadowRadius: 80,
    elevation: 20,
  },
  handleArea: {
    width: "100%",
    alignItems: "center",
    paddingVertical: theme.spacing.sm,
  },
  handle: {
    width: 64,
    height: 6,
    borderRadius: theme.borderRadius.full,
    backgroundColor: colors.white,
    opacity: 0.5,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.white,
    letterSpacing: 0.2,
  },
  sectionTitleWrapper: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  backText: {
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
  },
  resetText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
    textDecorationLine: "underline",
  },
  tilesGrid: {
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  tilesRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  pickersRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.sm,
  },
  pickerCol: {
    flex: 1,
    alignItems: "center",
  },
  pickerLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "rgba(255,255,255,0.55)",
    marginBottom: 6,
  },
  pickerDivider: {
    width: 1,
    height: PICKER_H,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  actions: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  btnDiscard: {
    flex: 1,
    height: 48,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  btnDiscardText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 15,
    fontWeight: "600",
  },
  btnSelect: {
    flex: 1,
    height: 48,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  btnSelectText: {
    color: theme.colors.primary.main,
    fontSize: 15,
    fontWeight: "700",
  },
}));
