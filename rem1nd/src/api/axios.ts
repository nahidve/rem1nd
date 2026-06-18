import axios from "axios";
import { getToken } from "../utils/token";

export const api = axios.create({
  baseURL: "http://192.168.0.102:5000/api/v1",
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
