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

export default function EditSubscription() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const qc = useQueryClient();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [category, setCategory] = useState("Other");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const res = await api.get(`/subscriptions/${id}`);
      const data = res.data.data;

      setName(data.name);
      setAmount(String(data.amount));
      setRenewalDate(data.renewalDate);
      setCurrency(data.currency || "INR");
      setCategory(data.category || "Other");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`/subscriptions/${id}`, {
        name,
        amount: Number(amount),
        currency,
        category,
        renewalDate: new Date(renewalDate).toISOString(),
      });

      await qc.invalidateQueries({ queryKey: ["subscriptions"] });
      await qc.invalidateQueries({ queryKey: ["dashboard"] });

      const subId = Array.isArray(id) ? id[0] : id;

      router.replace({
        pathname: "/(app)/subscriptions/[id]",
        params: { id: subId ?? "" },
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
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700", marginBottom: 8 }}>
        Edit Subscription
      </Text>

      <View style={{ gap: 6 }}>
        <Text style={{ fontWeight: "600", fontSize: 14 }}>Subscription Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name"
          style={{ borderWidth: 1, padding: 12, borderRadius: 8, borderColor: "#ccc" }}
        />
      </View>

      <View style={{ gap: 6 }}>
        <Text style={{ fontWeight: "600", fontSize: 14 }}>Amount</Text>
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
        <Text style={{ fontWeight: "600", fontSize: 14 }}>Renewal Date</Text>
        <TextInput
          value={renewalDate}
          onChangeText={setRenewalDate}
          placeholder="Renewal Date"
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
  );
}
