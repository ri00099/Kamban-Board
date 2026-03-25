import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await register(form.email, form.password, form.name);
      navigate("/boards");
    } catch (err) {
      setError(err.response?.data?.msg || err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "name", label: "Name", type: "text", placeholder: "Your full name", autoComplete: "name" },
    { key: "email", label: "Email", type: "email", placeholder: "you@example.com", autoComplete: "email" },
    { key: "password", label: "Password", type: "password", placeholder: "Create a password", autoComplete: "new-password" },
  ];

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#84cc16", "#22c55e"][strength];

  return (
    <div className="min-h-screen bg-[#080808] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-sm relative z-10">
        {/* Brand */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <span className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <rect x="0" y="0" width="6" height="6" rx="1.5" fill="#000" />
              <rect x="8" y="0" width="6" height="6" rx="1.5" fill="#000" />
              <rect x="0" y="8" width="6" height="6" rx="1.5" fill="#000" />
              <rect x="8" y="8" width="6" height="3" rx="1.5" fill="#000" />
            </svg>
          </span>
          <span
            className="text-xl font-semibold text-white tracking-tight"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            Boardly
          </span>
        </div>

        {/* Card */}
        <div className="bg-[#0f0f0f] border border-[#1e1e1e] rounded-2xl p-8 shadow-2xl shadow-black/50">
          <div className="mb-7">
            <h1
              className="text-2xl text-white mb-1.5 tracking-tight"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
            >
              Create account
            </h1>
            <p className="text-neutral-500 text-[13px]">Start organizing your work for free</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 bg-rose-950/30 border border-rose-800/50 text-rose-400 text-[13px] px-3.5 py-3 rounded-xl">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="mt-px flex-shrink-0">
                  <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M7 4v3.5M7 9.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {error}
              </div>
            )}

            {fields.map(({ key, label, type, placeholder, autoComplete }) => (
              <div key={key} className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-widest text-neutral-600 font-medium">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-[#141414] border border-[#252525] rounded-xl px-4 py-3 text-[14px] text-white placeholder-neutral-700 focus:outline-none focus:border-amber-500/60 focus:bg-[#161616] transition-all"
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  required
                />
                {/* Password strength */}
                {key === "password" && form.password && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{ backgroundColor: i <= strength ? strengthColor : "#1e1e1e" }}
                        />
                      ))}
                    </div>
                    <p className="text-[11px]" style={{ color: strengthColor }}>
                      {strengthLabel} password
                    </p>
                  </div>
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full relative bg-amber-400 hover:bg-amber-500 disabled:bg-amber-400/40 text-black font-semibold py-3 rounded-xl text-[14px] transition-all mt-1"
            >
              <span className={loading ? "opacity-0" : ""}>Create account</span>
              {loading && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg className="animate-spin w-4 h-4 text-black/70" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
              )}
            </button>

            <p className="text-[11px] text-neutral-700 text-center pt-1">
              By signing up, you agree to our{" "}
              <span className="text-neutral-500 hover:text-neutral-400 cursor-pointer transition-colors">Terms</span>{" "}
              &amp;{" "}
              <span className="text-neutral-500 hover:text-neutral-400 cursor-pointer transition-colors">Privacy Policy</span>
            </p>
          </form>
        </div>

        <p className="text-center text-neutral-600 text-[13px] mt-5">
          Already have an account?{" "}
          <Link to="/login" className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes animate-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin { animation: animate-spin 0.7s linear infinite; }
      `}</style>
    </div>
  );
}