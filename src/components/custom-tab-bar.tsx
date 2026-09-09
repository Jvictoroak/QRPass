import { colors, radius, spacing } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "home",
  events: "ticket",
  notifications: "notifications",
  profile: "person",
};

const CREATE_EVENT_ROUTE = "/create-event";

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const routes = state.routes;
  const midpoint = Math.ceil(routes.length / 2);
  const left = routes.slice(0, midpoint);
  const right = routes.slice(midpoint);

  const renderTab = (route: (typeof routes)[number], index: number) => {
    const isFocused = state.index === state.routes.indexOf(route);
    const iconName = ICONS[route.name] ?? "ellipse";

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <Pressable
        key={route.key}
        onPress={onPress}
        style={styles.tabButton}
        hitSlop={8}
      >
        <View style={[styles.iconWrap, isFocused && styles.iconWrapActive]}>
          <Ionicons
            name={
              isFocused
                ? iconName
                : (`${iconName}-outline` as keyof typeof Ionicons.glyphMap)
            }
            size={20}
            color={isFocused ? colors.white : colors.grayMuted}
          />
        </View>
      </Pressable>
    );
  };

  return (
    <View style={[styles.wrapper, { bottom: spacing.md + insets.bottom }]}>
      <View style={styles.bar}>
        {left.map(renderTab)}

        <Pressable
          onPress={() => router.push(CREATE_EVENT_ROUTE)}
          style={styles.plusButton}
          hitSlop={8}
        >
          <Ionicons name="add" size={26} color={colors.black} />
        </Pressable>

        {right.map(renderTab)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    height: 64,
    paddingHorizontal: spacing.sm,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: colors.purpleMuted,
  },
  plusButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.neon,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 0,
  },
});

export default CustomTabBar;
