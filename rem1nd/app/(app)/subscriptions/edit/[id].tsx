import { useEffect, useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  Text,
  Alert,
  ActivityIndicator,
  ScrollView,
  Switch,
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

export default function EditSubscription() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const qc = useQueryClient();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [category, setCategory] = useState("Other");
  const [billingType, setBillingType] = useState<"MONTHLY" | "YEARLY">("MONTHLY");
  const [autoPay, setAutoPay] = useState(false);
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
      setRenewalDate(data.renewalDate ? data.renewalDate.split("T")[0] : "");
      setCurrency(data.currency || "INR");
      setCategory(data.category || "Other");
      setBillingType(data.billingType || "MONTHLY");
      setAutoPay(!!data.autoPay);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a subscription name");
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Alert.alert("Error", "Please enter a valid positive amount");
      return;
    }
    if (!renewalDate || isNaN(Date.parse(renewalDate))) {
      Alert.alert("Error", "Please enter a valid date in YYYY-MM-DD format");
      return;
    }
    try {
      await api.put(`/subscriptions/${id}`, {
        name,
        amount: Number(amount),
        currency,
        category,
        billingType,
        renewalDate: new Date(renewalDate).toISOString(),
        autoPay,
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "left", "right"]}>
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

      <View style={{ gap: 6 }}>
        <Text style={{ fontWeight: "600", fontSize: 14 }}>Billing Cycle</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {["MONTHLY", "YEARLY"].map((type) => (
            <Pressable
              key={type}
              onPress={() => setBillingType(type as any)}
              style={{
                flex: 1,
                padding: 10,
                borderWidth: 1,
                borderRadius: 8,
                borderColor: billingType === type ? "black" : "#ccc",
                backgroundColor: billingType === type ? "black" : "white",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  color: billingType === type ? "white" : "black",
                }}
              >
                {type === "MONTHLY" ? "Monthly" : "Yearly"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 }}>
        <View>
          <Text style={{ fontWeight: "600", fontSize: 14 }}>Auto Pay Enabled</Text>
          <Text style={{ fontSize: 11, opacity: 0.6 }}>Automatically records payments on renewal dates</Text>
        </View>
        <Switch
          value={autoPay}
          onValueChange={setAutoPay}
          trackColor={{ false: "#ccc", true: "black" }}
          thumbColor={autoPay ? "white" : "#f4f3f4"}
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
