import { api } from "./axios";

export async function getDashboard() {
    const res = await api.get("/analytics/dashboard");
    return res.data.data;
}