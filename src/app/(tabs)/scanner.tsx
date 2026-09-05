import { supabase } from "@/lib/supabase";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";

export default function Scanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleBarcodeScanned({ data }: { data: string }) {
    if (isProcessing) return;
    setIsProcessing(true);

    const { data: result, error } = await supabase
      .rpc("check_in", { registration_code: data })
      .single();

    if (error) {
      Alert.alert("Erro", error.message, [
        { text: "OK", onPress: () => setIsProcessing(false) },
      ]);
      return;
    }

    const { success, message, attendee_name } = result as {
      success: boolean;
      message: string;
      attendee_name: string | null;
    };

    Alert.alert(
      success ? " Check-in feito" : " Atenção",
      attendee_name ? `${attendee_name}\n${message}` : message,
      [{ text: "OK", onPress: () => setIsProcessing(false) }],
    );
  }

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          Precisamos da permissão da câmera para escanear QR codes.
        </Text>
        <Text style={styles.link} onPress={requestPermission}>
          Permitir acesso à câmera
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={isProcessing ? undefined : handleBarcodeScanned}
      />
      <View style={styles.overlay}>
        <Text style={styles.overlayText}>Aponte a câmera para o QR code</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#fff",
    textAlign: "center",
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  link: {
    color: "#4da6ff",
    fontWeight: "600",
  },
  overlay: {
    position: "absolute",
    bottom: 60,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  overlayText: {
    color: "#fff",
  },
});
