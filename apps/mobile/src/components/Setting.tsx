import TextCore from "@/components/core/Text.component";
import {Pressable, View} from "react-native";
import {StyleSheet, useUnistyles} from "react-native-unistyles";
import Icon from "@/components/core/Icon.component";
import SwitchCore from "@/components/core/Switch.component";
import {ArrowUpRightIcon, LucideIcon} from "lucide-react-native";
import {LinearGradient} from "react-native-linear-gradient";

type SettingProps = {
    text: string,
    icon: LucideIcon,
    onPress: () => void,
    value?: number,
}

export default function Setting({
    text,
    icon,
    onPress,
    value,
}: SettingProps) {
    const {theme} = useUnistyles();
    return (
        <LinearGradient colors={theme.colors.gradients.settings} angle={60} useAngle={true} style={styles.container}>

            <View style={styles.iconWrapper}>
                <Icon icon={icon}></Icon>
            </View>

            <View style={styles.textWrapper}>
                <TextCore variant="h3">{text}</TextCore>
            </View>

            <Pressable onPress={onPress} style={styles.switchWrapper}>
                {value == null ? (
                    <Icon icon={ArrowUpRightIcon} hasBackground={false}></Icon>
                ) : (
                    <SwitchCore onPress={onPress} value={value} />
                )}
            </Pressable>

        </LinearGradient>

    )
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
    },
    iconWrapper: {
        marginRight: 8,
        marginLeft: 14,
    },
    textWrapper: {
        flex: 1
    },
    switchWrapper: {
        paddingHorizontal: 14,
        paddingVertical: 24,
    }
}));