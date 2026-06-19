import { useQuery } from "@tanstack/react-query";
import { getDashboard } from "../api/analytics.api";

export function useDashboard(userId?: string) {
  return useQuery({
    queryKey: ["dashboard", userId],
    queryFn: getDashboard,
  });
}
