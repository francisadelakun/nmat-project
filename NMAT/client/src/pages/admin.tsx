import { useAdminUsers, useUpdateUserStatus } from "@/hooks/use-admin-users";
import { useAdminTasks, useCreateTask, useDeleteTask } from "@/hooks/use-tasks";
import { useAdminWithdrawals, useUpdateWithdrawalStatus } from "@/hooks/use-withdrawals";
import { useReferralSettings, useUpdateReferralSetting } from "@/hooks/use-referrals";
import { useAnnouncements, useCreateAnnouncement, useDeleteAnnouncement } from "@/hooks/use-announcements";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Plus, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { countries } from "@shared/countries";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <MobileNav />
      
      <div className="md:pl-64 p-6 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Portal</h1>
          <p className="text-muted-foreground">Manage users, tasks, and settings</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Users</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <UsersTab />
          </TabsContent>
          
          <TabsContent value="tasks">
            <TasksTab />
          </TabsContent>

          <TabsContent value="withdrawals">
            <WithdrawalsTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function UsersTab() {
  const { data: users, isLoading } = useAdminUsers();
  const { mutate: updateUser } = useUpdateUserStatus();

  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>View and manage registered users.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="font-medium">{user.username}</div>
                  <div className="text-xs text-muted-foreground">{user.email}</div>
                </TableCell>
                <TableCell>{user.country}</TableCell>
                <TableCell>${(Number(user.balanceTask) + Number(user.balanceReferral)).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? "secondary" : "destructive"}>
                    {user.isActive ? "Active" : "Blocked"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateUser({ id: user.id, isActive: !user.isActive })}
                  >
                    {user.isActive ? "Block" : "Unblock"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TasksTab() {
  const { data: tasks } = useAdminTasks();
  const { mutate: createTask } = useCreateTask();
  const { mutate: deleteTask } = useDeleteTask();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createTask({
      tagName: formData.get("tagName") as string,
      country: formData.get("country") as string,
      smartLink: formData.get("smartLink") as string,
      rewardAmount: formData.get("rewardAmount") as string,
      isActive: true,
    }, {
      onSuccess: () => {
        setOpen(false);
        toast({ title: "Task created" });
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Task Management</CardTitle>
          <CardDescription>Create tasks for specific countries.</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Add Task</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Tag Name</Label>
                <Input name="tagName" placeholder="e.g. Tag 1" required />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Select name="country" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {countries.map(c => (
                      <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Smart Link URL</Label>
                <Input name="smartLink" placeholder="https://..." required />
              </div>
              <div className="space-y-2">
                <Label>Reward Amount (USDT)</Label>
                <Input name="rewardAmount" type="number" step="0.01" required />
              </div>
              <Button type="submit" className="w-full">Create Task</Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tag</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Reward</TableHead>
              <TableHead>Smart Link</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks?.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.tagName}</TableCell>
                <TableCell>{task.country}</TableCell>
                <TableCell>${Number(task.rewardAmount).toFixed(2)}</TableCell>
                <TableCell className="max-w-[200px] truncate">{task.smartLink}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" onClick={() => deleteTask(task.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function WithdrawalsTab() {
  const { data: withdrawals } = useAdminWithdrawals();
  const { mutate: updateStatus } = useUpdateWithdrawalStatus();
  const { toast } = useToast();

  const handleUpdate = (id: number, status: 'approved' | 'rejected') => {
    updateStatus({ id, status }, {
      onSuccess: () => toast({ title: `Withdrawal ${status}` })
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdrawal Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Network</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {withdrawals?.map((w) => (
              <TableRow key={w.id}>
                <TableCell>
                  <div className="font-medium">{w.username}</div>
                  <div className="text-xs text-muted-foreground">{w.country}</div>
                </TableCell>
                <TableCell>${Number(w.amount).toFixed(2)}</TableCell>
                <TableCell>{w.network}</TableCell>
                <TableCell className="font-mono text-xs">{w.walletAddress}</TableCell>
                <TableCell>
                  <Badge variant={w.status === 'pending' ? 'outline' : w.status === 'approved' ? 'default' : 'destructive'}>
                    {w.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {w.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="text-green-600 hover:text-green-700 hover:bg-green-50" onClick={() => handleUpdate(w.id, 'approved')}>
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleUpdate(w.id, 'rejected')}>
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function SettingsTab() {
  const { data: settings } = useReferralSettings();
  const { mutate: updateSetting } = useUpdateReferralSetting();
  const { data: announcements } = useAnnouncements();
  const { mutate: createAnnouncement } = useCreateAnnouncement();
  const { mutate: deleteAnnouncement } = useDeleteAnnouncement();
  const { toast } = useToast();

  const handleReferralUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateSetting({
      country: formData.get("country") as string,
      rewardAmount: formData.get("rewardAmount") as string,
      minWithdrawal: formData.get("minWithdrawal") as string,
    }, {
      onSuccess: () => toast({ title: "Settings updated" })
    });
  };

  const handleAnnouncementCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createAnnouncement({
      content: formData.get("content") as string,
      country: formData.get("country") === "global" ? undefined : (formData.get("country") as string),
      isActive: true
    }, {
        onSuccess: () => {
            toast({ title: "Announcement posted" });
        }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Country Settings</CardTitle>
          <CardDescription>Set referral rewards and minimum withdrawal per country.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <form onSubmit={handleReferralUpdate} className="flex gap-4 items-end flex-wrap">
                <div className="space-y-2 flex-1 min-w-[150px]">
                    <Label>Country</Label>
                    <Select name="country" required>
                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            {countries.map(c => (
                              <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 w-28">
                    <Label>Ref Reward</Label>
                    <Input name="rewardAmount" type="number" step="0.01" placeholder="0.50" required />
                </div>
                <div className="space-y-2 w-28">
                    <Label>Min Withdraw</Label>
                    <Input name="minWithdrawal" type="number" step="1" placeholder="20" required />
                </div>
                <Button type="submit">Set</Button>
              </form>

              <div className="mt-4 border rounded-md p-4">
                <h4 className="font-medium mb-2 text-sm">Current Settings</h4>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold border-b pb-1">
                        <span>Country</span>
                        <div className="flex gap-4">
                            <span>Ref</span>
                            <span>Min</span>
                        </div>
                    </div>
                    {settings?.map(s => (
                        <div key={s.id} className="flex justify-between text-xs">
                            <span className="truncate max-w-[100px]">{s.country}</span>
                            <div className="flex gap-4 font-mono">
                                <span>${Number(s.rewardAmount).toFixed(2)}</span>
                                <span>${Number(s.minWithdrawal).toFixed(0)}</span>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleAnnouncementCreate} className="space-y-4 mb-6">
                <div className="space-y-2">
                    <Label>Message</Label>
                    <Input name="content" required placeholder="Announcement text..." />
                </div>
                <div className="space-y-2">
                    <Label>Country (Optional - leave empty for Global)</Label>
                    <Select name="country">
                        <SelectTrigger><SelectValue placeholder="Global" /></SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            <SelectItem value="global">Global</SelectItem>
                            {countries.map(c => (
                              <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button type="submit">Post Announcement</Button>
            </form>

            <div className="space-y-2">
                {announcements?.map(a => (
                    <div key={a.id} className="flex justify-between items-center p-3 border rounded bg-muted/20">
                        <div>
                            <p className="font-medium">{a.content}</p>
                            <p className="text-xs text-muted-foreground">{a.country || "Global"}</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => deleteAnnouncement(a.id)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
