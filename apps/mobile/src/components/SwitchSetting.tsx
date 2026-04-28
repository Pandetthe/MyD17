import TextCore from "@/components/core/Text.component";
import {Pressable, View} from "react-native";
import {StyleSheet} from "react-native-unistyles";
import Icon from "@/components/core/Icon.component";
import SwitchCore from "@/components/core/Switch.component";
import {ArrowUpRightIcon} from "lucide-react-native";

type SettingProps = {
    text: string,
    icon: any, // TODO: Make precise
    onPress: () => void,
    value?: number,
}

export default function Setting({
    text,
    icon,
    onPress,
    value,
}: SettingProps) {

    return (
        <View style={styles.container}>
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

        </View>

    )
}

const styles = StyleSheet.create((theme) => ({
    container: {
        borderStyle: "solid",
        borderWidth: 1,
        borderRadius: 24,
        borderColor: theme.colors.primary.main,
        backgroundColor: theme.colors.primary.background.main, // TODO: Add proper color
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