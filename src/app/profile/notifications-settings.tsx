import { colors, radius, spacing, typography } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const OPTIONS: { label: string; description: string }[] = [
  {
    label: "Novas inscrições",
    description: "Você é avisado quando alguém se inscreve num evento seu.",
  },
  {
    label: "Check-ins confirmados",
    description: "Você é avisado quando alguém é validado no scanner.",
  },
  {
    label: "Lembretes de evento",
    description: "Você é avisado quando um evento seu está perto de começar.",
  },
];

export default function NotificationsSettings() {
  return (
    <View style={styles.container}>
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

        <View style={styles.content}>
          <Text style={styles.title}>Notificações</Text>
          <Text style={styles.subtitle}>
            Por enquanto, todas as notificações abaixo estão sempre ativas.
          </Text>

          <View style={styles.group}>
            {OPTIONS.map((option, index) => (
              <View key={option.label}>
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowLabel}>{option.label}</Text>
                    <Text style={styles.rowDescription}>
                      {option.description}
                    </Text>
                  </View>
                  <View style={styles.activeBadge}>
                    <Ionicons name="checkmark" size={13} color={colors.neon} />
                  </View>
                </View>
                {index < OPTIONS.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
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
  content: { padding: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  title: { ...typography.h1, fontSize: 24 },
  subtitle: { ...typography.body, color: colors.gray, marginTop: -4 },
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  rowLabel: { ...typography.bodyMedium },
  rowDescription: { ...typography.caption, marginTop: 2 },
  activeBadge: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.neonMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: { height: 1, backgroundColor: colors.border },
});
