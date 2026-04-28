import { View } from "react-native";
import {StyleSheet} from "react-native-unistyles";
import {Theme} from "@/styles/themes/theme";
import {Home} from "lucide-react-native";
import {useState} from "react";
import Setting from "@/components/SwitchSetting";

export default function Settings() {
    const [switchValue, setSwitchValue] = useState(0);
    const buttonClick = () => {
        setSwitchValue(1 - switchValue);
    }

    return (
        <View style={styles.container}>
            <Setting icon={Home} text={"Hello world"} onPress={buttonClick} value={switchValue}/>
            <Setting icon={Home} text={"<a>Hello world</a>"} onPress={buttonClick}/>
        </View>
    )
}

const styles = StyleSheet.create((theme: Theme) => ({
    container: {
        flex: 0,
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        marginTop: 10,
        gap: 10,
        backgroundColor: theme.colors.surface,
    },
}));
