import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertWithdrawal } from "@shared/routes";

export function useWithdrawals() {
  return useQuery({
    queryKey: [api.withdrawals.list.path],
    queryFn: async () => {
      const res = await fetch(api.withdrawals.list.path);
      if (!res.ok) throw new Error("Failed to fetch withdrawals");
      return api.withdrawals.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertWithdrawal) => {
      // Amount is usually a string in schema (numeric), but inputs might be number
      const payload = {
        ...data,
        amount: String(data.amount), 
      };
      
      const res = await fetch(api.withdrawals.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to request withdrawal");
      return api.withdrawals.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.withdrawals.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] }); // Update balance
    },
  });
}

// Admin hooks
export function useAdminWithdrawals() {
  return useQuery({
    queryKey: [api.admin.withdrawals.list.path],
    queryFn: async () => {
      const res = await fetch(api.admin.withdrawals.list.path);
      if (!res.ok) throw new Error("Failed to fetch admin withdrawals");
      return api.admin.withdrawals.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateWithdrawalStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'approved' | 'rejected' | 'pending' }) => {
      const url = buildUrl(api.admin.withdrawals.update.path, { id });
      const res = await fetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update withdrawal status");
      return api.admin.withdrawals.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.withdrawals.list.path] });
    },
  });
}
