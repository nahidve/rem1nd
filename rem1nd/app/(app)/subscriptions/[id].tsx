import { useEffect, useState } from "react";
import { View, Text, Pressable, Alert, ScrollView, TextInput, ActivityIndicator, Switch } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { api } from "../../../src/api/axios";
import { useAuthStore } from "../../../src/store/auth.store";

export default function SubscriptionDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const [item, setItem] = useState<any>(null);
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [groupLoading, setGroupLoading] = useState(false);

  // Invite form states
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePercentage, setInvitePercentage] = useState("");

  // Edit percentage states
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editPercentage, setEditPercentage] = useState("");

  const subscriptionId = Array.isArray(id) ? id[0] : id;

  useEffect(() => {
    loadData();
  }, [subscriptionId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load subscription details
      const subRes = await api.get(`/subscriptions/${subscriptionId}`);
      setItem(subRes.data.data);

      // Try to load group details
      await loadGroupDetails();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to load subscription details");
    } finally {
      setLoading(false);
    }
  };

  const loadGroupDetails = async () => {
    try {
      const groupRes = await api.get(`/subscriptions/${subscriptionId}/group`);
      setGroup(groupRes.data.data);
    } catch (e: any) {
      // Group not found is expected if splitting is not activated
      setGroup(null);
    }
  };

  const handleDelete = async () => {
    Alert.alert("Delete Subscription", "Are you sure you want to delete this subscription?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/subscriptions/${subscriptionId}`);
            router.replace("/subscriptions");
          } catch (e: any) {
            Alert.alert("Error", e.message);
          }
        },
      },
    ]);
  };

  const handleActivateGroup = async () => {
    setGroupLoading(true);
    try {
      const res = await api.post(`/subscriptions/${subscriptionId}/group`);
      setGroup(res.data.data);
      Alert.alert("Success", "Bill splitting activated successfully!");
      await loadGroupDetails();
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || e.message);
    } finally {
      setGroupLoading(false);
    }
  };

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      Alert.alert("Error", "Please enter an email address");
      return;
    }
    const pct = Number(invitePercentage);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      Alert.alert("Error", "Please enter a valid percentage between 0 and 100");
      return;
    }

    setGroupLoading(true);
    try {
      await api.post(`/subscriptions/${subscriptionId}/group/members`, {
        email: inviteEmail.trim().toLowerCase(),
        sharePercentage: pct,
      });
      setInviteEmail("");
      setInvitePercentage("");
      Alert.alert("Success", "Invitation sent!");
      await loadGroupDetails();
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || e.message);
    } finally {
      setGroupLoading(false);
    }
  };

  const handleUpdateStatus = async (memberId: string, status: "ACCEPTED" | "DECLINED") => {
    setGroupLoading(true);
    try {
      await api.put(`/subscriptions/${subscriptionId}/group/members/${memberId}`, {
        status,
      });
      Alert.alert("Success", `Invitation ${status.toLowerCase()}ed`);
      await loadGroupDetails();
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || e.message);
    } finally {
      setGroupLoading(false);
    }
  };

  const handleUpdatePercentage = async (memberId: string) => {
    const pct = Number(editPercentage);
    if (isNaN(pct) || pct < 0 || pct > 100) {
      Alert.alert("Error", "Please enter a valid percentage between 0 and 100");
      return;
    }

    setGroupLoading(true);
    try {
      await api.put(`/subscriptions/${subscriptionId}/group/members/${memberId}`, {
        sharePercentage: pct,
      });
      setEditingMemberId(null);
      setEditPercentage("");
      Alert.alert("Success", "Percentage updated");
      await loadGroupDetails();
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || e.message);
    } finally {
      setGroupLoading(false);
    }
  };

  const handleTogglePay = async (memberId: string, currentPaid: boolean) => {
    try {
      await api.put(`/subscriptions/${subscriptionId}/group/members/${memberId}/pay`, {
        paid: !currentPaid,
      });
      await loadGroupDetails();
    } catch (e: any) {
      Alert.alert("Error", e.response?.data?.message || e.message);
    }
  };

  if (loading || !item) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fafaf9" }}>
        <ActivityIndicator size="large" color="#1c1917" />
      </View>
    );
  }

  const isOwner = item.userId === user?.dbUserId;
  const currencySymbol = item.currency === "USD" ? "$" : item.currency === "EUR" ? "€" : item.currency === "GBP" ? "£" : "₹";

  // Calculate sum of active shares
  const totalAllocatedShares = group
    ? group.members.reduce((sum: number, m: any) => sum + Number(m.sharePercentage), 0)
    : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fafaf9" }} edges={["bottom"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
        {/* Subscription Info Card */}
        <View style={{ backgroundColor: "white", padding: 16, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, gap: 8 }}>
          <Text style={{ fontSize: 24, fontWeight: "700", color: "#1c1917" }}>{item.name}</Text>
          <Text style={{ fontSize: 18, fontWeight: "600", color: "#1c1917" }}>
            {currencySymbol}
            {item.amount} <Text style={{ fontSize: 14, fontWeight: "400", color: "#666" }}>/ {item.billingType.toLowerCase()}</Text>
          </Text>
          <View style={{ height: 1, backgroundColor: "#f1f5f9", marginVertical: 8 }} />
          <Text style={{ fontSize: 14, color: "#444" }}>
            📅 Next Renewal: <Text style={{ fontWeight: "600" }}>{new Date(item.renewalDate).toLocaleDateString()}</Text>
          </Text>
          <Text style={{ fontSize: 14, color: "#444" }}>
            ⚙️ Auto Pay: <Text style={{ fontWeight: "600" }}>{item.autoPay ? "Enabled" : "Disabled"}</Text>
          </Text>
        </View>

        {/* Bill Splitting Section */}
        <View style={{ backgroundColor: "white", padding: 16, borderRadius: 12, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#1c1917" }}>👥 Subscription Sharing & Splits</Text>
          
          {groupLoading && <ActivityIndicator color="#1c1917" style={{ marginVertical: 10 }} />}

          {!group ? (
            <View style={{ gap: 8 }}>
              <Text style={{ fontSize: 14, color: "#666" }}>
                Split the bill of this subscription by creating a group and inviting others. You can define split percentages and track payment statuses.
              </Text>
              <Pressable
                onPress={handleActivateGroup}
                disabled={groupLoading}
                style={{ padding: 12, backgroundColor: "black", borderRadius: 8, marginTop: 4 }}
              >
                <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>
                  Activate Bill Splitting
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {/* Members List */}
              <Text style={{ fontSize: 14, fontWeight: "600", color: "#444" }}>Group Members ({group.members.length})</Text>
              
              <View style={{ gap: 10 }}>
                {group.members.map((member: any) => {
                  const isCurrentUser = member.userId === user?.dbUserId || (user?.email && member.email === user.email);
                  const splitAmountValue = (Number(item.amount) * Number(member.sharePercentage)) / 100;
                  
                  return (
                    <View key={member.id} style={{ padding: 12, borderRadius: 8, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", gap: 8 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <View style={{ flex: 1, gap: 2 }}>
                          <Text style={{ fontWeight: "600", fontSize: 14, color: "#1e293b" }}>
                            {member.email} {isCurrentUser && <Text style={{ color: "#0ea5e9", fontSize: 11 }}>(You)</Text>}
                          </Text>
                          <Text style={{ fontSize: 13, color: "#64748b" }}>
                            Split: {currencySymbol}{splitAmountValue.toFixed(2)} ({Number(member.sharePercentage)}%)
                          </Text>
                        </View>
                        <View style={{ alignItems: "flex-end", gap: 4 }}>
                          <Text style={{
                            fontSize: 11,
                            fontWeight: "700",
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 12,
                            overflow: "hidden",
                            backgroundColor: member.status === "ACCEPTED" ? "#ecfdf5" : member.status === "DECLINED" ? "#fef2f2" : "#fffbeb",
                            color: member.status === "ACCEPTED" ? "#047857" : member.status === "DECLINED" ? "#b91c1c" : "#b45309"
                          }}>
                            {member.status}
                          </Text>
                          <Text style={{
                            fontSize: 11,
                            fontWeight: "700",
                            paddingHorizontal: 8,
                            paddingVertical: 3,
                            borderRadius: 12,
                            overflow: "hidden",
                            backgroundColor: member.paid ? "#e0f2fe" : "#f1f5f9",
                            color: member.paid ? "#0369a1" : "#475569"
                          }}>
                            {member.paid ? "PAID" : "UNPAID"}
                          </Text>
                        </View>
                      </View>

                      {/* Actions row */}
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 8, marginTop: 4 }}>
                        {/* Status update buttons for PENDING invitee */}
                        {isCurrentUser && member.status === "PENDING" ? (
                          <View style={{ flexDirection: "row", gap: 8 }}>
                            <Pressable
                              onPress={() => handleUpdateStatus(member.id, "ACCEPTED")}
                              style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#10b981", borderRadius: 6 }}
                            >
                              <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Accept</Text>
                            </Pressable>
                            <Pressable
                              onPress={() => handleUpdateStatus(member.id, "DECLINED")}
                              style={{ paddingVertical: 6, paddingHorizontal: 12, backgroundColor: "#ef4444", borderRadius: 6 }}
                            >
                              <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Decline</Text>
                            </Pressable>
                          </View>
                        ) : <View />}

                        {/* Payment Toggle Switch - allowed for owner or the member themselves */}
                        {(isOwner || isCurrentUser) && (
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <Text style={{ fontSize: 12, color: "#64748b" }}>Mark as Paid</Text>
                            <Switch
                              value={member.paid}
                              onValueChange={() => handleTogglePay(member.id, member.paid)}
                              trackColor={{ false: "#cbd5e1", true: "#0ea5e9" }}
                              thumbColor={member.paid ? "white" : "#f1f5f9"}
                            />
                          </View>
                        )}
                      </View>

                      {/* Editing Split Percentage option for Owner */}
                      {isOwner && editingMemberId !== member.id && (
                        <Pressable
                          onPress={() => {
                            setEditingMemberId(member.id);
                            setEditPercentage(String(Number(member.sharePercentage)));
                          }}
                          style={{ alignSelf: "flex-start", marginTop: 4 }}
                        >
                          <Text style={{ fontSize: 12, color: "#3b82f6", textDecorationLine: "underline" }}>Edit split share</Text>
                        </Pressable>
                      )}

                      {editingMemberId === member.id && (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
                          <TextInput
                            value={editPercentage}
                            onChangeText={setEditPercentage}
                            placeholder="Share %"
                            keyboardType="numeric"
                            style={{ borderWidth: 1, borderColor: "#cbd5e1", padding: 6, borderRadius: 6, width: 80, backgroundColor: "white" }}
                          />
                          <Pressable
                            onPress={() => handleUpdatePercentage(member.id)}
                            style={{ paddingVertical: 6, paddingHorizontal: 10, backgroundColor: "black", borderRadius: 6 }}
                          >
                            <Text style={{ color: "white", fontSize: 12 }}>Save</Text>
                          </Pressable>
                          <Pressable
                            onPress={() => setEditingMemberId(null)}
                            style={{ paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 6 }}
                          >
                            <Text style={{ color: "#64748b", fontSize: 12 }}>Cancel</Text>
                          </Pressable>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>

              {/* Share percentage checker */}
              <View style={{ padding: 10, backgroundColor: totalAllocatedShares > 100 ? "#fef2f2" : "#f8fafc", borderRadius: 8, marginTop: 4 }}>
                <Text style={{ fontSize: 13, color: totalAllocatedShares > 100 ? "#ef4444" : "#475569" }}>
                  Total split share allocated: <Text style={{ fontWeight: "700" }}>{totalAllocatedShares}%</Text>
                  {totalAllocatedShares > 100 && " (Warning: total percentage exceeds 100%)"}
                </Text>
              </View>

              {/* Owner utilities: Invite form */}
              {isOwner && (
                <View style={{ borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 12, marginTop: 4, gap: 8 }}>
                  <Text style={{ fontSize: 14, fontWeight: "600", color: "#444" }}>Invite New Member</Text>
                  
                  <View style={{ gap: 8 }}>
                    <TextInput
                      placeholder="Invitee Email Address"
                      value={inviteEmail}
                      onChangeText={setInviteEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={{ borderWidth: 1, padding: 10, borderRadius: 8, borderColor: "#cbd5e1" }}
                    />
                    
                    <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                      <TextInput
                        placeholder="Split share percentage"
                        value={invitePercentage}
                        onChangeText={setInvitePercentage}
                        keyboardType="numeric"
                        style={{ flex: 1, borderWidth: 1, padding: 10, borderRadius: 8, borderColor: "#cbd5e1" }}
                      />
                      <Text style={{ fontSize: 16, fontWeight: "600", color: "#475569" }}>%</Text>
                    </View>

                    <Pressable
                      onPress={handleInviteMember}
                      disabled={groupLoading}
                      style={{ padding: 12, backgroundColor: "black", borderRadius: 8, marginTop: 4 }}
                    >
                      <Text style={{ color: "white", textAlign: "center", fontWeight: "600" }}>
                        Send Invitation
                      </Text>
                    </Pressable>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Delete button (Owner only) */}
        {isOwner && (
          <Pressable
            onPress={handleDelete}
            style={{
              padding: 14,
              backgroundColor: "#ef4444",
              borderRadius: 8,
              marginTop: 8,
            }}
          >
            <Text style={{ color: "white", textAlign: "center", fontWeight: "600", fontSize: 16 }}>Delete Subscription</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
