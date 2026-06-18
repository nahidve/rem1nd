import { View, Text, Pressable } from "react-native";
import { useAuthStore } from "../../src/store/auth.store";

export default function Home() {
  const { user, logout } = useAuthStore();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Text>Dashboard</Text>

      <Text>{user?.email}</Text>

      <Pressable
        onPress={logout}
        style={{ padding: 12, backgroundColor: "black" }}
      >
        <Text style={{ color: "white" }}>Logout</Text>
      </Pressable>
    </View>
  );
}
