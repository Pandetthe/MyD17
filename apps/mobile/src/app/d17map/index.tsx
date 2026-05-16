import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system/legacy";
import { MapIcon } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { StyleSheet, useUnistyles } from "react-native-unistyles";

import { colors } from "@/styles/colors";
import D17MapView from "../../components/D17MapView";
import roomData from "../../../assets/map/floor1/roomCoordinates.json";

// ── Texture registry — require() must be static literals ──────────────────────
const TEXTURE_MODULES: Record<string, number> = {
  none:   require("../../../assets/map/floor1/none.webp"),
  "1.4":  require("../../../assets/map/floor1/1_4.webp"),
  "1.5":  require("../../../assets/map/floor1/1_5.webp"),
  "1.6":  require("../../../assets/map/floor1/1_6.webp"),
  "1.7":  require("../../../assets/map/floor1/1_7.webp"),
  "1.8":  require("../../../assets/map/floor1/1_8.webp"),
  "1.9":  require("../../../assets/map/floor1/1_9.webp"),
  "1.10": require("../../../assets/map/floor1/1_10.webp"),
  "1.11": require("../../../assets/map/floor1/1_11.webp"),
  "1.12": require("../../../assets/map/floor1/1_12.webp"),
  "1.15": require("../../../assets/map/floor1/1_15.webp"),
  "1.16": require("../../../assets/map/floor1/1_16.webp"),
  "1.17": require("../../../assets/map/floor1/1_17.webp"),
  "1.18": require("../../../assets/map/floor1/1_18.webp"),
  "1.19": require("../../../assets/map/floor1/1_19.webp"),
  "1.20": require("../../../assets/map/floor1/1_20.webp"),
  "1.21": require("../../../assets/map/floor1/1_21.webp"),
  "1.22": require("../../../assets/map/floor1/1_22.webp"),
  "1.23": require("../../../assets/map/floor1/1_23.webp"),
  "1.26": require("../../../assets/map/floor1/1_26.webp"),
  "1.27": require("../../../assets/map/floor1/1_27.webp"),
  "1.28": require("../../../assets/map/floor1/1_28.webp"),
  "1.29": require("../../../assets/map/floor1/1_29.webp"),
  "1.30": require("../../../assets/map/floor1/1_30.webp"),
  "1.31": require("../../../assets/map/floor1/1_31.webp"),
  "1.33": require("../../../assets/map/floor1/1_33.webp"),
  "1.34": require("../../../assets/map/floor1/1_34.webp"),
  "1.35": require("../../../assets/map/floor1/1_35.webp"),
  "1.36": require("../../../assets/map/floor1/1_36.webp"),
  "1.38": require("../../../assets/map/floor1/1_38.webp"),
  "1.39": require("../../../assets/map/floor1/1_39.webp"),
};

// ── Floor/room structure from keys ────────────────────────────────────────────
function parseFloorRooms(): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const key of Object.keys(TEXTURE_MODULES)) {
    if (key === "none") continue;
    const dot = key.indexOf(".");
    if (dot === -1) continue;
    const floor = key.slice(0, dot);
    const room = key.slice(dot + 1);
    (result[floor] ??= []).push(room);
  }
  for (const f of Object.keys(result)) result[f].sort((a, b) => Number(a) - Number(b));
  return result;
}

const FLOOR_ROOMS = parseFloorRooms();
const FLOORS = Object.keys(FLOOR_ROOMS).sort();

type RoomCoords = Record<string, { x: number; y: number }>;

