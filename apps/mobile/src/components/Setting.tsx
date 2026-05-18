import { View } from "react-native";
import { Card } from "@/components/core/Card.component";
import SwitchCore from "@/components/core/Switch.component";
import TextCore from "@/components/core/Text.component";
import { colors } from "@/styles/colors";
import type { Theme } from "@/styles/themes/theme";
import { ArrowUpRight, LucideIcon } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type SettingProps = {
  text: string;
  icon: LucideIcon;
  onPress: () => void;
  value?: boolean;
};

export default function Setting({ text, icon: IconComponent, onPress, value }: SettingProps) {
  const { theme } = useUnistyles();
  const isDark = theme.mode === "dark";
  const iconBg = isDark ? colors.core.dark : colors.core.disabled;

  return (
    <Card
      circle="none"
      color="primary"
      gradient={theme.colors.gradients.posts}
      onPress={onPress}
      style={styles.outer}
      contentStyle={styles.shell}
    >
      <View style={styles.row}>
        <View style={styles.iconOuter}>
          <View style={[styles.iconInner, { backgroundColor: iconBg }]}>
            <IconComponent size={theme.size.md} color={colors.core.main} />
          </View>
        </View>
        <TextCore variant="h3" weight="semiBold" style={styles.label} numberOfLines={1}>
          {text}
        </TextCore>
        {value == null ? (
          <ArrowUpRight size={theme.size.md} color={colors.core.main} strokeWidth={2} />
        ) : (
          <SwitchCore onPress={onPress} value={value} />
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  outer: {
    width: "100%",
  },
  shell: {
    height: 72,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xxs,
  },
  iconOuter: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  iconInner: {
    width: 38,
    height: 38,
    borderRadius: theme.borderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
    marginLeft: theme.spacing.xxs,
  },
}));
