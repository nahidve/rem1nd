import { useEffect, useState } from "react";
import { View, Text, Pressable, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { api } from "../../../src/api/axios";

export default function ReminderDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [item, setItem] = useState<any>(null);

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    try {
      const res = await api.get(`/reminders/${id}`);
      setItem(res.data.data);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/reminders/${id}`);
      router.replace("/reminders");
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
      <Text style={{ fontSize: 22, fontWeight: "700" }}>{item.title}</Text>

      <Text>Category: {item.category}</Text>

      <Text>Due: {new Date(item.dueDate).toLocaleString()}</Text>

      <Text>Status: {item.isActive ? "Active" : "Inactive"}</Text>

      <Pressable
        onPress={() =>
          router.push({
            pathname: "/(app)/reminders/edit/[id]",
            params: { id },
          })
        }
        style={{
          padding: 12,
          backgroundColor: "blue",
          borderRadius: 8,
        }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Edit</Text>
      </Pressable>

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
