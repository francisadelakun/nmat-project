import { useUser } from "@/hooks/use-auth";
import { useWithdrawals, useCreateWithdrawal } from "@/hooks/use-withdrawals";
import { useReferralSettings } from "@/hooks/use-referrals";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2, History, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

export default function WithdrawPage() {
  const { data: user } = useUser();
  const { data: settings } = useReferralSettings();
  const { data: withdrawals, isLoading: historyLoading } = useWithdrawals();
  const { mutate: requestWithdrawal, isPending } = useCreateWithdrawal();
  const { toast } = useToast();

  const minWithdrawal = useMemo(() => {
    if (!user || !settings) return 20;
    const countrySetting = settings.find(s => s.country === user.country);
    return countrySetting ? Number(countrySetting.minWithdrawal) : 20;
  }, [user, settings]);

  const withdrawalSchema = useMemo(() => z.object({
    amount: z.coerce.number().min(minWithdrawal, `Minimum withdrawal is ${minWithdrawal} USDT`),
    walletAddress: z.string().min(10, "Invalid wallet address"),
    network: z.enum(["TRC20", "ERC20"]),
  }), [minWithdrawal]);

  const form = useForm<z.infer<typeof withdrawalSchema>>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: minWithdrawal,
      walletAddress: "",
      network: "TRC20",
    },
  });

  const totalBalance = Number(user?.balanceTask || 0) + Number(user?.balanceReferral || 0);

  function onSubmit(values: z.infer<typeof withdrawalSchema>) {
    if (values.amount > totalBalance) {
      form.setError("amount", { message: "Insufficient balance" });
      return;
    }

    requestWithdrawal(values, {
      onSuccess: () => {
        toast({
          title: "Request Submitted",
          description: "Your withdrawal request has been received.",
        });
        form.reset({
            amount: minWithdrawal,
            walletAddress: "",
            network: "TRC20"
        });
      },
      onError: (err) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: err.message,
        });
      },
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileNav />
      
      <div className="md:pl-64 p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Withdraw Funds</h1>
          <p className="text-muted-foreground">Request payout to your crypto wallet</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Withdrawal Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>New Request</CardTitle>
                <CardDescription>Minimum withdrawal amount for {user?.country || 'your country'} is {minWithdrawal.toFixed(2)} USDT</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/10 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Balance</p>
                    <p className="text-2xl font-bold text-primary">${totalBalance.toFixed(2)} USDT</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => form.setValue("amount", Math.floor(totalBalance))}>
                    Max
                  </Button>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (USDT)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="network"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Network</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select network" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="TRC20">TRC20 (Tron)</SelectItem>
                                <SelectItem value="ERC20">ERC20 (Ethereum)</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="walletAddress"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Wallet Address</FormLabel>
                            <FormControl>
                              <Input placeholder="T..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="submit" className="w-full" disabled={isPending}>
                      {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Submit Request
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          {/* History Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5" /> History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="text-center py-4 text-muted-foreground">Loading...</div>
                ) : withdrawals?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                    <p>No withdrawals yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {withdrawals?.map((w) => (
                      <div key={w.id} className="p-3 bg-muted/50 rounded-lg border border-border">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold">${Number(w.amount).toFixed(2)}</span>
                          <Badge variant={w.status === 'approved' ? 'default' : w.status === 'rejected' ? 'destructive' : 'secondary'}>
                            {w.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground truncate font-mono mb-1">
                          {w.walletAddress}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(w.createdAt), 'MMM d, yyyy HH:mm')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
