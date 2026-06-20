import { View, Text, Pressable, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../../src/store/auth.store";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../../src/api/axios";

export default function SettingsScreen() {
  const { user, logout, updateHomeCurrency } = useAuthStore();
  const qc = useQueryClient();

  const isGuest = user?.uid === "guest";
  const currentCurrency = user?.homeCurrency || "INR";

  const handleCurrencyChange = async (currency: string) => {
    try {
      await api.put("/users/currency", { currency });
      updateHomeCurrency(currency);
      await qc.invalidateQueries({ queryKey: ["dashboard"] });
      if (Platform.OS === "web") {
        alert("Home currency updated successfully");
      } else {
        Alert.alert("Success", "Home currency updated successfully");
      }
    } catch (e: any) {
      if (Platform.OS === "web") {
        alert("Error updating currency: " + e.message);
      } else {
        Alert.alert("Error", e.message);
      }
    }
  };

  const handleLogout = async () => {
    const performLogout = async () => {
      try {
        await logout();
      } catch (e) {
        console.error("Logout failed", e);
      }
    };

    if (Platform.OS === "web") {
      const confirmLogout = window.confirm("Are you sure you want to logout?");
      if (confirmLogout) {
        await performLogout();
      }
    } else {
      Alert.alert("Logout", "Are you sure you want to logout?", [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: performLogout,
        },
      ]);
    }
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
      }}
      edges={["top", "left", "right"]}
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

        <Text style={{ marginBottom: 4 }}>Email: {user?.email || "Not Available"}</Text>

        <Text selectable style={{ marginBottom: 12 }}>User ID: {user?.dbUserId}</Text>

        <Text style={{ fontWeight: "600", marginBottom: 8, fontSize: 13, opacity: 0.8 }}>
          Preferred Home Currency (Dashboard Base)
        </Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {["INR", "USD", "EUR", "GBP"].map((code) => (
            <Pressable
              key={code}
              onPress={() => handleCurrencyChange(code)}
              style={{
                flex: 1,
                paddingVertical: 8,
                borderWidth: 1,
                borderRadius: 6,
                borderColor: currentCurrency === code ? "black" : "#ccc",
                backgroundColor: currentCurrency === code ? "black" : "white",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontWeight: "600",
                  color: currentCurrency === code ? "white" : "black",
                  fontSize: 12,
                }}
              >
                {code}
              </Text>
            </Pressable>
          ))}
        </View>
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
    </SafeAreaView>
  );
}
