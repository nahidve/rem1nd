import { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useDashboard } from "../../src/queries/dashboard.query";
import { useSubscriptions } from "../../src/queries/subscriptions.query";
import { useAuthStore } from "../../src/store/auth.store";

const PASTEL_COLORS = [
  "#e0f2fe", // light blue
  "#fef3c7", // light amber
  "#ccfbf1", // light teal
  "#f3e8ff", // light purple
  "#ffe4e6", // light rose
];

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

const getCategoryEmoji = (category: string) => {
  switch (category) {
    case "Entertainment":
      return "🎬";
    case "Utilities":
      return "🔌";
    case "Software":
      return "💻";
    case "Health":
      return "🏥";
    default:
      return "📦";
  }
};

const getDaysLeft = (dueDateStr: string) => {
  const diff = new Date(dueDateStr).getTime() - new Date().getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return "Overdue";
  if (days === 0) return "Today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
};

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: dashboard, isLoading: isDashboardLoading, error: dashboardError } = useDashboard();
  const { data: subscriptions, isLoading: isSubsLoading } = useSubscriptions();

  const isLoading = isDashboardLoading || isSubsLoading;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  if (dashboardError || !dashboard) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Failed to load dashboard data</Text>
      </View>
    );
  }

  const symbol = getCurrencySymbol(dashboard.homeCurrency);
  const displayName = user?.name || user?.email?.split("@")[0] || "Guest User";
  const userInitials = displayName.substring(0, 2).toUpperCase();

  const handlePlusPress = () => {
    Alert.alert("New Entry", "Choose what you want to create:", [
      {
        text: "Subscription",
        onPress: () => router.push("/subscriptions/create"),
      },
      {
        text: "Reminder",
        onPress: () => router.push("/reminders/create"),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  // Combine reminders and subscriptions for upcoming list (upcoming 7 days or closest payments)
  const upcomingItems = [
    ...(dashboard.reminders || []).map((r: any) => ({
      ...r,
      name: r.title,
      type: "Reminder",
    })),
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fcfbfa" }} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Header Row */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: "#e2dfd9", justifyContent: "center", alignItems: "center" }}>
              <Text style={{ fontWeight: "700", fontSize: 15, color: "#444" }}>{userInitials}</Text>
            </View>
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#1c1917" }}>{displayName}</Text>
          </View>
          <Pressable

            onPress={handlePlusPress}
            style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: "#e5e5e5", backgroundColor: "white", justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ fontSize: 20, fontWeight: "500", color: "#1c1917" }}>+</Text>
          </Pressable>
        </View>

        {/* Spend Card */}
        <View style={{ backgroundColor: "#f0714f", borderRadius: 24, padding: 24, marginBottom: 28, flexDirection: "row", justifyContent: "space-between", alignItems: "center", shadowColor: "#f0714f", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 4 }}>
          <View>
            <Text style={{ color: "rgba(255, 255, 255, 0.75)", fontSize: 13, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 }}>Monthly Spend</Text>
            <Text style={{ color: "white", fontSize: 32, fontWeight: "700", marginTop: 4 }}>{symbol}{Math.round(dashboard.totalMonthlySpend)}</Text>
          </View>
          <View style={{ backgroundColor: "rgba(255, 255, 255, 0.2)", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 }}>
            <Text style={{ color: "white", fontWeight: "600", fontSize: 12 }}>{subscriptions?.length || 0} active</Text>
          </View>
        </View>

        {/* Upcoming Section */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#1c1917" }}>Upcoming</Text>
          <Pressable onPress={() => router.push("/calendar")} style={{ backgroundColor: "#f3f2ef", paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#666" }}>View all</Text>
          </Pressable>
        </View>

        {upcomingItems.length === 0 ? (
          <View style={{ padding: 20, backgroundColor: "#fff", borderRadius: 16, borderStyle: "dashed", borderWidth: 1, borderColor: "#ccc", alignItems: "center", marginBottom: 28 }}>
            <Text style={{ color: "#888", fontSize: 13 }}>No upcoming reminders this week</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 4, marginBottom: 24 }}>
            {upcomingItems.map((item) => {
              const emoji = getCategoryEmoji(item.category);
              const daysStr = getDaysLeft(item.dueDate);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => router.push({ pathname: "/reminders/[id]", params: { id: item.id } })}
                  style={{ width: 146, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: "#f2efe9", backgroundColor: "white", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <Text style={{ fontSize: 18 }}>{emoji}</Text>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#1c1917" }}>{symbol}{Math.round(item.amount || 0)}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: "#ea580c", fontWeight: "600", marginBottom: 2 }}>{daysStr}</Text>
                  <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "600", color: "#1c1917" }}>{item.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* All Subscriptions Section */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#1c1917" }}>All Subscriptions</Text>
          <Pressable onPress={() => router.push("/subscriptions")} style={{ backgroundColor: "#f3f2ef", paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 }}>
            <Text style={{ fontSize: 12, fontWeight: "600", color: "#666" }}>View all</Text>
          </Pressable>
        </View>

        {(!subscriptions || subscriptions.length === 0) ? (
          <View style={{ padding: 30, backgroundColor: "#fff", borderRadius: 16, borderStyle: "dashed", borderWidth: 1, borderColor: "#ccc", alignItems: "center" }}>
            <Text style={{ color: "#888", fontSize: 13 }}>No subscriptions tracked yet</Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {subscriptions.map((item: any, idx: number) => {
              const emoji = getCategoryEmoji(item.category);
              const cardBg = PASTEL_COLORS[idx % PASTEL_COLORS.length];
              const renewalFormatted = new Date(item.renewalDate).toLocaleDateString(undefined, { month: "short", day: "numeric" });
              return (
                <Pressable
                  key={item.id}
                  onPress={() => router.push({ pathname: "/subscriptions/[id]", params: { id: item.id } })}
                  style={{ backgroundColor: cardBg, borderRadius: 20, padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.02, shadowRadius: 2, elevation: 1 }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.65)", justifyContent: "center", alignItems: "center" }}>
                      <Text style={{ fontSize: 20 }}>{emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "700", fontSize: 15, color: "#1c1917" }}>{item.name}</Text>
                      <Text style={{ fontSize: 11, color: "#666", marginTop: 2 }}>Renewal: {renewalFormatted}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: "#1c1917" }}>{symbol}{Math.round(item.amount)}</Text>
                    <Text style={{ fontSize: 9, color: "#666", marginTop: 2 }}>per {item.billingType === "YEARLY" ? "year" : "month"}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
