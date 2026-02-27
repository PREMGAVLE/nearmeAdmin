import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getRolePath } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const demoAccounts = [
  { label: 'Super Admin', mobile: '9876543210', password: 'admin123' },
  { label: 'Admin', mobile: '9876543211', password: 'admin123' },
  { label: 'Salesman', mobile: '9876543212', password: 'admin123' },
];

export default function LoginPage() {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobile.trim() || !password.trim()) return;
    setLoading(true);
    try {
      await login(mobile, password);
      const stored = localStorage.getItem('smartburhanpur_user');
      if (stored) {
        const user = JSON.parse(stored);
        navigate(getRolePath(user.role), { replace: true });
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Login failed';
      toast({ title: 'Login Failed', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demo: typeof demoAccounts[0]) => {
    setMobile(demo.mobile);
    setPassword(demo.password);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary-foreground/10 backdrop-blur-sm">
            <Building2 className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="mb-4 font-display text-4xl font-bold text-primary-foreground">
            SmartBurhanpur City
          </h1>
          <p className="text-lg text-primary-foreground/80">
            City-based B2B business directory platform. Manage listings, payments, and approvals from one powerful dashboard.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex w-full items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden flex items-center gap-3 justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
              <Building2 className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">SmartBurhanpur</h1>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="mt-1 text-muted-foreground">Sign in with your mobile number</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="Enter your mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="h-12"
                maxLength={10}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-12"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="h-12 w-full gradient-primary text-primary-foreground text-base font-semibold" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Demo Accounts (click to fill)</p>
            <div className="space-y-2">
              {demoAccounts.map((demo) => (
                <button
                  key={demo.mobile}
                  type="button"
                  onClick={() => handleDemoLogin(demo)}
                  className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-3 py-2.5 text-left transition-all hover:card-shadow-hover hover:border-primary/30"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{demo.label}</p>
                    <p className="text-xs text-muted-foreground">📱 {demo.mobile}</p>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">{demo.password}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
