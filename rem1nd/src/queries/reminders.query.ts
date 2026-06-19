import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/axios";

async function fetchReminders() {
  const res = await api.get("/reminders");
  return res.data.data;
}

export function useReminders() {
  return useQuery({
    queryKey: ["reminders"],
    queryFn: fetchReminders,
  });
}

export function useDeleteReminder() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/reminders/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reminders"] });
    },
  });
}
