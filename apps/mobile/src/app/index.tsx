import { View } from "react-native";
import Button from "@/components/core/Button.component";
import Icon from "@/components/core/Icon.component";
import { Theme } from "@/styles/themes/theme";
import { Calendar, Home } from "lucide-react-native";
import { StyleSheet } from "react-native-unistyles";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Icon icon={Home} />
      <Icon icon={Home} color="red" />
      <Icon icon={Home} color="amber" />
      <Icon icon={Home} color="green" />
      <Icon icon={Home} color="teal" />
      <Icon icon={Home} color="purple" />
      <Icon icon={Home} color="pink" />

      <Button icon={Calendar} text="Button" />
      <Button icon={Calendar} color="dark" text="Button" />
      <Button icon={Calendar} color="red" text="Button" size="lg" />
      <Button icon={Calendar} color="amber" text="Button" />
      <Button icon={Calendar} color="green" text="Button" />
      <Button icon={Calendar} color="teal" text="Button" />
      <Button icon={Calendar} color="purple" text="Button" />
      <Button icon={Calendar} color="pink" text="Button" />
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
