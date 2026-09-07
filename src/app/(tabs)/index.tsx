import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { WebBadge } from "@/components/web-badge";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

type EventItem = {
  id: string;
  name: string;
  event_date: string;
  location: string | null;
};

export default function HomeScreen() {
  const { session, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const loadEvents = useCallback(async () => {
    if (!session) {
      setEvents([]);
      setLoadingEvents(false);
      return;
    }
    setLoadingEvents(true);
    const { data } = await supabase
      .from("events")
      .select("id, name, event_date, location")
      .eq("organizer_id", session.user.id)
      .order("event_date", { ascending: true });
    setEvents(data ?? []);
    setLoadingEvents(false);
  }, [session]);

  // Recarrega toda vez que a tela ganha foco (ex: ao voltar de criar um evento)
  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents]),
  );

  if (authLoading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} />
      </ThemedView>
    );
  }

  if (!session) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedView style={styles.heroSection}>
            <ThemedText type="title">QRPASS</ThemedText>
            <ThemedText>Faça login para gerenciar seus eventos.</ThemedText>
            <Link href="/login" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Entrar</Text>
              </Pressable>
            </Link>
          </ThemedView>
          {Platform.OS === "web" && <WebBadge />}
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <ThemedText type="title">Meus Eventos</ThemedText>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Link href="/create-event" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>+ Criar Evento</Text>
              </Pressable>
            </Link>
            <Pressable
              onPress={() => supabase.auth.signOut()}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Sair</Text>
            </Pressable>
          </View>
        </View>
        <FlatList
          style={{ width: "100%" }}
          data={events}
          keyExtractor={(item) => item.id}
          refreshing={loadingEvents}
          onRefresh={loadEvents}
          contentContainerStyle={{ gap: 8, paddingBottom: BottomTabInset }}
          renderItem={({ item }) => (
            <Link
              href={{ pathname: "/event/[id]", params: { id: item.id } }}
              asChild
            >
              <Pressable style={styles.eventCard}>
                <Text style={styles.eventName}>{item.name}</Text>
                <Text style={styles.eventInfo}>{item.event_date}</Text>
                {item.location ? (
                  <Text style={styles.eventInfo}>{item.location}</Text>
                ) : null}
              </Pressable>
            </Link>
          )}
          ListEmptyComponent={
            !loadingEvents ? (
              <ThemedText style={{ textAlign: "center", marginTop: 40 }}>
                Você ainda não criou nenhum evento.
              </ThemedText>
            ) : null
          }
        />

        {Platform.OS === "web" && <WebBadge />}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    maxWidth: MaxContentWidth,
    width: "100%",
    alignSelf: "center",
  },
  heroSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: Spacing.four,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.three,
    flexWrap: "wrap",
    gap: 8,
  },
  primaryButton: {
    backgroundColor: "#000",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexShrink: 0,
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  eventCard: {
    backgroundColor: "#f2f2f2",
    padding: 14,
    borderRadius: 10,
    gap: 2,
  },
  eventName: { fontWeight: "700", fontSize: 16, color: "#000" },
  eventInfo: { color: "#555" },
  secondaryButton: {
    backgroundColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
  },
});
