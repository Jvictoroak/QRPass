// app/event/edit/[id].tsx
import { DateField } from "@/components/date-field";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
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

export default function EditEvent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session, loading: authLoading } = useAuth();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(true);

  const [name, setName] = useState("");
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const loadEvent = useCallback(async () => {
    setLoadingEvent(true);
    const { data } = await supabase
      .from("events")
      .select("id, name, event_date, location, organizer_id")
      .eq("id", id)
      .single();

    if (data) {
      setEvent(data);
      setName(data.name);
      setEventDate(new Date(data.event_date));
      setLocation(data.location ?? "");
    }
    setLoadingEvent(false);
  }, [id]);

  useEffect(() => {
    loadEvent();
  }, [loadEvent]);

  async function handleSave() {
    if (!name || !eventDate) {
      Alert.alert("Campos obrigatórios", "Nome e data são obrigatórios.");
      return;
    }
    if (!session || !event) return;

    setSaving(true);
    const { error } = await supabase
      .from("events")
      .update({
        name,
        event_date: eventDate,
        location,
      })
      .eq("id", event.id);
    setSaving(false);

    if (error) {
      Alert.alert("Erro ao salvar", error.message);
      return;
    }

    router.back();
  }

  const isLoading = loadingEvent || authLoading;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.centered]}>
          <ActivityIndicator color={colors.purple} />
        </SafeAreaView>
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.centered]}>
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
        <SafeAreaView style={[styles.safeArea, styles.centered]}>
          <Ionicons
            name="lock-closed-outline"
            size={28}
            color={colors.grayMuted}
          />
          <Text style={styles.restrictedTitle}>Acesso restrito</Text>
          <Text style={styles.restrictedText}>
            Só o organizador deste evento pode editá-lo.
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.black }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={styles.closeButton}
            hitSlop={8}
          >
            <Ionicons name="close" size={20} color={colors.white} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Editar evento</Text>

          <View style={styles.inputWrap}>
            <Ionicons
              name="pricetag-outline"
              size={16}
              color={colors.grayMuted}
            />
            <TextInput
              placeholder="Nome do evento"
              placeholderTextColor={colors.grayMuted}
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
          </View>

          <DateField
            value={eventDate}
            onChange={setEventDate}
            placeholder="Data do evento"
          />

          <View style={styles.inputWrap}>
            <Ionicons
              name="location-outline"
              size={16}
              color={colors.grayMuted}
            />
            <TextInput
              placeholder="Local (opcional)"
              placeholderTextColor={colors.grayMuted}
              value={location}
              onChangeText={setLocation}
              style={styles.input}
            />
          </View>

          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[styles.primaryButton, saving && { opacity: 0.6 }]}
          >
            <Text style={styles.primaryButtonText}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  safeArea: { flex: 1 },
  centered: {
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
    justifyContent: "flex-end",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm + 4,
  },
  title: { ...typography.h1, fontSize: 26 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 50,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.white,
    padding: 0,
  },
  primaryButton: {
    backgroundColor: colors.neon,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: "center",
    marginTop: spacing.xs,
  },
  primaryButtonText: {
    ...typography.bodyMedium,
    color: colors.black,
    fontSize: 15,
  },
});
