import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import Button from "@/components/core/Button.component";
import SwitchCore from "@/components/core/Switch.component";
import Tag from "@/components/core/Tag.component";
import TextCore from "@/components/core/Text.component";
import UnsavedChangesModal from "@/components/core/UnsavedChangesModal.component";
import { apiClient } from "@/lib/apiClient";
import { syncSubscriptions } from "@/lib/pushNotifications";
import { tagColor } from "@/lib/tagColor";
import { Theme } from "@/styles/themes/theme";
import { NavigationAction, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ArrowLeft, SaveIcon } from "lucide-react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type TagData = {
  id: number;
  title: string;
  color: string;
};

export default function Notifications() {
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  const [tags, setTags] = useState<TagData[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [showModal, setShowModal] = useState(false);
  const pendingAction = useRef<NavigationAction | null>(null);

  const hasUnsaved = JSON.stringify(selected) !== JSON.stringify(saved);
  const hasUnsavedRef = useRef(false);
  hasUnsavedRef.current = hasUnsaved;

  const saveOpacity = useSharedValue(0);
  const saveTranslateY = useSharedValue(16);

  useEffect(() => {
    const cfg = { duration: 220, easing: Easing.out(Easing.cubic) };
    saveOpacity.value = withTiming(hasUnsaved ? 1 : 0, cfg);
    saveTranslateY.value = withTiming(hasUnsaved ? 0 : 16, cfg);
  }, [hasUnsaved]);

  const saveAnimStyle = useAnimatedStyle(() => ({
    opacity: saveOpacity.value,
    transform: [{ translateY: saveTranslateY.value }],
  }));

  useEffect(() => {
    const fetchTags = async () => {
      const res = await apiClient.get<{ data: TagData[] }>("/api/tags");
      const data = res.data.data;
      setTags(data);
      const initial = data.reduce(
        (acc, tag) => ({ ...acc, [tag.id]: false }),
        {} as Record<number, boolean>,
      );
      setSelected(initial);
      setSaved(initial);
    };
    fetchTags();
  }, []);

  useEffect(() => {
    return navigation.addListener("beforeRemove", (e) => {
      if (!hasUnsavedRef.current) return;
      e.preventDefault();
      pendingAction.current = e.data.action;
      setShowModal(true);
    });
  }, [navigation]);

  const toggle = (id: number) => setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleAll = () => {
    const allOn = Object.values(selected).every(Boolean);
    setSelected(
      Object.keys(selected).reduce(
        (acc, key) => ({ ...acc, [Number(key)]: !allOn }),
        {} as Record<number, boolean>,
      ),
    );
  };

  const [isSaving, setIsSaving] = useState(false);

  const save = async () => {
    setIsSaving(true);
    try {
    const tagIds = Object.keys(selected)
      .filter((id) => selected[Number(id)])
      .map(Number);
    await syncSubscriptions(tagIds);
    setSaved({ ...selected });
    } catch {
      Alert.alert("Błąd", "Nie udało się zapisać powiadomień.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setShowModal(false);
    if (pendingAction.current) navigation.dispatch(pendingAction.current);
  };

  const allSelected = tags.length > 0 && Object.values(selected).every(Boolean);

  const goBack = useCallback(() => router.back(), [router]);

  const swipeBack = Gesture.Pan()
    .activeOffsetX([30, 9999])
    .failOffsetY([-15, 15])
    .onEnd((e) => {
      if (e.translationX > 80 || e.velocityX > 800) {
        runOnJS(goBack)();
      }
    });

  return (
    <GestureDetector gesture={swipeBack}>
      <View style={styles.wrapper}>
        <View style={[styles.header, { paddingTop: insets.top + theme.spacing.md }]}>
          <Button icon={ArrowLeft} color="dark" size="lg" onPress={() => router.back()} />
          <TextCore variant="h2" style={styles.title}>
            Powiadomienia
          </TextCore>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Pressable style={styles.selectAllRow} onPress={toggleAll}>
            <TextCore variant="h2">Wszystkie</TextCore>
            <SwitchCore onPress={toggleAll} value={allSelected} />
          </Pressable>

          <View style={styles.divider} />

          <View style={styles.tagsGrid}>
            {tags.map((tag) => {
              const isSelected = selected[tag.id] ?? false;
              const dimmed = !isSelected;
              return (
                <View key={tag.id} style={dimmed ? styles.dimmed : undefined}>
                  <Tag
                    text={`#${tag.title}`}
                    color={tagColor(tag.color)}
                    onPress={() => toggle(tag.id)}
                  />
                </View>
              );
            })}
          </View>
        </ScrollView>

        <Animated.View
          style={[styles.saveWrapper, { bottom: insets.bottom + theme.spacing.md }, saveAnimStyle]}
          pointerEvents={hasUnsaved ? "auto" : "none"}
        >
          <Button text="Zapisz" icon={SaveIcon} color="primary" size="lg" onPress={save} disabled={isSaving} />
        </Animated.View>

        <UnsavedChangesModal
          visible={showModal}
          onKeep={() => setShowModal(false)}
          onDiscard={handleDiscard}
        />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  wrapper: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  headerSpacer: {
    width: theme.size.lg,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: 96,
  },
  title: {
    flex: 1,
    textAlign: "center",
  },
  selectAllRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary.subtext,
    marginBottom: theme.spacing.md,
  },
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  dimmed: {
    opacity: 0.4,
  },
  saveWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
}));
