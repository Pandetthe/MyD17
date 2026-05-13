import { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Button from "@/components/core/Button.component";
import SwitchCore from "@/components/core/Switch.component";
import Tag from "@/components/core/Tag.component";
import TextCore from "@/components/core/Text.component";
import UnsavedChangesModal from "@/components/core/UnsavedChangesModal.component";
import { ColorPalette, Theme } from "@/styles/themes/theme";
import { useNavigation } from "@react-navigation/native";
import { SaveIcon } from "lucide-react-native";
import { StyleSheet } from "react-native-unistyles";

interface TagData {
  id: number;
  title: string;
  color: {
    id: number;
    color: ColorPalette;
  };
}

export default function Notifications() {
  const navigation = useNavigation();

  const [tags, setTags] = useState<TagData[]>([]);
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [saved, setSaved] = useState<Record<number, boolean>>({});
  const [showModal, setShowModal] = useState(false);
  const pendingAction = useRef<any>(null);

  const hasUnsavedRef = useRef(false);
  hasUnsavedRef.current = JSON.stringify(selected) !== JSON.stringify(saved);

  useEffect(() => {
    const fetchTags = async () => {
      const res = await fetch("http://localhost:1337/api/tags?populate=color");
      const json = await res.json();
      const data = json.data as TagData[];
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
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.selectAllRow} onPress={toggleAll}>
          <TextCore variant="h2">Select all</TextCore>
          <SwitchCore onPress={toggleAll} value={allSelected ? 1 : 0} />
        </Pressable>

        <View style={styles.divider} />

        <View style={styles.tagsGrid}>
          {tags.map((tag) => (
            <Tag
              key={tag.id}
              text={tag.title}
              color={tag.color.color}
              selected={selected[tag.id] ?? false}
              onPress={() => toggle(tag.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.saveWrapper}>
        <Button text="Save" icon={SaveIcon} color="primary" size="lg" onPress={save} />
      </View>

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
  content: {
    padding: theme.spacing.md,
    paddingBottom: 96,
  },
  selectAllRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.sm,
  },
  divider: {
    borderBottomWidth: 1,
    marginBottom: theme.spacing.md,
  },
  tagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: theme.spacing.sm,
  },
  saveWrapper: {
    position: "absolute",
    bottom: theme.spacing.md,
    right: theme.spacing.md,
  },
}));
