import { supabase } from "@/lib/supabase";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Pressable,
    Text,
    TextInput,
    View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";

type Step = "loading-event" | "form" | "otp" | "success";

export default function Register() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();

  const [step, setStep] = useState<Step>("loading-event");
  const [event, setEvent] = useState<any>(null);

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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 20,
        gap: 16,
        justifyContent: "center",
        backgroundColor: "#fff",
      }}
    >
      {event && (
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#000" }}>
            {event.name}
          </Text>
          <Text style={{ color: "#555" }}>{event.event_date}</Text>
          {event.location ? (
            <Text style={{ color: "#555" }}>{event.location}</Text>
          ) : null}
        </View>
      )}

      {step === "form" && (
        <>
          <TextInput
            placeholder="Seu nome"
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
            placeholder="Seu e-mail"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 12,
              color: "#000",
            }}
          />
          <Pressable
            onPress={handleSendCode}
            disabled={loading}
            style={{
              backgroundColor: "#000",
              padding: 14,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              {loading ? "Enviando..." : "Confirmar inscrição"}
            </Text>
          </Pressable>
        </>
      )}

      {step === "otp" && (
        <>
          <Text style={{ color: "#000" }}>
            Enviamos um código para {email}. Digite abaixo para confirmar:
          </Text>
          <TextInput
            placeholder="Código de 6 dígitos"
            placeholderTextColor="#888"
            value={otpCode}
            onChangeText={setOtpCode}
            keyboardType="number-pad"
            style={{
              borderWidth: 1,
              borderColor: "#ccc",
              borderRadius: 8,
              padding: 12,
              color: "#000",
            }}
          />
          <Pressable
            onPress={handleVerifyCode}
            disabled={loading}
            style={{
              backgroundColor: "#000",
              padding: 14,
              borderRadius: 8,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              {loading ? "Verificando..." : "Verificar código"}
            </Text>
          </Pressable>
        </>
      )}

      {step === "success" && (
        <View style={{ alignItems: "center", gap: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#000" }}>
            Inscrição confirmada! ✅
          </Text>
          <QRCode value={registrationCode} size={220} />
          <Text style={{ color: "#555", textAlign: "center" }}>
            Apresente este QR code na entrada do evento.
          </Text>
        </View>
      )}
    </View>
  );
}