// ── Helpers ────────────────────────────────────────────────────────────────────
async function assetToBase64(module: number): Promise<string> {
  const asset = Asset.fromModule(module);
  await asset.downloadAsync();
  if (!asset.localUri) return "";
  return FileSystem.readAsStringAsync(asset.localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
}

// ── Slot picker ────────────────────────────────────────────────────────────────
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
  const clamp = (i: number) => Math.max(0, Math.min(i, items.length - 1));

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      onIndexChange(clamp(Math.round(e.nativeEvent.contentOffset.y / ITEM_H)));
    },
    [items.length, onIndexChange],
  );

  return (
    <View style={{ height: PICKER_H, overflow: "hidden" }}>
      {/* Selection band */}
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
          borderColor: "rgba(255,255,255,0.35)",
          backgroundColor: "rgba(255,255,255,0.07)",
          borderRadius: 10,
        }}
      />
      <FlatList
        data={items}
        keyExtractor={(item) => item}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        initialScrollIndex={initialIndex}
        contentContainerStyle={{ paddingVertical: ITEM_H * 2 }}
        getItemLayout={(_, index) => ({ length: ITEM_H, offset: ITEM_H * index, index })}
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        renderItem={({ item, index }) => (
          <View style={{ height: ITEM_H, justifyContent: "center", alignItems: "center" }}>
            <Text
              style={{
                color: index === initialIndex ? colors.white : "rgba(255,255,255,0.3)",
                fontSize: index === initialIndex ? 22 : 15,
                fontWeight: index === initialIndex ? "700" : "400",
                letterSpacing: index === initialIndex ? 0.4 : 0,
              }}
            >
              {item}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

// ── Drawer animation constants (mirrors InfoBottomDrawer) ─────────────────────
const SPRING = { stiffness: 1000, damping: 500, mass: 3, overshootClamping: true } as const;
const CLOSE_TIMING = { duration: 300, easing: Easing.in(Easing.ease) } as const;
const CLOSE_THRESHOLD = 100;
const CLOSE_VELOCITY = 0.5;

const FAB_SIZE = 52;

// ── Screen ─────────────────────────────────────────────────────────────────────
export default function D17MapScreen() {
  const { theme } = useUnistyles();

  // Loaded assets
  const [glbBase64, setGlbBase64] = useState("");
  const [textureBase64, setTextureBase64] = useState("");
  const [searchTarget, setSearchTarget] = useState<{ x: number; z: number } | undefined>();

  // Applied (what the map actually shows)
  const [appliedFloor, setAppliedFloor] = useState<number | null>(null);
  const [appliedRoom, setAppliedRoom] = useState<number | null>(null);
  const [searchKey, setSearchKey] = useState<string | undefined>(undefined);

  // Drawer state
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerModalVisible, setDrawerModalVisible] = useState(false);
  const [openSeq, setOpenSeq] = useState(0); // bumped each open, keys pickers

  // Pending (what the pickers show, not yet applied)
  const [pendingFloor, setPendingFloor] = useState(0);
  const [pendingRoom, setPendingRoom] = useState(0);
  const pendingFloorRef = useRef(0);

  const loading = !glbBase64 || !textureBase64;

  // Reanimated
  const translateY = useSharedValue(800);

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
    const initF = appliedFloor ?? 0;
    const initR = appliedRoom ?? 0;
    setPendingFloor(initF);
    setPendingRoom(initR);
    pendingFloorRef.current = initF;
    setOpenSeq((s) => s + 1);
    setDrawerModalVisible(true);
    setDrawerVisible(true);
    translateY.value = withSpring(0, SPRING);
  }, [appliedFloor, appliedRoom, translateY]);

  // Pan gesture to swipe-close (mirrors InfoBottomDrawer)
  const panGesture = Gesture.Pan()
    .activeOffsetY(5)
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

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, 800], [1, 0], Extrapolation.CLAMP),
  }));

  // Mount: load GLB + default texture
  useEffect(() => {
    (async () => {
      const [glb, tex] = await Promise.all([
        assetToBase64(require("../../../assets/map/floor1/model.glb")),
        assetToBase64(TEXTURE_MODULES.none),
      ]);
      setGlbBase64(glb);
      setTextureBase64(tex);
    })();
  }, []);

  const handleConfirm = useCallback(async () => {
    const floor = FLOORS[pendingFloor];
    const room = (FLOOR_ROOMS[floor] ?? [])[pendingRoom];
    if (floor && room) {
      const key = `${floor}.${room}`;
      const tex = await assetToBase64(TEXTURE_MODULES[key] ?? TEXTURE_MODULES.none);
      setTextureBase64(tex);
      const coords = (roomData as RoomCoords)[key];
      if (coords) setSearchTarget({ x: coords.x, z: coords.y });
      setSearchKey(key);
      setAppliedFloor(pendingFloor);
      setAppliedRoom(pendingRoom);
    }
    closeDrawer();
  }, [pendingFloor, pendingRoom, closeDrawer]);

  const handleReset = useCallback(async () => {
    setAppliedFloor(null);
    setAppliedRoom(null);
    setSearchTarget(undefined);
    setSearchKey(undefined);
    const tex = await assetToBase64(TEXTURE_MODULES.none);
    setTextureBase64(tex);
    closeDrawer();
  }, [closeDrawer]);

  const handlePendingFloorChange = useCallback((idx: number) => {
    pendingFloorRef.current = idx;
    setPendingFloor(idx);
    setPendingRoom(0);
  }, []);

  const handlePendingRoomChange = useCallback((idx: number) => {
    setPendingRoom(idx);
  }, []);

  const currentPendingRooms = FLOOR_ROOMS[FLOORS[pendingFloor]] ?? [];

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill}>
        <D17MapView
          glbBase64={glbBase64}
          textureBase64={textureBase64}
          searchTargetX={searchTarget?.x}
          searchTargetZ={searchTarget?.z}
          bgColor={theme.colors.surface}
          roomCoords={Object.fromEntries(Object.entries(roomData as RoomCoords).filter(([k]) => k in TEXTURE_MODULES)) as RoomCoords}
          searchKey={searchKey}
        />
      </View>

      {loading && (
        <View style={[styles.loadingOverlay, { backgroundColor: theme.colors.surface + "CC" }]}>
          <ActivityIndicator color={colors.core.light} size="large" />
          <Text style={[styles.loadingText, { color: colors.core.light }]}>
            Ładowanie planu…
          </Text>
        </View>
      )}

      {/* FAB */}
      {!drawerVisible && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.colors.primary.main }]}
          onPress={openDrawer}
          activeOpacity={0.85}
        >
          <MapIcon color={colors.white} size={22} strokeWidth={2} />
        </TouchableOpacity>
      )}

      {/* Bottom drawer */}
      <Modal
        transparent
        visible={drawerModalVisible}
        animationType="none"
        onRequestClose={closeDrawer}
      >
        <GestureHandlerRootView style={styles.modalRoot}>
          {/* Backdrop */}
          <Animated.View style={[styles.backdrop, backdropStyle]}>
            <Pressable style={styles.backdropPressable} onPress={closeDrawer} />
          </Animated.View>

          {/* Sheet */}
          <Animated.View style={[styles.sheet, sheetStyle]}>
            {/* Drag handle */}
            <GestureDetector gesture={panGesture}>
              <View style={styles.handleArea}>
                <View style={styles.handle} />
              </View>
            </GestureDetector>

            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Wybierz salę</Text>
              {appliedFloor !== null && appliedRoom !== null && (
                <TouchableOpacity onPress={handleReset} hitSlop={8}>
                  <Text style={styles.resetText}>Resetuj</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Pickers */}
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

            {/* Action buttons */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.btnOdrzuc}
                onPress={closeDrawer}
                activeOpacity={0.7}
              >
                <Text style={styles.btnOdrzucText}>Odrzuć</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btnWybierz}
                onPress={handleConfirm}
                activeOpacity={0.85}
              >
                <Text style={styles.btnWybierzText}>Wybierz</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create((theme) => ({
  root: {
    flex: 1,
    backgroundColor: theme.colors.surface,
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
    bottom: 28,
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
  // Modal
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
    backgroundColor: theme.colors.dark.text.secondary,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    shadowColor: theme.colors.dark.main,
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
  header: {
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
  resetText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.5)",
    textDecorationLine: "underline",
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
  btnOdrzuc: {
    flex: 1,
    height: 48,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  btnOdrzucText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 15,
    fontWeight: "600",
  },
  btnWybierz: {
    flex: 1,
    height: 48,
    borderRadius: theme.borderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  btnWybierzText: {
    color: theme.colors.primary.main,
    fontSize: 15,
    fontWeight: "700",
  },
}));
