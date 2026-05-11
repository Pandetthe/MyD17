import { Pressable, View } from "react-native";
import SwitchCore from "@/components/core/Switch.component";
import { LinearGradient } from "react-native-linear-gradient";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import Tag from "@/components/core/Tag.component";
import { ColorPalette } from "@/styles/themes/theme";

type SettingProps = {
  text: string;
  onPress: () => void;
  value: number;
  color?: ColorPalette;
};

export default function Notification({ text, onPress, value, color }: SettingProps) {
  const { theme } = useUnistyles();
  const formatText = (text: string) =>
    text.length > 26 ? text.slice(0, 23) + "..." : text;

  return (
    <LinearGradient
      colors={theme.colors.gradients.settings}
      angle={60}
      useAngle
      style={styles.container}
    >

      <View style={styles.tagWrapper}>
        <Tag text={formatText(text)} color={color}/>
      </View>

      <Pressable onPress={onPress} style={styles.switchWrapper}>
        <SwitchCore onPress={onPress} value={value} />
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: theme.borderRadius.full,
    borderColor: theme.colors.primary.main,
    width: "95%",
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    boxShadow: `10px 5px 20px ${theme.colors.primary.background.accent}33`,
    elevation: 5,
  },
  tagWrapper: {
    flex: 1,
    marginLeft: theme.spacing.md
  },
  switchWrapper: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
}));
