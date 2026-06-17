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
import { colors, palette } from "@/styles/colors";
import type { PaletteColor } from "@/styles/themes/theme";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
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
  RotateCcw,
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

/* eslint-disable @typescript-eslint/no-require-imports */
const TEXTURE_MODULES: Record<string, number> = {
  // ── Floor 1 ──────────────────────────────────
  none1: require("@/assets/map/floor1/none.webp"),
  "1.4": require("@/assets/map/floor1/1_4.webp"),
  "1.5": require("@/assets/map/floor1/1_5.webp"),
  "1.6": require("@/assets/map/floor1/1_6.webp"),
  "1.10": require("@/assets/map/floor1/1_10.webp"),
  "1.11": require("@/assets/map/floor1/1_11.webp"),
  "1.12": require("@/assets/map/floor1/1_12.webp"),
  "1.16": require("@/assets/map/floor1/1_16.webp"),
  "1.17": require("@/assets/map/floor1/1_17.webp"),
  "1.18": require("@/assets/map/floor1/1_18.webp"),
  "1.19": require("@/assets/map/floor1/1_19.webp"),
  "1.20": require("@/assets/map/floor1/1_20.webp"),
  "1.21": require("@/assets/map/floor1/1_21.webp"),
  "1.22": require("@/assets/map/floor1/1_22.webp"),
  "1.23": require("@/assets/map/floor1/1_23.webp"),
  "1.26": require("@/assets/map/floor1/1_26.webp"),
  "1.27": require("@/assets/map/floor1/1_27.webp"),
  "1.28": require("@/assets/map/floor1/1_28.webp"),
  "1.33": require("@/assets/map/floor1/1_33.webp"),
  "1.35": require("@/assets/map/floor1/1_35.webp"),
  "1.36": require("@/assets/map/floor1/1_36.webp"),
  "1.38": require("@/assets/map/floor1/1_38.webp"),
  "1.39": require("@/assets/map/floor1/1_39.webp"),
  // ── Floor 2 ──────────────────────────────────
  none2: require("@/assets/map/floor2/none.webp"),
  "2.2": require("@/assets/map/floor2/2_2.webp"),
  "2.6": require("@/assets/map/floor2/2_6.webp"),
  "2.7": require("@/assets/map/floor2/2_7.webp"),
  "2.9": require("@/assets/map/floor2/2_9.webp"),
  "2.10": require("@/assets/map/floor2/2_10.webp"),
  "2.11": require("@/assets/map/floor2/2_11.webp"),
  "2.12": require("@/assets/map/floor2/2_12.webp"),
  "2.13": require("@/assets/map/floor2/2_13.webp"),
  "2.14": require("@/assets/map/floor2/2_14.webp"),
  "2.17": require("@/assets/map/floor2/2_17.webp"),
  "2.18": require("@/assets/map/floor2/2_18.webp"),
  "2.19": require("@/assets/map/floor2/2_19.webp"),
  "2.20": require("@/assets/map/floor2/2_20.webp"),
  "2.21": require("@/assets/map/floor2/2_21.webp"),
  "2.22": require("@/assets/map/floor2/2_22.webp"),
  "2.24": require("@/assets/map/floor2/2_24.webp"),
  "2.25": require("@/assets/map/floor2/2_25.webp"),
  "2.26": require("@/assets/map/floor2/2_26.webp"),
  "2.27": require("@/assets/map/floor2/2_27.webp"),
  "2.28": require("@/assets/map/floor2/2_28.webp"),
  "2.29": require("@/assets/map/floor2/2_29.webp"),
  "2.30": require("@/assets/map/floor2/2_30.webp"),
  "2.31": require("@/assets/map/floor2/2_31.webp"),
  "2.32": require("@/assets/map/floor2/2_32.webp"),
  "2.33": require("@/assets/map/floor2/2_33.webp"),
  "2.34": require("@/assets/map/floor2/2_34.webp"),
  "2.35": require("@/assets/map/floor2/2_35.webp"),
  "2.36": require("@/assets/map/floor2/2_36.webp"),
  "2.40": require("@/assets/map/floor2/2_40.webp"),
  "2.41": require("@/assets/map/floor2/2_41.webp"),
  "2.42": require("@/assets/map/floor2/2_42.webp"),
  "2.47": require("@/assets/map/floor2/2_47.webp"),
  "2.48": require("@/assets/map/floor2/2_48.webp"),
  // ── Floor 3 ──────────────────────────────────
  none3: require("@/assets/map/floor3/none.webp"),
  "3.2": require("@/assets/map/floor3/3_2.webp"),
  "3.7": require("@/assets/map/floor3/3_7.webp"),
  "3.8": require("@/assets/map/floor3/3_8.webp"),
  "3.9": require("@/assets/map/floor3/3_9.webp"),
  "3.10": require("@/assets/map/floor3/3_10.webp"),
  "3.11": require("@/assets/map/floor3/3_11.webp"),
  "3.12": require("@/assets/map/floor3/3_12.webp"),
  "3.13": require("@/assets/map/floor3/3_13.webp"),
  "3.19": require("@/assets/map/floor3/3_19.webp"),
  "3.22": require("@/assets/map/floor3/3_22.webp"),
  "3.23": require("@/assets/map/floor3/3_23.webp"),
  "3.24": require("@/assets/map/floor3/3_24.webp"),
  "3.26": require("@/assets/map/floor3/3_26.webp"),
  "3.27a": require("@/assets/map/floor3/3_27a.webp"),
  "3.27b": require("@/assets/map/floor3/3_27b.webp"),
  "3.27c": require("@/assets/map/floor3/3_27c.webp"),
  "3.27d": require("@/assets/map/floor3/3_27d.webp"),
  "3.27e": require("@/assets/map/floor3/3_27e.webp"),
  "3.30": require("@/assets/map/floor3/3_30.webp"),
  "3.31": require("@/assets/map/floor3/3_31.webp"),
  "3.32": require("@/assets/map/floor3/3_32.webp"),
  "3.33": require("@/assets/map/floor3/3_33.webp"),
  "3.34": require("@/assets/map/floor3/3_34.webp"),
  "3.35": require("@/assets/map/floor3/3_35.webp"),
  "3.36": require("@/assets/map/floor3/3_36.webp"),
  "3.37": require("@/assets/map/floor3/3_37.webp"),
  "3.38": require("@/assets/map/floor3/3_38.webp"),
  "3.39": require("@/assets/map/floor3/3_39.webp"),
  "3.40": require("@/assets/map/floor3/3_40.webp"),
  "3.41": require("@/assets/map/floor3/3_41.webp"),
  "3.42": require("@/assets/map/floor3/3_42.webp"),
  "3.43": require("@/assets/map/floor3/3_43.webp"),
  "3.44": require("@/assets/map/floor3/3_44.webp"),
  "3.45": require("@/assets/map/floor3/3_45.webp"),
  "3.46": require("@/assets/map/floor3/3_46.webp"),
  "3.47": require("@/assets/map/floor3/3_47.webp"),
  "3.48": require("@/assets/map/floor3/3_48.webp"),
  "3.49": require("@/assets/map/floor3/3_49.webp"),
  "3.51": require("@/assets/map/floor3/3_51.webp"),
  "3.50": require("@/assets/map/floor3/3_50.webp"),
  "3.53": require("@/assets/map/floor3/3_53.webp"),
  "3.54": require("@/assets/map/floor3/3_54.webp"),
  "3.55": require("@/assets/map/floor3/3_55.webp"),
  "3.56": require("@/assets/map/floor3/3_56.webp"),
  "3.57": require("@/assets/map/floor3/3_57.webp"),
  "3.58": require("@/assets/map/floor3/3_58.webp"),
  // ── Floor 4 ──────────────────────────────────
  none4: require("@/assets/map/floor4/none.webp"),
  "4.2": require("@/assets/map/floor4/4_2.webp"),
  "4.7": require("@/assets/map/floor4/4_7.webp"),
  "4.8": require("@/assets/map/floor4/4_8.webp"),
  "4.9": require("@/assets/map/floor4/4_9.webp"),
  "4.10": require("@/assets/map/floor4/4_10.webp"),
  "4.11": require("@/assets/map/floor4/4_11.webp"),
  "4.12": require("@/assets/map/floor4/4_12.webp"),
  "4.13": require("@/assets/map/floor4/4_13.webp"),
  "4.14": require("@/assets/map/floor4/4_14.webp"),
  "4.19": require("@/assets/map/floor4/4_19.webp"),
  "4.22": require("@/assets/map/floor4/4_22.webp"),
  "4.23": require("@/assets/map/floor4/4_23.webp"),
  "4.25": require("@/assets/map/floor4/4_25.webp"),
  "4.26": require("@/assets/map/floor4/4_26.webp"),
  "4.27": require("@/assets/map/floor4/4_27.webp"),
  "4.28": require("@/assets/map/floor4/4_28.webp"),
  "4.29": require("@/assets/map/floor4/4_29.webp"),
  "4.30": require("@/assets/map/floor4/4_30.webp"),
  "4.31": require("@/assets/map/floor4/4_31.webp"),
  "4.34": require("@/assets/map/floor4/4_34.webp"),
  "4.35": require("@/assets/map/floor4/4_35.webp"),
  "4.36": require("@/assets/map/floor4/4_36.webp"),
  "4.37": require("@/assets/map/floor4/4_37.webp"),
  "4.38": require("@/assets/map/floor4/4_38.webp"),
  "4.39": require("@/assets/map/floor4/4_39.webp"),
  "4.40": require("@/assets/map/floor4/4_40.webp"),
  "4.41": require("@/assets/map/floor4/4_41.webp"),
  "4.42": require("@/assets/map/floor4/4_42.webp"),
  "4.43": require("@/assets/map/floor4/4_43.webp"),
  "4.44": require("@/assets/map/floor4/4_44.webp"),
  "4.45": require("@/assets/map/floor4/4_45.webp"),
  "4.46": require("@/assets/map/floor4/4_46.webp"),
  "4.47": require("@/assets/map/floor4/4_47.webp"),
  "4.48": require("@/assets/map/floor4/4_48.webp"),
  "4.49": require("@/assets/map/floor4/4_49.webp"),
  "4.50": require("@/assets/map/floor4/4_50.webp"),
  "4.51": require("@/assets/map/floor4/4_51.webp"),
  "4.52": require("@/assets/map/floor4/4_52.webp"),
  "4.53": require("@/assets/map/floor4/4_53.webp"),
  "4.54": require("@/assets/map/floor4/4_54.webp"),
  "4.55": require("@/assets/map/floor4/4_55.webp"),
  "4.57": require("@/assets/map/floor4/4_57.webp"),
  "4.58": require("@/assets/map/floor4/4_58.webp"),
  // Rooms whose number prefix is 3 but only exist on floor 4
  "3.59": require("@/assets/map/floor4/3_59.webp"),
  "3.61": require("@/assets/map/floor4/3_61.webp"),
  "3.62": require("@/assets/map/floor4/3_62.webp"),
};

