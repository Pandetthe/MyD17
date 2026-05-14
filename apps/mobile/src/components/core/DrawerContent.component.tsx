import React from "react";
import { Pressable, Text, View } from "react-native";
import Logo from "@/components/core/Logo.component";
import { usePressAnimation } from "@/hooks/usePressAnimation";
import { colors } from "@/styles/colors";
import { Theme } from "@/styles/themes/theme";
import { usePathname, useRouter, Href } from "expo-router";
import { HomeIcon, InfoIcon, LucideIcon, MapIcon, SettingsIcon } from "lucide-react-native";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StyleSheet } from "react-native-unistyles";

type NavItemProps = {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onPress: () => void;
};

function NavItem({ icon: Icon, label, active, onPress }: NavItemProps) {
  const { animStyle, onPressIn, onPressOut } = usePressAnimation(0.97);
  return (
    <Pressable onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.navItem, active && styles.navItemActive, animStyle]}>
        <Icon size={24} color={colors.white} strokeWidth={1.8} />
        <Text style={styles.navItemText}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

export default function DrawerContent() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const navigate = (href: Href) => router.push(href);

  const topItems: { icon: LucideIcon; label: string; href: Href }[] = [
    { icon: HomeIcon, label: "STRONA GŁÓWNA", href: "/" },
    { icon: MapIcon, label: "MAPA D17", href: "/d17map" },
    { icon: InfoIcon, label: "INFORMACJE", href: "/information" },
  ];

  return (
    <View style={styles.container}>
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
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.dark.background.main,
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 10, height: 0 },
    shadowOpacity: 0.3,
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
    backgroundColor: theme.colors.dark.background.accent,
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
    backgroundColor: "transparent",
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.xxs,
  },
  navItemActive: {
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  navItemText: {
    fontFamily: theme.fonts.semiBold,
    color: colors.white,
    fontSize: 16,
    letterSpacing: 0.5,
  },
}));
