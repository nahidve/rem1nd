import { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../src/store/auth.store";
import { ActivityIndicator, View } from "react-native";

import { registerForPushNotificationsAsync } from "../src/config/notifications";
import { getExpoPushToken } from "../src/services/pushToken";
import { api } from "../src/api/axios";

const queryClient = new QueryClient();

function InitialLayout() {
  const { loading, hydrate, isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    hydrate();
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      (async () => {
        try {
          const token = await getExpoPushToken();
          if (token) {
            await api.post("/users/push-token", { token });
          }
        } catch (err) {
          console.error("Failed to register/upload push token on startup", err);
        }
      })();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      router.replace("/(app)");
    }
  }, [isAuthenticated, loading, segments]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <InitialLayout />
    </QueryClientProvider>
  );
}