const NONE_MODULES: Record<string, number> = {
  "1": TEXTURE_MODULES.none1,
  "2": TEXTURE_MODULES.none2,
  "3": TEXTURE_MODULES.none3,
  "4": TEXTURE_MODULES.none4,
};

const SPECIAL_MODULES: Record<string, Record<string, number>> = {
  "1": {
    bathrooms: require("@/assets/map/floor1/bathrooms.webp"),
    lifts: require("@/assets/map/floor1/lifts.webp"),
    stairs: require("@/assets/map/floor1/stairs.webp"),
  },
  "2": {
    bathrooms: require("@/assets/map/floor2/bathrooms.webp"),
    lifts: require("@/assets/map/floor2/lifts.webp"),
    stairs: require("@/assets/map/floor2/stairs.webp"),
  },
  "3": {
    bathrooms: require("@/assets/map/floor3/bathrooms.webp"),
    lifts: require("@/assets/map/floor3/lifts.webp"),
    stairs: require("@/assets/map/floor3/stairs.webp"),
  },
  "4": {
    bathrooms: require("@/assets/map/floor4/bathrooms.webp"),
    lifts: require("@/assets/map/floor4/lifts.webp"),
    stairs: require("@/assets/map/floor4/stairs.webp"),
  },
};

const GLB_MODULES: Record<string, number> = {
  "1": require("@/assets/map/floor1/model.glb"),
  "2": require("@/assets/map/floor2/model.glb"),
  "3": require("@/assets/map/floor3/model.glb"),
  "4": require("@/assets/map/floor4/model.glb"),
};

