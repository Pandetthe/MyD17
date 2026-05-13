import { Pressable, View } from "react-native";
import Icon from "@/components/core/Icon.component";
import SwitchCore from "@/components/core/Switch.component";
import TextCore from "@/components/core/Text.component";
import { ArrowRightIcon, LucideIcon } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

type SettingProps = {
  text: string;
  icon: LucideIcon;
  onPress: () => void;
  value?: number;
};

export default function Setting({ text, icon, onPress, value }: SettingProps) {
  const { theme } = useUnistyles();
  return (
    <View>
      <View style={styles.iconWrapper}>
        <Icon icon={icon}></Icon>
      </View>

      <View style={styles.textWrapper}>
        <TextCore variant="h3">{text}</TextCore>
      </View>

      <Pressable onPress={onPress} style={styles.switchWrapper}>
        {value == null ? (
          <Icon icon={ArrowRightIcon} hasBackground={false}></Icon>
        ) : (
          <SwitchCore onPress={onPress} value={value} />
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    borderStyle: "solid",
    borderWidth: 1,
    borderRadius: theme.borderRadius.lg,
    borderColor: theme.colors.primary.main,
    width: "95%",
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    boxShadow: `10px 5px 20px ${theme.colors.primary.background.accent}33`,
    elevation: 5,
  },
  iconWrapper: {
    marginRight: theme.spacing.xs,
    marginLeft: theme.spacing.md,
  },
  textWrapper: {
    flex: 1,
  },
  switchWrapper: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
}));
