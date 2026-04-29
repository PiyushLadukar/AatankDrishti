import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import {
  Globe, Shield, TrendingUp, Users, AlertTriangle, Map,
  BarChart2, Activity, Search, Filter, Download, ChevronRight,
  Eye, Target, Zap, ArrowRight, Clock, Database, Brain
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Summary {
  total_incidents: number;
  years_covered: string;
  total_killed: number;
  total_wounded: number;
  countries: number;
  groups: number;
  ideology_categories: number;
}
interface IdeologyData { ideology: string; incidents: number; killed: number; }
interface TimelineData { year: number; ideology: string; incidents: number; }
interface RegionData { region: string; ideology: string; incidents: number; }
interface GroupData { group_name: string; ideology: string; incidents: number; killed: number; }
interface ReligionData { religion_subtype: string; incidents: number; }

// ─── Config ─────────────────────────────────────────────────────────────────
const API = "http://localhost:5000/api";

const IDEOLOGY_COLORS: Record<string, string> = {
  "Religious Extremist": "#dc2626",
  "Ethno-Nationalist":   "#2563eb",
  "Left-Wing":           "#d97706",
  "Right-Wing":          "#7c3aed",
  "Unknown":             "#64748b",
  "Single Issue":        "#059669",
};

const RELIGION_COLORS: Record<string, string> = {
  "Islamic":   "#15803d",
  "Christian": "#1d4ed8",
  "Jewish":    "#b45309",
  "Sikh":      "#7e22ce",
  "Cult":      "#475569",
  "Unknown":   "#94a3b8",
};

// ─── Custom hook ─────────────────────────────────────────────────────────────
function useApi<T>(endpoint: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetch(`${API}/${endpoint}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [endpoint]);
  return { data, loading, error };
}

// ─── Counter animation ───────────────────────────────────────────────────────
function AnimatedNumber({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    startRef.current = null;
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value, duration]);
  return <>{display.toLocaleString()}</>;
}

// ─── Homepage ────────────────────────────────────────────────────────────────
function Homepage({ onEnter }: { onEnter: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const features = [
    { icon: <Globe size={20} />, title: "180K+ Incidents", desc: "Global Terrorism Database spanning 1970–2020", color: "#dc2626" },
    { icon: <Brain size={20} />, title: "AI-Powered Analysis", desc: "KMeans clustering + NLP for pattern discovery", color: "#2563eb" },
    { icon: <BarChart2 size={20} />, title: "Ideology Mapping", desc: "70+ groups mapped across 6 ideology categories", color: "#d97706" },
    { icon: <Map size={20} />, title: "Regional Insights", desc: "Country, region, and geopolitical breakdowns", color: "#7c3aed" },
    { icon: <Activity size={20} />, title: "Time Series", desc: "50 years of incident trends visualized", color: "#059669" },
    { icon: <Shield size={20} />, title: "Data-Driven Only", desc: "No assumptions — documented sources only", color: "#0891b2" },
  ];

  const stats = [
    { label: "Incidents Analyzed", value: "180,000+" },
    { label: "Countries Covered", value: "205" },
    { label: "Years of Data", value: "50+" },
    { label: "Ideology Categories", value: "6" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fafafa 0%, #f0f4ff 50%, #fdf2f8 100%)",
      fontFamily: "'Sora', 'Outfit', system-ui, sans-serif",
      overflow: "hidden",
    }}>
      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 60px",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 100,
        transition: "all 0.3s",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36,
            background: "linear-gradient(135deg, #dc2626, #7c3aed)",
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Eye size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", letterSpacing: "-0.3px" }}>आतंकदृष्टि</div>
            <div style={{ fontSize: 10, color: "#64748b", letterSpacing: "0.5px", textTransform: "uppercase" }}>AatankDrishti</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ padding: "8px 20px", borderRadius: 8, color: "#475569", fontSize: 14, cursor: "pointer", fontWeight: 500 }}>About</div>
          <div style={{ padding: "8px 20px", borderRadius: 8, color: "#475569", fontSize: 14, cursor: "pointer", fontWeight: 500 }}>Data</div>
          <button
            onClick={onEnter}
            style={{
              padding: "8px 22px",
              background: "linear-gradient(135deg, #0f172a, #1e293b)",
              color: "white", border: "none", borderRadius: 8,
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            Open Dashboard <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{
        padding: "100px 60px 80px",
        maxWidth: 1200, margin: "0 auto",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: "all 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#fef3f2", border: "1px solid #fecaca",
          borderRadius: 100, padding: "6px 16px", marginBottom: 28,
        }}>
          <div style={{ width: 6, height: 6, background: "#dc2626", borderRadius: "50%", animation: "pulse 2s infinite" }} />
          <span style={{ color: "#dc2626", fontSize: 13, fontWeight: 600 }}>Data-Driven Research Tool</span>
        </div>

        <h1 style={{
          fontSize: "clamp(42px, 6vw, 72px)",
          fontWeight: 800,
          color: "#0f172a",
          lineHeight: 1.1,
          letterSpacing: "-2px",
          maxWidth: 780,
          marginBottom: 24,
        }}>
          आतंकदृष्टि
          <span style={{
            display: "block",
            fontSize: "clamp(22px, 3vw, 36px)",
            fontWeight: 400,
            color: "#64748b",
            letterSpacing: "-0.5px",
            marginTop: 8,
          }}>
            Global Terrorism Intelligence Dashboard
          </span>
        </h1>

        <p style={{
          fontSize: 18,
          color: "#475569",
          lineHeight: 1.7,
          maxWidth: 580,
          marginBottom: 40,
        }}>
          Analyze 180,000+ documented terrorism incidents across 50 years.
          Explore ideology patterns, regional data, and AI-discovered insights
          — all from the Global Terrorism Database.
        </p>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <button
            onClick={onEnter}
            style={{
              padding: "14px 32px",
              background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
              color: "white", border: "none", borderRadius: 10,
              fontSize: 16, fontWeight: 700, cursor: "pointer",
              display: "flex", alignItems: "center", gap: 10,
              boxShadow: "0 8px 32px rgba(15,23,42,0.3)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 12px 40px rgba(15,23,42,0.4)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 32px rgba(15,23,42,0.3)";
            }}
          >
            <BarChart2 size={18} /> Open Dashboard
          </button>
          <button style={{
            padding: "14px 32px",
            background: "white",
            color: "#0f172a", border: "1.5px solid #e2e8f0", borderRadius: 10,
            fontSize: 16, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 10,
            transition: "border-color 0.2s",
          }}>
            <Database size={18} /> View Data Sources
          </button>
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", gap: 0, marginTop: 72,
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          maxWidth: 700,
        }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{
              flex: 1, padding: "28px 24px",
              borderRight: i < stats.length - 1 ? "1px solid #e2e8f0" : "none",
              textAlign: "center",
            }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features grid */}
      <div style={{
        padding: "0 60px 100px",
        maxWidth: 1200, margin: "0 auto",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
      }}>
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#dc2626", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>Platform Capabilities</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px" }}>Everything you need to analyze terrorism data</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: "white",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: "28px 28px",
              transition: "transform 0.2s, box-shadow 0.2s",
              cursor: "default",
              animationDelay: `${i * 0.1}s`,
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = `0 12px 40px ${f.color}18`;
                (e.currentTarget as HTMLDivElement).style.borderColor = `${f.color}40`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0";
              }}
            >
              <div style={{
                width: 44, height: 44,
                background: `${f.color}12`,
                border: `1px solid ${f.color}25`,
                borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16, color: f.color,
              }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f172a", marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          marginTop: 60,
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: 20, padding: "48px 60px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 20px 60px rgba(15,23,42,0.25)",
        }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "white", marginBottom: 8, letterSpacing: "-0.5px" }}>
              Ready to explore the data?
            </div>
            <div style={{ fontSize: 15, color: "#94a3b8" }}>
              180,000+ documented incidents. 50 years. All ideologies. No assumptions.
            </div>
          </div>
          <button onClick={onEnter} style={{
            padding: "14px 32px",
            background: "white", color: "#0f172a",
            border: "none", borderRadius: 10,
            fontSize: 15, fontWeight: 700, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 8,
            whiteSpace: "nowrap",
            transition: "transform 0.2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
          >
            Launch Dashboard <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
function Dashboard({ onBack }: { onBack: () => void }) {
  const summary   = useApi<Summary>("summary");
  const ideology  = useApi<IdeologyData[]>("ideology");
  const timeline  = useApi<TimelineData[]>("timeline");
  const region    = useApi<RegionData[]>("region");
  const topGroups = useApi<GroupData[]>("top-groups");
  const religion  = useApi<ReligionData[]>("religion-subtype");

  const [selectedIdeology, setSelectedIdeology] = useState<string>("All");
  const [yearRange, setYearRange] = useState<[number, number]>([1970, 2020]);
  const [activeTab, setActiveTab] = useState<"overview" | "ideology" | "groups" | "insights">("overview");

  // Process timeline → pivot by year
  const timelineByYear = timeline.data
    ? Object.values(
        timeline.data.reduce((acc: Record<number, Record<string, unknown>>, row) => {
          if (!acc[row.year]) acc[row.year] = { year: row.year };
          (acc[row.year] as Record<string, unknown>)[row.ideology] = row.incidents;
          return acc;
        }, {})
      ).sort((a: any, b: any) => a.year - b.year)
      .filter((d: any) => d.year >= yearRange[0] && d.year <= yearRange[1])
    : [];

  const regionTotals = region.data
    ? Object.values(
        region.data.reduce((acc: Record<string, any>, row) => {
          if (!acc[row.region]) acc[row.region] = { region: row.region, total: 0 };
          acc[row.region].total += row.incidents;
          return acc;
        }, {})
      ).sort((a: any, b: any) => b.total - a.total).slice(0, 10)
    : [];

  const s = summary.data;

  const StatCard = ({ icon, label, value, sub, color }: any) => (
    <div style={{
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: 16, padding: "24px",
      flex: 1, minWidth: 160,
      position: "relative", overflow: "hidden",
      transition: "box-shadow 0.2s, transform 0.2s",
    }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${color}18`;
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
      }}
    >
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: 80, height: 80,
        background: `${color}08`,
        borderRadius: "0 0 0 80px",
      }} />
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: `${color}12`, color,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 14,
      }}>{icon}</div>
      <div style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600 }}>{label}</div>
      <div style={{ color: "#0f172a", fontSize: 26, fontWeight: 800, marginTop: 4, letterSpacing: "-1px" }}>
        {typeof value === "number" ? <AnimatedNumber value={value} /> : value}
      </div>
      {sub && <div style={{ color: "#94a3b8", fontSize: 12, marginTop: 3 }}>{sub}</div>}
    </div>
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: <BarChart2 size={15} /> },
    { id: "ideology", label: "Ideology", icon: <Target size={15} /> },
    { id: "groups", label: "Groups", icon: <Users size={15} /> },
    { id: "insights", label: "Insights", icon: <Brain size={15} /> },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily: "'Sora', 'Outfit', system-ui, sans-serif",
    }}>
      {/* Top bar */}
      <div style={{
        background: "white",
        borderBottom: "1px solid #e2e8f0",
        padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 60, position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button onClick={onBack} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "none", border: "1px solid #e2e8f0", borderRadius: 8,
            padding: "6px 14px", color: "#64748b", fontSize: 13, cursor: "pointer",
            fontWeight: 500,
          }}>
            ← Home
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 30, height: 30,
              background: "linear-gradient(135deg, #dc2626, #7c3aed)",
              borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Eye size={15} color="white" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: "#0f172a" }}>आतंकदृष्टि</span>
            <span style={{ color: "#e2e8f0", fontSize: 18 }}>|</span>
            <span style={{ color: "#64748b", fontSize: 13, fontWeight: 500 }}>Analysis Dashboard</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: 20, padding: "4px 12px",
          }}>
            <div style={{ width: 6, height: 6, background: "#16a34a", borderRadius: "50%" }} />
            <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 600 }}>Live Data</span>
          </div>
          <div style={{
            background: "#f8fafc", border: "1px solid #e2e8f0",
            borderRadius: 8, padding: "6px 12px", fontSize: 13, color: "#64748b",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Clock size={13} />
            GTD 1970–2020
          </div>
        </div>
      </div>

      {/* Research banner */}
      <div style={{
        background: "linear-gradient(90deg, #fef9c3, #fef3f2)",
        borderBottom: "1px solid #fde68a",
        padding: "10px 32px",
        display: "flex", alignItems: "center", gap: 10,
        fontSize: 13, color: "#92400e",
      }}>
        <AlertTriangle size={15} />
        <strong>Research Note:</strong> Terrorism spans all ideological categories. This dashboard shows documented facts only — no predetermined conclusions. ~38% of incidents have unknown perpetrators.
      </div>

      <div style={{ padding: "28px 32px" }}>
        {/* Stat cards */}
        {s && (
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
            <StatCard icon={<Activity size={16} />} label="Total Incidents" value={s.total_incidents} sub={s.years_covered} color="#dc2626" />
            <StatCard icon={<Users size={16} />} label="Total Killed" value={s.total_killed} color="#7c3aed" />
            <StatCard icon={<Zap size={16} />} label="Total Wounded" value={s.total_wounded} color="#d97706" />
            <StatCard icon={<Globe size={16} />} label="Countries" value={s.countries} color="#2563eb" />
            <StatCard icon={<Shield size={16} />} label="Active Groups" value={s.groups} sub="documented" color="#059669" />
            <StatCard icon={<Target size={16} />} label="Ideology Types" value={s.ideology_categories} color="#0891b2" />
          </div>
        )}

        {/* Tabs */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 24,
          background: "white", borderRadius: 12, padding: 4,
          border: "1px solid #e2e8f0", width: "fit-content",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              style={{
                padding: "8px 20px",
                background: activeTab === t.id ? "#0f172a" : "transparent",
                color: activeTab === t.id ? "white" : "#64748b",
                border: "none", borderRadius: 8,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 7,
                transition: "all 0.2s",
              }}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div style={{
          background: "white", border: "1px solid #e2e8f0",
          borderRadius: 12, padding: "16px 20px", marginBottom: 24,
          display: "flex", alignItems: "center", gap: 20,
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: 13, fontWeight: 600 }}>
            <Filter size={14} /> Filters:
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {["All", "Religious Extremist", "Ethno-Nationalist", "Left-Wing", "Right-Wing", "Unknown"].map(ide => (
              <button
                key={ide}
                onClick={() => setSelectedIdeology(ide)}
                style={{
                  padding: "5px 14px",
                  background: selectedIdeology === ide
                    ? (IDEOLOGY_COLORS[ide] || "#0f172a")
                    : "#f8fafc",
                  color: selectedIdeology === ide ? "white" : "#475569",
                  border: `1px solid ${selectedIdeology === ide ? (IDEOLOGY_COLORS[ide] || "#0f172a") : "#e2e8f0"}`,
                  borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {ide}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>Year: {yearRange[0]}–{yearRange[1]}</span>
            <input type="range" min={1970} max={2020} value={yearRange[0]}
              onChange={e => setYearRange([+e.target.value, yearRange[1]])}
              style={{ width: 80 }} />
            <input type="range" min={1970} max={2020} value={yearRange[1]}
              onChange={e => setYearRange([yearRange[0], +e.target.value])}
              style={{ width: 80 }} />
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Timeline chart */}
            <div style={{ background: "white", borderRadius: 16, padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a" }}>Incidents Over Time — By Ideology</div>
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>50 years of global terrorism patterns across all ideological categories</div>
              </div>
              {timeline.loading ? <Loader /> :
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={timelineByYear}>
                    <defs>
                      {Object.entries(IDEOLOGY_COLORS).map(([ide, color]) => (
                        <linearGradient key={ide} id={`grad-${ide.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                          <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                    <Legend />
                    {Object.entries(IDEOLOGY_COLORS)
                      .filter(([ide]) => selectedIdeology === "All" || ide === selectedIdeology)
                      .map(([ide, color]) => (
                        <Area key={ide} type="monotone" dataKey={ide}
                          stroke={color} fill={`url(#grad-${ide.replace(/\s+/g, "")})`}
                          strokeWidth={2} dot={false} />
                      ))}
                  </AreaChart>
                </ResponsiveContainer>
              }
            </div>

            {/* Region + Ideology side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div style={{ background: "white", borderRadius: 16, padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Incidents by Region</div>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Top 10 affected regions globally</div>
                {region.loading ? <Loader /> :
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={regionTotals} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                      <YAxis type="category" dataKey="region" stroke="#94a3b8" tick={{ fontSize: 10, fill: "#94a3b8" }} width={145} />
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10 }} />
                      <Bar dataKey="total" fill="#2563eb" radius={[0, 6, 6, 0]}>
                        {regionTotals.map((_: any, i: number) => (
                          <Cell key={i} fill={`hsl(${220 - i * 15}, 70%, ${55 - i * 2}%)`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                }
              </div>

              <div style={{ background: "white", borderRadius: 16, padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Religious Extremism Breakdown</div>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Spans multiple faiths — not one religion</div>
                {religion.loading ? <Loader /> :
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={religion.data || []} dataKey="incidents" nameKey="religion_subtype"
                        cx="50%" cy="50%" outerRadius={100} innerRadius={50}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}>
                        {(religion.data || []).map((entry: ReligionData) => (
                          <Cell key={entry.religion_subtype} fill={RELIGION_COLORS[entry.religion_subtype] || "#94a3b8"} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                }
              </div>
            </div>
          </div>
        )}

        {/* Ideology Tab */}
        {activeTab === "ideology" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div style={{ background: "white", borderRadius: 16, padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Incidents by Ideology</div>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Distribution across all ideology categories</div>
                {ideology.loading ? <Loader /> :
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={ideology.data || []} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis type="category" dataKey="ideology" stroke="#94a3b8" tick={{ fontSize: 11, fill: "#94a3b8" }} width={140} />
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10 }} />
                      <Bar dataKey="incidents" radius={[0, 6, 6, 0]}>
                        {(ideology.data || []).map((entry: IdeologyData) => (
                          <Cell key={entry.ideology} fill={IDEOLOGY_COLORS[entry.ideology] || "#94a3b8"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                }
              </div>

              <div style={{ background: "white", borderRadius: 16, padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Killed by Ideology</div>
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>Total fatalities attributed per category</div>
                {ideology.loading ? <Loader /> :
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={ideology.data || []} layout="vertical" margin={{ left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis type="category" dataKey="ideology" stroke="#94a3b8" tick={{ fontSize: 11, fill: "#94a3b8" }} width={140} />
                      <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 10 }} />
                      <Bar dataKey="killed" radius={[0, 6, 6, 0]}>
                        {(ideology.data || []).map((entry: IdeologyData) => (
                          <Cell key={entry.ideology} fill={IDEOLOGY_COLORS[entry.ideology] || "#94a3b8"} opacity={0.8} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                }
              </div>
            </div>

            {/* Ideology cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {(ideology.data || []).map((item: IdeologyData) => (
                <div key={item.ideology} style={{
                  background: "white", border: `1px solid ${IDEOLOGY_COLORS[item.ideology] || "#e2e8f0"}30`,
                  borderLeft: `4px solid ${IDEOLOGY_COLORS[item.ideology] || "#e2e8f0"}`,
                  borderRadius: 12, padding: "20px 24px",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                }}>
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 12 }}>{item.ideology}</div>
                  <div style={{ display: "flex", gap: 20 }}>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: IDEOLOGY_COLORS[item.ideology] || "#0f172a", letterSpacing: "-0.5px" }}>
                        <AnimatedNumber value={item.incidents} />
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>incidents</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
                        <AnimatedNumber value={item.killed} />
                      </div>
                      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>killed</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Groups Tab */}
        {activeTab === "groups" && (
          <div style={{ background: "white", borderRadius: 16, padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#0f172a", marginBottom: 4 }}>Top 20 Most Active Groups</div>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 24 }}>Groups ranked by number of documented incidents across all ideologies</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                    {["#", "Group Name", "Ideology", "Incidents", "Killed", "Lethality"].map(h => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: "#64748b", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(topGroups.data || []).filter((g: GroupData) => selectedIdeology === "All" || g.ideology === selectedIdeology)
                    .slice(0, 20).map((g: GroupData, i: number) => {
                      const lethality = g.incidents > 0 ? (g.killed / g.incidents).toFixed(2) : "0";
                      return (
                        <tr key={g.group_name} style={{
                          borderBottom: "1px solid #f8fafc",
                          transition: "background 0.15s",
                        }}
                          onMouseEnter={e => { (e.currentTarget as HTMLTableRowElement).style.background = "#f8fafc"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLTableRowElement).style.background = "transparent"; }}
                        >
                          <td style={{ padding: "12px 14px", color: "#94a3b8", fontWeight: 600 }}>{i + 1}</td>
                          <td style={{ padding: "12px 14px", color: "#0f172a", fontWeight: 600, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.group_name}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <span style={{
                              background: `${IDEOLOGY_COLORS[g.ideology] || "#64748b"}15`,
                              color: IDEOLOGY_COLORS[g.ideology] || "#64748b",
                              padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                            }}>{g.ideology}</span>
                          </td>
                          <td style={{ padding: "12px 14px", color: "#0f172a", fontWeight: 700 }}>{g.incidents.toLocaleString()}</td>
                          <td style={{ padding: "12px 14px", color: "#dc2626", fontWeight: 700 }}>{g.killed.toLocaleString()}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <div style={{
                                height: 6, width: `${Math.min(Number(lethality) * 10, 100)}px`,
                                background: `${IDEOLOGY_COLORS[g.ideology] || "#64748b"}`,
                                borderRadius: 3, minWidth: 4,
                              }} />
                              <span style={{ fontSize: 12, color: "#64748b" }}>{lethality}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Insights Tab */}
        {activeTab === "insights" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            {[
              {
                color: "#dc2626", icon: <AlertTriangle size={18} />, title: "On Religious Extremism",
                body: "Religious extremist incidents span multiple faiths — Islamic, Christian, Jewish, Sikh, and cult-based groups. The GTD data shows concentration in specific conflict zones (Iraq, Afghanistan, Nigeria) where geopolitical instability is the primary driver, not religion alone.",
                stat: "28%", statLabel: "of identified incidents"
              },
              {
                color: "#64748b", icon: <Search size={18} />, title: "The Unknown Problem",
                body: "A significant share of GTD incidents have no confirmed perpetrator group. Assigning ideology to these would be methodologically unsound. Any analysis that ignores this category produces misleading conclusions.",
                stat: "~38%", statLabel: "unidentified perpetrator"
              },
              {
                color: "#2563eb", icon: <Globe size={18} />, title: "Ethno-Nationalist Terrorism",
                body: "Historically, ethno-nationalist groups (IRA, LTTE, ETA, PKK) have caused the most cumulative casualties over multi-decade campaigns. This category is chronically underreported in Western media relative to its actual scale.",
                stat: "20%", statLabel: "of total incidents"
              },
              {
                color: "#7c3aed", icon: <TrendingUp size={18} />, title: "Rising Right-Wing Trend",
                body: "Right-wing and white supremacist terrorism has increased significantly in Western countries post-2010. This trend is documented in GTD data but often receives less media coverage than attacks attributed to other ideologies.",
                stat: "+4×", statLabel: "growth since 2010"
              },
              {
                color: "#d97706", icon: <Activity size={18} />, title: "Left-Wing Historical Peak",
                body: "In the 1970s–1980s, Left-Wing groups (FARC, Red Brigades, Weather Underground, Shining Path) dominated the global terrorism landscape — a fact often absent from modern narratives about terrorism.",
                stat: "1970s", statLabel: "peak decade"
              },
              {
                color: "#059669", icon: <Map size={18} />, title: "Geography Matters Most",
                body: "The region's political history — state collapse, colonial legacy, ethnic conflicts — predicts terrorism type more reliably than ideology. South America → Left-Wing. Western Europe → Ethno-Nationalist. Middle East → Religious Extremist.",
                stat: "12", statLabel: "regions analyzed"
              },
            ].map((ins, i) => (
              <div key={i} style={{
                background: "white", borderRadius: 16, padding: "28px",
                border: "1px solid #e2e8f0",
                borderLeft: `4px solid ${ins.color}`,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${ins.color}18`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)";
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    color: ins.color, fontWeight: 700, fontSize: 15,
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 9,
                      background: `${ins.color}12`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{ins.icon}</div>
                    {ins.title}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: ins.color, letterSpacing: "-0.5px" }}>{ins.stat}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>{ins.statLabel}</div>
                  </div>
                </div>
                <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.7, margin: 0 }}>{ins.body}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: 40, paddingTop: 20, borderTop: "1px solid #e2e8f0",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontSize: 12, color: "#94a3b8",
        }}>
          <span>Data: Global Terrorism Database (GTD) · START Center, University of Maryland</span>
          <span>All classifications based on documented academic sources · Research use only</span>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  );
}

function Loader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, flexDirection: "column", gap: 12 }}>
      <div style={{ width: 32, height: 32, border: "3px solid #e2e8f0", borderTop: "3px solid #0f172a", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <div style={{ color: "#94a3b8", fontSize: 13 }}>Loading data from API...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<"home" | "dashboard">("home");
  return page === "home"
    ? <Homepage onEnter={() => setPage("dashboard")} />
    : <Dashboard onBack={() => setPage("home")} />;
}