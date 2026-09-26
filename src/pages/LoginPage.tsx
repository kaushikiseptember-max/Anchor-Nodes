import React, { useState } from "react";
import { useAuth } from "../store/AuthContext";
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  KeyRound,
} from "lucide-react";
import { Button } from "../components/common/Button";

const EMAIL_REGEX = /^[^s@]+@[^s@]+.[^s@]+$/;

export const LoginPage: React.FC = () => {
  const { login, setAuthPage } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const nextErrors: typeof errors = {};

    if (!email.trim()) {
      nextErrors.email = "Email address is required.";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      console.error("Login failed:", err);
      const msg = err?.message || "Invalid credentials.";
      if (err?.code === "INVALID_CREDENTIALS" || err?.status === 401 || msg.toLowerCase().includes("invalid")) {
        setErrors({ general: "Invalid email or password. Please check your credentials and try again." });
      } else {
        setErrors({ general: msg });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden bg-grid-pattern">
      {/* Ambient background glow accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-r from-violet-600/15 via-cyan-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 p-0.5 shadow-xl shadow-cyan-500/20 mb-4">
            <div className="w-full h-full bg-[#070B14] rounded-[14px] flex items-center justify-center overflow-hidden">
              <img
                src="/anchornode-logo.png"
                alt="AnchorNode Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <Shield className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold font-display tracking-tight text-white flex items-center justify-center gap-2">
            AnchorNode Vault
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 uppercase">
              v2.4
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Self-Healing Distributed AI Object Storage Console
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-panel p-7 sm:p-8 rounded-2xl shadow-2xl border border-slate-800/80 relative backdrop-blur-xl">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white tracking-tight">Operator Authentication</h2>
            <p className="text-xs text-slate-400 mt-1">
              Enter your credentials to securely unlock the cluster dashboard.
            </p>
          </div>

          {/* General Error Banner */}
          {errors.general && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email Field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Work Email <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="operator@anchornode.internal"
                  className={`w-full pl-10 pr-3.5 py-2.5 bg-slate-900/90 border ${
                    errors.email ? "border-rose-500/80 focus:border-rose-400" : "border-slate-800 focus:border-cyan-500/60"
                  } rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all`}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border ${
                    errors.password ? "border-rose-500/80 focus:border-rose-400" : "border-slate-800 focus:border-cyan-500/60"
                  } rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-400 mt-1.5 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="cyan"
                size="lg"
                isLoading={isSubmitting}
                rightIcon={<LogIn className="w-4 h-4" />}
                className="w-full justify-center text-sm font-semibold tracking-wide"
              >
                {isSubmitting ? "Authenticating..." : "Access Cluster Console"}
              </Button>
            </div>
          </form>

          {/* Navigation to Signup */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Need an account?{" "}
              <button
                type="button"
                onClick={() => setAuthPage("signup")}
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors focus:outline-none underline-offset-2 hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </p>
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-xs font-mono">
          <KeyRound className="w-3.5 h-3.5 text-slate-400" />
          <span>Encrypted Session with 7-Day JWT Token</span>
        </div>
      </div>
    </div>
  );
};
