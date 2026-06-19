import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useAuthStore } from "../../src/store/auth.store";
import { useGoogleAuth } from "../../src/services/google.auth";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const { login, register, guestLogin } = useAuthStore();
  const router = useRouter();

  const { promptAsync } = useGoogleAuth(() => {
    router.replace("/(app)");
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      await login(email, password);
      router.replace("/(app)");
    } catch (e: any) {
      Alert.alert("Login failed", e.message);
    }
  };

  const handleRegister = async () => {
    try {
      await register(email, password);
      router.replace("/(app)");
    } catch (e: any) {
      Alert.alert("Register failed", e.message);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center", gap: 12 }}>
      <Text style={{ fontSize: 28, fontWeight: "600" }}>Rem1nd</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />

      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ borderWidth: 1, padding: 12, borderRadius: 8 }}
      />

      <Pressable
        onPress={handleLogin}
        style={{ padding: 12, backgroundColor: "black" }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Login</Text>
      </Pressable>

      <Pressable
        onPress={handleRegister}
        style={{ padding: 12, borderWidth: 1 }}
      >
        <Text style={{ textAlign: "center" }}>Create Account</Text>
      </Pressable>

      <Pressable
        onPress={() => promptAsync()}
        style={{ padding: 12, backgroundColor: "#4285F4" }}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Continue with Google
        </Text>
      </Pressable>

      <Pressable
        onPress={async () => {
          try {
            await guestLogin();
            router.replace("/(app)");
          } catch (e: any) {
            Alert.alert("Guest login failed", e.message);
          }
        }}
        style={{
          padding: 12,
          backgroundColor: "#666",
          borderRadius: 8,
        }}
      >
        <Text
          style={{
            color: "white",
            textAlign: "center",
          }}
        >
          Continue as Guest
        </Text>
      </Pressable>
    </View>
  );
}
