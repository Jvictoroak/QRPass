import { supabase } from "@/lib/supabase";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

export default function Login() {
  const [mode, setMode] = useState<"login" | "signup">("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        padding: 20,
        gap: 12,
        justifyContent: "center",
        backgroundColor: "#fff",
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: "bold", color: "#000" }}>
        {mode === "login" ? "Entrar" : "Criar conta"}
      </Text>

      {mode === "signup" && (
        <>
          <TextInput
            placeholder="Nome"
            placeholderTextColor="#888"
            value={firstName}
            onChangeText={setFirstName}
            style={inputStyle}
          />
          <TextInput
            placeholder="Sobrenome"
            placeholderTextColor="#888"
            value={lastName}
            onChangeText={setLastName}
            style={inputStyle}
          />
          <Pressable onPress={() => setShowDatePicker(true)} style={inputStyle}>
            <Text style={{ color: birthDate ? "#000" : "#888" }}>
              {birthDate ? formatDateDisplay(birthDate) : "Data de nascimento"}
            </Text>
          </Pressable>

          {showDatePicker && (
            <DateTimePicker
              value={birthDate ?? new Date(2000, 0, 1)}
              mode="date"
              display="spinner"
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setBirthDate(selectedDate);
                }
              }}
            />
          )}
        </>
      )}

      <TextInput
        placeholder="E-mail"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={inputStyle}
      />

      <TextInput
        placeholder="Senha"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={inputStyle}
      />

      {mode === "signup" && (
        <>
          <TextInput
            placeholder="Confirmar senha"
            placeholderTextColor="#888"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={inputStyle}
          />

          <Pressable
            onPress={() => setTermsAccepted(!termsAccepted)}
            style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderWidth: 1,
                borderColor: "#000",
                backgroundColor: termsAccepted ? "#000" : "#fff",
                borderRadius: 4,
              }}
            />
            <Text style={{ color: "#000", flex: 1 }}>
              Li e aceito os termos de uso
            </Text>
          </Pressable>
        </>
      )}

      <Pressable
        onPress={mode === "login" ? handleLogin : handleSignup}
        disabled={loading}
        style={{
          backgroundColor: "#000",
          padding: 14,
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "600" }}>
          {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
        </Text>
      </Pressable>

      <Pressable onPress={() => setMode(mode === "login" ? "signup" : "login")}>
        <Text style={{ color: "#555", textAlign: "center" }}>
          {mode === "login"
            ? "Não tem conta? Criar uma"
            : "Já tem conta? Entrar"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  padding: 12,
  color: "#000",
} as const;
