import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from "react-native";
import { useRouter } from "expo-router";
import { useDashboard } from "../../src/queries/dashboard.query";
import { getDashboard } from "../../src/api/analytics.api";
import { useAuthStore } from "../../src/store/auth.store";

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

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data, isLoading, error } = useDashboard();

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
        <Text>Failed to load dashboard</Text>
      </View>
    );
  }

  if (!data) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {" "}
        <ActivityIndicator />{" "}
      </View>
    );
  }

  const symbol = getCurrencySymbol(data.homeCurrency);

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "700",
          marginBottom: 20,
        }}
      >
        Dashboard{" "}
      </Text>
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <Pressable
          onPress={() => router.push("/reminders/create")}
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: "black",
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
            }}
          >
            New Reminder
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/subscriptions/create")}
          style={{
            flex: 1,
            padding: 12,
            backgroundColor: "black",
            borderRadius: 10,
          }}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
            }}
          >
            New Subscription
          </Text>
        </Pressable>
      </View>
      <View
        style={{
          borderWidth: 1,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            opacity: 0.7,
          }}
        >
          Monthly Spend
        </Text>

        <Text
          style={{
            fontSize: 28,
            fontWeight: "700",
          }}
        >
          {symbol}{Math.round(data.totalMonthlySpend)}
        </Text>
      </View>
      <View
        style={{
          borderWidth: 1,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            opacity: 0.7,
          }}
        >
          Yearly Spend Estimate
        </Text>

        <Text
          style={{
            fontSize: 24,
            fontWeight: "700",
          }}
        >
          {symbol}{Math.round(data.yearlySpendEstimate)}
        </Text>
      </View>

      {/* Category Spending Breakdown */}
      {data.categoryBreakdown && Object.keys(data.categoryBreakdown).length > 0 && (
        <View
          style={{
            borderWidth: 1,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderColor: "#ddd",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", marginBottom: 12 }}>
            Monthly Spend by Category
          </Text>
          {Object.entries(data.categoryBreakdown).map(([category, amount]) => {
            const percentage = Math.min(
              100,
              Math.round((Number(amount) / (data.totalMonthlySpend || 1)) * 100)
            );
            return (
              <View key={category} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text style={{ fontWeight: "500" }}>{category}</Text>
                  <Text style={{ fontWeight: "600", opacity: 0.8 }}>
                    {symbol}{Math.round(Number(amount))} ({percentage}%)
                  </Text>
                </View>
                <View style={{ height: 8, backgroundColor: "#eee", borderRadius: 4, overflow: "hidden" }}>
                  <View
                    style={{
                      height: "100%",
                      width: `${percentage}%`,
                      backgroundColor: "black",
                      borderRadius: 4,
                    }}
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View
        style={{
          flexDirection: "row",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <View
          style={{
            flex: 1,
            borderWidth: 1,
            borderRadius: 12,
            padding: 16,
          }}
        >
          <Text>Subscriptions</Text>

          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
            }}
          >
            {data.subscriptionCount}
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            borderWidth: 1,
            borderRadius: 12,
            padding: 16,
          }}
        >
          <Text>Upcoming</Text>

          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
            }}
          >
            {data.upcomingReminders}
          </Text>
        </View>
      </View>
      <View
        style={{
          borderWidth: 1,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            opacity: 0.7,
          }}
        >
          Highest Subscription
        </Text>

        {data.highestSubscription ? (
          <>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
              }}
            >
              {data.highestSubscription.name}
            </Text>

            <Text>
              {getCurrencySymbol(data.highestSubscription.currency)}
              {data.highestSubscription.amount} / month
            </Text>
          </>
        ) : (
          <Text>No subscriptions</Text>
        )}
      </View>
      <View
        style={{
          borderWidth: 1,
          borderRadius: 12,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            opacity: 0.7,
          }}
        >
          Next Renewal
        </Text>

        {data.nextPayment ? (
          <>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
              }}
            >
              {data.nextPayment.name}
            </Text>

            <Text>
              {new Date(data.nextPayment.renewalDate).toLocaleDateString()}
            </Text>
          </>
        ) : (
          <Text>No upcoming renewals</Text>
        )}
      </View>
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          marginBottom: 12,
        }}
      >
        Next 7 Days
      </Text>
      <FlatList
        scrollEnabled={false}
        data={data.reminders}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={() => <Text>No upcoming reminders.</Text>}
        renderItem={({ item }) => (
          <View
            style={{
              borderWidth: 1,
              borderRadius: 10,
              padding: 12,
              marginBottom: 10,
            }}
          >
            <Text
              style={{
                fontWeight: "600",
              }}
            >
              {item.title}
            </Text>

            <Text>{new Date(item.dueDate).toLocaleDateString()}</Text>
          </View>
        )}
      />
    </ScrollView>
  );
}
