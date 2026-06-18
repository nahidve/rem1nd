import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore } from "../src/store/auth.store";
import { registerForPushNotificationsAsync } from "../src/config/notifications";

export default function RootLayout() {
  const { hydrate, loading, isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAppGroup = segments[0] === "(app)";

    if (isAuthenticated && !inAppGroup) {
      router.replace("/(app)");
    } else if (!isAuthenticated && inAppGroup) {
      router.replace("/(auth)/login");
    }
  }, [isAuthenticated, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
