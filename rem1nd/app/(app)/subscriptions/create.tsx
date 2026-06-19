import { useState } from "react";
import {
  View,
  TextInput,
  Pressable,
  Text,
  Alert,
  Switch,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { createSubscription } from "../../../src/api/subscription.api";
import { useRouter } from "expo-router";

export default function CreateSubscription() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const [renewalDate, setRenewalDate] = useState(new Date());

  const [showPicker, setShowPicker] = useState(false);

  const [autoPay, setAutoPay] = useState(false);

  const handleCreate = async () => {
    try {
      await createSubscription({
        name,
        amount: Number(amount),
        billingType: "MONTHLY",
        renewalDate: renewalDate.toISOString(),
        autoPay,
      });

      router.replace("/subscriptions");
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
        placeholder="Subscription Name"
        value={name}
        onChangeText={setName}
        style={{
          borderWidth: 1,
          padding: 12,
          borderRadius: 8,
        }}
      />

      <TextInput
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
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
        <Text>Renewal Date: {renewalDate.toLocaleDateString()}</Text>
      </Pressable>

      {showPicker && (
        <DateTimePicker
          value={renewalDate}
          mode="date"
          onChange={(event, selectedDate) => {
            setShowPicker(Platform.OS === "ios");

            if (selectedDate) {
              setRenewalDate(selectedDate);
            }
          }}
        />
      )}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text>Auto Pay</Text>

        <Switch value={autoPay} onValueChange={setAutoPay} />
      </View>

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
          Create Subscription
        </Text>
      </Pressable>
    </View>
  );
}
