import { useState } from "react";
import { View, TextInput, Pressable, Text, Alert } from "react-native";
import { createReminder } from "../../../src/api/reminder.api";
import { useRouter } from "expo-router";

export default function CreateReminder() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");

  const handleCreate = async () => {
    try {
      await createReminder({
        title,
        category,
        dueDate: new Date().toISOString(),
        repeatType: "ONCE",
      });

      router.replace("/(app)");
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

      <Pressable
        onPress={handleCreate}
        style={{ padding: 12, backgroundColor: "black" }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Create</Text>
      </Pressable>
    </View>
  );
}
