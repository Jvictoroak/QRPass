import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

export default function CreateEvent() {
  const { session, loading: authLoading } = useAuth();
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) {
      router.push("/login");
    }
  }, [authLoading, session]);

  async function handleCreate() {
    if (!name || !eventDate) {
      Alert.alert("Missing info", "Name and date are required.");
      return;
    }
    if (!session) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .insert({
        name,
        event_date: eventDate,
        location,
        organizer_id: session.user.id,
      })
      .select()
      .single();
    setLoading(false);

    if (error) {
      Alert.alert("Error", error.message);
      return;
    }

    Alert.alert("Success", `Event created: ${data.name}`);
    router.push("/");
  }

  if (authLoading || !session) {
    return null;
  }

  function formatDateDisplay(date: Date) {
    return date.toLocaleDateString("pt-BR");
  }

  function formatDateISO(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        gap: 12,
        justifyContent: "center",
        backgroundColor: "#fff",
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#000" }}>
        Create Event
      </Text>

      <TextInput
        placeholder="Event name"
        placeholderTextColor="#888"
        value={name}
        onChangeText={setName}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 12,
          color: "#000",
        }}
      />

      <Pressable
        onPress={() => setShowDatePicker(true)}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 12,
        }}
      >
        <Text style={{ color: eventDate ? "#000" : "#888" }}>
          {eventDate ? formatDateDisplay(eventDate) : "Data do evento"}
        </Text>
      </Pressable>

      {showDatePicker && (
        <DateTimePicker
          value={eventDate ?? new Date()}
          mode="date"
          display="spinner"
          minimumDate={new Date()}
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);

            if (selectedDate) {
              setEventDate(selectedDate);
            }
          }}
        />
      )}

      <TextInput
        placeholder="Location (optional)"
        placeholderTextColor="#888"
        value={location}
        onChangeText={setLocation}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 12,
          color: "#000",
        }}
      />

      <Pressable
        onPress={handleCreate}
        disabled={loading}
        style={{
          backgroundColor: "#000",
          padding: 14,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          {loading ? "Creating..." : "Create Event"}
        </Text>
      </Pressable>
    </View>
  );
}
