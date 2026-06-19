import { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { getSubscriptions } from "../../src/api/subscription.api";
import { getReminders } from "../../src/api/reminder.api";

export default function CalendarScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const reminders = await getReminders();
      const subscriptions = await getSubscriptions();

      const reminderEvents = reminders.map((r) => ({
        id: r.id,
        title: r.title,
        date: r.dueDate,
        type: "Reminder",
        amount: r.amount,
      }));

      const subscriptionEvents = subscriptions.map((s) => ({
        id: s.id,
        title: s.name,
        date: s.renewalDate,
        type: "Subscription",
        amount: s.amount,
      }));

      const merged = [...reminderEvents, ...subscriptionEvents].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );

      setItems(merged);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "600",
          marginBottom: 16,
        }}
      >
        Upcoming Payments
      </Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            style={{
              borderWidth: 1,
              borderRadius: 10,
              padding: 12,
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                fontWeight: "600",
              }}
            >
              {item.title}
            </Text>

            <Text>Type: {item.type}</Text>

            <Text>{new Date(item.date).toLocaleDateString()}</Text>

            <Text>{item.category}</Text>

            {item.amount && <Text>₹{item.amount}</Text>}
          </View>
        )}
      />
    </View>
  );
}
