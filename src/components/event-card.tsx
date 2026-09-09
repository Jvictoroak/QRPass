import { colors, fonts, radius, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Badge, BadgeVariant } from "./badge";

interface EventCardProps {
  name: string;
  date: string;
  location?: string;
  attendeeCount?: number;
  statusLabel?: string;
  statusVariant?: BadgeVariant;
  highlight?: boolean;
  /** Cor de fundo atrás do cartão, usada para "recortar" as marcas de picote.
   *  Use a mesma cor do fundo da tela (por padrão colors.black). */
  backdropColor?: string;
  onPress?: () => void;
}

/**
 * Cartão no estilo ticket stub: mostra os dados principais do evento,
 * uma linha picotada (como se fosse destacável) e um atalho de QR Code.
 */
export function EventCard({
  name,
  date,
  location,
  attendeeCount,
  statusLabel,
  statusVariant = "neon",
  highlight = false,
  backdropColor = colors.black,
  onPress,
}: EventCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        highlight && styles.cardHighlight,
        pressed && { opacity: 0.85 },
      ]}
    >
      {statusLabel && <Badge label={statusLabel} variant={statusVariant} />}

      <Text style={styles.name}>{name}</Text>

      <View style={styles.metaRow}>
        <Ionicons name="calendar-outline" size={14} color={colors.gray} />
        <Text style={styles.metaText}>{date}</Text>
      </View>

      {location && (
        <View style={styles.metaRow}>
          <Ionicons name="location-outline" size={14} color={colors.gray} />
          <Text style={styles.metaText}>{location}</Text>
        </View>
      )}

      {typeof attendeeCount === "number" && (
        <>
          <View style={styles.dashDivider}>
            <View
              style={[
                styles.notch,
                styles.notchLeft,
                { backgroundColor: backdropColor },
              ]}
            />
            <View
              style={[
                styles.notch,
                styles.notchRight,
                { backgroundColor: backdropColor },
              ]}
            />
          </View>
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>
              {attendeeCount}{" "}
              {attendeeCount === 1 ? "confirmado" : "confirmados"}
            </Text>
            <Ionicons name="qr-code-outline" size={22} color={colors.neon} />
          </View>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: 4,
  },
  cardHighlight: {
    borderWidth: 1,
    borderColor: "rgba(198, 255, 61, 0.35)",
  },
  name: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.white,
    marginTop: spacing.sm,
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.gray,
  },
  dashDivider: {
    borderTopWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.border,
    marginTop: spacing.sm,
    marginHorizontal: -spacing.md,
  },
  notch: {
    position: "absolute",
    top: -9,
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  notchLeft: { left: -9 },
  notchRight: { right: -9 },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.gray,
  },
});

export default EventCard;
