import { Stack } from "expo-router";

export default function SubscriptionsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Subscriptions" }} />
      <Stack.Screen name="create" options={{ title: "Create Subscription" }} />
      <Stack.Screen name="[id]" options={{ title: "Subscription Details" }} />
    </Stack>
  );
}
