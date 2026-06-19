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

export default function EditSubscription() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const qc = useQueryClient();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [renewalDate, setRenewalDate] = useState("");
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
        renewalDate: new Date(renewalDate).toISOString(),
      });

      await qc.invalidateQueries({ queryKey: ["subscriptions"] });

      router.replace({
        pathname: "/(app)/subscriptions/[id]",
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
        value={name}
        onChangeText={setName}
        placeholder="Name"
        style={{ borderWidth: 1, padding: 12 }}
      />
      <TextInput
        value={amount}
        onChangeText={setAmount}
        placeholder="Amount"
        style={{ borderWidth: 1, padding: 12 }}
      />
      <TextInput
        value={renewalDate}
        onChangeText={setRenewalDate}
        placeholder="Renewal Date"
        style={{ borderWidth: 1, padding: 12 }}
      />

      <Pressable
        onPress={handleUpdate}
        style={{ padding: 12, backgroundColor: "black" }}
      >
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/(app)/subscriptions/edit/[id]",
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

        <Text style={{ color: "white", textAlign: "center" }}>Update</Text>
      </Pressable>
    </View>
  );
}
