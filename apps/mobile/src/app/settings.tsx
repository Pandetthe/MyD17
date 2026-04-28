import { View } from "react-native";
import {StyleSheet} from "react-native-unistyles";
import {Theme} from "@/styles/themes/theme";
import {BellIcon, BellRingIcon, InfoIcon, LanguagesIcon, MoonIcon} from "lucide-react-native";
import {useState} from "react";
import Setting from "@/components/Setting";

export default function Settings() {
    const [darkMode, setDarkMode] = useState(0);
    const [notifications, setNotifications] = useState(0);

    const darkModeClick = () => {
        setDarkMode(1 - darkMode);
    }
    const notificationsClick = () => {
        setNotifications(1 - notifications);
    }
    const openLanguage = () => {
        alert("Languages") // Placeholder
    }
    const openSubscriptions = () => {
        alert("Subscriptions") // Placeholder
    }

    return (
        <View style={styles.container}>
            <Setting icon={MoonIcon} text={"Dark Mode"} onPress={darkModeClick} value={darkMode}/>
            <Setting icon={notifications === 1 ? BellRingIcon : BellIcon} text={"Enable notifications"} onPress={notificationsClick} value={notifications}/>
            <Setting icon={LanguagesIcon} text={"Language"} onPress={openLanguage}/>
            <Setting icon={InfoIcon} text={"Manage subscriptions"} onPress={openSubscriptions}/>
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
