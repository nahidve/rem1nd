import { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { api } from "../../../../src/api/axios";
import { useQueryClient } from "@tanstack/react-query";

export default function EditReminder() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await api.get(`/reminders/${id}`);
      const data = res.data.data;

      setTitle(data.title);
      setCategory(data.category);
      setDueDate(data.dueDate);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/reminders/${id}`, {
        title,
        category,
        dueDate: new Date(dueDate).toISOString(),
      });

      await qc.invalidateQueries({ queryKey: ["reminders"] });

      router.replace({
        pathname: "/(app)/reminders/[id]",
        params: { id },
      });
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        style={{ borderWidth: 1, padding: 12 }}
      />
      <TextInput
        value={category}
        onChangeText={setCategory}
        placeholder="Category"
        style={{ borderWidth: 1, padding: 12 }}
      />
      <TextInput
        value={dueDate}
        onChangeText={setDueDate}
        placeholder="Due Date"
        style={{ borderWidth: 1, padding: 12 }}
      />

      <Pressable
        onPress={handleUpdate}
        style={{ padding: 12, backgroundColor: "black" }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Update</Text>
      </Pressable>
    </View>
  );
}
