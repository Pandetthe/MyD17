import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import Button from "@/components/core/Button.component";
import { apiClient } from "@/lib/apiClient";
import { tagColor } from "@/lib/tagColor";
import SwitchCore from "@/components/core/Switch.component";
import Tag from "@/components/core/Tag.component";
import TextCore from "@/components/core/Text.component";
import UnsavedChangesModal from "@/components/core/UnsavedChangesModal.component";
import { Theme } from "@/styles/themes/theme";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ArrowLeft, SaveIcon } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

interface TagData {
  id: number;
  title: string;
  color: string;
}

export default function Notifications() {
  const navigation = useNavigation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useUnistyles();

  const [tags, setTags] = useState<TagData[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [showModal, setShowModal] = useState(false);
  const pendingAction = useRef<any>(null);

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

  const toggle = (id: number) =>
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));

  const toggleAll = () => {
    const allOn = Object.values(selected).every(Boolean);
    setSelected(
      Object.keys(selected).reduce(
        (acc, key) => ({ ...acc, [Number(key)]: !allOn }),
        {} as Record<number, boolean>,
      ),
    );
  };

  const save = () => setSaved({ ...selected });

  const handleDiscard = () => {
    setShowModal(false);
    navigation.dispatch(pendingAction.current);
  };

  const allSelected = tags.length > 0 && Object.values(selected).every(Boolean);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <Button
          icon={ArrowLeft}
          color="dark"
          size="lg"
          onPress={() => router.back()}
        />
        <TextCore variant="h2" style={styles.title}>Powiadomienia</TextCore>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <Pressable style={styles.selectAllRow} onPress={toggleAll}>
          <TextCore variant="h2">Wszystkie</TextCore>
          <SwitchCore onPress={toggleAll} value={allSelected ? 1 : 0} />
        </Pressable>

        <View style={styles.divider} />

        <View style={styles.tagsGrid}>
          {tags.map((tag) => (
            <Tag
              key={tag.id}
              text={tag.title}
              color={tagColor(tag.color)}
              selected={selected[tag.id] ?? false}
              onPress={() => toggle(tag.id)}
            />
          ))}
        </View>
      </ScrollView>

      <Animated.View
        style={[styles.saveWrapper, { bottom: insets.bottom + theme.spacing.md }, saveAnimStyle]}
        pointerEvents={hasUnsaved ? "auto" : "none"}
      >
        <Button text="Zapisz" icon={SaveIcon} color="primary" size="lg" onPress={save} />
      </Animated.View>

      <UnsavedChangesModal
        visible={showModal}
        onKeep={() => setShowModal(false)}
        onDiscard={handleDiscard}
      />
    </View>
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
  saveWrapper: {
    position: "absolute",
    right: theme.spacing.md,
  },
}));
