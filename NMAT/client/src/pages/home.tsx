import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ShieldCheck, Globe2 } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Navbar */}
      <nav className="border-b border-border/40 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            NMAT
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -z-10" />
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
          Earn <span className="text-primary">Crypto</span> by Completing <span className="text-accent">Simple Tasks</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          The most trusted CPA rewards platform. Complete offers, invite friends, and get paid in USDT instantly to your wallet.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20">
              Start Earning Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 border-y border-border/50 py-10 bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold text-primary mb-2">$500k+</div>
            <div className="text-muted-foreground">Paid out to users</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold text-accent mb-2">50+</div>
            <div className="text-muted-foreground">Countries Supported</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-4xl font-bold text-primary mb-2">24/7</div>
            <div className="text-muted-foreground">Instant Withdrawals</div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-20 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">Why Choose NMAT?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Global Access</h3>
              <p className="text-muted-foreground">
                Tasks tailored to your country. We support users from USA, UK, Nigeria, India, and more.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">High Payouts</h3>
              <p className="text-muted-foreground">
                We partner directly with top advertisers to bring you the highest rates in the industry.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure & Fast</h3>
              <p className="text-muted-foreground">
                Withdrawals via USDT (TRC20/ERC20) ensure you get your money fast and securely.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border">
        &copy; {new Date().getFullYear()} NMAT Platform. All rights reserved.
      </footer>
    </div>
  );
}
