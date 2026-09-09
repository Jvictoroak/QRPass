import { DateField } from "@/components/date-field";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
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
      Alert.alert("Campos obrigatórios", "Nome e data são obrigatórios.");
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
      Alert.alert("Erro", error.message);
      return;
    }

    Alert.alert("Sucesso", `Evento criado: ${data.name}`);
    router.push("/");
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

  if (authLoading || !session) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.centered]}>
          <ActivityIndicator color={colors.purple} />
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
          <Text style={styles.title}>Criar evento</Text>
          <Text style={styles.subtitle}>
            Preencha os dados principais. Você pode editar depois.
          </Text>

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
            minimumDate={new Date()}
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
            onPress={handleCreate}
            disabled={loading}
            style={[styles.primaryButton, loading && { opacity: 0.6 }]}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "Criando..." : "Criar evento"}
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
  centered: { alignItems: "center", justifyContent: "center" },
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
  subtitle: {
    ...typography.body,
    color: colors.gray,
    marginTop: -4,
    marginBottom: spacing.xs,
  },
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
