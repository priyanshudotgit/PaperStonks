import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(location.pathname === "/login");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(false);

  const toggleMode = (e) => {
    e.preventDefault();
    setIsLogin(!isLogin);
    setError("");
    navigate(isLogin ? "/register" : "/login", { replace: true });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!isLogin && password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="min-h-screen flex flex-col md:flex-row antialiased bg-gray-50 font-sans text-gray-900">
        
        {/* Left Panel (Branding & Features) - Hidden on Mobile */}
        <div className="hidden md:flex flex-col w-[40%] bg-white border-r border-gray-200 p-8 lg:p-12 relative z-10 shadow-xl">
          {/* Logo & Header */}
          <Link to="/paper" className="flex items-center gap-2 mb-10 hover:opacity-80 transition-opacity">
            <span className="material-symbols-outlined text-black text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              monitoring
            </span>
            <h1 className="text-2xl font-bold text-black tracking-tight">PaperStonks</h1>
          </Link>

          <div className="mt-8">
            <h2 className="text-4xl font-bold mb-4 text-black leading-tight">
              Professional Paper Trading.
            </h2>
            <p className="text-lg text-gray-600 mb-10">
              Master the markets without risking capital. Built for the modern era of retail investing.
            </p>

            {/* Features List */}
            <ul className="space-y-6 mb-12">
              <li className="flex items-start gap-4">
                <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                  <span className="material-symbols-outlined text-black">bolt</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black mb-1">Real-time Data</h3>
                  <p className="text-sm text-gray-600">Lightning fast execution and live market quotes.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                  <span className="material-symbols-outlined text-black">account_balance_wallet</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black mb-1">₹100k Virtual Cash</h3>
                  <p className="text-sm text-gray-600">Start trading immediately with a generous simulated balance.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="p-2 bg-gray-100 rounded-lg shrink-0">
                  <span className="material-symbols-outlined text-black">format_list_bulleted</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black mb-1">Unlimited Watchlists</h3>
                  <p className="text-sm text-gray-600">Track your favorite equities across global markets.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Portfolio Preview Card */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm transform hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Portfolio</span>
                <div className="text-2xl font-bold text-black mt-1">₹1,24,530.00</div>
              </div>
              <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span>
                2.4%
              </div>
            </div>
            
            {/* Sparkline Visual */}
            <div className="h-16 w-full flex items-end overflow-hidden relative">
              <svg className="w-full h-full stroke-green-600 fill-green-50" preserveAspectRatio="none" viewBox="0 0 100 30">
                <path d="M0 30 L0 25 L10 22 L20 26 L30 15 L40 18 L50 10 L60 12 L70 5 L80 8 L90 2 L100 0 L100 30 Z" stroke="none"></path>
                <path d="M0 25 L10 22 L20 26 L30 15 L40 18 L50 10 L60 12 L70 5 L80 8 L90 2 L100 0" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Right Panel (Auth Form) */}
        <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 relative z-10 bg-gray-50">
          
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-2 mb-8">
            <span className="material-symbols-outlined text-black text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              monitoring
            </span>
            <h1 className="text-2xl font-bold text-black tracking-tight">PaperStonks</h1>
          </div>

          <div className="w-full max-w-[420px] bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl shadow-xl overflow-hidden p-8">
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-2">
                {isLogin ? "Welcome back" : "Create an account"}
              </h2>
              <p className="text-sm text-gray-600">
                {isLogin ? "Log in to your account to continue." : "Sign up to start your journey."}
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
              
              {!isLogin && (
                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700 block">Full Name</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                      person
                    </span>
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                      placeholder="Warren Buffett"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 block">Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                    mail
                  </span>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    placeholder="name@gmail.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700 block">Password</label>
                  {isLogin && (
                    <Link to="/forgot-password" className="text-xs font-medium text-gray-500 hover:text-black transition-colors">
                      Forgot?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">
                    lock
                  </span>
                  <input
                    id="password"
                    type="password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {isLogin && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black/20 cursor-pointer"
                  />
                  <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none">
                    Remember me for 30 days
                  </label>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all transform hover:-translate-y-[1px] active:translate-y-0 mt-4 shadow-md disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    {isLogin ? "Logging in..." : "Creating account..."}
                  </span>
                ) : (
                  isLogin ? "Log In" : "Sign Up"
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button type="button" onClick={toggleMode} className="text-black font-medium hover:underline ml-1">
                  {isLogin ? "Sign up" : "Log in"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
