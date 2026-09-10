import { colors, radius, spacing, typography } from "@/constants/theme";
import { supabasePublic as supabase } from "@/lib/supabase-public";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
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
import QRCode from "react-native-qrcode-svg";
import { SafeAreaView } from "react-native-safe-area-context";

type Step = "loading-event" | "form" | "otp" | "success";

type EventData = {
  id: string;
  name: string;
  event_date: string;
  location: string | null;
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

const STEP_ORDER: Step[] = ["form", "otp", "success"];

export default function Register() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  const [step, setStep] = useState<Step>("loading-event");
  const [event, setEvent] = useState<EventData | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [registrationCode, setRegistrationCode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadEvent() {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error || !data) {
        Alert.alert("Erro", "Evento não encontrado.");
        return;
      }
      setEvent(data);
      setStep("form");
    }
    if (eventId) loadEvent();
  }, [eventId]);

  async function handleSendCode() {
    if (!name || !email) {
      Alert.alert("Campos obrigatórios", "Preencha nome e e-mail.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);

    if (error) {
      Alert.alert("Erro", error.message);
      return;
    }

    setStep("otp");
  }

  async function handleVerifyCode() {
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: "email",
    });

    if (authError || !authData.session) {
      setLoading(false);
      Alert.alert("Código inválido", authError?.message ?? "Tente novamente.");
      return;
    }

    const userId = authData.session.user.id;

    const { data: existing, error: existingError } = await supabase
      .from("registrations")
      .select("*")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingError) {
      setLoading(false);
      Alert.alert("Erro", existingError.message);
      return;
    }

    if (existing) {
      setLoading(false);
      setRegistrationCode(existing.code);
      setStep("success");
      return;
    }

    const { data: registration, error: regError } = await supabase
      .from("registrations")
      .insert({
        event_id: eventId,
        attendee_name: name,
        email,
        user_id: userId,
      })
      .select()
      .single();

    setLoading(false);

    if (regError) {
      Alert.alert("Erro ao inscrever", regError.message);
      return;
    }

    setRegistrationCode(registration.code);
    setStep("success");
  }

  if (step === "loading-event") {
    return (
      <View style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.center]}>
          <ActivityIndicator color={colors.purple} />
        </SafeAreaView>
      </View>
    );
  }

  const currentStepIndex = STEP_ORDER.indexOf(step);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.black }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {step !== "success" && (
            <View style={styles.stepRow}>
              {STEP_ORDER.slice(0, 2).map((s, index) => (
                <View
                  key={s}
                  style={[
                    styles.stepDot,
                    index <= currentStepIndex && styles.stepDotActive,
                  ]}
                />
              ))}
            </View>
          )}

          {event && step !== "success" && (
            <View style={styles.eventHeader}>
              <Text style={styles.eventName}>{event.name}</Text>
              <View style={styles.metaRow}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={colors.gray}
                />
                <Text style={styles.eventInfo}>
                  {formatEventDate(event.event_date)}
                </Text>
              </View>
              {event.location ? (
                <View style={styles.metaRow}>
                  <Ionicons
                    name="location-outline"
                    size={14}
                    color={colors.gray}
                  />
                  <Text style={styles.eventInfo}>{event.location}</Text>
                </View>
              ) : null}
            </View>
          )}

          {step === "form" && (
            <View style={styles.formGroup}>
              <Text style={styles.title}>Confirme sua inscrição</Text>

              <View style={styles.inputWrap}>
                <Ionicons
                  name="person-outline"
                  size={16}
                  color={colors.grayMuted}
                />
                <TextInput
                  placeholder="Seu nome"
                  placeholderTextColor={colors.grayMuted}
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputWrap}>
                <Ionicons
                  name="mail-outline"
                  size={16}
                  color={colors.grayMuted}
                />
                <TextInput
                  placeholder="Seu e-mail"
                  placeholderTextColor={colors.grayMuted}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                />
              </View>

              <Pressable
                onPress={handleSendCode}
                disabled={loading}
                style={[styles.primaryButton, loading && { opacity: 0.6 }]}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? "Enviando..." : "Confirmar inscrição"}
                </Text>
              </Pressable>
            </View>
          )}

          {step === "otp" && (
            <View style={styles.formGroup}>
              <Text style={styles.title}>Verifique seu e-mail</Text>
              <Text style={styles.subtitle}>
                Enviamos um código para {email}. Digite abaixo para confirmar:
              </Text>
              <View style={styles.inputWrap}>
                <Ionicons
                  name="key-outline"
                  size={16}
                  color={colors.grayMuted}
                />
                <TextInput
                  placeholder="Código de 6 dígitos"
                  placeholderTextColor={colors.grayMuted}
                  value={otpCode}
                  onChangeText={setOtpCode}
                  keyboardType="number-pad"
                  style={styles.input}
                />
              </View>
              <Pressable
                onPress={handleVerifyCode}
                disabled={loading}
                style={[styles.primaryButton, loading && { opacity: 0.6 }]}
              >
                <Text style={styles.primaryButtonText}>
                  {loading ? "Verificando..." : "Verificar código"}
                </Text>
              </Pressable>
            </View>
          )}

          {step === "success" && (
            <View style={styles.successWrap}>
              <View style={styles.successBadge}>
                <Ionicons name="checkmark" size={22} color={colors.neon} />
              </View>
              <Text style={styles.successTitle}>Inscrição confirmada</Text>
              <Text style={styles.subtitle}>
                Apresente este QR code na entrada do evento.
              </Text>

              <View style={styles.ticketCard}>
                <Text style={styles.ticketEventName}>{event?.name}</Text>
                <Text style={styles.ticketAttendee}>{name}</Text>
                <View style={styles.ticketDivider}>
                  <View style={[styles.notch, styles.notchLeft]} />
                  <View style={[styles.notch, styles.notchRight]} />
                </View>
                <View style={styles.qrWrap}>
                  <QRCode value={registrationCode} size={200} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  safeArea: { flex: 1, backgroundColor: colors.black },
  center: { alignItems: "center", justifyContent: "center" },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.lg,
  },
  stepRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.sm,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceElevated,
  },
  stepDotActive: { backgroundColor: colors.neon },
  eventHeader: {
    alignItems: "center",
    gap: 4,
  },
  eventName: { ...typography.h2, textAlign: "center" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  eventInfo: { ...typography.body, color: colors.gray },
  formGroup: { gap: spacing.sm + 4 },
  title: { ...typography.h1, fontSize: 22, textAlign: "center" },
  subtitle: {
    ...typography.body,
    color: colors.gray,
    textAlign: "center",
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
  successWrap: { alignItems: "center", gap: spacing.sm },
  successBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    backgroundColor: colors.neonMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  successTitle: { ...typography.h1, fontSize: 22 },
  ticketCard: {
    marginTop: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    padding: spacing.lg,
    alignItems: "center",
    width: "100%",
    maxWidth: 320,
  },
  ticketEventName: {
    ...typography.h3,
    color: colors.black,
    textAlign: "center",
  },
  ticketAttendee: {
    ...typography.body,
    color: "#555",
    marginTop: 2,
    marginBottom: spacing.sm,
  },
  ticketDivider: {
    width: "100%",
    borderTopWidth: 2,
    borderStyle: "dashed",
    borderColor: "#E4E4E7",
    marginVertical: spacing.sm,
  },
  notch: {
    position: "absolute",
    top: -9,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.black,
  },
  notchLeft: { left: -spacing.lg - 9 },
  notchRight: { right: -spacing.lg - 9 },
  qrWrap: {
    marginTop: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.white,
  },
});
