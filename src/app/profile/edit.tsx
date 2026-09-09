// app/profile/edit.tsx
import { DateField } from "@/components/date-field";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
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

export default function EditProfile() {
  const { session } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!session) {
      setLoadingProfile(false);
      return;
    }
    setLoadingProfile(true);
    const { data } = await supabase
      .from("profiles")
      .select("first_name, last_name, birth_date")
      .eq("id", session.user.id)
      .single();

    if (data) {
      setFirstName(data.first_name ?? "");
      setLastName(data.last_name ?? "");
      setBirthDate(data.birth_date ? new Date(data.birth_date) : null);
    }
    setLoadingProfile(false);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  function formatDateISO(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  async function handleSave() {
    if (!session) return;
    if (!firstName || !lastName || !birthDate) {
      Alert.alert(
        "Campos obrigatórios",
        "Preencha nome, sobrenome e data de nascimento.",
      );
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName,
        last_name: lastName,
        birth_date: formatDateISO(birthDate),
      })
      .eq("id", session.user.id);
    setSaving(false);

    if (error) {
      Alert.alert("Erro ao salvar", error.message);
      return;
    }

    router.back();
  }

  if (loadingProfile) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.center]}>
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
            style={styles.iconButton}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={20} color={colors.white} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Editar perfil</Text>

          <View style={styles.inputWrap}>
            <TextInput
              placeholder="Nome"
              placeholderTextColor={colors.grayMuted}
              value={firstName}
              onChangeText={setFirstName}
              style={styles.input}
            />
          </View>

          <View style={styles.inputWrap}>
            <TextInput
              placeholder="Sobrenome"
              placeholderTextColor={colors.grayMuted}
              value={lastName}
              onChangeText={setLastName}
              style={styles.input}
            />
          </View>

          <DateField
            value={birthDate}
            onChange={setBirthDate}
            placeholder="Data de nascimento"
            maximumDate={new Date()}
          />

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
  center: { alignItems: "center", justifyContent: "center" },
  topBar: {
    flexDirection: "row",
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
  content: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm + 4,
  },
  title: { ...typography.h1, fontSize: 24, marginBottom: spacing.xs },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
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
    marginTop: spacing.sm,
  },
  primaryButtonText: {
    ...typography.bodyMedium,
    color: colors.black,
    fontSize: 15,
  },
});
