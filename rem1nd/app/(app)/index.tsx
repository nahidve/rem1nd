import { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { getDashboard } from "../../src/api/analytics.api";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await getDashboard();
        if (active) {
          setData(res);
        }
      } catch (err: any) {
        if (active) {
          setError(err.message || "Failed to load dashboard");
        }
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <Text style={{ color: "red", textAlign: "center" }}>{error}</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "600" }}>
        Dashboard
      </Text>

      <Text>Total Monthly Spend: ₹{data.totalMonthlySpend}</Text>

      <Text>Subscriptions: {data.subscriptionCount}</Text>

      <Text>Upcoming Payments: {data.upcomingReminders}</Text>

      <Text style={{ marginTop: 10, fontWeight: "600" }}>
        Next 7 Days Reminders
      </Text>

      <FlatList
        data={data.reminders}
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
            <Text>{new Date(item.dueDate).toDateString()}</Text>
          </View>
        )}
      />
    </View>
  );
}