import { DarkTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { colors } from "@/constants/theme";
import { AuthProvider } from "@/lib/auth-context";
import {
  Rubik_400Regular,
  Rubik_500Medium,
  Rubik_700Bold,
  Rubik_900Black,
  useFonts,
} from "@expo-google-fonts/rubik";

SplashScreen.preventAutoHideAsync();

const QRPassNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.black,
    card: colors.black,
    primary: colors.purple,
    text: colors.white,
    border: colors.border,
  },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Rubik_400Regular,
    Rubik_500Medium,
    Rubik_700Bold,
    Rubik_900Black,
  });

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <AuthProvider>
      <ThemeProvider value={QRPassNavigationTheme}>
        <StatusBar style="light" />
        <AnimatedSplashOverlay />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.black },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="create-event"
            options={{ presentation: "modal" }}
          />
          <Stack.Screen name="login" options={{ presentation: "modal" }} />
          <Stack.Screen
            name="scanner"
            options={{ presentation: "fullScreenModal" }}
          />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  );
}
