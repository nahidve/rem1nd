import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import { getReminders, Reminder } from "../../src/api/reminder.api";

export default function Home() {
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await getReminders();
      setReminders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "600" }}>Reminders</Text>

      <Pressable
        onPress={load}
        style={{ padding: 10, backgroundColor: "black" }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Refresh</Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/(app)/reminders/create")}
        style={{ padding: 10, backgroundColor: "black" }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          + Add Reminder
        </Text>
      </Pressable>

      <Pressable
        onPress={() => router.push("/subscriptions")}
        style={{ padding: 10, backgroundColor: "black", marginTop: 10 }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Subscriptions
        </Text>
      </Pressable>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                padding: 12,
                borderWidth: 1,
                borderRadius: 8,
                marginBottom: 10,
              }}
            >
              <Text style={{ fontWeight: "600" }}>{item.title}</Text>
              <Text>{item.category}</Text>
              <Text>{item.repeatType}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}
