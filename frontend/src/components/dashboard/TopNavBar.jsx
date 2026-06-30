import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";

export default function TopNavBar({ activeTab, isMarketOpen }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const btnRef = useRef(null);

  const currentTab = activeTab || (location.pathname === "/holdings" ? "Holdings" : "Watchlist");

  const navLinks = [
    { label: "Watchlist", path: "/" },
    { label: "Holdings", path: "/holdings" },
    { label: "Trades", path: "/trades" },
  ];

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
      })
    : null;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <nav
      id="top-nav"
      className="fixed top-0 w-full z-50 flex justify-between items-center px-lg h-16 bg-surface border-b border-outline-variant"
    >
      {/* Left: Brand + Market Status */}
      <div className="flex items-center gap-lg">
        <div
          className="text-headline-md font-bold text-primary cursor-pointer"
          onClick={() => navigate("/")}
        >
          PaperStonks
        </div>

        {/* Market Status Badge */}
        <div
          className="hidden md:flex items-center gap-xs px-sm py-xs rounded-full text-label-sm font-medium border"
          style={{
            backgroundColor: isMarketOpen ? "var(--color-gain-bg)" : "var(--color-loss-bg)",
            color: isMarketOpen ? "var(--color-gain)" : "var(--color-loss)",
            borderColor: isMarketOpen ? "var(--color-gain-border)" : "var(--color-loss-border)",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: isMarketOpen ? "var(--color-gain)" : "var(--color-loss)",
              display: "inline-block",
            }}
          />
          {isMarketOpen ? "Market Open" : "Market Closed"}
        </div>
      </div>

      {/* Right: Nav Links + Actions */}
      <div className="hidden md:flex items-center gap-lg h-full">
        <div className="flex h-full">
          {navLinks.map((link) => {
            const isActive = link.label === currentTab;
            return (
              <button
                key={link.label}
                onClick={() => navigate(link.path)}
                className={`flex items-center px-md text-label-md h-full transition-colors cursor-pointer ${
                  isActive
                    ? "text-primary font-bold border-b-2 border-primary"
                    : "text-on-surface-variant font-medium hover:text-primary"
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-md border-l border-outline-variant pl-md">
          {/* Balance Display */}
          <div className="text-label-sm text-on-surface-variant">
            <span className="text-mono-data text-primary font-medium">
              ₹{Number(user?.cashBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Profile button + Dropdown */}
          <div className="relative">
            <button
              ref={btnRef}
              id="profile-btn"
              className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer flex items-center"
              onClick={() => setDropdownOpen((v) => !v)}
              title={`Logged in as ${user?.name || "User"}`}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
                account_circle
              </span>
            </button>

            {/* Dropdown */}
            <div
              ref={dropdownRef}
              className="profile-dropdown"
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: 280,
                pointerEvents: dropdownOpen ? "auto" : "none",
                opacity: dropdownOpen ? 1 : 0,
                transform: dropdownOpen
                  ? "translateY(0) scale(1)"
                  : "translateY(-8px) scale(0.96)",
                transformOrigin: "top right",
                transition: "opacity 0.2s cubic-bezier(0.4,0,0.2,1), transform 0.2s cubic-bezier(0.4,0,0.2,1)",
                zIndex: 100,
              }}
            >
              <div
                className="bg-surface-container-lowest border border-outline-variant rounded-[12px] overflow-hidden"
                style={{
                  boxShadow:
                    "0 10px 38px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)",
                }}
              >
                {/* User info header */}
                <div
                  className="px-md py-md flex items-center gap-md border-b border-outline-variant"
                  style={{ backgroundColor: "var(--color-surface-container-low)" }}
                >
                  {/* Avatar */}
                  <div
                    className="flex items-center justify-center rounded-full font-bold text-label-md"
                    style={{
                      width: 40,
                      height: 40,
                      background: "linear-gradient(135deg, #565e71, #3f4759)",
                      color: "#fff",
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-label-md text-on-surface font-semibold truncate">
                      {user?.name || "User"}
                    </span>
                    <span className="text-label-sm text-on-surface-variant truncate">
                      {user?.email || "—"}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="px-md py-sm flex flex-col gap-xs">
                  <div className="flex justify-between items-center py-xs">
                    <span className="text-label-sm text-on-surface-variant flex items-center gap-xs">
                      <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                        account_balance_wallet
                      </span>
                      Cash Balance
                    </span>
                    <span className="text-mono-data text-gain font-semibold">
                      ₹{Number(user?.cashBalance || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  {memberSince && (
                    <div className="flex justify-between items-center py-xs">
                      <span className="text-label-sm text-on-surface-variant flex items-center gap-xs">
                        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>
                          calendar_month
                        </span>
                        Member since
                      </span>
                      <span className="text-label-sm text-on-surface font-medium">
                        {memberSince}
                      </span>
                    </div>
                  )}
                </div>

                {/* Logout */}
                <div className="border-t border-outline-variant px-md py-sm">
                  <button
                    id="logout-btn"
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-sm px-sm py-sm rounded-lg text-label-md font-medium cursor-pointer transition-colors"
                    style={{
                      color: "var(--color-loss)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "var(--color-loss-bg)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                      logout
                    </span>
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
