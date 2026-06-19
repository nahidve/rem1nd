import { useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  Text,
  Alert,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createReminder } from "../../../src/api/reminder.api";
import { useRouter } from "expo-router";

export default function CreateReminder() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");

  const [dueDate, setDueDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const handleCreate = async () => {
    try {
      await createReminder({
        title,
        category,
        dueDate: dueDate.toISOString(),
        repeatType: "ONCE",
      });

      router.replace("/reminders");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
        gap: 12,
      }}
    >
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={{
          borderWidth: 1,
          padding: 12,
          borderRadius: 8,
        }}
      />

      <TextInput
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
        style={{
          borderWidth: 1,
          padding: 12,
          borderRadius: 8,
        }}
      />

      <Pressable
        onPress={() => setShowPicker(true)}
        style={{
          borderWidth: 1,
          padding: 12,
          borderRadius: 8,
        }}
      >
        <Text>Due Date: {dueDate.toLocaleString()}</Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={dueDate}
          mode="datetime"
          onChange={(event, selectedDate) => {
            setShowPicker(Platform.OS === "ios");

            if (selectedDate) {
              setDueDate(selectedDate);
            }
          }}
        />
      )}

      <Pressable
        onPress={handleCreate}
        style={{
          padding: 12,
          backgroundColor: "black",
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            color: "white",
            textAlign: "center",
          }}
        >
          Create Reminder
        </Text>
      </Pressable>
    </View>
  );
}
