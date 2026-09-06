import { supabase } from "@/lib/supabase";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

export default function Login() {
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSendCode() {
    if (!email) {
      Alert.alert("E-mail obrigatório", "Digite seu e-mail para continuar.");
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
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });
    setLoading(false);
    if (error) {
      Alert.alert("Código inválido", error.message);
      return;
    }
    router.back();
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
        {step === "email" ? "Entrar" : "Digite o código"}
      </Text>

      {step === "email" ? (
        <>
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
              {loading ? "Enviando..." : "Enviar código"}
            </Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={{ color: "#555" }}>Enviamos um código para {email}</Text>
          <TextInput
            placeholder="Código de 6 dígitos"
            placeholderTextColor="#888"
            value={code}
            onChangeText={setCode}
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
              {loading ? "Verificando..." : "Confirmar"}
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
