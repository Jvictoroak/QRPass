import { Badge } from "@/components/badge";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type EventData = {
  id: string;
  name: string;
  event_date: string;
  location: string | null;
  organizer_id: string;
};

type Registration = {
  id: string;
  attendee_name: string;
  status: "not_arrived" | "checked_in";
  checked_in_at: string | null;
};

function formatEventDate(isoDate?: string) {
  if (!isoDate) return "";
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
}

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, loading: authLoading } = useAuth();
  const [event, setEvent] = useState<EventData | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  async function handleShareLink() {
    const url = Linking.createURL(`/register/${id}`);

    try {
      await Share.share({
        message: `Você foi convidado para o evento "${event?.name}"! Inscreva-se aqui: ${url}`,
      });
    } catch (error) {
      console.log("Erro ao compartilhar:", error);
    }
  }

  const loadData = useCallback(async () => {
    const { data: eventData } = await supabase
      .from("events")
      .select("id, name, event_date, location, organizer_id")
      .eq("id", id)
      .single();
    setEvent(eventData);

    const { data: regData } = await supabase
      .from("registrations")
      .select("id, attendee_name, status, checked_in_at")
      .eq("event_id", id)
      .order("attendee_name");
    setRegistrations(regData ?? []);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!id) return;

    const channel = supabase
      .channel(`registrations-event-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "registrations",
          filter: `event_id=eq.${id}`,
        },
        () => {
          loadData();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, loadData]);

  const isLoading = loading || authLoading;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.center]}>
          <ActivityIndicator color={colors.purple} />
        </SafeAreaView>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.center]}>
          <Ionicons
            name="alert-circle-outline"
            size={28}
            color={colors.grayMuted}
          />
          <Text style={styles.restrictedTitle}>Evento não encontrado</Text>
          <Pressable
            onPress={() => router.replace("/")}
            style={styles.restrictedButton}
          >
            <Text style={styles.restrictedButtonText}>Voltar</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  const isOwner = session?.user.id === event.organizer_id;

  if (!isOwner) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.center]}>
          <Ionicons
            name="lock-closed-outline"
            size={28}
            color={colors.grayMuted}
          />
          <Text style={styles.restrictedTitle}>Acesso restrito</Text>
          <Text style={styles.restrictedText}>
            Só o organizador deste evento pode ver esta página.
          </Text>
          <Pressable
            onPress={() => router.replace("/")}
            style={styles.restrictedButton}
          >
            <Text style={styles.restrictedButtonText}>Voltar para a Home</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  const checkedInCount = registrations.filter(
    (r) => r.status === "checked_in",
  ).length;
  const totalCount = registrations.length;
  const progress = totalCount > 0 ? checkedInCount / totalCount : 0;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={styles.iconButton}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={20} color={colors.white} />
          </Pressable>
          <Pressable
            onPress={handleShareLink}
            style={styles.iconButton}
            hitSlop={8}
          >
            <Ionicons name="share-outline" size={18} color={colors.white} />
          </Pressable>
        </View>

        <View style={styles.header}>
          <Text style={styles.eventName}>{event.name}</Text>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={colors.gray} />
            <Text style={styles.eventInfo}>
              {formatEventDate(event.event_date)}
            </Text>
          </View>
          {event.location ? (
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color={colors.gray} />
              <Text style={styles.eventInfo}>{event.location}</Text>
            </View>
          ) : null}

          <View style={styles.counterBox}>
            <View style={styles.counterTextRow}>
              <Text style={styles.counterText}>
                {checkedInCount} de {totalCount} chegaram
              </Text>
              <Text style={styles.counterPercent}>
                {totalCount > 0 ? Math.round(progress * 100) : 0}%
              </Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${progress * 100}%` }]}
              />
            </View>
          </View>

          <Pressable
            onPress={() => router.push("/scanner")}
            style={styles.scannerButton}
          >
            <Ionicons name="qr-code-outline" size={18} color={colors.black} />
            <Text style={styles.scannerButtonText}>Abrir scanner</Text>
          </Pressable>
        </View>

        <FlatList
          data={registrations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.rowName}>{item.attendee_name}</Text>
              <Badge
                label={item.status === "checked_in" ? "Chegou" : "Não chegou"}
                variant={item.status === "checked_in" ? "neon" : "gray"}
              />
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons
                name="people-outline"
                size={28}
                color={colors.grayMuted}
              />
              <Text style={styles.emptyTitle}>Nenhuma inscrição ainda</Text>
              <Text style={styles.emptySubtitle}>
                Compartilhe o link pra receber as primeiras.
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  safeArea: { flex: 1 },
  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  restrictedTitle: { ...typography.h2 },
  restrictedText: {
    ...typography.body,
    color: colors.gray,
    textAlign: "center",
  },
  restrictedButton: {
    marginTop: spacing.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    borderRadius: radius.pill,
  },
  restrictedButtonText: { ...typography.bodyMedium },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: 4,
  },
  eventName: { ...typography.h1, fontSize: 24 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  eventInfo: { ...typography.body, color: colors.gray },
  counterBox: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  counterTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  counterText: { ...typography.bodyMedium },
  counterPercent: { ...typography.bodyMedium, color: colors.neon },
  progressTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceElevated,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.neon,
    borderRadius: radius.pill,
  },
  scannerButton: {
    marginTop: spacing.sm + 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.neon,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  scannerButtonText: { ...typography.bodyMedium, color: colors.black },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: spacing.sm + 4,
  },
  rowName: { ...typography.body, color: colors.white },
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
