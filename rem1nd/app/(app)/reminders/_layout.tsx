import { Stack } from "expo-router";

export default function RemindersLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Reminders" }} />
      <Stack.Screen name="create" options={{ title: "Create Reminder" }} />
      <Stack.Screen name="[id]" options={{ title: "Reminder Details" }} />
    </Stack>
  );
}
