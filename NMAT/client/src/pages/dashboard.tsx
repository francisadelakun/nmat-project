import { useUser } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";
import { useAnnouncements } from "@/hooks/use-announcements";
import { useReferralStats } from "@/hooks/use-referrals";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskCard } from "@/components/dashboard/task-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Megaphone, Copy, Users, DollarSign, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: announcements } = useAnnouncements();
  const { data: referralStats } = useReferralStats();
  const { toast } = useToast();

  if (userLoading) return <div className="h-screen w-full flex items-center justify-center"><Skeleton className="w-[100px] h-[20px] rounded-full" /></div>;
  if (!user) return null; // Redirect handled by hook/router logic typically

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileNav />
      
      <div className="md:pl-64 p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.username} from {user.country}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary/50 px-3 py-1 rounded-full border border-border">
            <span>Server Time: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Announcements */}
        {announcements && announcements.length > 0 && (
          <div className="space-y-4">
            {announcements.map((ann) => (
              <Alert key={ann.id} className="bg-primary/5 border-primary/20 text-primary">
                <Megaphone className="h-4 w-4" />
                <AlertTitle>Announcement</AlertTitle>
                <AlertDescription>
                  {ann.content}
                </AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 border-none">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium opacity-90 flex items-center gap-2">
                <Wallet className="w-5 h-5" /> Task Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">${Number(user.balanceTask).toFixed(2)}</div>
              <p className="text-xs opacity-75 mt-1">Earnings from completed offers</p>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" /> Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">{referralStats?.totalReferrals || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {referralStats?.pendingReferrals || 0} pending verification
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card shadow-sm border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" /> Referral Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">${Number(user.balanceReferral).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground mt-1">Total earned from invites</p>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Section */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Available Tasks</h2>
          {tasksLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[200px] rounded-xl" />
              ))}
            </div>
          ) : tasks?.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground">No tasks available for your country at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks?.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>

        {/* Referral Link Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Invite Friends & Earn</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4 items-center">
            <code className="flex-1 bg-muted p-3 rounded-lg border border-border text-sm font-mono break-all w-full">
              {window.location.origin}/register?ref={user.referralCode}
            </code>
            <Button onClick={copyReferralLink} className="whitespace-nowrap w-full sm:w-auto">
              <Copy className="w-4 h-4 mr-2" /> Copy Link
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
