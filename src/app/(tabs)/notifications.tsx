import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    MaxContentWidth,
    colors,
    radius,
    spacing,
    typography,
} from "@/constants/theme";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

type RegistrationRow = {
  id: string;
  attendee_name: string;
  status: "not_arrived" | "checked_in";
  checked_in_at: string | null;
  created_at: string;
  event_id: string;
};

type EventRow = {
  id: string;
  name: string;
  event_date: string;
};

type NotificationItem = {
  id: string;
  type: "checkin" | "registration" | "reminder";
  title: string;
  subtitle: string;
  timestamp: string;
};

function formatTimestamp(iso: string) {
  const date = new Date(iso);
  const isToday = date.toDateString() === new Date().toDateString();
  if (isToday) {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
  }).format(date);
}

type NotificationType = NotificationItem["type"];

type NotificationIconConfig = {
  name: keyof typeof Ionicons.glyphMap;
  bg: string;
  color: string;
};

const ICONS: Record<NotificationType, NotificationIconConfig> = {
  checkin: { name: "checkmark", bg: colors.neonMuted, color: colors.neon },
  registration: {
    name: "person-add-outline",
    bg: colors.purpleMuted,
    color: colors.purpleText,
  },
  reminder: {
    name: "calendar-outline",
    bg: "rgba(255,255,255,0.08)",
    color: colors.gray,
  },
};

export default function NotificationsScreen() {
  const { session, loading: authLoading } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);

  const load = useCallback(async () => {
    if (!session) {
      setItems([]);
      setLoadingItems(false);
      return;
    }
    setLoadingItems(true);

    const { data: eventsData } = await supabase
      .from("events")
      .select("id, name, event_date")
      .eq("organizer_id", session.user.id);

    const events = (eventsData ?? []) as EventRow[];
    const eventIds = events.map((e) => e.id);
    const eventById = new Map(events.map((e) => [e.id, e]));

    let registrations: RegistrationRow[] = [];
    if (eventIds.length > 0) {
      const { data: regsData } = await supabase
        .from("registrations")
        .select(
          "id, attendee_name, status, checked_in_at, created_at, event_id",
        )
        .in("event_id", eventIds)
        .order("created_at", { ascending: false })
        .limit(50);
      registrations = (regsData ?? []) as RegistrationRow[];
    }

    const notifications: NotificationItem[] = [];

    for (const reg of registrations) {
      const event = eventById.get(reg.event_id);
      notifications.push({
        id: `reg-${reg.id}`,
        type: "registration",
        title: "Nova inscrição",
        subtitle: `${reg.attendee_name} se inscreveu${event ? ` em ${event.name}` : ""}`,
        timestamp: reg.created_at,
      });
      if (reg.status === "checked_in" && reg.checked_in_at) {
        notifications.push({
          id: `checkin-${reg.id}`,
          type: "checkin",
          title: "Check-in confirmado",
          subtitle: `${reg.attendee_name} chegou${event ? ` ao ${event.name}` : ""}`,
          timestamp: reg.checked_in_at,
        });
      }
    }

    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    for (const event of events) {
      const eventTime = new Date(event.event_date).getTime();
      const hoursUntil = eventTime - now;
      if (hoursUntil > 0 && hoursUntil <= oneDay) {
        notifications.push({
          id: `reminder-${event.id}`,
          type: "reminder",
          title: "Lembrete de evento",
          subtitle: `${event.name} é em menos de 24h`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    notifications.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    setItems(notifications);
    setLoadingItems(false);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const groupLabel = useMemo(() => {
    return items.length > 0 ? "recentes" : "";
  }, [items]);

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
          <Text style={styles.eyebrow}>{groupLabel}</Text>
          <Text style={styles.title}>Notificações</Text>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          refreshing={loadingItems}
          onRefresh={load}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({ item }) => {
            const icon = ICONS[item.type];
            return (
              <View style={styles.row}>
                <View style={[styles.rowIcon, { backgroundColor: icon.bg }]}>
                  <Ionicons name={icon.name} size={16} color={icon.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                  <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                </View>
                <Text style={styles.rowTime}>
                  {formatTimestamp(item.timestamp)}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            !loadingItems ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="notifications-outline"
                  size={28}
                  color={colors.grayMuted}
                />
                <Text style={styles.emptyTitle}>Nada por aqui ainda</Text>
                <Text style={styles.emptySubtitle}>
                  Inscrições e check-ins aparecem aqui em tempo real.
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
    paddingTop: spacing.md,
    gap: spacing.md,
    maxWidth: MaxContentWidth,
    width: "100%",
    alignSelf: "center",
  },
  centered: { alignItems: "center", justifyContent: "center" },
  headerRow: { gap: 2 },
  eyebrow: { ...typography.label, textTransform: "capitalize" },
  title: { ...typography.h1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 4,
    paddingVertical: spacing.sm + 4,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { ...typography.bodyMedium },
  rowSubtitle: { ...typography.caption, marginTop: 2 },
  rowTime: { ...typography.caption },
  divider: { height: 1, backgroundColor: colors.border },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingTop: spacing.xl * 2,
  },
  emptyTitle: { ...typography.h3 },
  emptySubtitle: { ...typography.caption, textAlign: "center" },
});
