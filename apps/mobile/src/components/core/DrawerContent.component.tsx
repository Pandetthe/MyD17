import React from "react";
import { Pressable, Text, View } from "react-native";
import Logo from "@/components/core/Logo.component";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import { colors } from "@/styles/colors";
import { usePathname, useRouter, Href } from "expo-router";
import {
  HomeIcon,
  InfoIcon,
  LucideIcon,
  MapIcon,
  PhoneIcon,
  SettingsIcon,
} from "lucide-react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";
import { DrawerActions, useNavigation } from "@react-navigation/native";

type NavItemProps = {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onPress: () => void;
  testID?: string;
};

function NavItem({ icon: Icon, label, active, onPress, testID }: NavItemProps) {
  const { animStyle, onPressIn, onPressOut } = usePressAnimation(0.97);
  const iconColor = active ? colors.white : colors.core.extraLight;
  return (
    <Pressable testID={testID} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.navItem, active && styles.navItemActive, animStyle]}>
        <Icon size={22} color={iconColor} strokeWidth={active ? 2 : 1.6} />
        <Text style={[styles.navItemText, active && styles.navItemTextActive]}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function DrawerContent() {
  const router = useRouter();
  const navigation = useNavigation();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const navigate = (href: Href) => {
    navigation.dispatch(DrawerActions.closeDrawer());
    router.push(href);
  };

  const topItems: { icon: LucideIcon; label: string; href: Href }[] = [
    { icon: HomeIcon, label: "STRONA GŁÓWNA", href: "/" },
    { icon: MapIcon, label: "MAPA D17", href: "/d17map" },
    { icon: InfoIcon, label: "INFORMACJE", href: "/information" },
    { icon: PhoneIcon, label: "KONTAKT", href: "/contact" },
  ];

  const navTestIDs: Record<string, string> = {
    "/": "drawer-nav-home",
    "/d17map": "drawer-nav-map",
    "/information": "drawer-nav-information",
    "/contact": "drawer-nav-contact",
  };

  return (
    <View testID="drawer-content" style={styles.container}>
      <View style={styles.decorativeCircle} />

      <View style={[styles.content, { paddingTop: insets.top ? insets.top + 32 : 64 }]}>
        <View style={styles.logoContainer}>
          <Logo height={50} variant="white" />
        </View>

        <View>
          {topItems.map((item) => (
            <NavItem
              key={item.label}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
              onPress={() => navigate(item.href)}
              testID={navTestIDs[item.href as string]}
            />
          ))}
        </View>
      </View>

      <View
        style={[styles.bottomContainer, { paddingBottom: insets.bottom ? insets.bottom + 16 : 32 }]}
      >
        <NavItem
          icon={SettingsIcon}
          label="USTAWIENIA"
          active={pathname === "/settings"}
          onPress={() => navigate("/settings")}
          testID="drawer-nav-settings"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.dark.bg,
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    shadowColor: colors.core.extraDark,
    shadowOffset: { width: 10, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  decorativeCircle: {
    position: "absolute",
    left: -111,
    top: -89,
    width: 638,
    height: 638,
    borderRadius: 319,
    backgroundColor: colors.core.extraDark,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  logoContainer: {
    paddingBottom: 40,
    paddingLeft: theme.spacing.xs,
  },
  bottomContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xxs,
  },
  navItemActive: {
    backgroundColor: "rgba(16,101,175,0.15)",
  },
  navItemText: {
    fontFamily: theme.fonts.semiBold,
    color: colors.core.extraLight,
    fontSize: 14,
    letterSpacing: 0.4,
  },
  navItemTextActive: {
    color: colors.white,
  },
}));