type RoomCoords = Record<string, { x: number; y: number }>;

const ROOM_COORDS_BY_FLOOR: Record<string, RoomCoords> = {
  "1": roomData1 as RoomCoords,
  "2": roomData2 as RoomCoords,
  "3": roomData3 as RoomCoords,
  "4": roomData4 as RoomCoords,
};

// Textures for rooms that appear on a non-canonical floor (e.g. 1.38 on floor 2).
const CROSS_FLOOR_TEXTURES: Record<string, Record<string, number>> = {
  "2": { "1.38": require("@/assets/map/floor2/1_38.webp") },
  "4": { "3.56": require("@/assets/map/floor4/3_56.webp") },
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
  if (candidate in TEXTURE_MODULES) return candidate;
  // Fallback: find a key in ROOM_CANONICAL_FLOOR whose canonical is this floor and suffix matches.
  const override = Object.keys(ROOM_CANONICAL_FLOOR).find(
    (k) => ROOM_CANONICAL_FLOOR[k] === floor && k.slice(k.indexOf(".") + 1) === suffix,
  );
  return override ?? candidate;
}

function getRoomTextureModule(key: string, floor: string): number {
  return (
    CROSS_FLOOR_TEXTURES[floor]?.[key] ??
    TEXTURE_MODULES[key] ??
    NONE_MODULES[floor] ??
    NONE_MODULES["1"]
  );
}

