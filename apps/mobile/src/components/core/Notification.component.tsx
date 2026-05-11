// import { StyleSheet, useUnistyles } from "react-native-unistyles";
// import { Theme } from "@/styles/themes/theme";
// import Tag from "@/components/core/Tag.component";
// import SwitchCore from "@/components/core/Switch.component";
// import { LinearGradient } from "react-native-linear-gradient";
// import { Pressable } from "react-native";
//
// type NotificationProps = {
//   text: string;
//   onPress: () => void;
//   value: number;
//   color?: string;
// }
//
// export default function Notification({ text, color, onPress, value}: NotificationProps) {
//   const { theme } = useUnistyles();
//
//   return (
//     <LinearGradient
//       colors={theme.colors.gradients.settings}
//       angle={60}
//       useAngle
//       style={styles.container}
//     >
//       <Tag text={text} color={color} />
//
//       <Pressable onPress={onPress} style={styles.switchWrapper}>
//         <SwitchCore onPress={onPress} value={value} />
//       </Pressable>
//     </LinearGradient>
//   )
// }
//
// const styles = StyleSheet.create((theme: Theme) => ({
//   container: {
//     backgroundColor: theme.colors.surface,
//     width: "95%",
//     height: 72,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: theme.spacing.lg,
//     borderRadius: theme.borderRadius.lg,
//     borderColor: theme.colors.primary.main,
//     borderWidth: 1,
//     borderStyle: "solid",
//     marginVertical: theme.spacing.xxs,
//     boxShadow: `10px 5px 20px ${theme.colors.primary.background.accent}33`,
//     elevation: 5,
//   },
//   switchWrapper: {
//     paddingHorizontal: theme.spacing.md,
//     paddingVertical: theme.spacing.lg,
//     alignItems: "center",
//     borderWidth: 1,
//   },
// }));

import { Pressable, View } from "react-native";
import Icon from "@/components/core/Icon.component";
import SwitchCore from "@/components/core/Switch.component";
import TextCore from "@/components/core/Text.component";
import { ArrowUpRightIcon, LucideIcon } from "lucide-react-native";
import { LinearGradient } from "react-native-linear-gradient";
import { StyleSheet, useUnistyles } from "react-native-unistyles";
import Tag from "@/components/core/Tag.component";

type SettingProps = {
  text: string;
  onPress: () => void;
  value: number;
  color?: string;
};

export default function Notification({ text, onPress, value, color }: SettingProps) {
  const { theme } = useUnistyles();
  return (
    <LinearGradient
      colors={theme.colors.gradients.settings}
      angle={60}
      useAngle
      style={styles.container}
    >

      <View style={styles.tagWrapper}>
        <Tag text={text} color={color}/>
      </View>

      <Pressable onPress={onPress} style={styles.switchWrapper}>
        <SwitchCore onPress={onPress} value={value} />
      </Pressable>
    </LinearGradient>
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
  tagWrapper: {
    flex: 1,
    marginLeft: theme.spacing.md
  },
  switchWrapper: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
}));
