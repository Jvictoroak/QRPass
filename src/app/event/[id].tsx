import { supabase } from "@/lib/supabase";
import { Link, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

type Registration = {
  id: string;
  attendee_name: string;
  status: "not_arrived" | "checked_in";
  checked_in_at: string | null;
};

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const { data: eventData } = await supabase
      .from("events")
      .select("*")
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

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const checkedInCount = registrations.filter(
    (r) => r.status === "checked_in",
  ).length;
  const totalCount = registrations.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eventName}>{event?.name}</Text>
        <Text style={styles.eventInfo}>{event?.event_date}</Text>
        {event?.location ? (
          <Text style={styles.eventInfo}>{event.location}</Text>
        ) : null}

        <View style={styles.counterBox}>
          <Text style={styles.counterText}>
            {checkedInCount} de {totalCount} chegaram
          </Text>
        </View>

        <Link href="/(tabs)/scanner" asChild>
          <Pressable style={styles.scannerButton}>
            <Text style={styles.scannerButtonText}>Abrir Scanner</Text>
          </Pressable>
        </Link>
      </View>

      <FlatList
        data={registrations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rowName}>{item.attendee_name}</Text>
            <Text
              style={[
                styles.badge,
                item.status === "checked_in"
                  ? styles.badgeSuccess
                  : styles.badgePending,
              ]}
            >
              {item.status === "checked_in" ? "Chegou" : "Não chegou"}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#888", marginTop: 20 }}>
            Nenhuma inscrição ainda.
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    padding: 20,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  eventName: { fontSize: 22, fontWeight: "bold", color: "#000" },
  eventInfo: { color: "#555" },
  counterBox: {
    marginTop: 10,
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 8,
  },
  counterText: { fontWeight: "600", color: "#000", textAlign: "center" },
  scannerButton: {
    marginTop: 10,
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  scannerButtonText: { color: "#fff", fontWeight: "600" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  rowName: { color: "#000", fontSize: 16 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "600",
    overflow: "hidden",
  },
  badgeSuccess: { backgroundColor: "#d4edda", color: "#155724" },
  badgePending: { backgroundColor: "#f8d7da", color: "#721c24" },
});
