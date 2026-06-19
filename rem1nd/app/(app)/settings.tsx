import { View, Text, Pressable, Alert } from "react-native";
import { useAuthStore } from "../../src/store/auth.store";

export default function SettingsScreen() {
  const { user, logout } = useAuthStore();

  const isGuest = user?.uid === "guest";

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  return (
    <View
      style={{
        flex: 1,
        padding: 16,
      }}
    >
      <Text
        style={{
          fontSize: 24,
          fontWeight: "600",
          marginBottom: 24,
        }}
      >
        Settings
      </Text>

      <View
        style={{
          borderWidth: 1,
          borderRadius: 10,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontWeight: "600",
            marginBottom: 8,
          }}
        >
          Account
        </Text>

        <Text>Type: {isGuest ? "Guest Account" : "Registered Account"}</Text>

        <Text>Email: {user?.email || "Not Available"}</Text>

        <Text selectable>User ID: {user?.dbUserId}</Text>
      </View>

      <View
        style={{
          borderWidth: 1,
          borderRadius: 10,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontWeight: "600",
            marginBottom: 8,
          }}
        >
          Premium
        </Text>

        <Text>Premium features coming soon.</Text>
      </View>

      <View
        style={{
          borderWidth: 1,
          borderRadius: 10,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontWeight: "600",
            marginBottom: 8,
          }}
        >
          Notifications
        </Text>

        <Text>Local reminder notifications enabled.</Text>
      </View>

      {isGuest && (
        <View
          style={{
            borderWidth: 1,
            borderRadius: 10,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <Text
            style={{
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Upgrade Account
          </Text>

          <Text>
            Link email/password or Google account later without losing your
            data.
          </Text>
        </View>
      )}

      <Pressable
        onPress={handleLogout}
        style={{
          marginTop: "auto",
          backgroundColor: "#b00020",
          padding: 14,
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            color: "white",
            textAlign: "center",
            fontWeight: "600",
          }}
        >
          Logout
        </Text>
      </Pressable>
    </View>
  );
}
