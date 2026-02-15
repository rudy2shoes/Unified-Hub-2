import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/api";
import {
  Users, CreditCard, TrendingUp, UserPlus, Shield, ArrowLeft,
  Trash2, Loader2, Search, AlertTriangle, Lock, Eye, EyeOff
} from "lucide-react";
import { useState } from "react";
import hubLogo from "@assets/HUB_Logo_(1)_1770930042707.png";

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionStatus: string | null;
  createdAt: string;
}

interface AdminStats {
  total: number;
  active: number;
  trialing: number;
  inactive: number;
  canceled: number;
  newLast30: number;
  newLast7: number;
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number | string; color: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#141414] border border-white/5 rounded-xl p-5"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm text-neutral-400">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-white" data-testid={`stat-${label.toLowerCase().replace(/\s/g, '-')}`}>{value}</p>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const s = status || "inactive";
  const styles: Record<string, string> = {
    active: "bg-green-500/15 text-green-400 border-green-500/20",
    trialing: "bg-blue-500/15 text-blue-400 border-blue-500/20",
    inactive: "bg-neutral-500/15 text-neutral-400 border-neutral-500/20",
    canceled: "bg-red-500/15 text-red-400 border-red-500/20",
    past_due: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[s] || styles.inactive}`} data-testid={`badge-status-${s}`}>
      {s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}
    </span>
  );
}

function AdminLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/auth/login", { email, password });
      const user = await res.json();
      if (!user.isAdmin) {
        setError("This account does not have admin privileges.");
        await apiRequest("POST", "/api/auth/logout");
        setLoading(false);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md px-6"
      >
        <div className="text-center mb-8">
          <img src={hubLogo} alt="HUB" className="h-12 mx-auto mb-4" />
          <div className="w-14 h-14 rounded-2xl bg-red-500/15 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-red-400" />
          </div>
          <h1 className="text-2xl font-semibold mb-1">Admin Portal</h1>
          <p className="text-neutral-400 text-sm">Sign in with your admin credentials</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-400 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hubhub.co"
              required
              className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-red-500/50 transition"
              data-testid="input-admin-email"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-neutral-400 font-medium">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-red-500/50 transition"
                data-testid="input-admin-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition"
                data-testid="button-toggle-password"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              data-testid="text-admin-login-error"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
            data-testid="button-admin-login"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Shield className="w-4 h-4" /> Sign In</>}
          </button>
        </form>

        <p className="text-center text-neutral-600 text-xs mt-6">Authorized personnel only</p>
      </motion.div>
    </div>
  );
}

export default function AdminPortal() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: authUser, isLoading: authLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
    retry: false,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/users");
      if (!res.ok) throw new Error("Forbidden");
      return res.json();
    },
    enabled: !!authUser?.isAdmin,
  });

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/stats");
      return res.json();
    },
    enabled: !!authUser?.isAdmin,
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setDeleteConfirm(null);
    },
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!authUser || !authUser.isAdmin) {
    return <AdminLoginScreen />;
  }

  const users: AdminUser[] = usersData?.users || [];
  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <header className="border-b border-white/5 bg-[#0d0d0d]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setLocation("/dashboard")} className="text-neutral-400 hover:text-white transition" data-testid="button-back">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <img src={hubLogo} alt="HUB" className="h-7" />
            <div className="h-5 w-px bg-white/10" />
            <span className="text-sm font-medium text-neutral-300">Admin Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-red-400" />
            </div>
            <span className="text-sm text-neutral-400">{authUser.email}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-semibold mb-1">Dashboard Overview</h1>
          <p className="text-neutral-400 text-sm">Monitor users, subscriptions, and platform activity.</p>
        </motion.div>

        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
            <StatCard icon={Users} label="Total Users" value={stats.total} color="bg-blue-500/20" />
            <StatCard icon={CreditCard} label="Active" value={stats.active} color="bg-green-500/20" />
            <StatCard icon={TrendingUp} label="Trialing" value={stats.trialing} color="bg-purple-500/20" />
            <StatCard icon={Users} label="Inactive" value={stats.inactive} color="bg-neutral-500/20" />
            <StatCard icon={AlertTriangle} label="Canceled" value={stats.canceled} color="bg-red-500/20" />
            <StatCard icon={UserPlus} label="New (7d)" value={stats.newLast7} color="bg-cyan-500/20" />
            <StatCard icon={UserPlus} label="New (30d)" value={stats.newLast30} color="bg-indigo-500/20" />
          </div>
        )}

        <div className="bg-[#141414] border border-white/5 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-medium">All Users</h2>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#1a1a1a] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-red-500/50 w-64"
                data-testid="input-search-users"
              />
            </div>
          </div>

          {usersLoading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-neutral-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="table-users">
                <thead>
                  <tr className="text-left text-xs text-neutral-500 uppercase tracking-wider border-b border-white/5">
                    <th className="px-5 py-3">User</th>
                    <th className="px-5 py-3">Email</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Stripe Customer</th>
                    <th className="px-5 py-3">Joined</th>
                    <th className="px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition" data-testid={`row-user-${user.id}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500/30 to-orange-500/30 flex items-center justify-center text-xs font-medium">
                            {user.firstName[0]}{user.lastName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                            {user.isAdmin && <span className="text-[10px] text-red-400 font-medium uppercase">Admin</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-neutral-300">{user.email}</td>
                      <td className="px-5 py-4"><StatusBadge status={user.subscriptionStatus} /></td>
                      <td className="px-5 py-4 text-sm text-neutral-500 font-mono text-xs">
                        {user.stripeCustomerId ? user.stripeCustomerId.slice(0, 18) + '...' : '—'}
                      </td>
                      <td className="px-5 py-4 text-sm text-neutral-400">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-5 py-4">
                        {user.isAdmin ? (
                          <span className="text-xs text-neutral-600">Protected</span>
                        ) : deleteConfirm === user.id ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => deleteMutation.mutate(user.id)}
                              className="text-xs text-red-400 hover:text-red-300 font-medium"
                              data-testid={`button-confirm-delete-${user.id}`}
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-xs text-neutral-500 hover:text-neutral-300"
                              data-testid={`button-cancel-delete-${user.id}`}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(user.id)}
                            className="text-neutral-600 hover:text-red-400 transition"
                            data-testid={`button-delete-${user.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-neutral-500 text-sm">
                        {search ? "No users match your search." : "No users found."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
