import { useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  Pressable,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useDashboard } from "../../src/queries/dashboard.query";
import { useSubscriptions } from "../../src/queries/subscriptions.query";
import { useAuthStore } from "../../src/store/auth.store";

const PASTEL_COLORS = [
  "#f1f5f9", // slate light
  "#fef2f2", // rose light
  "#ecfdf5", // emerald light
  "#eff6ff", // blue light
  "#fbf7f5", // orange light
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

const getCategoryColor = (category: string) => {
  switch (category) {
    case "Entertainment":
      return "#f43f5e"; // rose/pink
    case "Utilities":
      return "#0ea5e9"; // sky blue
    case "Software":
      return "#10b981"; // emerald green
    case "Health":
      return "#8b5cf6"; // violet
    default:
      return "#a8a29e"; // warm gray
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fafaf9" }}>
        <ActivityIndicator size="large" color="#1c1917" />
      </View>
    );
  }

  if (dashboardError || !dashboard) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fafaf9", padding: 24 }}>
        <Text style={{ fontSize: 16, fontWeight: "600", color: "#ef4444", marginBottom: 8 }}>Failed to load dashboard</Text>
        <Text style={{ fontSize: 13, color: "#666", textAlign: "center" }}>Please check your internet connection and try again.</Text>
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

  // Combine reminders and subscriptions for upcoming list
  const upcomingItems = [
    ...(dashboard.reminders || []).map((r: any) => ({
      ...r,
      name: r.title,
      type: "Reminder",
    })),
  ];

  // Calculate category spend distribution
  const categoryTotals: Record<string, number> = {};
  let totalSpendSum = 0;

  (subscriptions || []).forEach((sub: any) => {
    const amt = Number(sub.amount) || 0;
    const cat = sub.category || "Other";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
    totalSpendSum += amt;
  });

  const categoryBreakdown = Object.entries(categoryTotals)
    .map(([name, value]) => ({
      name,
      value,
      percentage: totalSpendSum > 0 ? (value / totalSpendSum) * 100 : 0,
      color: getCategoryColor(name),
      emoji: getCategoryEmoji(name),
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fafaf9" }} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* Header Row */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: "#e7e5e4", justifyContent: "center", alignItems: "center", borderWidth: 1.5, borderColor: "#d6d3d1" }}>
              <Text style={{ fontWeight: "700", fontSize: 14, color: "#444" }}>{userInitials}</Text>
            </View>
            <View>
              <Text style={{ fontSize: 12, color: "#78716c", fontWeight: "500" }}>Welcome back,</Text>
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#1c1917", marginTop: -2 }}>{displayName}</Text>
            </View>
          </View>
          <Pressable
            onPress={handlePlusPress}
            style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: "#1c1917", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 }}
          >
            <Text style={{ fontSize: 22, fontWeight: "300", color: "white", marginTop: -2 }}>+</Text>
          </Pressable>
        </View>

        {/* Spend Card (Premium Solid Accent) */}
        <View style={{ borderRadius: 24, overflow: "hidden", marginBottom: 28, shadowColor: "#f97316", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 20, elevation: 8, backgroundColor: "#ea580c", padding: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "rgba(255, 255, 255, 0.75)", fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.8 }}>Monthly Spend</Text>
              <Text style={{ color: "white", fontSize: 36, fontWeight: "800", marginTop: 4 }}>{symbol}{Math.round(dashboard.totalMonthlySpend)}</Text>
            </View>
            <View style={{ backgroundColor: "rgba(255, 255, 255, 0.18)", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.2)" }}>
              <Text style={{ color: "white", fontWeight: "600", fontSize: 11 }}>{subscriptions?.length || 0} Active</Text>
            </View>
          </View>

          {/* Category Spend Distribution Bar */}
          <View style={{ height: 10, width: "100%", backgroundColor: "rgba(255, 255, 255, 0.25)", borderRadius: 5, flexDirection: "row", overflow: "hidden", marginBottom: 18 }}>
            {subscriptions && subscriptions.length > 0 ? (
              categoryBreakdown.map((item, idx) => (
                <View
                  key={item.name}
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                    height: "100%",
                  }}
                />
              ))
            ) : (
              <View style={{ width: "100%", backgroundColor: "rgba(255,255,255,0.3)", height: "100%" }} />
            )}
          </View>

          {/* Distribution Legend */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {subscriptions && subscriptions.length > 0 ? (
              categoryBreakdown.slice(0, 3).map((item) => (
                <View key={item.name} style={{ flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255, 255, 255, 0.12)", paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, borderWidth: 0.5, borderColor: "rgba(255,255,255,0.15)" }}>
                  <Text style={{ fontSize: 11, color: "white" }}>{item.emoji}</Text>
                  <Text style={{ color: "white", fontSize: 11, fontWeight: "600" }}>{item.name} ({Math.round(item.percentage)}%)</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: "500" }}>Add subscriptions to see distribution.</Text>
            )}
          </View>
        </View>

        {/* Upcoming Section */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#1c1917" }}>Upcoming Payments</Text>
        </View>

        {upcomingItems.length === 0 ? (
          /* Custom Premium Empty State for Reminders */
          <View style={{ padding: 32, backgroundColor: "white", borderRadius: 24, alignItems: "center", marginBottom: 28, borderWidth: 1, borderColor: "#f2efe9", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#ecfdf5", justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 28 }}>📅</Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1c1917", marginBottom: 4 }}>All Caught Up!</Text>
            <Text style={{ color: "#78716c", fontSize: 12, textAlign: "center", lineHeight: 18, paddingHorizontal: 20 }}>
              No upcoming reminders for the next 7 days. Enjoy your free time!
            </Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingBottom: 6, marginBottom: 24 }}>
            {upcomingItems.map((item) => {
              const emoji = getCategoryEmoji(item.category);
              const daysStr = getDaysLeft(item.dueDate);
              const isOverdue = daysStr === "Overdue";
              
              return (
                <Pressable
                  key={item.id}
                  onPress={() => router.push({ pathname: "/reminders/[id]", params: { id: item.id } })}
                  style={{ width: 156, padding: 16, borderRadius: 20, borderWidth: 1, borderColor: "#f2efe9", backgroundColor: "white", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "#fafaf9", justifyContent: "center", alignItems: "center" }}>
                      <Text style={{ fontSize: 16 }}>{emoji}</Text>
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: "700", color: "#1c1917" }}>{symbol}{Math.round(item.amount || 0)}</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: isOverdue ? "#dc2626" : "#f97316", fontWeight: "700", marginBottom: 4 }}>{daysStr}</Text>
                  <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "700", color: "#1c1917" }}>{item.name}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {/* All Subscriptions Section */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#1c1917" }}>All Subscriptions</Text>
          <Pressable onPress={() => router.push("/subscriptions")} style={{ backgroundColor: "#f3f2ef", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#666" }}>View all</Text>
          </Pressable>
        </View>

        {(!subscriptions || subscriptions.length === 0) ? (
          /* Custom Premium Empty State for Subscriptions */
          <View style={{ padding: 32, backgroundColor: "white", borderRadius: 24, alignItems: "center", borderWidth: 1, borderColor: "#f2efe9", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 }}>
            <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "#eff6ff", justifyContent: "center", alignItems: "center", marginBottom: 16 }}>
              <Text style={{ fontSize: 28 }}>💳</Text>
            </View>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#1c1917", marginBottom: 4 }}>No Subscriptions Yet</Text>
            <Text style={{ color: "#78716c", fontSize: 12, textAlign: "center", lineHeight: 18, paddingHorizontal: 16, marginBottom: 20 }}>
              Track regular payments (Netflix, Spotify, Utilities) to analyze your spending.
            </Text>
            <Pressable
              onPress={() => router.push("/subscriptions/create")}
              style={{ backgroundColor: "#1c1917", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }}
            >
              <Text style={{ color: "white", fontSize: 12, fontWeight: "700" }}>+ Add Subscription</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {subscriptions.map((item: any, idx: number) => {
              const emoji = getCategoryEmoji(item.category);
              const accentColor = getCategoryColor(item.category);
              const cardBg = PASTEL_COLORS[idx % PASTEL_COLORS.length];
              const renewalFormatted = new Date(item.renewalDate).toLocaleDateString(undefined, { month: "short", day: "numeric" });
              
              return (
                <Pressable
                  key={item.id}
                  onPress={() => router.push({ pathname: "/subscriptions/[id]", params: { id: item.id } })}
                  style={{
                    backgroundColor: "white",
                    borderRadius: 20,
                    padding: 16,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#f2efe9",
                    borderLeftWidth: 5,
                    borderLeftColor: accentColor,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.02,
                    shadowRadius: 5,
                    elevation: 1,
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "#fafaf9", justifyContent: "center", alignItems: "center" }}>
                      <Text style={{ fontSize: 18 }}>{emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "700", fontSize: 14, color: "#1c1917" }}>{item.name}</Text>
                      <Text style={{ fontSize: 11, color: "#78716c", marginTop: 2 }}>Renews: {renewalFormatted}</Text>
                    </View>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: "#1c1917" }}>{symbol}{Math.round(item.amount)}</Text>
                    <Text style={{ fontSize: 9, color: "#78716c", marginTop: 2 }}>{item.billingType === "YEARLY" ? "yearly" : "monthly"}</Text>
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