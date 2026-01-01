import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertReferralSetting } from "@shared/routes";

export function useReferrals() {
  return useQuery({
    queryKey: [api.referrals.list.path],
    queryFn: async () => {
      const res = await fetch(api.referrals.list.path);
      if (!res.ok) throw new Error("Failed to fetch referrals");
      return api.referrals.list.responses[200].parse(await res.json());
    },
  });
}

export function useReferralStats() {
  return useQuery({
    queryKey: [api.referrals.stats.path],
    queryFn: async () => {
      const res = await fetch(api.referrals.stats.path);
      if (!res.ok) throw new Error("Failed to fetch referral stats");
      return api.referrals.stats.responses[200].parse(await res.json());
    },
  });
}

// Admin hooks
export function useReferralSettings() {
  return useQuery({
    queryKey: [api.admin.referralSettings.list.path],
    queryFn: async () => {
      const res = await fetch(api.admin.referralSettings.list.path);
      if (!res.ok) throw new Error("Failed to fetch referral settings");
      return api.admin.referralSettings.list.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateReferralSetting() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertReferralSetting) => {
      const res = await fetch(api.admin.referralSettings.update.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update referral setting");
      return api.admin.referralSettings.update.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.admin.referralSettings.list.path] });
    },
  });
}
