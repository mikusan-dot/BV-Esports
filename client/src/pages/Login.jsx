import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Trophy, Mail, Lock, Eye, EyeOff, LogIn, X } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.code === "auth/user-not-found"
          ? "No account found with this email."
          : err.code === "auth/wrong-password"
          ? "Incorrect password."
          : err.code === "auth/invalid-credential"
          ? "Invalid email or password."
          : "Failed to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("Enter your email first to reset password.");
      return;
    }
    try {
      await resetPassword(email);
      setError("");
      alert("Password reset email sent! Check your inbox.");
    } catch (err) {
      setError("Failed to send reset email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117] px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-xl bg-gradient-to-br from-[rgba(88,166,255,0.15)] to-[rgba(88,166,255,0.05)] border border-[rgba(88,166,255,0.15)] flex items-center justify-center mb-5 shadow-lg">
            <Trophy className="w-8 h-8 text-[#58a6ff]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="text-[#58a6ff]">BV</span>
            <span className="text-text-primary ml-2">Esports</span>
          </h1>
          <p className="text-sm text-text-muted mt-1.5 font-medium">Team Management System</p>
        </div>

        {/* Card */}
        <div className="card-premium rounded-xl p-7">
          <h2 className="text-lg font-bold text-text-primary mb-1">Welcome Back</h2>
          <p className="text-sm text-text-muted mb-6">Sign in to your account</p>

          {error && (
            <div className="mb-4 p-3.5 rounded-lg bg-[rgba(248,81,73,0.08)] border border-[rgba(248,81,73,0.2)] text-[#f85149] text-sm font-medium flex items-center gap-2">
              <X className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 input-premium text-sm text-text-primary placeholder-text-muted"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-11 py-3 input-premium text-sm text-text-primary placeholder-text-muted"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 btn-primary rounded-lg text-sm disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              onClick={handleResetPassword}
              className="text-sm text-[#58a6ff]/80 hover:text-[#58a6ff] transition-colors font-medium"
            >
              Forgot password?
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-[#30363d] text-center">
            <p className="text-sm text-text-muted">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#58a6ff] hover:text-[#79c0ff] font-semibold transition-colors">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
