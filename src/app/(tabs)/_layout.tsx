import { CustomTabBar } from "@/components/custom-tab-bar";
import { Tabs } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="events" options={{ title: "Eventos" }} />
        <Tabs.Screen name="notifications" options={{ title: "Notificações" }} />
        <Tabs.Screen name="profile" options={{ title: "Perfil" }} />
      </Tabs>
    </SafeAreaProvider>
  );
}
