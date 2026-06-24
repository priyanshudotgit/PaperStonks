import { useAuth } from "../context/AuthContext.jsx";

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function StatCard({ label, value, icon, accent = "brand" }) {
  const accentMap = {
    brand: "from-brand-600/20 to-brand-500/5 border-brand-500/10 text-brand-400",
    gain: "from-gain/20 to-gain/5 border-gain/10 text-gain",
    neutral: "from-white/10 to-white/5 border-white/5 text-white/60",
  };

  return (
    <div className={`glass-light rounded-2xl p-6 bg-gradient-to-br ${accentMap[accent]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-white/40">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <span className="text-4xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-white/70 mb-1">{title}</h3>
      <p className="text-sm text-white/30 max-w-xs">{description}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const cashBalance = user?.cashBalance ? Number(user.cashBalance) : 100000;

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Top bar ── */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📈</span>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              PaperStonks
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{user?.name}</p>
              <p className="text-xs text-white/30">{user?.email}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-sm font-bold text-white">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <button
              id="logout-btn"
              onClick={logout}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 transition-all"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        {/* Greeting */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-white">
            Good {getGreeting()},{" "}
            <span className="bg-gradient-to-r from-brand-400 to-brand-500 bg-clip-text text-transparent">
              {user?.name?.split(" ")[0] || "Trader"}
            </span>
            👋
          </h1>
          <p className="mt-1 text-white/40">Here's your trading overview</p>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 animate-fade-in-up delay-100">
          <StatCard label="Cash Balance" value={formatCurrency(cashBalance)} icon="💵" accent="brand" />
          <StatCard label="Portfolio Value" value={formatCurrency(0)} icon="📊" accent="neutral" />
          <StatCard label="Total P&L" value={formatCurrency(0)} icon="📈" accent="gain" />
          <StatCard label="Trades Made" value="0" icon="🔄" accent="neutral" />
        </div>

        {/* Content grid */}
        <div className="grid lg:grid-cols-3 gap-6 animate-fade-in-up delay-200">
          {/* Holdings */}
          <div className="lg:col-span-2 glass-light rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>💼</span> Holdings
            </h2>
            <EmptyState
              icon="📭"
              title="No holdings yet"
              description="Start trading to build your portfolio. Your stocks will appear here."
            />
          </div>

          {/* Watchlist */}
          <div className="glass-light rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <span>👁️</span> Watchlist
            </h2>
            <EmptyState
              icon="⭐"
              title="Watchlist empty"
              description="Add stocks to your watchlist to track them in real-time."
            />
          </div>
        </div>

        {/* Recent trades */}
        <div className="mt-6 glass-light rounded-2xl p-6 animate-fade-in-up delay-300">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📜</span> Recent Trades
          </h2>
          <EmptyState
            icon="🕐"
            title="No trades yet"
            description="When you make your first trade, it will appear here."
          />
        </div>
      </main>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}
