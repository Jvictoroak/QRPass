import { DateField } from "@/components/date-field";
import { colors, radius, spacing, typography } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
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

export default function Login() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [loading, setLoading] = useState(false);

  function formatDateDisplay(date: Date) {
    return date.toLocaleDateString("pt-BR");
  }
  function formatDateISO(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Campos obrigatórios", "Preencha e-mail e senha.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      Alert.alert("Erro ao entrar", error.message);
      return;
    }
    router.back();
  }

  async function handleSignup() {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !birthDate
    ) {
      Alert.alert("Campos obrigatórios", "Preencha todos os campos.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert(
        "Senhas diferentes",
        "A confirmação de senha não bate com a senha.",
      );
      return;
    }
    if (password.length < 6) {
      Alert.alert(
        "Senha curta",
        "A senha precisa ter pelo menos 6 caracteres.",
      );
      return;
    }
    const isoBirthDate = formatDateISO(birthDate);
    if (!isoBirthDate) {
      Alert.alert("Data inválida", "Use o formato DD/MM/AAAA.");
      return;
    }
    if (!termsAccepted) {
      Alert.alert(
        "Termos de uso",
        "Você precisa aceitar os termos de uso para continuar.",
      );
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error || !data.user) {
      setLoading(false);
      Alert.alert("Erro ao criar conta", error?.message ?? "Tente novamente.");
      return;
    }

    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      first_name: firstName,
      last_name: lastName,
      birth_date: formatDateISO(birthDate),
      terms_accepted_at: new Date().toISOString(),
    });

    setLoading(false);

    if (profileError) {
      Alert.alert("Erro ao salvar perfil", profileError.message);
      return;
    }

    router.back();
  }

  const isSignup = mode === "signup";

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
          <Text style={styles.title}>
            {isSignup ? "Criar conta" : "Bem-vindo de volta"}
          </Text>
          <Text style={styles.subtitle}>
            {isSignup
              ? "Preencha seus dados para começar a criar eventos."
              : "Entre para gerenciar seus eventos."}
          </Text>

          {isSignup && (
            <>
              <View style={styles.row}>
                <View style={[styles.inputWrap, { flex: 1 }]}>
                  <TextInput
                    placeholder="Nome"
                    placeholderTextColor={colors.grayMuted}
                    value={firstName}
                    onChangeText={setFirstName}
                    style={styles.input}
                  />
                </View>
                <View style={[styles.inputWrap, { flex: 1 }]}>
                  <TextInput
                    placeholder="Sobrenome"
                    placeholderTextColor={colors.grayMuted}
                    value={lastName}
                    onChangeText={setLastName}
                    style={styles.input}
                  />
                </View>
              </View>

              <DateField
                value={birthDate}
                onChange={setBirthDate}
                placeholder="Data de nascimento"
                maximumDate={new Date()}
              />
            </>
          )}

          <View style={styles.inputWrap}>
            <Ionicons name="mail-outline" size={16} color={colors.grayMuted} />
            <TextInput
              placeholder="E-mail"
              placeholderTextColor={colors.grayMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          <View style={styles.inputWrap}>
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color={colors.grayMuted}
            />
            <TextInput
              placeholder="Senha"
              placeholderTextColor={colors.grayMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
            />
          </View>

          {isSignup && (
            <>
              <View style={styles.inputWrap}>
                <Ionicons
                  name="lock-closed-outline"
                  size={16}
                  color={colors.grayMuted}
                />
                <TextInput
                  placeholder="Confirmar senha"
                  placeholderTextColor={colors.grayMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  style={styles.input}
                />
              </View>

              <Pressable
                onPress={() => setTermsAccepted(!termsAccepted)}
                style={styles.checkboxRow}
              >
                <View
                  style={[
                    styles.checkbox,
                    termsAccepted && styles.checkboxChecked,
                  ]}
                >
                  {termsAccepted && (
                    <Ionicons name="checkmark" size={13} color={colors.black} />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  Li e aceito os termos de uso
                </Text>
              </Pressable>
            </>
          )}

          <Pressable
            onPress={isSignup ? handleSignup : handleLogin}
            disabled={loading}
            style={[styles.primaryButton, loading && { opacity: 0.6 }]}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? "Aguarde..." : isSignup ? "Criar conta" : "Entrar"}
            </Text>
          </Pressable>

          <Pressable onPress={() => setMode(isSignup ? "login" : "signup")}>
            <Text style={styles.switchModeText}>
              {isSignup ? "Já tem conta? " : "Não tem conta? "}
              <Text style={styles.switchModeHighlight}>
                {isSignup ? "Entrar" : "Criar uma"}
              </Text>
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  row: { flexDirection: "row", gap: spacing.sm },
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
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.neon,
    borderColor: colors.neon,
  },
  checkboxLabel: { ...typography.body, color: colors.gray, flex: 1 },
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
  switchModeText: {
    ...typography.body,
    color: colors.gray,
    textAlign: "center",
    marginTop: spacing.xs,
  },
  switchModeHighlight: {
    color: colors.purpleText,
    fontFamily: typography.bodyMedium.fontFamily,
  },
});
