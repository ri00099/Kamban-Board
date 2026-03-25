import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/authContext";

function getInitials(user) {
  if (!user) return "?";
  if (user.name) {
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (user.email) return user.email[0].toUpperCase();
  return "?";
}

function getAvatarColor(str = "") {
  const colors = [
    "from-amber-400 to-orange-500",
    "from-rose-400 to-pink-600",
    "from-violet-400 to-purple-600",
    "from-sky-400 to-blue-600",
    "from-emerald-400 to-teal-600",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

export default function Navbar() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close dropdown whenever the route changes
  useEffect(() => { setOpen(false); }, [location.pathname]);

  const isActive = (path) => location.pathname.startsWith(path);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    navigate("/login");
  };

  const initials = getInitials(user);
  const avatarGradient = getAvatarColor(user?.email || user?.name || "");

  return (
    <header className="border-b border-[#1e1e1e] bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo + nav links */}
        <div className="flex items-center gap-6">
          <Link to="/boards" className="flex items-center gap-2 group">
            <span className="w-7 h-7 rounded-md bg-amber-400 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="0" y="0" width="6" height="6" rx="1.5" fill="#000" />
                <rect x="8" y="0" width="6" height="6" rx="1.5" fill="#000" />
                <rect x="0" y="8" width="6" height="6" rx="1.5" fill="#000" />
                <rect x="8" y="8" width="6" height="3" rx="1.5" fill="#000" />
              </svg>
            </span>
            <span
              className="font-semibold text-[15px] tracking-tight text-white"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              Boardly
            </span>
          </Link>

          {/* Top-level nav — only when logged in */}
          {token && (
            <nav className="hidden md:flex items-center gap-1">
              <Link
                to="/boards"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] transition-colors ${
                  isActive("/boards")
                    ? "text-white bg-white/[0.08]"
                    : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
                }`}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <rect x="0.5" y="0.5" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                  <rect x="7.5" y="0.5" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                  <rect x="0.5" y="7.5" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                  <rect x="7.5" y="7.5" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                </svg>
                Boards
              </Link>
              <Link
                to="/workspaces"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] transition-colors ${
                  isActive("/workspaces")
                    ? "text-white bg-white/[0.08]"
                    : "text-neutral-500 hover:text-neutral-300 hover:bg-white/5"
                }`}
              >
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M1 3.5h11M1 6.5h11M1 9.5h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
                Workspaces
              </Link>
            </nav>
          )}
        </div>

        {/* Right side */}
        {token && (
          <div className="flex items-center gap-3" ref={menuRef}>
            {/* New Board shortcut */}
            <button
              onClick={() => navigate("/boards")}
              className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-500 hover:text-neutral-300 transition-colors px-3 py-1.5 rounded-md hover:bg-white/5"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              New board
            </button>

            {/* Divider */}
            <div className="w-px h-5 bg-[#2a2a2a] hidden sm:block" />

            {/* Avatar Button */}
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2.5 pl-1 pr-2.5 py-1 rounded-full hover:bg-white/5 transition-colors group"
              >
                <span
                  className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-xs font-bold text-white shadow-lg ring-2 ring-[#1e1e1e] group-hover:ring-amber-500/30 transition-all`}
                >
                  {initials}
                </span>
                <span className="text-sm text-neutral-300 max-w-[120px] truncate hidden sm:block">
                  {user?.name || user?.email?.split("@")[0] || "Account"}
                </span>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  className={`text-neutral-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                >
                  <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {/* Dropdown */}
              {open && (
                <div className="absolute right-0 mt-2 w-64 bg-[#111] border border-[#2a2a2a] rounded-xl shadow-2xl shadow-black/60 overflow-hidden animate-in">
                  {/* Profile header */}
                  <div className="px-4 py-3.5 border-b border-[#1e1e1e]">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-sm font-bold text-white shadow flex-shrink-0`}
                      >
                        {initials}
                      </span>
                      <div className="min-w-0">
                        {user?.name && (
                          <p className="text-sm font-medium text-white truncate">{user.name}</p>
                        )}
                        <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1.5">
                    <button
                      onClick={() => navigate("/boards")}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                        isActive("/boards") ? "text-white bg-white/5" : "text-neutral-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <rect x="0.5" y="0.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                        <rect x="8" y="0.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                        <rect x="0.5" y="8" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                        <rect x="8" y="8" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                      </svg>
                      My boards
                    </button>
                    <button
                      onClick={() => navigate("/workspaces")}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left ${
                        isActive("/workspaces") ? "text-white bg-white/5" : "text-neutral-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1 3h12M1 7h12M1 11h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                      </svg>
                      Workspaces
                    </button>
                  </div>

                  <div className="border-t border-[#1e1e1e] py-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M5 12H2a1 1 0 01-1-1V3a1 1 0 011-1h3M9.5 10l3-3-3-3M13 7H5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Not logged in */}
        {!token && (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-neutral-400 hover:text-white transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm bg-amber-400 hover:bg-amber-500 text-black font-medium px-4 py-1.5 rounded-lg transition-colors"
            >
              Get started
            </Link>
          </div>
        )}
      </div>

      <style>{`
        @keyframes animate-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-in { animation: animate-in 0.15s ease-out forwards; }
      `}</style>
    </header>
  );
}