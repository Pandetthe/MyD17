import { View } from "react-native";
import TextCore from "@/components/core/Text.component";
import { StyleSheet } from "react-native-unistyles";

export default function D17Map() {
  return (
    <View style={styles.container}>
      <TextCore>D17 Map</TextCore>
    </View>
  );
}

const styles = StyleSheet.create((theme) => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.surface,
  },
}));
