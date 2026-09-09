import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
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

type StatusFilter = "all" | "active" | "closed";

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

function isEventActive(isoDate: string) {
  return new Date(isoDate).getTime() > Date.now();
}

const FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "active", label: "Ativos" },
  { key: "closed", label: "Encerrados" },
];

export default function EventsScreen() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");

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
      .order("event_date", { ascending: false });
    setEvents(data ?? []);
    setLoadingEvents(false);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents]),
  );

  const filteredEvents = useMemo(() => {
    return events.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      if (!matchesSearch) return false;

      if (filter === "all") return true;
      const active = isEventActive(item.event_date);
      return filter === "active" ? active : !active;
    });
  }, [events, search, filter]);

  if (authLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.centered]}>
          <ActivityIndicator color={colors.purple} />
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
            <Text style={styles.title}>Eventos</Text>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={16} color={colors.grayMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Buscar evento"
            placeholderTextColor={colors.grayMuted}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons
                name="close-circle"
                size={16}
                color={colors.grayMuted}
              />
            </Pressable>
          )}
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map((item) => {
            const isActive = filter === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => setFilter(item.key)}
                style={[styles.filterPill, isActive && styles.filterPillActive]}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    isActive && styles.filterLabelActive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <FlatList
          style={{ width: "100%" }}
          data={filteredEvents}
          keyExtractor={(item) => item.id}
          refreshing={loadingEvents}
          onRefresh={loadEvents}
          contentContainerStyle={{
            gap: spacing.md,
            paddingBottom: BottomTabInset + spacing.xl,
          }}
          renderItem={({ item }) => {
            const active = isEventActive(item.event_date);
            return (
              <EventCard
                name={item.name}
                date={formatEventDate(item.event_date)}
                location={item.location ?? undefined}
                statusLabel={active ? "Ativo" : "Encerrado"}
                statusVariant={active ? "neon" : "gray"}
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
                  name={search ? "search" : "ticket-outline"}
                  size={28}
                  color={colors.grayMuted}
                />
                <Text style={styles.emptyTitle}>
                  {search ? "Nenhum resultado" : "Nenhum evento aqui"}
                </Text>
                <Text style={styles.emptySubtitle}>
                  {search
                    ? "Tente buscar por outro nome."
                    : "Eventos desse filtro aparecem aqui."}
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.white,
    padding: 0,
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
  },
  filterPillActive: {
    backgroundColor: colors.purpleMuted,
  },
  filterLabel: { ...typography.caption, color: colors.gray },
  filterLabelActive: {
    color: colors.purpleText,
    fontFamily: typography.bodyMedium.fontFamily,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingTop: spacing.xl * 2,
  },
  emptyTitle: { ...typography.h3 },
  emptySubtitle: { ...typography.caption, textAlign: "center" },
});
