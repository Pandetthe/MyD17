import { Pressable, View } from "react-native";
import Tag from "@/components/core/Tag.component";
import { palette } from "@/styles/colors";
import { ColorPalette, PaletteColor } from "@/styles/themes/theme";
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

  const resolvedColor = color ?? "primary";
  const isRaw = resolvedColor !== "primary" && resolvedColor !== "dark" && resolvedColor in palette;
  const tcKey = (resolvedColor === "primary" || resolvedColor === "dark") ? resolvedColor : "primary";
  const main = isRaw
    ? palette[resolvedColor as PaletteColor].main
    : theme.colors[tcKey].main;

  return (
    <View style={[styles.container]}>
      <Pressable
        onPress={onPress}
        style={[styles.tagWrapper, value && { borderColor: main }]}
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
