import { Pressable, View } from "react-native";
import Tag from "@/components/core/Tag.component";
import { ColorPalette } from "@/styles/themes/theme";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type SettingProps = {
  text: string;
  onPress: () => void;
  value: boolean;
  color?: ColorPalette;
};

export default function Notification({ text, onPress, value, color }: SettingProps) {
  const { theme } = useUnistyles();
  const formatText = (t: string) => (t.length > 26 ? t.slice(0, 23) + "..." : t);

  return (
    <View style={[styles.container]}>
      <Pressable
        onPress={onPress}
        style={[styles.tagWrapper, value && { borderColor: theme.colors[color ?? "primary"].main }]}
      >
        <Tag text={formatText(text)} color={color} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    padding: theme.spacing.xxs,
  },
  tagWrapper: {
    padding: theme.spacing.xxs,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: theme.borderRadius.full,
    borderColor: "transparent",
  },
  tagBorder: {
    borderColor: theme.colors.primary.main,
  },
}));
