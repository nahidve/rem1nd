import { Stack } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore } from "../src/store/auth.store";
import { registerForPushNotificationsAsync } from "../src/config/notifications";

export default function RootLayout() {
  const { hydrate, loading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, []);

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="(app)" />
      ) : (
        <Stack.Screen name="(auth)" />
      )}
    </Stack>
  );
}
