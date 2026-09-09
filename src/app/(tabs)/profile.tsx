import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Avatar } from "@/components/avatar";
import {
  MaxContentWidth,
  colors,
  radius,
  spacing,
  typography,
} from "@/constants/theme";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";

type Profile = {
  first_name: string;
  last_name: string;
};

type SettingsRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  danger?: boolean;
};

function SettingsRow({ icon, label, onPress, danger }: SettingsRowProps) {
  return (
    <Pressable onPress={onPress} style={styles.row}>
      <View
        style={[
          styles.rowIcon,
          danger && { backgroundColor: colors.dangerMuted },
        ]}
      >
        <Ionicons
          name={icon}
          size={16}
          color={danger ? colors.danger : colors.white}
        />
      </View>
      <Text style={[styles.rowLabel, danger && { color: colors.danger }]}>
        {label}
      </Text>
      {!danger && (
        <Ionicons name="chevron-forward" size={16} color={colors.grayMuted} />
      )}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const loadProfile = useCallback(async () => {
    if (!session) {
      setProfile(null);
      setLoadingProfile(false);
      return;
    }
    setLoadingProfile(true);
    const { data } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("id", session.user.id)
      .single();
    setProfile(data);
    setLoadingProfile(false);
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile]),
  );

  if (authLoading || loadingProfile) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.centered]}>
          <ActivityIndicator color={colors.purple} />
        </SafeAreaView>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.centered]}>
          <Text style={styles.rowLabel}>Faça login para ver seu perfil.</Text>
        </SafeAreaView>
      </View>
    );
  }

  const name = profile
    ? `${profile.first_name} ${profile.last_name}`.trim()
    : (session.user.email?.split("@")[0] ?? "Organizador");

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Avatar name={name} size={64} />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{session.user.email}</Text>
          </View>
        </View>

        <View style={styles.group}>
          <SettingsRow
            icon="person-outline"
            label="Editar perfil"
            onPress={() => router.push("/profile/edit")}
          />
          <View style={styles.divider} />
          <SettingsRow
            icon="notifications-outline"
            label="Notificações"
            onPress={() => router.push("/profile/notifications-settings")}
          />
        </View>

        <View style={styles.group}>
          <SettingsRow
            icon="log-out-outline"
            label="Sair da conta"
            danger
            onPress={() => supabase.auth.signOut()}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.black },
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.lg,
    maxWidth: MaxContentWidth,
    width: "100%",
    alignSelf: "center",
  },
  centered: { alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  name: { ...typography.h2 },
  email: { ...typography.caption, marginTop: 2 },
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm + 4,
    paddingVertical: spacing.md,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { ...typography.bodyMedium, flex: 1 },
  divider: { height: 1, backgroundColor: colors.border },
});
