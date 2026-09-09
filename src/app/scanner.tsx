import { colors, radius, spacing, typography } from "@/constants/theme";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
        <SafeAreaView style={styles.permissionSafeArea}>
          <Pressable
            onPress={() => router.back()}
            style={styles.closeButton}
            hitSlop={8}
          >
            <Ionicons name="close" size={20} color={colors.white} />
          </Pressable>

          <View style={styles.permissionContent}>
            <View style={styles.permissionIcon}>
              <Ionicons name="camera-outline" size={28} color={colors.neon} />
            </View>
            <Text style={styles.permissionTitle}>Acesso à câmera</Text>
            <Text style={styles.permissionText}>
              Precisamos da permissão da câmera para escanear os QR codes de
              entrada.
            </Text>
            <Pressable
              onPress={requestPermission}
              style={styles.permissionButton}
            >
              <Text style={styles.permissionButtonText}>
                Permitir acesso à câmera
              </Text>
            </Pressable>
          </View>
        </SafeAreaView>
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

      <SafeAreaView style={styles.overlayContainer} pointerEvents="box-none">
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            style={styles.closeButton}
            hitSlop={8}
          >
            <Ionicons name="close" size={20} color={colors.white} />
          </Pressable>
        </View>

        <View style={styles.frameWrap} pointerEvents="none">
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>
        </View>

        <View style={styles.bottomHint}>
          {isProcessing ? (
            <Text style={styles.hintText}>Processando...</Text>
          ) : (
            <Text style={styles.hintText}>Aponte a câmera para o QR code</Text>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const FRAME_SIZE = 240;
const CORNER_SIZE = 28;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  permissionSafeArea: { flex: 1 },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: spacing.lg,
    marginTop: spacing.sm,
  },
  permissionContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  permissionIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.neonMuted,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  permissionTitle: { ...typography.h2 },
  permissionText: {
    ...typography.body,
    color: colors.gray,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  permissionButton: {
    backgroundColor: colors.neon,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  permissionButtonText: { ...typography.bodyMedium, color: colors.black },
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    justifyContent: "space-between",
  },
  topBar: { flexDirection: "row" },
  frameWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: colors.neon,
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: radius.sm,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: radius.sm,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: radius.sm,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: radius.sm,
  },
  bottomHint: {
    alignItems: "center",
    paddingBottom: spacing.xl + spacing.md,
  },
  hintText: {
    ...typography.bodyMedium,
    color: colors.white,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    overflow: "hidden",
  },
});
