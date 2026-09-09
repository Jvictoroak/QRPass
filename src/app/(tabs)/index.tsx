import { Ionicons } from "@expo/vector-icons";
import { Link, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { EventCard } from "@/components/event-card";
import {
  BottomTabInset,
  MaxContentWidth,
  colors,
  radius,
  spacing,
  typography,
} from "@/constants/theme";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

type EventItem = {
  id: string;
  name: string;
  event_date: string;
  location: string | null;
};

function formatEventDate(isoDate: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

function getEventStatus(isoDate: string): {
  label: string;
  variant: "neon" | "gray";
} {
  const isUpcoming = new Date(isoDate).getTime() > Date.now();
  return isUpcoming
    ? { label: "Próximo", variant: "neon" }
    : { label: "Encerrado", variant: "gray" };
}

export default function HomeScreen() {
  const router = useRouter();
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

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents]),
  );

  if (authLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.centered]}>
          <ActivityIndicator color={colors.purple} />
        </SafeAreaView>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.heroSection}>
            <Text style={styles.heroTitle}>QRPass</Text>
            <Text style={styles.heroSubtitle}>
              Faça login para gerenciar seus eventos.
            </Text>
            <Link href="/login" asChild>
              <Pressable style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Entrar</Text>
              </Pressable>
            </Link>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>
              {events.length} {events.length === 1 ? "evento" : "eventos"}
            </Text>
            <Text style={styles.title}>Seus eventos</Text>
          </View>
        </View>

        <FlatList
          style={{ width: "100%" }}
          data={events}
          keyExtractor={(item) => item.id}
          refreshing={loadingEvents}
          onRefresh={loadEvents}
          contentContainerStyle={{
            gap: spacing.md,
            paddingBottom: BottomTabInset + spacing.xl,
          }}
          renderItem={({ item }) => {
            const status = getEventStatus(item.event_date);
            return (
              <EventCard
                name={item.name}
                date={formatEventDate(item.event_date)}
                location={item.location ?? undefined}
                statusLabel={status.label}
                statusVariant={status.variant}
                backdropColor={colors.black}
                onPress={() =>
                  router.push({
                    pathname: "/event/[id]",
                    params: { id: item.id },
                  })
                }
              />
            );
          }}
          ListEmptyComponent={
            !loadingEvents ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="calendar-outline"
                  size={28}
                  color={colors.grayMuted}
                />
                <Text style={styles.emptyTitle}>Nenhum evento ainda</Text>
                <Text style={styles.emptySubtitle}>
                  Toque em + para criar o primeiro.
                </Text>
              </View>
            ) : null
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    maxWidth: MaxContentWidth,
    width: "100%",
    alignSelf: "center",
  },
  centered: { alignItems: "center", justifyContent: "center" },
  heroSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    gap: spacing.md,
  },
  heroTitle: { ...typography.h1, fontSize: 32 },
  heroSubtitle: { ...typography.body, color: colors.gray, textAlign: "center" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: spacing.md,
  },
  eyebrow: { ...typography.label, marginBottom: 2 },
  title: { ...typography.h1 },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: colors.neon,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    borderRadius: radius.pill,
  },
  primaryButtonText: { ...typography.bodyMedium, color: colors.black },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingTop: spacing.xl * 2,
  },
  emptyTitle: { ...typography.h3 },
  emptySubtitle: { ...typography.caption, textAlign: "center" },
  devLink: { paddingVertical: spacing.sm, alignItems: "center" },
  devLinkText: { ...typography.caption, color: colors.grayMuted },
});
