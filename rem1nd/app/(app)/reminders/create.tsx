import { useState } from "react";
import { View, TextInput, Pressable, Text, Alert } from "react-native";
import { useRouter } from "expo-router";

import { api } from "../../../src/api/axios";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateReminder() {
  const router = useRouter();
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleCreate = async () => {
    try {
      await api.post("/reminders", {
        title,
        category,
        dueDate: new Date(dueDate).toISOString(),
        repeatType: "ONCE",
      });

      await qc.invalidateQueries({ queryKey: ["reminders"] });

      router.replace("/reminders");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, padding: 12 }}
      />

      <TextInput
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
        style={{ borderWidth: 1, padding: 12 }}
      />

      <TextInput
        placeholder="Due Date (YYYY-MM-DD HH:mm)"
        value={dueDate}
        onChangeText={setDueDate}
        style={{ borderWidth: 1, padding: 12 }}
      />

      <Pressable
        onPress={handleCreate}
        style={{ padding: 12, backgroundColor: "black" }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Create</Text>
      </Pressable>
    </View>
  );
}
