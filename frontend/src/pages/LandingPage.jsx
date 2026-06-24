import { Link } from "react-router-dom";

const MOCK_TICKER = [
  { symbol: "AAPL", price: "198.45", change: "+2.31%" },
  { symbol: "TSLA", price: "267.12", change: "+4.18%" },
  { symbol: "MSFT", price: "442.58", change: "-0.87%" },
  { symbol: "GOOGL", price: "178.90", change: "+1.24%" },
  { symbol: "AMZN", price: "193.67", change: "+0.56%" },
  { symbol: "NVDA", price: "135.22", change: "+3.74%" },
  { symbol: "META", price: "512.40", change: "-1.12%" },
  { symbol: "NFLX", price: "684.33", change: "+1.91%" },
];

const FEATURES = [
  {
    icon: "📊",
    title: "Real-Time Prices",
    desc: "Track live stock prices and make trades based on actual market data.",
  },
  {
    icon: "💰",
    title: "$100K Virtual Cash",
    desc: "Start with $100,000 in virtual money. No risk, all the learning.",
  },
  {
    icon: "📈",
    title: "Portfolio Tracking",
    desc: "Watch your holdings grow with detailed performance analytics.",
  },
  {
    icon: "🔔",
    title: "Custom Watchlists",
    desc: "Curate watchlists to monitor your favourite stocks at a glance.",
  },
];

function TickerBar() {
  const doubled = [...MOCK_TICKER, ...MOCK_TICKER];
  return (
    <div className="overflow-hidden border-y border-white/5 py-3">
      <div className="animate-ticker flex whitespace-nowrap gap-10">
        {doubled.map((t, i) => (
          <span key={i} className="flex items-center gap-2 text-sm font-medium">
            <span className="text-white/60">{t.symbol}</span>
            <span className="text-white">${t.price}</span>
            <span className={t.change.startsWith("+") ? "text-gain" : "text-loss"}>
              {t.change}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function MiniChart({ color = "#29a4ff", height = 60 }) {
  // Simple SVG sparkline
  const points = [20, 35, 25, 45, 38, 55, 48, 60, 50, 65, 58, 72, 65, 70];
  const w = 200;
  const step = w / (points.length - 1);
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${height - (p / 80) * height}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${path} L ${w} ${height} L 0 ${height} Z`}
        fill={`url(#grad-${color.replace("#", "")})`}
      />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navbar ── */}
      <nav className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/paper" className="flex items-center gap-2.5">
            <span className="text-2xl">📈</span>
            <span className="text-xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
              PaperStonks
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              id="nav-login-btn"
              className="px-5 py-2 text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/register"
              id="nav-register-btn"
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-brand-600 hover:bg-brand-500 text-white transition-all hover:shadow-lg hover:shadow-brand-600/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Ticker ── */}
      <TickerBar />

      {/* ── Hero ── */}
      <section className="relative flex-1 flex items-center overflow-hidden">
        {/* Background glow blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-brand-600/10 blur-[120px]" />
          <div className="absolute -bottom-60 right-0 w-[600px] h-[600px] rounded-full bg-brand-500/8 blur-[150px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-24 lg:py-32 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          {/* Left — Copy */}
          <div>
            <div className="animate-fade-in inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-500/30 bg-brand-500/10 text-brand-300 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-gain animate-pulse-glow" />
              Markets are open
            </div>

            <h1 className="animate-fade-in-up text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
              Master the market
              <br />
              <span className="bg-gradient-to-r from-brand-400 via-brand-500 to-brand-600 bg-clip-text text-transparent animate-gradient">
                without the risk.
              </span>
            </h1>

            <p className="animate-fade-in-up delay-200 mt-6 text-lg text-white/50 leading-relaxed max-w-lg">
              PaperStonks gives you $100,000 in virtual cash to practice stock trading.
              Build strategies, track portfolios, and learn — all with zero financial risk.
            </p>

            <div className="animate-fade-in-up delay-300 flex items-center gap-4 mt-10">
              <Link
                to="/register"
                id="hero-cta-btn"
                className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-white font-semibold shadow-xl shadow-brand-600/20 hover:shadow-brand-500/30 hover:scale-[1.02] transition-all"
              >
                Start Trading Free
              </Link>
              <Link
                to="/login"
                className="px-6 py-3.5 rounded-xl border border-white/10 text-white/70 font-medium hover:border-white/20 hover:text-white transition-all"
              >
                I have an account
              </Link>
            </div>

            <div className="animate-fade-in delay-500 flex items-center gap-6 mt-10 text-sm text-white/30">
              <span className="flex items-center gap-1.5">
                <span className="text-gain">✓</span> No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-gain">✓</span> Real market data
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-gain">✓</span> 100% free
              </span>
            </div>
          </div>

          {/* Right — Decorative card */}
          <div className="hidden lg:block animate-fade-in-up delay-300">
            <div className="glass rounded-2xl p-6 shadow-2xl shadow-black/40">
              {/* Mock portfolio header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider">Portfolio Value</p>
                  <p className="text-3xl font-bold text-white mt-1">$124,832.50</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gain/10 text-gain text-sm font-semibold">
                    ↑ +24.83%
                  </span>
                  <p className="text-xs text-white/30 mt-1">All time</p>
                </div>
              </div>

              <MiniChart color="#22c55e" height={80} />

              {/* Mock holdings */}
              <div className="mt-5 space-y-3">
                {[
                  { sym: "AAPL", shares: 45, val: "$8,930.25", chg: "+2.31%" },
                  { sym: "NVDA", shares: 30, val: "$4,056.60", chg: "+3.74%" },
                  { sym: "MSFT", shares: 20, val: "$8,851.60", chg: "-0.87%" },
                ].map((h) => (
                  <div key={h.sym} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center text-xs font-bold text-brand-400">
                        {h.sym.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{h.sym}</p>
                        <p className="text-xs text-white/30">{h.shares} shares</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-white">{h.val}</p>
                      <p className={`text-xs font-medium ${h.chg.startsWith("+") ? "text-gain" : "text-loss"}`}>
                        {h.chg}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="relative py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Everything you need to{" "}
              <span className="text-brand-400">start trading</span>
            </h2>
            <p className="mt-4 text-white/40 max-w-xl mx-auto">
              No sign-up fees, no hidden costs. Just a platform built for learning.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`animate-fade-in-up delay-${(i + 1) * 100} glass-light rounded-2xl p-6 hover:border-brand-500/20 transition-all group`}
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-white/30">
          <span>© {new Date().getFullYear()} PaperStonks</span>
          <span>Built for learning. Not financial advice.</span>
        </div>
      </footer>
    </div>
  );
}
