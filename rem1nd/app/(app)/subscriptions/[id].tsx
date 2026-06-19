import { useEffect, useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { api } from "../../../src/api/axios";

export default function SubscriptionDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    try {
      const res = await api.get(`/subscriptions/${id}`);
      setItem(res.data.data);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/subscriptions/${id}`);
      router.replace("/subscriptions");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  if (!item) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>{item.name}</Text>

      <Text>Amount: ₹{item.amount}</Text>

      <Text>Renewal: {new Date(item.renewalDate).toLocaleDateString()}</Text>

      <Text>Auto Pay: {item.autoPay ? "Yes" : "No"}</Text>

      <Pressable
        onPress={handleDelete}
        style={{
          padding: 12,
          backgroundColor: "red",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Delete</Text>
      </Pressable>
    </View>
  );
}
