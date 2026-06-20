import { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Pressable, ScrollView } from "react-native";
import { getSubscriptions } from "../../src/api/subscription.api";
import { getReminders } from "../../src/api/reminder.api";
import { api } from "../../src/api/axios";

const CATEGORIES = [
  { name: "Entertainment", icon: "🎬" },
  { name: "Utilities", icon: "🔌" },
  { name: "Software", icon: "💻" },
  { name: "Health", icon: "🏥" },
  { name: "Other", icon: "📦" },
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

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function CalendarScreen() {
  const [activeTab, setActiveTab] = useState<"Schedule" | "History">("Schedule");
  
  // Schedule states
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  // History states
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (activeTab === "Schedule") {
      loadData();
    } else {
      loadHistory();
    }
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const reminders = await getReminders();
      const subscriptions = await getSubscriptions();

      const reminderEvents = reminders.map((r: any) => ({
        id: r.id,
        title: r.title,
        date: r.dueDate,
        type: "Reminder",
        amount: r.amount,
        currency: r.currency || "INR",
        category: r.category || "Other",
      }));

      const subscriptionEvents = subscriptions.map((s: any) => ({
        id: s.id,
        title: s.name,
        date: s.renewalDate,
        type: "Subscription",
        amount: s.amount,
        currency: s.currency || "INR",
        category: s.category || "Other",
      }));

      const merged = [...reminderEvents, ...subscriptionEvents].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setItems(merged);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await api.get("/analytics/history");
      setHistoryItems(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Custom Calendar Grid Logic
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  const hasEventOnDay = (day: number) => {
    return items.some((item) => {
      const d = new Date(item.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  };

  // Filter events by selected day
  const displayedEvents = items.filter((item) => {
    if (selectedDay === null) return true;
    const d = new Date(item.date);
    return d.getFullYear() === year && d.getMonth() === month && d.getDate() === selectedDay;
  });

  return (
    <View style={{ flex: 1, backgroundColor: "#f9f9f9" }}>
      {/* Top Segmented Tabs */}
      <View style={{ flexDirection: "row", padding: 16, backgroundColor: "white", borderBottomWidth: 1, borderColor: "#eee", gap: 10 }}>
        <Pressable
          onPress={() => setActiveTab("Schedule")}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            backgroundColor: activeTab === "Schedule" ? "black" : "#f0f0f0",
          }}
        >
          <Text style={{ textAlign: "center", fontWeight: "600", color: activeTab === "Schedule" ? "white" : "black" }}>
            Calendar Schedule
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab("History")}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            backgroundColor: activeTab === "History" ? "black" : "#f0f0f0",
          }}
        >
          <Text style={{ textAlign: "center", fontWeight: "600", color: activeTab === "History" ? "white" : "black" }}>
            Payment History
          </Text>
        </Pressable>
      </View>

      {activeTab === "Schedule" ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          {/* Month Navigator Header */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 }}>
            <Pressable onPress={handlePrevMonth} style={{ padding: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>←</Text>
            </Pressable>
            <Text style={{ fontSize: 18, fontWeight: "700" }}>
              {MONTH_NAMES[month]} {year}
            </Text>
            <Pressable onPress={handleNextMonth} style={{ padding: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>→</Text>
            </Pressable>
          </View>

          {/* Calendar Grid Container */}
          <View style={{ backgroundColor: "white", padding: 12, marginHorizontal: 16, borderRadius: 12, borderWidth: 1, borderColor: "#eee" }}>
            {/* Weekdays Row */}
            <View style={{ flexDirection: "row", marginBottom: 8 }}>
              {WEEKDAYS.map((day) => (
                <Text key={day} style={{ flex: 1, textAlign: "center", fontWeight: "600", opacity: 0.5, fontSize: 13 }}>
                  {day}
                </Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {/* Empty leading cells */}
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <View key={`empty-${i}`} style={{ width: `${100 / 7}%`, aspectRatio: 1.1 }} />
              ))}

              {/* Month day cells */}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const isSelected = selectedDay === dayNum;
                const hasEvent = hasEventOnDay(dayNum);
                const isToday = new Date().getDate() === dayNum && new Date().getMonth() === month && new Date().getFullYear() === year;

                return (
                  <Pressable
                    key={`day-${dayNum}`}
                    onPress={() => setSelectedDay(isSelected ? null : dayNum)}
                    style={{
                      width: `${100 / 7}%`,
                      aspectRatio: 1.1,
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: 8,
                      backgroundColor: isSelected ? "black" : isToday ? "#e0e0e0" : "transparent",
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: isSelected || isToday ? "bold" : "500",
                        color: isSelected ? "white" : "#111",
                        fontSize: 14,
                      }}
                    >
                      {dayNum}
                    </Text>
                    {hasEvent && (
                      <View
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: 2,
                          backgroundColor: isSelected ? "white" : "black",
                          marginTop: 2,
                        }}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Day Events Header */}
          <View style={{ paddingHorizontal: 16, marginTop: 20, marginBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#333" }}>
              {selectedDay ? `Payments on ${MONTH_NAMES[month]} ${selectedDay}` : "All Monthly Payments"}
            </Text>
            {selectedDay !== null && (
              <Pressable onPress={() => setSelectedDay(null)}>
                <Text style={{ color: "blue", fontSize: 12, fontWeight: "600" }}>Show All</Text>
              </Pressable>
            )}
          </View>

          {loading ? (
            <ActivityIndicator style={{ marginTop: 20 }} />
          ) : displayedEvents.length === 0 ? (
            <Text style={{ textAlign: "center", marginTop: 24, opacity: 0.5, fontSize: 14 }}>
              No scheduled events for this date range.
            </Text>
          ) : (
            <View style={{ paddingHorizontal: 16 }}>
              {displayedEvents.map((item) => {
                const catObj = CATEGORIES.find((c) => c.name === item.category);
                const icon = catObj ? catObj.icon : "🗓️";
                const symbol = getCurrencySymbol(item.currency);

                return (
                  <View
                    key={item.id}
                    style={{
                      backgroundColor: "white",
                      borderWidth: 1,
                      borderColor: "#eee",
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#f0f0f0", justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ fontSize: 18 }}>{icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "600", fontSize: 15, color: "#111" }}>{item.title}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                          <View style={{ paddingVertical: 1, paddingHorizontal: 4, borderRadius: 3, backgroundColor: item.type === "Subscription" ? "black" : "#e0e0e0" }}>
                            <Text style={{ fontSize: 9, fontWeight: "600", color: item.type === "Subscription" ? "white" : "#444" }}>
                              {item.type}
                            </Text>
                          </View>
                          <Text style={{ fontSize: 11, opacity: 0.6 }}>
                            {new Date(item.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      {item.amount && (
                        <Text style={{ fontSize: 15, fontWeight: "700", color: "#111" }}>
                          {symbol}{Math.round(item.amount)}
                        </Text>
                      )}
                      {item.type === "Subscription" && <Text style={{ fontSize: 9, opacity: 0.5 }}>/ mo</Text>}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      ) : (
        /* History logs tab */
        <View style={{ flex: 1, padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#333", marginBottom: 12 }}>
            Roll Over Payments Ledger
          </Text>

          {loadingHistory ? (
            <ActivityIndicator style={{ marginTop: 40 }} />
          ) : historyItems.length === 0 ? (
            <Text style={{ textAlign: "center", marginTop: 40, opacity: 0.5 }}>
              No payments rolled over yet.
            </Text>
          ) : (
            <FlatList
              data={historyItems}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const subObj = item.subscription || {};
                const catObj = CATEGORIES.find((c) => c.name === subObj.category);
                const icon = catObj ? catObj.icon : "🗓️";
                const symbol = getCurrencySymbol(item.currency);

                return (
                  <View
                    style={{
                      backgroundColor: "white",
                      borderWidth: 1,
                      borderColor: "#eee",
                      borderRadius: 12,
                      padding: 16,
                      marginBottom: 10,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: "#eef7ee", justifyContent: "center", alignItems: "center" }}>
                        <Text style={{ fontSize: 18 }}>{icon}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: "600", fontSize: 15, color: "#111" }}>{subObj.name || "Subscription"}</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
                          <View style={{ paddingVertical: 1, paddingHorizontal: 4, borderRadius: 3, backgroundColor: "#e8f5e9" }}>
                            <Text style={{ fontSize: 9, fontWeight: "600", color: "#2e7d32" }}>
                              SUCCESS
                            </Text>
                          </View>
                          <Text style={{ fontSize: 11, opacity: 0.6 }}>
                            Paid {new Date(item.paymentDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ fontSize: 15, fontWeight: "700", color: "#2e7d32" }}>
                        +{symbol}{Math.round(item.amount)}
                      </Text>
                      <Text style={{ fontSize: 9, opacity: 0.5 }}>rolled</Text>
                    </View>
                  </View>
                );
              }}
            />
          )}
        </View>
      )}
    </View>
  );
}
