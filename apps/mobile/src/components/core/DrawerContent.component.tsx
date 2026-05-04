import React from "react";
import { Pressable, Text, View } from "react-native";
import Logo from "@/components/core/Logo.component";
import { usePathname, useRouter } from "expo-router";
import {
  HomeIcon,
  InfoIcon,
  LucideIcon,
  MapIcon,
  SettingsIcon,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/styles/colors";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import { Theme } from "@/styles/themes/theme";

type NavItemProps = {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onPress: () => void;
};

function NavItem({ icon: Icon, label, active, onPress }: NavItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.navItem,
        active && styles.navItemActive,
      ]}
    >
      <Icon size={24} color={colors.white} strokeWidth={1.8} />
      <Text style={styles.navItemText}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function DrawerContent() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const navigate = (href: string) => router.push(href as any);

  const topItems = [
    { icon: HomeIcon, label: "HOME", href: "/" },
    { icon: MapIcon, label: "D17 MAP", href: "/d17map" },
    { icon: InfoIcon, label: "INFORMATION", href: "/information" },
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
              key={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
              onPress={() => navigate(item.href)}
            />
          ))}
        </View>
      </View>

      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom ? insets.bottom + 16 : 32 }]}>
        <NavItem
          icon={SettingsIcon}
          label="SETTINGS"
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
    backgroundColor: theme.colors.dark.main,
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
    backgroundColor: theme.colors.dark.text.secondary,
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
