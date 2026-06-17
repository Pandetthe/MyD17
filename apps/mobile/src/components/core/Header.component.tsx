import React from "react";
import { Pressable, StatusBar, View } from "react-native";
import Logo from "@/components/core/Logo.component";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import { colors } from "@/styles/colors";
import { Theme } from "@/styles/themes/theme";
import { DrawerNavigationProp, useDrawerStatus } from "@react-navigation/drawer";
import { ParamListBase, useNavigation } from "@react-navigation/native";
import { MenuIcon } from "lucide-react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export default function Header() {
  const navigation = useNavigation<DrawerNavigationProp<ParamListBase>>();
  const { theme } = useUnistyles();
  const isDark = theme.mode === "dark";
  const logoVariant = isDark ? "white" : "color";
  const iconColor = isDark ? colors.core.extraLight : colors.core.dark;
  const insets = useSafeAreaInsets();
  const menu = usePressAnimation(0.93);

  const drawerStatus = useDrawerStatus();
  const barStyle = drawerStatus === "open" || isDark ? "light-content" : "dark-content";

  return (
    <View
      testID="app-header"
      style={[styles.container, { paddingTop: insets.top + theme.spacing.md }]}
    >
      <StatusBar barStyle={barStyle} />
      <Pressable
        testID="header-menu-button"
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

      {/* Spacer mirrors the menu button's footprint to keep the logo centered */}
      <View style={styles.iconButton}>
        <View style={{ width: 24, height: 24 }} />
      </View>
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
