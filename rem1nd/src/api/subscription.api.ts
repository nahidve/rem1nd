import { api } from "./axios";

export type Subscription = {
  id: string;
  name: string;
  amount: number;
  billingType: "MONTHLY" | "YEARLY";
  renewalDate: string;
  autoPay: boolean;
};

export async function getSubscriptions(): Promise<Subscription[]> {
  const res = await api.get("/subscriptions");
  return res.data.data;
}

export async function getSubscription(id: string) {
  const res = await api.get(`/subscriptions/${id}`);
  return res.data.data;
}

export async function createSubscription(data: {
  name: string;
  amount: number;
  billingType: "MONTHLY" | "YEARLY";
  renewalDate: string;
  autoPay: boolean;
}) {
  const res = await api.post("/subscriptions", data);
  return res.data.data;
}

export async function updateSubscription(
  id: string,
  data: Partial<{
    name: string;
    amount: number;
    billingType: "MONTHLY" | "YEARLY";
    renewalDate: string;
    autoPay: boolean;
  }>,
) {
  const res = await api.patch(`/subscriptions/${id}`, data);
  return res.data.data;
}

export async function deleteSubscription(id: string) {
  await api.delete(`/subscriptions/${id}`);
}
