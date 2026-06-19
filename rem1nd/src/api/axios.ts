import axios from "axios";
import { getToken } from "../utils/token";

export const api = axios.create({ baseURL: "http://10.0.2.2:5000/api/v1" });
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
