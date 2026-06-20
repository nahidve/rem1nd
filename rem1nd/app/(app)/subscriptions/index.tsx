import { useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

import {
  useSubscriptions,
  useDeleteSubscription,
} from "../../../src/queries/subscriptions.query";

const CATEGORIES = ["All", "Entertainment", "Utilities", "Software", "Health", "Other"];

const getCurrencySymbol = (code?: string) => {
  switch (code) {
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    default:
      return "₹";
  }
};

export default function SubscriptionsScreen() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const { data, isLoading, error } = useSubscriptions();
  const { mutate: deleteSubscription } = useDeleteSubscription();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "red" }}>Failed to load subscriptions</Text>
      </View>
    );
  }

  const filteredSubscriptions = (data || []).filter((item: any) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={{ flex: 1, paddingHorizontal: 16, backgroundColor: "#f9f9f9" }} edges={["top", "left", "right"]}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 12, color: "#111", marginTop: 8 }}>
        Subscriptions
      </Text>

      {/* Search Input */}
      <TextInput
        placeholder="Search subscriptions..."
        value={search}
        onChangeText={setSearch}
        style={{
          borderWidth: 1,
          borderColor: "#e0e0e0",
          backgroundColor: "white",
          padding: 12,
          borderRadius: 8,
          marginBottom: 12,
        }}
      />

      {/* Category Filter Chips */}
      <View style={{ marginBottom: 16 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {CATEGORIES.map((cat) => (
            <Pressable
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 12,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: selectedCategory === cat ? "black" : "#ccc",
                backgroundColor: selectedCategory === cat ? "black" : "white",
              }}
            >
              <Text
                style={{
                  fontWeight: "600",
                  fontSize: 12,
                  color: selectedCategory === cat ? "white" : "black",
                }}
              >
                {cat}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 40, opacity: 0.5 }}>
            No subscriptions found.
          </Text>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/subscriptions/[id]",
                params: { id: item.id },
              })
            }
            style={{
              padding: 16,
              backgroundColor: "white",
              borderWidth: 1,
              borderColor: "#eee",
              borderRadius: 12,
              marginBottom: 12,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ gap: 4, flex: 1 }}>
                <Text style={{ fontWeight: "600", fontSize: 16, color: "#111" }}>{item.name}</Text>
                <Text style={{ fontSize: 12, opacity: 0.6 }}>
                  Next: {new Date(item.renewalDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
                <View
                  style={{
                    alignSelf: "flex-start",
                    backgroundColor: "#f0f0f0",
                    paddingVertical: 2,
                    paddingHorizontal: 6,
                    borderRadius: 4,
                    marginTop: 4,
                  }}
                >
                  <Text style={{ fontSize: 10, fontWeight: "600", color: "#666" }}>{item.category}</Text>
                </View>
              </View>

              <Text style={{ fontWeight: "700", fontSize: 16, color: "#111" }}>
                {getCurrencySymbol(item.currency)}{Math.round(item.amount)}
                <Text style={{ fontSize: 10, fontWeight: "400", opacity: 0.6 }}>/mo</Text>
              </Text>
            </View>

            <Pressable
              onPress={() => deleteSubscription(item.id)}
              style={{
                marginTop: 12,
                paddingVertical: 6,
                paddingHorizontal: 12,
                backgroundColor: "#ffebee",
                borderRadius: 6,
                alignSelf: "flex-start",
              }}
            >
              <Text style={{ color: "#c62828", fontSize: 12, fontWeight: "600" }}>Delete</Text>
            </Pressable>
          </Pressable>
        )}
      />

      <Pressable
        onPress={() => router.push("/subscriptions/create")}
        style={{
          position: "absolute",
          right: 20,
          bottom: 20,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: "black",
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 4,
        }}
      >
        <Text style={{ color: "white", fontSize: 28, fontWeight: "300" }}>+</Text>
      </Pressable>
    </SafeAreaView>
  );
}
