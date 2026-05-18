import React from "react";
import { Pressable, View } from "react-native";
import Logo from "@/components/core/Logo.component";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import { colors } from "@/styles/colors";
import { Theme } from "@/styles/themes/theme";
import { DrawerNavigationProp } from "@react-navigation/drawer";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { BellIcon, MenuIcon } from "lucide-react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export default function Header() {
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();
  const { theme, rt } = useUnistyles();
  const isDark = theme.mode === "dark";
  const logoVariant = isDark ? "white" : "color";
  const iconColor = isDark ? colors.core.extraLight : colors.core.dark;
  const insets = useSafeAreaInsets();
  const menu = usePressAnimation(0.93);
  const bell = usePressAnimation(0.93);

  return (
    <View style={[styles.container, { paddingTop: insets.top + theme.spacing.md }]}>
      <Pressable
        onPress={() => navigation.openDrawer()}
        onPressIn={menu.onPressIn}
        onPressOut={menu.onPressOut}
        style={styles.iconButton}
      >
        <Animated.View style={menu.animStyle}>
          <MenuIcon color={iconColor} size={24} />
        </Animated.View>
      </Pressable>

      <Logo height={45} variant={logoVariant} />

      <Pressable onPressIn={bell.onPressIn} onPressOut={bell.onPressOut} style={styles.iconButton}>
        <Animated.View style={bell.animStyle}>
          <BellIcon color={iconColor} size={24} />
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  iconButton: {
    padding: theme.spacing.xs,
  },
}));
