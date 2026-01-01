import { Link, useLocation } from "wouter";
import { useUser, useLogout } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Wallet, 
  Menu,
  X,
  Users, 
  Settings, 
  Megaphone, 
  LogOut, 
  CheckSquare,
  BarChart3
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const { data: user } = useUser();
  const { mutate: logout } = useLogout();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const isAdmin = user?.role === "admin";

  const userLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/withdraw", label: "Withdraw", icon: Wallet },
  ];

  const adminLinks = [
    { href: "/admin", label: "Overview", icon: BarChart3 },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/tasks", label: "Tasks", icon: CheckSquare },
    { href: "/admin/withdrawals", label: "Withdrawals", icon: Wallet },
    { href: "/admin/referrals", label: "Referral Settings", icon: Settings },
    { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  ];

  const links = isAdmin ? adminLinks : userLinks;

  if (!user) return null;

  return (
    <div className="md:hidden flex items-center justify-between p-4 bg-card border-b border-border sticky top-0 z-50">
      <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
        NMAT
      </h1>
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="p-2">
          <Menu className="w-6 h-6 text-foreground" />
        </SheetTrigger>
        <SheetContent side="right" className="w-[80%] max-w-[300px] p-0">
            <SheetHeader className="p-6 border-b border-border">
                <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
          <div className="flex flex-col h-full py-6">
            <nav className="flex-1 px-4 space-y-2">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive = location === link.href;
                
                return (
                  <Link key={link.href} href={link.href}>
                    <div
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer",
                        isActive 
                          ? "bg-primary/10 text-primary font-semibold" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                      {link.label}
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="p-6 border-t border-border mt-auto">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                  {user?.username.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">{user?.country}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
