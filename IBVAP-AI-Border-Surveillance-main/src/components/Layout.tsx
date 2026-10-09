import { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Camera,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  Gauge,
  LayoutDashboard,
  LogOut,
  MapPinned,
  Radar,
  Settings,
  Shield,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useCyberSecurity } from "../context/CyberSecurityContext";

const NAV_ITEMS = [
  { path: "/", label: "COMMAND CENTER", icon: LayoutDashboard, exact: true },
  { path: "/surveillance", label: "LIVE SURVEILLANCE", icon: Camera },
  { path: "/threat-intelligence", label: "THREAT INTELLIGENCE", icon: ShieldAlert },
  { path: "/incidents", label: "INCIDENTS", icon: AlertTriangle },
  { path: "/evidence", label: "EVIDENCE", icon: FileSearch },
  { path: "/cameras", label: "CAMERA NETWORK", icon: Radar },
  { path: "/analytics", label: "ANALYTICS", icon: BarChart3 },
  { path: "/zones", label: "VIRTUAL FENCE", icon: Shield },
  { path: "/map", label: "BORDER MAP", icon: MapPinned },
  { path: "/health", label: "SYSTEM HEALTH", icon: Activity },
  { path: "/settings", label: "SETTINGS", icon: Settings },
];

function SystemClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="topbar-clock">
      <div className="topbar-clock-time">{time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}</div>
      <div className="topbar-clock-date">{time.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</div>
    </div>
  );
}

export default function Layout() {
  const { user, signOut, isDemo } = useAuth();
  const { alerts } = useCyberSecurity();
  const nav = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    nav("/login");
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
        <div className="sidebar-header">
          <div className="brand-mark">
            <Shield size={16} />
          </div>
          {!collapsed && (
            <div className="brand-copy">
              <div className="brand-name">IBVAP</div>
              <div className="brand-tag">INTELLIGENT BORDER</div>
              <div className="brand-tag">VIDEO ANALYTICS</div>
            </div>
          )}
          <button type="button" className="sidebar-collapse" onClick={() => setCollapsed((value) => !value)} aria-label="Toggle sidebar">
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          {NAV_ITEMS.map(({ path, label, icon: Icon, exact }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
              title={collapsed ? label : undefined}
            >
              <span className="nav-icon"><Icon size={14} /></span>
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="network-pill"><span className="live-dot" /> SYSTEM ONLINE</div>
          {!collapsed && (
            <div className="operator-block">
              <div className="operator-avatar"><UserRound size={12} /></div>
              <div className="operator-copy">
                <div className="operator-name">{user?.full_name || user?.email || "Operator"}</div>
                <div className="operator-role">{user?.role || "Security Operations"}</div>
              </div>
              <button type="button" className="signout-btn" onClick={handleSignOut} aria-label="Sign out">
                <LogOut size={12} />
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-label">COMMAND CENTER</div>
            <div className="topbar-subtitle">LIVE BORDER OPERATIONS</div>
            <div className="topbar-divider" />
            <div className="topbar-status status-ok"><span className="live-dot" /> SYSTEM OPERATIONAL</div>
            <div className="topbar-status"><Gauge size={12} /> 18 CAMERAS ONLINE</div>
            <div className="topbar-status status-warn"><AlertTriangle size={12} /> {String(3 + alerts.filter((alert) => alert.status === "ACTIVE").length).padStart(2, "0")} ACTIVE THREATS</div>
          </div>

          <div className="topbar-right">
            {isDemo && <div className="demo-badge">DEMO MODE</div>}
            <button type="button" className="notification-btn" aria-label="Notifications">
              <Bell size={15} />
              <span className="notification-count">{2 + alerts.filter((alert) => !alert.acknowledged).length}</span>
            </button>
            <SystemClock />
            <div className="profile-chip">
              <div className="profile-avatar">OS</div>
            </div>
          </div>
        </header>

        <main className="content-shell">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