function parseFloorRooms(): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const key of Object.keys(TEXTURE_MODULES)) {
    if (key.startsWith("none")) continue;
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
// Display strings for the SlotPicker floor column
const FLOOR_PICKER_ITEMS = FLOORS.map((f) => FLOOR_LABEL[f]?.full ?? `Piętro ${f}`);

async function assetToBase64(module: number): Promise<string> {
  const asset = Asset.fromModule(module);
  await asset.downloadAsync();
  if (!asset.localUri) return "";
  return FileSystem.readAsStringAsync(asset.localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

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
  const routeRoom = typeof room === "string" && room in TEXTURE_MODULES ? room : undefined;

  // Pre-loaded GLB base64 strings for all floors
  const [glbBase64s, setGlbBase64s] = useState<Record<string, string>>({});
  const [textureBase64, setTextureBase64] = useState("");
  const [floorPayload, setFloorPayload] = useState<FloorPayload | null>(null);
  const [searchTarget, setSearchTarget] = useState<{ x: number; z: number } | undefined>();

  const [activeFloor, setActiveFloor] = useState("1");
  const [appliedFloor, setAppliedFloor] = useState<number | null>(null);
  const [appliedRoom, setAppliedRoom] = useState<number | null>(null);
  const [searchKey, setSearchKey] = useState<string | undefined>(undefined);

  const [drawerVisible, setDrawerVisible] = useState(false);
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

  const loading = !glbBase64s["1"] || !textureBase64;
  const translateY = useSharedValue(800);

  // Pre-load all floor models + initial texture in parallel
  useEffect(() => {
    (async () => {
      const [glb1, glb2, glb3, glb4, tex] = await Promise.all([
        assetToBase64(GLB_MODULES["1"]),
        assetToBase64(GLB_MODULES["2"]),
        assetToBase64(GLB_MODULES["3"]),
        assetToBase64(GLB_MODULES["4"]),
        assetToBase64(NONE_MODULES["1"]),
      ]);
      setGlbBase64s({ "1": glb1, "2": glb2, "3": glb3, "4": glb4 });
      setTextureBase64(tex);
    })();
  }, []);

  const loadedFloors = useMemo(
    () => Object.fromEntries(FLOORS.map((f) => [f, !!glbBase64s[f]])),
    [glbBase64s],
  );

  const handleFloorSwitch = useCallback(
    async (newFloor: string) => {
      if (newFloor === activeFloor || !glbBase64s[newFloor]) return;

      const currentIdx = FLOORS.indexOf(activeFloor);
      const newIdx = FLOORS.indexOf(newFloor);
      const direction = newIdx > currentIdx ? 1 : -1;

      const noneTexture = await assetToBase64(NONE_MODULES[newFloor]);

      let texToSet = noneTexture;
      let newSearchTarget: { x: number; z: number } | undefined;

      if (searchKey) {
        // Room is selected — show its texture on the new floor if it exists there,
        // otherwise fall back to none. Either way the selection is never cleared.
        if (roomHasFloor(searchKey, newFloor)) {
          texToSet = await assetToBase64(getRoomTextureModule(searchKey, newFloor));
        }
        const coords = (ROOM_COORDS_BY_FLOOR[newFloor] as RoomCoords)?.[searchKey];
        if (coords) newSearchTarget = { x: coords.x, z: coords.y };
      } else if (specialType) {
        const mod = SPECIAL_MODULES[newFloor]?.[specialType];
        if (mod) texToSet = await assetToBase64(mod);
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
        glb: glbBase64s[newFloor],
        direction,
        roomCoords: ROOM_COORDS_BY_FLOOR[newFloor] ?? {},
        noneTexture: texToSet,
        selectedKey: searchKey ?? null,
      });
    },
    [activeFloor, glbBase64s, searchKey, specialType],
  );

  const finishClose = useCallback(() => {
    setDrawerModalVisible(false);
    setDrawerVisible(false);
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
    setDrawerVisible(true);
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
      void assetToBase64(NONE_MODULES["1"]).then(setTextureBase64);
      return;
    }

    void (async () => {
      const canonicalFloor = getCanonicalFloor(routeRoom);
      const floorIndex = FLOORS.indexOf(canonicalFloor);
      const suffix = routeRoom.slice(routeRoom.indexOf(".") + 1);
      const roomIndex = (FLOOR_ROOMS[canonicalFloor] ?? []).indexOf(suffix);
      const tex = await assetToBase64(getRoomTextureModule(routeRoom, canonicalFloor));

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

      if (canonicalFloor !== activeFloor && glbBase64s[canonicalFloor]) {
        const currentIdx = FLOORS.indexOf(activeFloor);
        const targetIdx = FLOORS.indexOf(canonicalFloor);
        const direction = targetIdx > currentIdx ? 1 : -1;
        const noneTexture = await assetToBase64(NONE_MODULES[canonicalFloor]);
        setActiveFloor(canonicalFloor);
        setFloorPayload({
          glb: glbBase64s[canonicalFloor],
          direction,
          roomCoords: ROOM_COORDS_BY_FLOOR[canonicalFloor] ?? {},
          noneTexture: tex,
          selectedKey: routeRoom,
        });
        void noneTexture;
      }
    })();
  }, [routeRoom, glbBase64s]);

  const handleConfirm = useCallback(async () => {
    const pickerFloor = FLOORS[pendingFloor];
    const suffix = (FLOOR_ROOMS[pickerFloor] ?? [])[pendingRoom];

    if (pickerFloor && suffix) {
      const key = getRoomKey(pickerFloor, suffix);
      const canonicalFloor = getCanonicalFloor(key);

      const tex = await assetToBase64(getRoomTextureModule(key, canonicalFloor));

      // Always navigate to the lowest floor that has this room.
      if (canonicalFloor !== activeFloor && glbBase64s[canonicalFloor]) {
        const currentIdx = FLOORS.indexOf(activeFloor);
        const targetIdx = FLOORS.indexOf(canonicalFloor);
        const direction = targetIdx > currentIdx ? 1 : -1;
        const noneTexture = await assetToBase64(NONE_MODULES[canonicalFloor]);
        setActiveFloor(canonicalFloor);
        setFloorPayload({
          glb: glbBase64s[canonicalFloor],
          direction,
          roomCoords: ROOM_COORDS_BY_FLOOR[canonicalFloor] ?? {},
          noneTexture: tex,
          selectedKey: key,
        });
        void noneTexture;
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
  }, [pendingFloor, pendingRoom, activeFloor, glbBase64s, closeDrawer]);

  const handleReset = useCallback(async () => {
    floorPillCloseRef.current?.();
    setAppliedFloor(null);
    setAppliedRoom(null);
    setSearchTarget(undefined);
    setSearchKey(undefined);
    setSpecialType(null);
    setCameraReset((n) => n + 1);
    const tex = await assetToBase64(NONE_MODULES[activeFloor]);
    setTextureBase64(tex);
    closeDrawer();
  }, [activeFloor, closeDrawer]);

  const handleSpecial = useCallback(
    async (type: "bathrooms" | "lifts" | "stairs") => {
      if (specialType === type) {
        // Tapping the active special toggles it off.
        handleReset();
        return;
      }
      const mod = SPECIAL_MODULES[activeFloor]?.[type];
      if (mod) {
        const tex = await assetToBase64(mod);
        setTextureBase64(tex);
      }
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
    async (key: string) => {
      const canonicalFloor = getCanonicalFloor(key);
      const floorIndex = FLOORS.indexOf(canonicalFloor);
      const suffix = key.slice(key.indexOf(".") + 1);
      const roomIndex = (FLOOR_ROOMS[canonicalFloor] ?? []).indexOf(suffix);

      const tex = await assetToBase64(getRoomTextureModule(key, canonicalFloor));

      if (canonicalFloor !== activeFloor && glbBase64s[canonicalFloor]) {
        const direction = floorIndex > FLOORS.indexOf(activeFloor) ? 1 : -1;
        const noneTexture = await assetToBase64(NONE_MODULES[canonicalFloor]);
        setActiveFloor(canonicalFloor);
        setFloorPayload({
          glb: glbBase64s[canonicalFloor],
          direction,
          roomCoords: ROOM_COORDS_BY_FLOOR[canonicalFloor] ?? {},
          noneTexture: tex,
          selectedKey: key,
        });
        void noneTexture;
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
    [activeFloor, glbBase64s, closeDrawer],
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
    async (key: string) => {
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

      const tex = await assetToBase64(getRoomTextureModule(key, activeFloor));
      setTextureBase64(tex);
    },
    [activeFloor],
  );

  const currentPendingRooms = FLOOR_ROOMS[FLOORS[pendingFloor]] ?? [];
  const activeRoomCoords = ROOM_COORDS_BY_FLOOR[activeFloor] ?? {};

  const fabBottom = 28 + insets.bottom;

  return (
    <View testID="d17map-screen" style={styles.root}>
      <View style={StyleSheet.absoluteFill}>
        {glbBase64s["1"] && textureBase64 ? (
          <D17MapView
            glbBase64={glbBase64s["1"]}
            textureBase64={textureBase64}
            floorPayload={floorPayload}
            cameraReset={cameraReset}
            searchTargetX={searchTarget?.x}
            searchTargetZ={searchTarget?.z}
            onRoomPress={handleMapRoomClick}
            roomCoords={
              Object.fromEntries(
                Object.entries(activeRoomCoords).filter(([k]) => k in TEXTURE_MODULES),
              ) as RoomCoords
            }
            searchKey={searchKey}
          />
        ) : null}
      </View>

      {loading && (
        <View style={[styles.loadingOverlay, { backgroundColor: theme.colors.surface + "CC" }]}>
          <ActivityIndicator color={colors.core.light} size="large" />
          <Text style={[styles.loadingText, { color: colors.core.light }]}>Ładowanie planu…</Text>
        </View>
      )}

      {!loading && (
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
      )}

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
