import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

export default function CreateEvent() {
  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name || !eventDate) {
      Alert.alert("Missing info", "Name and date are required.");
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from("events")
      .insert({ name, event_date: eventDate, location })
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

      <TextInput
        placeholder="Date (YYYY-MM-DD)"
        placeholderTextColor="#888"
        value={eventDate}
        onChangeText={setEventDate}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 8,
          padding: 12,
          color: "#000",
        }}
      />

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
