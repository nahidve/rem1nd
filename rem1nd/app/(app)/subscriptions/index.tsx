import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";

import {
  useSubscriptions,
  useDeleteSubscription,
} from "../../../src/queries/subscriptions.query";

export default function SubscriptionsScreen() {
  const router = useRouter();

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
        <Text>Failed to load subscriptions</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={data || []}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text>No subscriptions yet</Text>}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/subscriptions/[id]",
                params: { id: item.id },
              })
            }
            style={{
              padding: 12,
              borderWidth: 1,
              borderRadius: 10,
              marginBottom: 10,
            }}
          >
            <Text style={{ fontWeight: "600" }}>{item.name}</Text>

            <Text>₹{item.amount}</Text>

            <Pressable
              onPress={() => deleteSubscription(item.id)}
              style={{
                marginTop: 8,
                padding: 6,
                backgroundColor: "red",
                borderRadius: 6,
                alignSelf: "flex-start",
              }}
            >
              <Text style={{ color: "white" }}>Delete</Text>
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
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: "black",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontSize: 28 }}>+</Text>
      </Pressable>
    </View>
  );
}
