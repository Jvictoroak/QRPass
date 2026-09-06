import * as Device from "expo-device";
import { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AnimatedIcon } from "@/components/animated-icon";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { WebBadge } from "@/components/web-badge";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Link } from "expo-router";

function getDevMenuHint() {
  if (Platform.OS === "web") {
    return <ThemedText type="small">use browser devtools</ThemedText>;
  }
  if (Device.isDevice) {
    return (
      <ThemedText type="small">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }
  const shortcut = Platform.OS === "android" ? "cmd+m (or ctrl+m)" : "cmd+d";
  return (
    <ThemedText type="small">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}

export default function HomeScreen() {
  const [connectionStatus, setConnectionStatus] = useState("testing...");

  useEffect(() => {
    async function testConnection() {
      const { error } = await supabase.from("events").select("id").limit(1);
      if (error) {
        setConnectionStatus(`error: ${error.message}`);
      } else {
        setConnectionStatus("connected ✅");
      }
    }
    testConnection();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.heroSection}>
          <AnimatedIcon />
          <ThemedText type="title" style={styles.title}>
            QRPASS
          </ThemedText>
        </ThemedView>

        <Link href="/create-event">
          <ThemedText>Create Event</ThemedText>
        </Link>

        <Link
          href={{
            pathname: "/register/[eventId]",
            params: { eventId: "bd29582e-2a24-4454-9499-50a6cca84072" },
          }}
        >
          <ThemedText>Testar Inscrição</ThemedText>
        </Link>
        <Link
          href={{
            pathname: "/event/[id]",
            params: { id: "bd29582e-2a24-4454-9499-50a6cca84072" },
          }}
        >
          <ThemedText>Ver Detalhe do Evento</ThemedText>
        </Link>

        <Pressable onPress={() => supabase.auth.signOut()}>
          <ThemedText>Sair (teste)</ThemedText>
        </Pressable>

        {Platform.OS === "web" && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: "center",
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: "center",
  },
  code: {
    textTransform: "uppercase",
  },
  stepContainer: {
    gap: Spacing.three,
    alignSelf: "stretch",
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
    borderRadius: Spacing.four,
  },
});
