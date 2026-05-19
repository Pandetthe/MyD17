import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import roomData from "@/assets/map/floor1/roomCoordinates.json";
import D17MapView from "@/components/D17MapView";
import { colors } from "@/styles/colors";
import { MAP_GLB_BASE64, MAP_TEXTURES } from "@/lib/mapAssets";
import { SearchIcon } from "lucide-react-native";
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
import { StyleSheet, useUnistyles } from "react-native-unistyles";

function parseFloorRooms(): Record<string, string[]> {
  const result: Record<string, string[]> = {};
  for (const key of Object.keys(MAP_TEXTURES)) {
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
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
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

const SPRING = { stiffness: 1000, damping: 500, mass: 3, overshootClamping: true } as const;
const CLOSE_TIMING = { duration: 300, easing: Easing.in(Easing.ease) } as const;
const CLOSE_THRESHOLD = 100;
const CLOSE_VELOCITY = 0.5;
const FAB_SIZE = 52;

export default function D17MapScreen() {
  const { theme } = useUnistyles();
  const insets = useSafeAreaInsets();

  const [textureBase64, setTextureBase64] = useState(MAP_TEXTURES.none);
  const [searchTarget, setSearchTarget] = useState<{ x: number; z: number } | undefined>();

  const [appliedFloor, setAppliedFloor] = useState<number | null>(null);
  const [appliedRoom, setAppliedRoom] = useState<number | null>(null);
  const [searchKey, setSearchKey] = useState<string | undefined>(undefined);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerModalVisible, setDrawerModalVisible] = useState(false);
  const [openSeq, setOpenSeq] = useState(0);

  const [pendingFloor, setPendingFloor] = useState(0);
  const [pendingRoom, setPendingRoom] = useState(0);
  const pendingFloorRef = useRef(0);

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

  const handleConfirm = useCallback(() => {
    const floor = FLOORS[pendingFloor];
    const room = (FLOOR_ROOMS[floor] ?? [])[pendingRoom];
    if (floor && room) {
      const key = `${floor}.${room}`;
      setTextureBase64(MAP_TEXTURES[key] ?? MAP_TEXTURES.none);
      const coords = (roomData as RoomCoords)[key];
      if (coords) setSearchTarget({ x: coords.x, z: coords.y });
      setSearchKey(key);
      setAppliedFloor(pendingFloor);
      setAppliedRoom(pendingRoom);
    }
    closeDrawer();
  }, [pendingFloor, pendingRoom, closeDrawer]);

  const handleReset = useCallback(() => {
    setAppliedFloor(null);
    setAppliedRoom(null);
    setSearchTarget(undefined);
    setSearchKey(undefined);
    setTextureBase64(MAP_TEXTURES.none);
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

  const handleMapRoomClick = useCallback(async (key: string) => {
    const [floorStr, roomStr] = key.split(".");
    const floorIndex = FLOORS.indexOf(floorStr);
    const roomIndex = (FLOOR_ROOMS[floorStr] ?? []).indexOf(roomStr);

    if (floorIndex !== -1 && roomIndex !== -1) {
      setAppliedFloor(floorIndex);
      setAppliedRoom(roomIndex);
      setPendingFloor(floorIndex);
      pendingFloorRef.current = floorIndex;
      setPendingRoom(roomIndex);
    }

    setSearchKey(key);
    const coords = (roomData as RoomCoords)[key];
    if (coords) setSearchTarget({ x: coords.x, z: coords.y });

    setTextureBase64(MAP_TEXTURES[key] ?? MAP_TEXTURES.none);
  }, []);

  const currentPendingRooms = FLOOR_ROOMS[FLOORS[pendingFloor]] ?? [];

  return (
    <View style={styles.root}>
      <View style={StyleSheet.absoluteFill}>
        <D17MapView
          glbBase64={MAP_GLB_BASE64}
          textureBase64={textureBase64}
          searchTargetX={searchTarget?.x}
          searchTargetZ={searchTarget?.z}
          onRoomPress={handleMapRoomClick}
          roomCoords={
            Object.fromEntries(
              Object.entries(roomData as RoomCoords).filter(([k]) => k in MAP_TEXTURES),
            ) as RoomCoords
          }
          searchKey={searchKey}
        />
      </View>


      {!drawerVisible && (
        <TouchableOpacity
          style={[
            styles.fab,
            { backgroundColor: theme.colors.primary.main, bottom: 28 + insets.bottom },
          ]}
          onPress={openDrawer}
          activeOpacity={0.85}
        >
          <SearchIcon color={colors.white} size={22} strokeWidth={2} />
        </TouchableOpacity>
      )}

      <Modal
        transparent
        visible={drawerModalVisible}
        animationType="none"
        onRequestClose={closeDrawer}
      >
        <GestureHandlerRootView style={styles.modalRoot}>
          <Animated.View style={[styles.backdrop, backdropStyle]}>
            <Pressable style={styles.backdropPressable} onPress={closeDrawer} />
          </Animated.View>

          <Animated.View
            style={[styles.sheet, sheetStyle, { paddingBottom: theme.spacing.lg + insets.bottom }]}
          >
            <GestureDetector gesture={panGesture}>
              <View style={styles.handleArea}>
                <View style={styles.handle} />
              </View>
            </GestureDetector>

            <View style={styles.sheetHeader}>
              <Text style={styles.headerTitle}>Wybierz salę</Text>
              {appliedFloor !== null && appliedRoom !== null && (
                <TouchableOpacity onPress={handleReset} hitSlop={8}>
                  <Text style={styles.resetText}>Resetuj</Text>
                </TouchableOpacity>
              )}
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
              <TouchableOpacity style={styles.btnDiscard} onPress={closeDrawer} activeOpacity={0.7}>
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
          </Animated.View>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
}

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
