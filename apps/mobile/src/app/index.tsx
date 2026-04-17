import Icon from "@/components/core/Icon.component";
import { Theme } from "@/styles/themes/theme";
import { View } from "react-native";
import { StyleSheet } from "react-native-unistyles";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Icon name="Home" />
    </View>
  );
}

const styles = StyleSheet.create((theme: Theme) => ({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
  },
}));
