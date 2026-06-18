import { useState } from "react";
import { View, TextInput, Pressable, Text, Alert } from "react-native";
import { createSubscription } from "../../../src/api/subscription.api";
import { useRouter } from "expo-router";

export default function CreateSubscription() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [renewalDate, setRenewalDate] = useState("");

  const handleCreate = async () => {
    try {
      await createSubscription({
        name,
        amount: Number(amount),
        billingType: "MONTHLY",
        renewalDate: new Date(renewalDate).toISOString(),
        autoPay: false,
      });

      router.replace("/subscriptions/create");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 12 }}
      />

      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 12 }}
      />

      <TextInput
        placeholder="Renewal Date (YYYY-MM-DD)"
        value={renewalDate}
        onChangeText={setRenewalDate}
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
