import { useEffect, useState } from "react";
import { View, Text, FlatList, Pressable } from "react-native";
import {
  getSubscriptions,
  Subscription,
} from "../../../src/api/subscription.api";
import { useRouter } from "expo-router";

export default function SubscriptionsScreen() {
  const [items, setItems] = useState<Subscription[]>([]);
  const router = useRouter();

  const load = async () => {
    const data = await getSubscriptions();
    setItems(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "600" }}>Subscriptions</Text>

      <Pressable
        onPress={() => router.push("/(app)/subscriptions/create")}
        style={{ padding: 10, backgroundColor: "black" }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          + Add Subscription
        </Text>
      </Pressable>

      <FlatList
        data={items}
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
            <Text style={{ fontWeight: "600" }}>{item.name}</Text>
            <Text>₹ {item.amount}</Text>
            <Text>{item.billingType}</Text>
            <Text>Renew: {item.renewalDate}</Text>
          </View>
        )}
      />
    </View>
  );
}
