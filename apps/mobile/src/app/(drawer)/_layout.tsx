import { useWindowDimensions } from "react-native";
import DrawerContent from "@/components/core/DrawerContent.component";
import Header from "@/components/core/Header.component";
import { Drawer } from "expo-router/drawer";

export default function DrawerLayout() {
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.8, 310);

  return (
    <Drawer
      drawerContent={() => <DrawerContent />}
      screenOptions={{
        header: () => <Header />,
        drawerType: "front",
        drawerStyle: {
          backgroundColor: "transparent",
          width: drawerWidth,
        },
      }}
    >
      <Drawer.Screen name="index" />
      <Drawer.Screen name="d17map" />
      <Drawer.Screen name="information" />
      <Drawer.Screen name="settings" options={{ headerShown: false }} />
    </Drawer>
  );
}
