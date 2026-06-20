import { useEffect, useState } from "react";
import {
   View,
   TextInput,
   Pressable,
   Text,
   Alert,
   ActivityIndicator,
   ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";

import { api } from "../../../../src/api/axios";
import { useQueryClient } from "@tanstack/react-query";

const CURRENCIES = [
  { code: "INR", symbol: "₹" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
];

const CATEGORIES = [
  { name: "Entertainment", icon: "🎬" },
  { name: "Utilities", icon: "🔌" },
  { name: "Software", icon: "💻" },
  { name: "Health", icon: "🏥" },
  { name: "Other", icon: "📦" },
];

export default function EditReminder() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Other");
  const [currency, setCurrency] = useState("INR");
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
      setAmount(data.amount ? String(data.amount) : "");
      setCategory(data.category || "Other");
      setCurrency(data.currency || "INR");
      setDueDate(data.dueDate ? data.dueDate.split("T")[0] : "");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!dueDate || isNaN(Date.parse(dueDate))) {
      Alert.alert("Error", "Please enter a valid date in YYYY-MM-DD format");
      return;
    }
    try {
      await api.put(`/reminders/${id}`, {
        title,
        amount: amount ? Number(amount) : null,
        category,
        currency,
        dueDate: new Date(dueDate).toISOString(),
      });

      await qc.invalidateQueries({ queryKey: ["reminders"] });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });

      const remId = Array.isArray(id) ? id[0] : id;

      router.replace({
        pathname: "/(app)/reminders/[id]",
        params: { id: remId ?? "" },
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 8 }}>
        Edit Reminder
      </Text>

      <View style={{ gap: 6 }}>
        <Text style={{ fontWeight: "600", fontSize: 14 }}>Reminder Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Title"
          style={{ borderWidth: 1, padding: 12, borderRadius: 8, borderColor: "#ccc" }}
        />
      </View>

      <View style={{ gap: 6 }}>
        <Text style={{ fontWeight: "600", fontSize: 14 }}>Amount (Optional)</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          placeholder="Amount"
          keyboardType="numeric"
          style={{ borderWidth: 1, padding: 12, borderRadius: 8, borderColor: "#ccc" }}
        />
      </View>

      <View style={{ gap: 6 }}>
        <Text style={{ fontWeight: "600", fontSize: 14 }}>Currency</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {CURRENCIES.map((c) => (
            <Pressable
              key={c.code}
              onPress={() => setCurrency(c.code)}
              style={{
                flex: 1,
                padding: 10,
                borderWidth: 1,
                borderRadius: 8,
                borderColor: currency === c.code ? "black" : "#ccc",
                backgroundColor: currency === c.code ? "black" : "white",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  color: currency === c.code ? "white" : "black",
                }}
              >
                {c.symbol} {c.code}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ gap: 6 }}>
        <Text style={{ fontWeight: "600", fontSize: 14 }}>Category</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat.name}
              onPress={() => setCategory(cat.name)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderRadius: 20,
                borderColor: category === cat.name ? "black" : "#ccc",
                backgroundColor: category === cat.name ? "black" : "white",
              }}
            >
              <Text
                style={{
                  fontWeight: "500",
                  color: category === cat.name ? "white" : "black",
                }}
              >
                {cat.icon} {cat.name}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ gap: 6 }}>
        <Text style={{ fontWeight: "600", fontSize: 14 }}>Due Date</Text>
        <TextInput
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="Due Date"
          style={{ borderWidth: 1, padding: 12, borderRadius: 8, borderColor: "#ccc" }}
        />
      </View>

      <Pressable
        onPress={handleUpdate}
        style={{ padding: 14, backgroundColor: "black", borderRadius: 8, marginTop: 12 }}
      >
        <Text style={{ color: "white", textAlign: "center", fontWeight: "600", fontSize: 16 }}>
          Update
        </Text>
      </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
