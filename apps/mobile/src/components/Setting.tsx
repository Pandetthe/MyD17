import { View } from "react-native";
import { Card } from "@/components/core/Card.component";
import SwitchCore from "@/components/core/Switch.component";
import TextCore from "@/components/core/Text.component";
import { colors } from "@/styles/colors";
import type { Theme } from "@/styles/themes/theme";
import { ArrowUpRight, LucideIcon } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

const SETTING_GRADIENT = ["#F2F9FF", "#ECF6FF"] as const;

type SettingProps = {
  text: string;
  icon: LucideIcon;
  onPress: () => void;
  value?: number;
};

export default function Setting({ text, icon: IconComponent, onPress, value }: SettingProps) {
  const { theme } = useUnistyles();

  return (
    <Card
      circle="none"
      color="primary"
      gradient={SETTING_GRADIENT}
      onPress={onPress}
      style={styles.outer}
      contentStyle={styles.shell}
    >
      <View style={styles.row}>
        <View style={styles.iconOuter}>
          <View style={styles.iconInner}>
            <IconComponent size={theme.size.md} color={theme.colors.primary.main} />
          </View>
        </View>
        <TextCore variant="h3" weight="semiBold" style={styles.label} numberOfLines={1}>
          {text}
        </TextCore>
        {value == null ? (
          <ArrowUpRight size={theme.size.md} color={theme.colors.primary.main} strokeWidth={2} />
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
    shadowOffset: { width: 10, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
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
    backgroundColor: colors.core.extraLight,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    flex: 1,
    marginLeft: theme.spacing.xxs,
  },
}));
