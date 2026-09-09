import { colors, fonts } from "@/constants/theme";
import { StyleSheet, Text, View } from "react-native";

interface AvatarProps {
  name: string;
  size?: number;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function Avatar({ name, size = 56 }: AvatarProps) {
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.purple,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    fontFamily: fonts.bold,
    color: colors.white,
  },
});

export default Avatar;
