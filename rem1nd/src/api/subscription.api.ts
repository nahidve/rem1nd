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
