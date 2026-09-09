import { colors, fonts, radius, spacing } from "@/constants/theme";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

export type BadgeVariant = "neon" | "purple" | "gray" | "danger";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
}

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  neon: { bg: colors.neonMuted, text: colors.neonText },
  purple: { bg: colors.purpleMuted, text: colors.purpleText },
  gray: { bg: "rgba(255,255,255,0.08)", text: colors.gray },
  danger: { bg: colors.dangerMuted, text: colors.danger },
};

export function Badge({ label, variant = "gray", icon }: BadgeProps) {
  const { bg, text } = VARIANT_STYLES[variant];

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      {icon}
      <Text style={[styles.label, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.pill,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 11,
  },
});

export default Badge;
