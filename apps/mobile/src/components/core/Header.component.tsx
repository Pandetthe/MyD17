import React from "react";
import { Pressable, View } from "react-native";
import Logo from "@/components/core/Logo.component";
import { Theme } from "@/styles/themes/theme";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { BellIcon, ChevronLeftIcon, MenuIcon } from "lucide-react-native";
import { StyleSheet, useUnistyles } from "react-native-unistyles";

export default function Header({ onBack }: { onBack?: () => void }) {
  const navigation = useNavigation();
  const { theme } = useUnistyles();

  const handleLeftPress = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.dispatch(DrawerActions.openDrawer());
    }
  };

  return (
    <View style={styles.container}>
      <Pressable onPress={handleLeftPress} style={styles.iconButton}>
        {onBack ? (
          <ChevronLeftIcon color={theme.colors.dark.text.secondary} size={24} />
        ) : (
          <MenuIcon color={theme.colors.dark.text.secondary} size={24} />
        )}
      </Pressable>

      <Logo height={45} />

      <Pressable style={styles.iconButton}>
        <BellIcon color={theme.colors.dark.text.secondary} size={24} />
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
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  iconButton: {
    padding: theme.spacing.xs,
  },
}));
