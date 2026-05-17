import { useState, useEffect, useRef } from "react";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  Globe, Shield, TrendingUp, Users, AlertTriangle, Map,
  BarChart2, Activity, Search, Filter, ChevronRight,
  Eye, Target, Zap, ArrowRight, Clock, Database, Brain,
  Github, Linkedin, Code, Play, Menu, X, Info,
  BookOpen, Link, ExternalLink, FileText, Award, ChevronDown,
  CheckCircle, Hash, Calendar, MapPin,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Summary { total_incidents:number; years_covered:string; total_killed:number; total_wounded:number; countries:number; groups:number; ideology_categories:number }
interface IdeologyData { ideology:string; incidents:number; killed:number }
interface TimelineData { year:number; ideology:string; incidents:number }
interface RegionData { region:string; ideology:string; incidents:number }
interface GroupData { group_name:string; ideology:string; incidents:number; killed:number }
interface ReligionData { religion_subtype:string; incidents:number }

// ─── Config ───────────────────────────────────────────────────────────────────
const API = "https://aatankdrishti-production.up.railway.app";
const IC: Record<string,string> = {
  "Religious Extremist":"#dc2626","Ethno-Nationalist":"#2563eb",
  "Left-Wing":"#d97706","Right-Wing":"#7c3aed","Unknown":"#64748b","Single Issue":"#059669",
};
const RC: Record<string,string> = {
  "Islamic":"#15803d","Christian":"#1d4ed8","Jewish":"#b45309",
  "Sikh":"#7e22ce","Cult":"#475569","Unknown":"#94a3b8",
};
const F = "'Sora','Outfit',system-ui,sans-serif";

// ─── Responsive Hook ──────────────────────────────────────────────────────────
function useBreakpoint() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return { isMobile: w < 640, isTablet: w >= 640 && w < 1024, isDesktop: w >= 1024, w };
}

// ─── API Hook ─────────────────────────────────────────────────────────────────
function useApi<T>(ep: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetch(`${API}/${ep}`)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [ep]);
  return { data, loading, error };
}

// ─── Scroll Reveal ────────────────────────────────────────────────────────────
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setV(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, v };
}

// ─── Animated Number ──────────────────────────────────────────────────────────
function Num({ v, d = 1800 }: { v: number; d?: number }) {
  const [n, setN] = useState(0);
  const r = useRef<number | null>(null);
  useEffect(() => {
    r.current = null;
    const a = (ts: number) => {
      if (!r.current) r.current = ts;
      const p = Math.min((ts - r.current) / d, 1);
      setN(Math.floor((1 - Math.pow(1 - p, 3)) * v));
      if (p < 1) requestAnimationFrame(a);
    };
    requestAnimationFrame(a);
  }, [v, d]);
  return <>{n.toLocaleString()}</>;
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
const CT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "9px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", fontFamily: F }}>
      <p style={{ fontWeight: 700, color: "#0f172a", fontSize: 12, marginBottom: 3 }}>{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.fill, fontSize: 11, margin: "2px 0" }}>
          {p.name}: <strong>{p.value?.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

// ─── Loader ───────────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160, flexDirection: "column", gap: 10 }}>
      <div style={{ width: 30, height: 30, border: "3px solid #f1f5f9", borderTop: "3px solid #0f172a", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <span style={{ color: "#94a3b8", fontSize: 12, fontFamily: F }}>Loading...</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ size = 34 }: { size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
      <img
        src="./logo.png"
        alt="AatankDrishti Logo"
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.28),
          objectFit: "contain",
          flexShrink: 0,
        }}
      />
      <div>
        <div style={{ fontWeight: 1200, fontSize: Math.round(size * 0.6), color: "#0f172a", letterSpacing: "-0.3px", lineHeight: 1, fontFamily: F }}>आतंकदृष्टि</div>
        <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: "1.5px", textTransform: "uppercase", fontWeight: 600, marginTop: 1, fontFamily: F }}>AatankDrishti</div>
      </div>
    </div>
  );
}

// ─── Ticker ───────────────────────────────────────────────────────────────────
function Ticker() {
  const items = ["180,000+ Incidents","205 Countries","50 Years · 1970–2020","3,500+ Groups","6 Ideology Categories","411K+ Deaths","GTD — START Center","AI Clustering + NLP","Research-Grade Intelligence"];
  return (
    <div style={{ background: "#0f172a", overflow: "hidden", padding: "11px 0" }}>
      <div style={{ display: "flex", animation: "tick 28s linear infinite", whiteSpace: "nowrap" }}>
        {[...items, ...items].map((it, i) => (
          <span key={i} style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", padding: "0 28px", display: "inline-flex", alignItems: "center", gap: 10, fontFamily: F }}>
            <span style={{ width: 4, height: 4, background: "#dc2626", borderRadius: "50%", display: "inline-block", flexShrink: 0 }} />
            {it}
          </span>
        ))}
      </div>
      <style>{`@keyframes tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

// ─── Hero Visual Card ──────────────────────────────────────────────────────────
function HeroVisual() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 2200);
    return () => clearInterval(id);
  }, []);

  const liveStats = [
    { label: "Iraq", val: "24,636", change: "+3.2%", c: "#dc2626" },
    { label: "Afghanistan", val: "17,891", change: "+2.8%", c: "#d97706" },
    { label: "Pakistan", val: "14,368", change: "+1.9%", c: "#7c3aed" },
    { label: "India", val: "11,960", change: "+1.1%", c: "#2563eb" },
    { label: "Colombia", val: "8,342", change: "+0.7%", c: "#059669" },
  ];

  const ideoBars = [
    { label: "Religious Ext.", pct: 92, c: "#dc2626" },
    { label: "Ethno-Nationalist", pct: 68, c: "#2563eb" },
    { label: "Unknown", pct: 100, c: "#64748b" },
    { label: "Left-Wing", pct: 28, c: "#d97706" },
    { label: "Right-Wing", pct: 14, c: "#7c3aed" },
  ];

  const pulseRings = [
    { size: 260, op: 0.04, delay: "0s" },
    { size: 200, op: 0.07, delay: "0.6s" },
    { size: 140, op: 0.10, delay: "1.2s" },
  ];

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 480, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {/* Ambient glow */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Central globe */}
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 10 }}>
        {pulseRings.map((r, i) => (
          <div key={i} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: r.size, height: r.size, borderRadius: "50%", border: `1px solid rgba(220,38,38,${r.op})`, animation: `hpulse 3s ease-in-out ${r.delay} infinite` }} />
        ))}
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#dc2626,#7c3aed)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 40px rgba(220,38,38,0.3), 0 0 80px rgba(220,38,38,0.1)", position: "relative", zIndex: 2 }}>
          <Globe size={36} color="white" />
        </div>
      </div>

      {/* Top-left: Total incidents card */}
      <div style={{ position: "absolute", top: "8%", left: "0%", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderRadius: 14, padding: "14px 18px", border: "1px solid rgba(220,38,38,0.15)", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", animation: "floatA 6s ease-in-out infinite", minWidth: 160, zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#dc2626", animation: "blink 1.5s ease-in-out infinite" }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "1px", fontFamily: F }}>Total Incidents</span>
        </div>
        <div style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px", fontFamily: F }}>181,691</div>
        <div style={{ fontSize: 10, color: "#64748b", marginTop: 2, fontFamily: F }}>1970 – 2020 · GTD</div>
        <div style={{ marginTop: 10, height: 3, background: "#f1f5f9", borderRadius: 2 }}>
          <div style={{ height: "100%", width: "78%", background: "linear-gradient(90deg,#dc2626,#f87171)", borderRadius: 2, animation: "barGrow 2s ease-out" }} />
        </div>
      </div>

      {/* Top-right: Ideology mini-chart */}
      <div style={{ position: "absolute", top: "4%", right: "0%", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderRadius: 14, padding: "14px 16px", border: "1px solid rgba(124,58,237,0.15)", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", animation: "floatB 7s ease-in-out infinite", minWidth: 170, zIndex: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10, fontFamily: F }}>Ideology Breakdown</div>
        {ideoBars.map((b, i) => (
          <div key={i} style={{ marginBottom: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
              <span style={{ fontSize: 9, color: "#64748b", fontFamily: F }}>{b.label}</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: b.c, fontFamily: F }}>{b.pct}%</span>
            </div>
            <div style={{ height: 4, background: "#f1f5f9", borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${b.pct}%`, background: b.c, borderRadius: 2, transition: "width 1s ease", opacity: 0.85 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Left middle: Countries card */}
      <div style={{ position: "absolute", left: "-4%", top: "42%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderRadius: 14, padding: "14px 16px", border: "1px solid rgba(37,99,235,0.15)", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", animation: "floatC 8s ease-in-out infinite", zIndex: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#2563eb", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 6, fontFamily: F }}>Coverage</div>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px", fontFamily: F }}>205</div>
            <div style={{ fontSize: 9, color: "#64748b", fontFamily: F }}>Countries</div>
          </div>
          <div style={{ width: 1, background: "#e2e8f0" }} />
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px", fontFamily: F }}>50</div>
            <div style={{ fontSize: 9, color: "#64748b", fontFamily: F }}>Years</div>
          </div>
        </div>
      </div>

      {/* Right middle: Live top countries */}
      <div style={{ position: "absolute", right: "-4%", top: "46%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderRadius: 14, padding: "14px 16px", border: "1px solid rgba(220,38,38,0.12)", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", animation: "floatD 9s ease-in-out infinite", minWidth: 170, zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <MapPin size={10} color="#dc2626" />
          <span style={{ fontSize: 10, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "1px", fontFamily: F }}>Top Affected</span>
        </div>
        {liveStats.map((s, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: i < liveStats.length - 1 ? "1px solid #f8fafc" : "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: s.c }} />
              <span style={{ fontSize: 10, color: "#475569", fontFamily: F }}>{s.label}</span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#0f172a", fontFamily: F }}>{s.val}</span>
          </div>
        ))}
      </div>

      {/* Bottom-left: Killed stat */}
      <div style={{ position: "absolute", bottom: "10%", left: "4%", background: "rgba(15,23,42,0.92)", backdropFilter: "blur(12px)", borderRadius: 14, padding: "14px 18px", border: "1px solid rgba(220,38,38,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.16)", animation: "floatE 7.5s ease-in-out infinite", zIndex: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4, fontFamily: F }}>Total Killed</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-1px", fontFamily: F }}>411,000+</div>
        <div style={{ fontSize: 10, color: "#475569", marginTop: 2, fontFamily: F }}>Documented fatalities</div>
      </div>

      {/* Bottom-right: Groups */}
      <div style={{ position: "absolute", bottom: "8%", right: "2%", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderRadius: 14, padding: "12px 16px", border: "1px solid rgba(5,150,105,0.15)", boxShadow: "0 8px 32px rgba(0,0,0,0.08)", animation: "floatF 6.5s ease-in-out infinite", zIndex: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: "#059669", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4, fontFamily: F }}>Terrorist Groups</div>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px", fontFamily: F }}>3,500+</div>
        <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
          {["RE","EN","LW","RW"].map((t, i) => (
            <span key={i} style={{ fontSize: 8, fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: ["#fef2f2","#eff6ff","#fffbeb","#f5f3ff"][i], color: ["#dc2626","#2563eb","#d97706","#7c3aed"][i], fontFamily: F }}>{t}</span>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes hpulse { 0%,100%{transform:translate(-50%,-50%) scale(1);opacity:1} 50%{transform:translate(-50%,-50%) scale(1.06);opacity:0.6} }
        @keyframes floatA { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes floatB { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes floatC { 0%,100%{transform:translateY(-50%)} 50%{transform:translateY(calc(-50% - 8px))} }
        @keyframes floatD { 0%,100%{transform:translateY(-50%)} 50%{transform:translateY(calc(-50% + 8px))} }
        @keyframes floatE { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes floatF { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes barGrow { from{width:0} }
      `}</style>
    </div>
  );
}

// ─── Dual-Thumb Range Slider ──────────────────────────────────────────────────
function RangeSlider({ min, max, value, onChange }: { min: number; max: number; value: [number, number]; onChange: (v: [number, number]) => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState<"min" | "max" | null>(null);
  const pct = (v: number) => ((v - min) / (max - min)) * 100;
  const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const posToVal = (clientX: number) => {
    if (!trackRef.current) return 0;
    const { left, width } = trackRef.current.getBoundingClientRect();
    return Math.round(clamp((clientX - left) / width, 0, 1) * (max - min) + min);
  };
  const onMouseDown = (thumb: "min" | "max") => (e: React.MouseEvent) => { e.preventDefault(); setDragging(thumb); };
  useEffect(() => {
    if (!dragging) return;
    const move = (e: MouseEvent) => {
      const v = posToVal(e.clientX);
      if (dragging === "min") onChange([clamp(v, min, value[1] - 1), value[1]]);
      else onChange([value[0], clamp(v, value[0] + 1, max)]);
    };
    const up = () => setDragging(null);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [dragging, value]);
  const lo = pct(value[0]);
  const hi = pct(value[1]);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#0f172a", fontFamily: F, minWidth: 36, textAlign: "right" }}>{value[0]}</span>
      <div ref={trackRef} style={{ position: "relative", height: 24, flex: 1, display: "flex", alignItems: "center" }}>
        <div style={{ position: "absolute", left: 0, right: 0, height: 4, borderRadius: 2, background: "#e2e8f0" }} />
        <div style={{ position: "absolute", left: `${lo}%`, width: `${hi - lo}%`, height: 4, borderRadius: 2, background: "#0f172a" }} />
        <div onMouseDown={onMouseDown("min")} style={{ position: "absolute", left: `${lo}%`, transform: "translateX(-50%)", width: 16, height: 16, borderRadius: "50%", background: "#fff", border: "2.5px solid #0f172a", boxShadow: "0 1px 6px rgba(0,0,0,0.18)", cursor: "grab", zIndex: dragging === "min" ? 3 : 2 }} />
        <div onMouseDown={onMouseDown("max")} style={{ position: "absolute", left: `${hi}%`, transform: "translateX(-50%)", width: 16, height: 16, borderRadius: "50%", background: "#fff", border: "2.5px solid #0f172a", boxShadow: "0 1px 6px rgba(0,0,0,0.18)", cursor: "grab", zIndex: dragging === "max" ? 3 : 2 }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color: "#0f172a", fontFamily: F, minWidth: 36 }}>{value[1]}</span>
    </div>
  );
}

// ─── DATA SOURCES PAGE ────────────────────────────────────────────────────────
function CitationsPage({ onBack }: { onBack: () => void }) {
  const { isMobile } = useBreakpoint();
  const [scrolled, setScrolled] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("primary");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const primarySource = {
    id: "GTD-2022",
    title: "Global Terrorism Database (GTD)",
    subtitle: "National Consortium for the Study of Terrorism and Responses to Terrorism (START)",
    institution: "University of Maryland",
    year: "2022",
    url: "https://www.start.umd.edu/gtd/",
    kaggle: "https://www.kaggle.com/datasets/START-UMD/gtd",
    coverage: "1970–2020",
    records: "181,691 incidents",
    badge: "Primary Dataset",
    badgeColor: "#dc2626",
    description: "The GTD is an open-source database including information on terrorist attacks around the world from 1970 through 2020. The GTD includes systematic data on domestic as well as transnational and international terrorist incidents that have occurred during this time period and now includes more than 200,000 cases. For each GTD incident, information is available on the date and location of the incident, the weapons used and nature of the target, the number of casualties, and — when identifiable — the group or individual responsible.",
    citation: `National Consortium for the Study of Terrorism and Responses to Terrorism (START), University of Maryland. (2022). Global Terrorism Database 1970 - 2020 [Data file]. Retrieved from https://www.start.umd.edu/gtd`,
    fields: ["Date & Location", "Attack Type", "Weapons Used", "Target Type", "Casualties", "Group Responsible", "Success/Failure", "Nationality of Perpetrators"],
    notes: [
      "1993 data were not included in the original GTD and are estimated using a methodology described at START.umd.edu",
      "Data from 2011 onward were collected by START",
      "All years prior to 2011 were originally collected by PGIS",
    ],
  };

  const academicSources = [
    {
      id: "RAND-2023",
      authors: "Jones, S. G., Doxsee, C., Harrington, N.",
      year: "2023",
      title: "The Escalating Terrorism Problem in the United States",
      journal: "CSISRAND Corporation",
      url: "https://www.csis.org/analysis/escalating-terrorism-problem-united-states",
      usedFor: "Right-wing ideology classification methodology and trend analysis",
      type: "Report",
    },
    {
      id: "START-IDC",
      authors: "Chermak, S., Freilich, J., Parkin, W.",
      year: "2021",
      title: "Ideology and Terrorism: A Review of the Literature",
      journal: "Criminology & Public Policy",
      url: "https://www.annualreviews.org/content/journals/10.1146/annurev-criminol-022422-121713",
      usedFor: "Academic framework for ideology classification into 6 categories",
      type: "Journal Article ",
    },
    {
      id: "UCDP-2022",
      authors: "Sundberg, R., Melander, E.",
      year: "2022",
      title: "Introducing the UCDP Georeferenced Event Dataset",
      journal: "Journal of Peace Research, 50(4)",
      url: "https://ucdp.uu.se/downloads/",
      usedFor: "Cross-validation of regional conflict data",
      type: "Journal Article",
    },
    {
      id: "TRAC-2023",
      authors: "Terrorism Research & Analysis Consortium (TRAC)",
      year: "2023",
      title: "TRAC Global Terrorism & Insurgency Database",
      journal: "TRAC",
      url: "https://www.trackingterrorism.org/",
      usedFor: "Supplementary group ideology verification for ambiguous cases",
      type: "Database",
    },
    {
      id: "CFR-2023",
      authors: "Masters, J.",
      year: "2023",
      title: "Al-Qaeda: Council on Foreign Relations Backgrounder",
      journal: "Council on Foreign Relations",
      url: "https://www.cfr.org/backgrounders/al-qaeda-aka-al-qaida-al-qaida",
      usedFor: "Religious extremist group ideology classification",
      type: "Report",
    },
    {
      id: "ICSR-2022",
      authors: "International Centre for the Study of Radicalisation (ICSR)",
      year: "2022",
      title: "Mapping the Jihadist Threat: ISIL and Beyond",
      journal: "King's College London",
      url: "https://www.usip.org/sites/default/files/The-Jihadi-Threat-ISIS-Al-Qaeda-and-Beyond.pdf",
      usedFor: "Islamic extremism subtype classification (2011–2020)",
      type: "Report",
    },
  ];

  const methodologySources = [
    {
      id: "SKLEARN-2023",
      name: "scikit-learn",
      version: "1.3.0",
      desc: "KMeans clustering algorithm used for AI ideology discovery (k=6 clusters, random_state=42)",
      url: "https://scikit-learn.org/stable/",
      citation: `Pedregosa, F. et al. (2011). Scikit-learn: Machine Learning in Python. JMLR 12, pp. 2825-2830.`,
    },
    {
      id: "PANDAS-2023",
      name: "pandas",
      version: "2.0.3",
      desc: "Data manipulation and CSV preprocessing pipeline",
      url: "https://pandas.pydata.org/",
      citation: `McKinney, W. (2010). Data Structures for Statistical Computing in Python. Proc. 9th Python in Science Conf., pp. 56-61.`,
    },
    {
      id: "NUMPY-2023",
      name: "NumPy",
      version: "1.24.3",
      desc: "Numerical computing foundation for data analysis",
      url: "https://numpy.org/",
      citation: `Harris, C. R. et al. (2020). Array programming with NumPy. Nature, 585, 357-362.`,
    },
    {
      id: "FLASK-2023",
      name: "Flask",
      version: "3.0.0",
      desc: "REST API backend serving processed GTD data endpoints",
      url: "https://flask.palletsprojects.com/",
      citation: `Ronacher, A. (2023). Flask Web Development Framework. Pallets Projects.`,
    },
    {
      id: "REACT-2023",
      name: "React + TypeScript",
      version: "18.2.0",
      desc: "Frontend dashboard UI framework",
      url: "https://react.dev/",
      citation: `Meta Platforms, Inc. (2023). React: The Library for Web and Native User Interfaces. Meta Open Source.`,
    },
    {
      id: "RECHARTS",
      name: "Recharts",
      version: "2.9.0",
      desc: "Composable charting library for all data visualizations in the dashboard",
      url: "https://recharts.org/",
      citation: `Recharts Group. (2023). Recharts: A Redefined Chart Library Built with React and D3.`,
    },
  ];

  const ideologyMapping = [
    { group: "Al-Qaeda, ISIS/ISIL, Boko Haram, Al-Shabaab, Hamas", ideology: "Religious Extremist (Islamic)", source: "ICSR, CFR, GTD codebook", color: "#dc2626" },
    { group: "IRA, ETA, LTTE, PKK, Hezbollah", ideology: "Ethno-Nationalist", source: "START Academic Database, TRAC", color: "#2563eb" },
    { group: "FARC, Shining Path, Red Brigades, Naxalites", ideology: "Left-Wing", source: "GTD codebook, START", color: "#d97706" },
    { group: "Neo-Nazi groups, White Supremacist orgs, Anti-government militias", ideology: "Right-Wing", source: "RAND, START Domestic Terror Project", color: "#7c3aed" },
    { group: "Unknown, unidentified perpetrators", ideology: "Unknown", source: "GTD gname field = 'Unknown'", color: "#64748b" },
    { group: "Anti-abortion extremists, Animal liberation, Eco-terrorism", ideology: "Single Issue", source: "GTD codebook category", color: "#059669" },
  ];

  const Section = ({ id, title, icon, badge, children }: any) => {
    const isOpen = expandedSection === id;
    return (
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", marginBottom: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        <div onClick={() => setExpandedSection(isOpen ? null : id)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "18px 16px" : "20px 28px", cursor: "pointer", userSelect: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", color: "#0f172a" }}>{icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: isMobile ? 14 : 16, color: "#0f172a", fontFamily: F }}>{title}</div>
              {badge && <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: `${badge.c}12`, color: badge.c, fontFamily: F }}>{badge.label}</span>}
            </div>
          </div>
          <ChevronDown size={18} color="#94a3b8" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s" }} />
        </div>
        {isOpen && <div style={{ borderTop: "1px solid #f1f5f9", padding: isMobile ? "20px 16px" : "28px" }}>{children}</div>}
      </div>
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: F }}>
      {/* Nav */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "0 16px" : "0 60px", height: isMobile ? 52 : 58, background: scrolled ? "rgba(255,255,255,0.96)" : "#fff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 200, boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.06)" : "none", transition: "all 0.3s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 18 }}>
          <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "1px solid #e2e8f0", borderRadius: 7, padding: isMobile ? "5px 10px" : "6px 13px", color: "#64748b", fontSize: isMobile ? 12 : 13, cursor: "pointer", fontWeight: 500, fontFamily: F }}>← Home</button>
          <Logo size={isMobile ? 24 : 28} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "6px 12px" }}>
          <BookOpen size={12} color="#2563eb" />
          <span style={{ fontSize: 12, fontWeight: 600, color: "#2563eb", fontFamily: F }}>Data Sources</span>
        </div>
      </nav>

      {/* Hero banner */}
      <div style={{ background: "linear-gradient(135deg,#0f172a 0%,#1e293b 60%,#0f172a 100%)", padding: isMobile ? "40px 18px" : "56px 60px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle,rgba(220,38,38,0.08),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.25)", borderRadius: 100, padding: "4px 14px", marginBottom: 16 }}>
            <Award size={11} color="#fca5a5" />
            <span style={{ color: "#fca5a5", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", fontFamily: F }}>Research Transparency</span>
          </div>
          <h1 style={{ fontSize: isMobile ? 28 : 44, fontWeight: 800, color: "#fff", letterSpacing: "-1.5px", marginBottom: 12, fontFamily: F }}>Data Sources & Citations</h1>
          <p style={{ fontSize: isMobile ? 13 : 16, color: "#64748b", maxWidth: 600, lineHeight: 1.7, marginBottom: 28, fontFamily: F }}>
            आतंकदृष्टि is built on peer-reviewed, publicly available data. All sources are documented below in full academic citation format. No data has been altered, fabricated, or improperly attributed.
          </p>
          <div style={{ display: "flex", gap: isMobile ? 12 : 20, flexWrap: "wrap" }}>
            {[
              { label: "Primary Dataset", val: "GTD · START/UMD", c: "#dc2626" },
              { label: "Academic Papers", val: "6 Sources", c: "#7c3aed" },
              { label: "Tech Libraries", val: "6 Cited", c: "#059669" },
              { label: "Coverage", val: "1970–2020", c: "#2563eb" },
            ].map((s, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 18px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: s.c, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 3, fontFamily: F }}>{s.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: F }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: isMobile ? "24px 14px" : "36px 60px" }}>

        {/* PRIMARY SOURCE */}
        <Section id="primary" title="Primary Dataset" icon={<Database size={18} />} badge={{ label: "Core Data Source", c: "#dc2626" }}>
          <div style={{ background: "linear-gradient(135deg,#fef2f2,#fff5f5)", border: "2px solid #fecaca", borderRadius: 14, padding: isMobile ? "20px" : "28px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ background: "#dc2626", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20, fontFamily: F }}>PRIMARY</span>
                  <span style={{ background: "#fef2f2", color: "#dc2626", fontSize: 10, fontWeight: 700, padding: "2px 10px", borderRadius: 20, border: "1px solid #fecaca", fontFamily: F }}>{primarySource.records}</span>
                </div>
                <h3 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px", marginBottom: 4, fontFamily: F }}>{primarySource.title}</h3>
                <div style={{ fontSize: 13, color: "#64748b", fontFamily: F }}>{primarySource.subtitle} · {primarySource.institution}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a href={primarySource.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#dc2626", color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none", fontFamily: F }}>
                  <ExternalLink size={12} />Visit GTD
                </a>
                <a href={primarySource.kaggle} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#fff", color: "#0f172a", borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none", border: "1px solid #e2e8f0", fontFamily: F }}>
                  <Link size={12} />KAGGLE Dataset
                </a>
              </div>
            </div>

            <p style={{ fontSize: isMobile ? 13 : 14, color: "#475569", lineHeight: 1.75, marginBottom: 20, fontFamily: F }}>{primarySource.description}</p>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
              {[
                { label: "Coverage Period", val: primarySource.coverage, icon: <Calendar size={12} /> },
                { label: "Total Records", val: primarySource.records, icon: <Database size={12} /> },
                { label: "Institution", val: "Univ. of Maryland", icon: <Award size={12} /> },
                { label: "Last Updated", val: primarySource.year, icon: <Clock size={12} /> },
              ].map((m, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 10, padding: "12px", border: "1px solid #fecaca" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#dc2626", marginBottom: 4 }}>{m.icon}<span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: F }}>{m.label}</span></div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", fontFamily: F }}>{m.val}</div>
                </div>
              ))}
            </div>

            <div style={{ background: "#fff", borderRadius: 10, padding: "16px", border: "1px solid #fecaca", marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#dc2626", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8, fontFamily: F }}>Key Data Fields Used</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {primarySource.fields.map((f, i) => (
                  <span key={i} style={{ background: "#fef2f2", color: "#dc2626", fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 6, fontFamily: F }}>{f}</span>
                ))}
              </div>
            </div>

            <div style={{ background: "#0f172a", borderRadius: 10, padding: "16px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8, fontFamily: F }}>📋 Full Citation (APA Format)</div>
              <p style={{ fontSize: isMobile ? 11 : 12, color: "#94a3b8", lineHeight: 1.7, fontFamily: "monospace", margin: 0 }}>{primarySource.citation}</p>
            </div>

            {primarySource.notes.length > 0 && (
              <div style={{ marginTop: 14 }}>
                {primarySource.notes.map((n, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0" }}>
                    <Info size={12} color="#d97706" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, fontFamily: F }}>{n}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>

        {/* ACADEMIC SOURCES */}
        <Section id="academic" title="Academic & Research Sources" icon={<BookOpen size={18} />} badge={{ label: "6 Sources", c: "#7c3aed" }}>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 1.65, fontFamily: F }}>
            These sources were used to validate ideology classifications, cross-reference group affiliations, and contextualize regional terrorism trends.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {academicSources.map((s, i) => (
              <div key={s.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: isMobile ? "16px" : "20px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                      <span style={{ background: "#f1f5f9", color: "#64748b", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 4, fontFamily: "monospace" }}>[{s.id}]</span>
                      <span style={{ background: "#f5f3ff", color: "#7c3aed", fontSize: 9, fontWeight: 700, padding: "2px 8px", borderRadius: 20, fontFamily: F }}>{s.type}</span>
                      <span style={{ color: "#94a3b8", fontSize: 10, fontFamily: F }}>{s.year}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: isMobile ? 13 : 14, color: "#0f172a", marginBottom: 3, fontFamily: F }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 8, fontFamily: F }}>{s.authors} · <em>{s.journal}</em></div>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 6, background: "#fffbeb", borderRadius: 6, padding: "6px 10px", border: "1px solid #fef08a" }}>
                      <CheckCircle size={11} color="#d97706" style={{ marginTop: 1, flexShrink: 0 }} />
                      <span style={{ fontSize: 11, color: "#92400e", fontFamily: F }}><strong>Used for:</strong> {s.usedFor}</span>
                    </div>
                  </div>
                  <a href={s.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 12px", background: "#fff", color: "#7c3aed", borderRadius: 8, fontSize: 11, fontWeight: 600, textDecoration: "none", border: "1px solid #e9d5ff", whiteSpace: "nowrap", flexShrink: 0, fontFamily: F }}>
                    <ExternalLink size={11} />View Source
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* IDEOLOGY MAPPING */}
        <Section id="mapping" title="Ideology Classification Mapping" icon={<Target size={18} />} badge={{ label: "Documented", c: "#059669" }}>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 1.65, fontFamily: F }}>
            Each ideology classification used in this dashboard is based on documented sources — not arbitrary decisions. The table below maps perpetrator groups to ideology categories with citations.
          </p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                  {["Example Groups", "Ideology Category", "Source"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "10px 14px", color: "#64748b", fontWeight: 700, fontSize: 11, fontFamily: F }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ideologyMapping.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px 14px", color: "#475569", fontSize: 11, lineHeight: 1.5, fontFamily: F, maxWidth: 280 }}>{r.group}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ background: `${r.color}10`, color: r.color, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, fontFamily: F }}>{r.ideology}</span>
                    </td>
                    <td style={{ padding: "12px 14px", color: "#64748b", fontSize: 11, fontFamily: "monospace" }}>{r.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, background: "#f0fdf4", borderRadius: 10, padding: "14px 16px", border: "1px solid #bbf7d0" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <CheckCircle size={14} color="#059669" style={{ marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: "#065f46", lineHeight: 1.65, fontFamily: F }}>
                <strong>Methodology note:</strong> Groups with ambiguous or contested ideological affiliation were conservatively assigned to "Unknown" rather than forcing a classification. Approximately 38% of GTD incidents fall in this category. No assumptions were made beyond documented evidence.
              </span>
            </div>
          </div>
        </Section>

        {/* TECH / SOFTWARE */}
        <Section id="tech" title="Software & Libraries" icon={<Code size={18} />} badge={{ label: "Open Source", c: "#2563eb" }}>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 1.65, fontFamily: F }}>
            All software used in the data pipeline and frontend dashboard is open-source. Full citations are provided below.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
            {methodologySources.map((s, i) => (
              <div key={s.id} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", fontFamily: F }}>{s.name}</div>
                    <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "monospace" }}>v{s.version}</div>
                  </div>
                  <a href={s.url} target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", background: "#eff6ff", color: "#2563eb", borderRadius: 6, fontSize: 11, fontWeight: 600, textDecoration: "none", fontFamily: F, flexShrink: 0 }}>
                    <ExternalLink size={10} />Docs
                  </a>
                </div>
                <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6, marginBottom: 10, fontFamily: F }}>{s.desc}</p>
                <div style={{ background: "#0f172a", borderRadius: 6, padding: "10px 12px" }}>
                  <div style={{ fontSize: 10, color: "#475569", marginBottom: 4, fontFamily: F }}>Citation:</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", lineHeight: 1.6, fontFamily: "monospace" }}>{s.citation}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* DATA ETHICS */}
        <Section id="ethics" title="Data Ethics & Disclaimer" icon={<Shield size={18} />} badge={{ label: "Research Use Only", c: "#d97706" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { icon: <Shield size={14} />, c: "#059669", title: "Research Integrity", body: "This dashboard is built strictly for academic and research purposes. No data has been modified, cherry-picked, or manipulated. All figures are derived directly from the GTD CSV files with only documented cleaning steps (removing nulls, standardizing column names)." },
              { icon: <AlertTriangle size={14} />, c: "#d97706", title: "Sensitivity Notice", body: "Terrorism data involves real victims and real violence. Numbers in this dashboard represent human lives. This project does not glorify, trivialize, or politically exploit any incident. The goal is understanding — not sensationalism." },
              { icon: <Globe size={14} />, c: "#2563eb", title: "Ideological Neutrality", body: "All six ideology categories — including Unknown — are treated with equal methodological rigor. No ideology is presented as inherently more dangerous. Geographic and historical context is recommended when interpreting any category." },
              { icon: <Hash size={14} />, c: "#7c3aed", title: "No Data Fabrication", body: "The ~38% 'Unknown' category is preserved as-is rather than redistributed or estimated. Fabricating ideology for undocumented incidents would introduce systematic bias. Users are encouraged to interpret this absence of information as meaningful." },
            ].map((e, i) => (
              <div key={i} style={{ display: "flex", gap: 14, padding: "16px", background: `${e.c}06`, border: `1px solid ${e.c}18`, borderRadius: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${e.c}12`, display: "flex", alignItems: "center", justifyContent: "center", color: e.c, flexShrink: 0 }}>{e.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#0f172a", marginBottom: 4, fontFamily: F }}>{e.title}</div>
                  <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.7, margin: 0, fontFamily: F }}>{e.body}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Footer cite */}
        <div style={{ background: "#0f172a", borderRadius: 16, padding: isMobile ? "24px 18px" : "32px 40px", marginTop: 8, textAlign: "center" }}>
          <div style={{ fontSize: 11, color: "#475569", fontFamily: F, marginBottom: 6 }}>Quick Citation for this Dashboard</div>
          
          <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <a href="https://www.start.umd.edu/gtd/" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#64748b", textDecoration: "none", fontFamily: F, display: "flex", alignItems: "center", gap: 5 }}><ExternalLink size={11} />GTD Official Site</a>
            <a href="https://www.kaggle.com/datasets/START-UMD/gtd" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#64748b", textDecoration: "none", fontFamily: F, display: "flex", alignItems: "center", gap: 5 }}><Link size={11} />Dataset Kaggle</a>
            <a href="https://github.com/PiyushLadukar/AatankDrishti" target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#64748b", textDecoration: "none", fontFamily: F, display: "flex", alignItems: "center", gap: 5 }}><Github size={11} />GitHub Repo</a>
          </div>
        </div>
      </div>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');`}</style>
    </div>
  );
}

// ─── HOMEPAGE ─────────────────────────────────────────────────────────────────
function Homepage({ onEnter, onCitations }: { onEnter: () => void; onCitations: () => void }) {
  const { isMobile, isTablet, isDesktop } = useBreakpoint();
  const [vis, setVis] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const hw = useReveal();
  const num = useReveal();
  const prev = useReveal();
  const cred = useReveal();

  useEffect(() => {
    setTimeout(() => setVis(true), 60);
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const pad = isMobile ? "60px 18px" : isTablet ? "80px 32px" : "96px 60px";
  const maxW = { maxWidth: 1200, margin: "0 auto" };

  const features = [
    { icon: <Globe size={isMobile ? 18 : 20} />, title: "180K+ Incidents", desc: "Full GTD spanning 1970–2020 across 205 countries", color: "#dc2626" },
    { icon: <Brain size={isMobile ? 18 : 20} />, title: "AI-Powered Analysis", desc: "KMeans clustering + NLP for pattern discovery", color: "#2563eb" },
    { icon: <BarChart2 size={isMobile ? 18 : 20} />, title: "Ideology Mapping", desc: "70+ groups mapped to 6 categories via academic sources", color: "#d97706" },
    { icon: <Map size={isMobile ? 18 : 20} />, title: "Regional Insights", desc: "Heatmaps showing ideology mix per world region", color: "#7c3aed" },
    { icon: <Activity size={isMobile ? 18 : 20} />, title: "50-Year Timeline", desc: "Area charts showing ideology shifts per decade", color: "#059669" },
    { icon: <Shield size={isMobile ? 18 : 20} />, title: "Research Grade", desc: "No assumptions — all mappings cite documented sources", color: "#0891b2" },
  ];

  const hwSteps = [
    { n: "01", icon: <Database size={20} />, c: "#2563eb", bg: "#eff6ff", title: "Data Ingestion", desc: "Raw GTD CSV cleaned. 135 columns → 20 essential.", tag: "cleaner.py" },
    { n: "02", icon: <Brain size={20} />, c: "#7c3aed", bg: "#f5f3ff", title: "Ideology Mapping", desc: "70+ groups mapped via START, RAND academic sources.", tag: "ideology_mapper.py" },
    { n: "03", icon: <BarChart2 size={20} />, c: "#dc2626", bg: "#fef2f2", title: "AI Discovery", desc: "KMeans finds 6 natural clusters. NLP on news.", tag: "clustering.py" },
    { n: "04", icon: <Eye size={20} />, c: "#059669", bg: "#f0fdf4", title: "Live Dashboard", desc: "Flask API + React frontend with 12+ charts.", tag: "app.py + App.tsx" },
  ];

  const numFacts = [
    { val: "181,691", label: "Total GTD Incidents", sub: "1970 to 2020", c: "#dc2626" },
    { val: "411,000+", label: "People Killed", sub: "documented", c: "#7c3aed" },
    { val: "522,000+", label: "People Wounded", sub: "documented", c: "#d97706" },
    { val: "205", label: "Countries Affected", sub: "globally", c: "#2563eb" },
    { val: "3,500+", label: "Terrorist Groups", sub: "named in GTD", c: "#059669" },
    { val: "~38%", label: "Unknown Perpetrators", sub: "no confirmed group", c: "#64748b" },
  ];

  const prevIdeo = [
    { ideology: "Unknown", incidents: 68000, fill: "#64748b" },
    { ideology: "Religious Ext.", incidents: 50000, fill: "#dc2626" },
    { ideology: "Ethno-Nat.", incidents: 36000, fill: "#2563eb" },
    { ideology: "Left-Wing", incidents: 14000, fill: "#d97706" },
    { ideology: "Right-Wing", incidents: 7000, fill: "#7c3aed" },
  ];
  const prevTl = [
    { y: 1970, v: 600 }, { y: 1975, v: 1400 }, { y: 1980, v: 2600 }, { y: 1985, v: 3200 },
    { y: 1990, v: 4200 }, { y: 1995, v: 3400 }, { y: 2000, v: 1800 }, { y: 2005, v: 5200 },
    { y: 2010, v: 8400 }, { y: 2015, v: 14200 }, { y: 2018, v: 9800 }, { y: 2020, v: 7200 },
  ];

  const tech: any[] = [];

  return (
    <div style={{ fontFamily: F, background: "#fff", overflowX: "hidden" }}>

      {/* ── Nav ── */}
      <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? "0 16px" : "0 60px", height: isMobile ? 56 : 68, background: scrolled ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.85)", backdropFilter: "blur(20px)", borderBottom: scrolled ? "1px solid #e2e8f0" : "1px solid transparent", position: "sticky", top: 0, zIndex: 200, boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.06)" : "none", transition: "all 0.3s" }}>
        <Logo size={isMobile ? 28 : 34} />
        {!isMobile && (
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
           
            <div onClick={onCitations} style={{ padding: "8px 14px", borderRadius: 8, color: "#475569", fontSize: 14, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 5, transition: "background 0.2s" }} onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = "#f1f5f9"} onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = "transparent"}>
              <BookOpen size={14} />Data Sources
            </div>
            <div style={{ width: 1, height: 18, background: "#e2e8f0", margin: "0 6px" }} />
            <button onClick={onEnter} style={{ padding: "8px 20px", background: "linear-gradient(135deg,#0f172a,#1e293b)", color: "white", border: "none", borderRadius: 9, fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, boxShadow: "0 4px 14px rgba(15,23,42,0.22)", transition: "transform 0.2s", fontFamily: F }} onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"} onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"}>
              Open Dashboard <ArrowRight size={14} />
            </button>
          </div>
        )}
        {isMobile && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button onClick={onEnter} style={{ padding: "7px 14px", background: "#0f172a", color: "white", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: F }}>Dashboard</button>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        )}
      </nav>
      {isMobile && menuOpen && (
        <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "12px 16px", display: "flex", flexDirection: "column", gap: 2, position: "sticky", top: 56, zIndex: 199 }}>
          {["About", "Research"].map(l => (
            <div key={l} style={{ padding: "10px 14px", borderRadius: 8, color: "#475569", fontSize: 14, cursor: "pointer", fontWeight: 500 }}>{l}</div>
          ))}
          <div onClick={onCitations} style={{ padding: "10px 14px", borderRadius: 8, color: "#475569", fontSize: 14, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 6 }}>
            <BookOpen size={14} />Data Sources
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <div style={{ padding: isMobile ? "70px 18px 60px" : isTablet ? "90px 32px 70px" : "110px 60px 96px", background: "linear-gradient(150deg,#fafafa 0%,#f0f4ff 55%,#fdf4f8 100%)", position: "relative", overflow: "hidden", opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(24px)", transition: "all 0.9s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ position: "absolute", top: -80, right: -80, width: isMobile ? 200 : 400, height: isMobile ? 200 : 400, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,0.06),transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: isMobile ? 180 : 320, height: isMobile ? 180 : 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(220,38,38,0.05),transparent 65%)", pointerEvents: "none" }} />

        <div style={{ ...maxW, display: "grid", gridTemplateColumns: isMobile || isTablet ? "1fr" : "1fr 1fr", gap: isDesktop ? 48 : 0, alignItems: "center" }}>
          {/* Left: text content */}
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#fef3f2", border: "1px solid #fecaca", borderRadius: 100, padding: "5px 14px", marginBottom: 20 }}>
              <div style={{ width: 6, height: 6, background: "#ec1e1e", borderRadius: "50%", animation: "pulse-d 2s infinite" }} />
              <span style={{ color: "#e01a1a", fontSize: isMobile ? 12 : 13, fontWeight: 600, fontFamily: F }}> GTD 1970–2020</span>
            </div>

            <h1 style={{ fontSize: isMobile ? "clamp(40px,11vw,56px)" : isTablet ? "clamp(52px,8vw,72px)" : "clamp(56px,6vw,88px)", fontWeight: 800, color: "#0f172a", lineHeight: 1.0, letterSpacing: isMobile ? "-2px" : "-4px", maxWidth: 820, marginBottom: 12, marginTop: 8, fontFamily: F }}>
              आतंकदृष्टि
            </h1>
            <h2 style={{ fontSize: isMobile ? 18 : isTablet ? 22 : 24, fontWeight: 400, color: "#64748b", letterSpacing: "-0.3px", marginBottom: 16, fontFamily: F }}>
              Global Terrorism Intelligence Dashboard
            </h2>
            <p style={{ fontSize: isMobile ? 15 : 17, color: "#475569", lineHeight: 1.75, maxWidth: 520, marginBottom: 36, fontFamily: F }}>
              Analyze <strong style={{ color: "#0f172a" }}>180,000+</strong> documented terrorism incidents across 50 years. Explore ideology patterns, regional data, and AI-discovered insights.
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
              <button onClick={onEnter} style={{ padding: isMobile ? "12px 24px" : "14px 32px", background: "linear-gradient(135deg,#0f172a,#334155)", color: "white", border: "none", borderRadius: 12, fontSize: isMobile ? 14 : 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 8px 28px rgba(15,23,42,0.28)", transition: "transform 0.2s", fontFamily: F }} onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"} onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"}>
                <Play size={isMobile ? 15 : 17} fill="white" />Launch Dashboard
              </button>
              <button onClick={onCitations} style={{ padding: isMobile ? "12px 20px" : "14px 28px", background: "#fff", color: "#0f172a", border: "1.5px solid #e2e8f0", borderRadius: 12, fontSize: isMobile ? 14 : 15, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, transition: "border-color 0.2s", fontFamily: F }} onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = "#94a3b8"} onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = "#e2e8f0"}>
                <BookOpen size={15} />Data Sources
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", maxWidth: 520 }}>
              {[{ v: "180K+", l: "Incidents" }, { v: "205", l: "Countries" }, { v: "50+", l: "Years" }, { v: "6", l: "Ideologies" }].map((s, i) => (
                <div key={i} style={{ padding: isMobile ? "16px 10px" : "20px", textAlign: "center", borderRight: i < 3 ? "1px solid #e2e8f0" : "none" }}>
                  <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px", fontFamily: F }}>{s.v}</div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 3, fontWeight: 500, fontFamily: F }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: animated visual — desktop only */}
          {isDesktop && (
            <div style={{ position: "relative", height: 520, width: "100%" }}>
              <HeroVisual />
            </div>
          )}
        </div>
        <style>{`@keyframes pulse-d{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
      </div>

      <Ticker />

      {/* ── Features ── */}
      <section style={{ padding: pad, background: "#fff" }}>
        <div style={maxW}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 52 }}>
            <div style={{ display: "inline-block", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 99, padding: "4px 14px", marginBottom: 12 }}>
              <span style={{ color: "#dc2626", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", fontFamily: F }}>Platform Capabilities</span>
            </div>
            <h2 style={{ fontSize: isMobile ? 24 : isTablet ? 32 : 40, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px", fontFamily: F }}>Everything you need to analyze terrorism data</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : isTablet ? "1fr 1fr" : "repeat(3,1fr)", gap: isMobile ? 12 : 20 }}>
            {features.map((f, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: isMobile ? "20px" : "28px", transition: "transform 0.2s,box-shadow 0.2s,border-color 0.2s" }} onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "translateY(-4px)"; el.style.boxShadow = `0 12px 40px ${f.color}12`; el.style.borderColor = `${f.color}30`; }} onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; el.style.borderColor = "#e2e8f0"; }}>
                <div style={{ width: isMobile ? 40 : 48, height: isMobile ? 40 : 48, background: `${f.color}0d`, border: `1px solid ${f.color}1e`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, color: f.color }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: isMobile ? 14 : 16, color: "#0f172a", marginBottom: 6, fontFamily: F }}>{f.title}</div>
                <div style={{ fontSize: isMobile ? 13 : 14, color: "#64748b", lineHeight: 1.65, fontFamily: F }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section style={{ padding: pad, background: "#fff", borderTop: "1px solid #f1f5f9" }}>
        <div ref={hw.ref} style={maxW}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 36 : 56, opacity: hw.v ? 1 : 0, transform: hw.v ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s ease" }}>
            <div style={{ display: "inline-block", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 99, padding: "4px 14px", marginBottom: 12 }}>
              <span style={{ color: "#dc2626", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", fontFamily: F }}>How It Works</span>
            </div>
            <h2 style={{ fontSize: isMobile ? 22 : isTablet ? 30 : 38, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px", fontFamily: F }}>From Raw CSV to Intelligence Dashboard</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : isTablet ? "1fr 1fr" : "repeat(4,1fr)", gap: isMobile ? 16 : 24 }}>
            {hwSteps.map((s, i) => (
              <div key={i} style={{ textAlign: "center", opacity: hw.v ? 1 : 0, transform: hw.v ? "translateY(0)" : "translateY(28px)", transition: `all 0.7s ease ${i * 0.1}s` }}>
                <div style={{ width: isMobile ? 64 : 76, height: isMobile ? 64 : 76, borderRadius: "50%", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: s.c, position: "relative", boxShadow: `0 8px 20px ${s.c}12` }}>
                  {s.icon}
                  <div style={{ position: "absolute", top: -7, right: -7, width: 22, height: 22, borderRadius: "50%", background: s.c, color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F }}>{s.n}</div>
                </div>
                <h3 style={{ fontSize: isMobile ? 13 : 15, fontWeight: 700, color: "#0f172a", marginBottom: 8, fontFamily: F }}>{s.title}</h3>
                {!isMobile && <p style={{ fontSize: 12, color: "#64748b", lineHeight: 1.65, marginBottom: 10, fontFamily: F }}>{s.desc}</p>}
                <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: s.bg, color: s.c, fontFamily: "monospace" }}>{s.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Numbers ── */}
      <section style={{ background: "#0f172a", padding: pad }}>
        <div ref={num.ref} style={maxW}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 52, opacity: num.v ? 1 : 0, transform: num.v ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s ease" }}>
            <div style={{ display: "inline-block", background: "rgba(220,38,38,0.15)", border: "1px solid rgba(220,38,38,0.3)", borderRadius: 99, padding: "4px 14px", marginBottom: 12 }}>
              <span style={{ color: "#fca5a5", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", fontFamily: F }}>The Scale</span>
            </div>
            <h2 style={{ fontSize: isMobile ? 22 : isTablet ? 30 : 38, fontWeight: 800, color: "#fff", letterSpacing: "-1px", fontFamily: F }}>Terrorism by the Numbers</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3,1fr)", gap: isMobile ? 12 : 18 }}>
            {numFacts.map((f, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${f.c}20`, borderTop: `3px solid ${f.c}`, borderRadius: 14, padding: isMobile ? "20px 16px" : "28px 24px", opacity: num.v ? 1 : 0, transform: num.v ? "translateY(0)" : "translateY(24px)", transition: `all 0.7s ease ${i * 0.08}s` }}>
                <div style={{ fontSize: isMobile ? 28 : 40, fontWeight: 800, color: f.c, letterSpacing: "-1.5px", marginBottom: 6, fontFamily: F }}>{f.val}</div>
                <div style={{ fontSize: isMobile ? 13 : 15, fontWeight: 600, color: "#fff", marginBottom: 3, fontFamily: F }}>{f.label}</div>
                <div style={{ fontSize: 12, color: "#475569", fontFamily: F }}>{f.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Preview Charts ── */}
      <section style={{ background: "#f8fafc", padding: pad }}>
        <div ref={prev.ref} style={maxW}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 28 : 44, opacity: prev.v ? 1 : 0, transform: prev.v ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s ease" }}>
            <div style={{ display: "inline-block", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 99, padding: "4px 14px", marginBottom: 12 }}>
              <span style={{ color: "#2563eb", fontSize: 11, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", fontFamily: F }}>Live Preview</span>
            </div>
            <h2 style={{ fontSize: isMobile ? 22 : isTablet ? 30 : 38, fontWeight: 800, color: "#0f172a", letterSpacing: "-1px", fontFamily: F }}>See the Data in Action</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 14 : 22 }}>
            <div style={{ background: "#fff", borderRadius: 18, padding: isMobile ? "20px" : "26px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", opacity: prev.v ? 1 : 0, transform: prev.v ? "translateY(0)" : "translateY(24px)", transition: "all 0.8s ease 0.1s" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 2, fontFamily: F }}>Incidents by Ideology</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 16, fontFamily: F }}>Preview — real data in dashboard</div>
              <ResponsiveContainer width="100%" height={isMobile ? 170 : 200}>
                <BarChart data={prevIdeo} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="ideology" tick={{ fontSize: isMobile ? 9 : 11, fill: "#475569" }} width={isMobile ? 90 : 110} axisLine={false} tickLine={false} />
                  <Tooltip content={<CT />} />
                  <Bar dataKey="incidents" radius={[0, 5, 5, 0]}>{prevIdeo.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background: "#fff", borderRadius: 18, padding: isMobile ? "20px" : "26px", border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", opacity: prev.v ? 1 : 0, transform: prev.v ? "translateY(0)" : "translateY(24px)", transition: "all 0.8s ease 0.2s" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 2, fontFamily: F }}>Incidents Over Time</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 16, fontFamily: F }}>50-year trend · 2011–15 spike = ISIL</div>
              <ResponsiveContainer width="100%" height={isMobile ? 170 : 200}>
                <AreaChart data={prevTl}>
                  <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} /><stop offset="95%" stopColor="#dc2626" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="y" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CT />} />
                  <Area type="monotone" dataKey="v" name="Incidents" stroke="#dc2626" fill="url(#pg)" strokeWidth={2} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 28, opacity: prev.v ? 1 : 0, transition: "all 0.8s ease 0.4s" }}>
            <button onClick={onEnter} style={{ padding: isMobile ? "12px 24px" : "14px 32px", background: "linear-gradient(135deg,#0f172a,#1e293b)", color: "white", border: "none", borderRadius: 12, fontSize: isMobile ? 14 : 15, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 9, boxShadow: "0 8px 28px rgba(15,23,42,0.22)", transition: "transform 0.2s", fontFamily: F }} onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"} onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"}>
              <Play size={15} fill="white" />Open Live Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: isMobile ? "0 18px 60px" : pad }}>
        <div style={maxW}>
          <div style={{ background: "linear-gradient(135deg,#0f172a,#1e293b)", borderRadius: 20, padding: isMobile ? "36px 24px" : isTablet ? "48px 40px" : "56px 64px", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: isMobile ? 24 : 32, boxShadow: "0 20px 60px rgba(15,23,42,0.2)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -80, right: 120, width: 240, height: 240, borderRadius: "50%", background: "rgba(220,38,38,0.06)", pointerEvents: "none" }} />
            <div>
              <h2 style={{ fontSize: isMobile ? 22 : 30, fontWeight: 800, color: "#fff", letterSpacing: "-0.8px", marginBottom: 8, fontFamily: F }}>Ready to explore the data?</h2>
              <p style={{ fontSize: isMobile ? 13 : 15, color: "#475569", maxWidth: 420, lineHeight: 1.65, fontFamily: F }}>180,000+ incidents. 50 years. All ideologies. No assumptions.</p>
            </div>
            <div style={{ display: "flex", gap: 10, flexDirection: isMobile ? "column" : "row", width: isMobile ? "100%" : "auto" }}>
              <button onClick={onCitations} style={{ padding: isMobile ? "11px 20px" : "14px 28px", background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, fontSize: isMobile ? 13 : 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: F }}>
                <BookOpen size={14} />Data Sources
              </button>
              <button onClick={onEnter} style={{ padding: isMobile ? "12px 24px" : "14px 32px", background: "#fff", color: "#0f172a", border: "none", borderRadius: 12, fontSize: isMobile ? 14 : 15, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", boxShadow: "0 4px 16px rgba(0,0,0,0.18)", transition: "transform 0.2s", fontFamily: F }} onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)"} onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"}>
                Launch Dashboard <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Credit ── */}
      <section style={{ background: "#fff", padding: pad, borderTop: "1px solid #e2e8f0" }}>
        <div ref={cred.ref} style={{ maxWidth: 840, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: isMobile ? 32 : 48, opacity: cred.v ? 1 : 0, transform: cred.v ? "translateY(0)" : "translateY(20px)", transition: "all 0.7s ease" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#94a3b8", letterSpacing: "3px", textTransform: "uppercase", marginBottom: 8, fontFamily: F }}>Designed & Built By</div>
            <h2 style={{ fontSize: isMobile ? 26 : 32, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.8px", fontFamily: F }}>The Creator</h2>
          </div>
          <div style={{ opacity: cred.v ? 1 : 0, transform: cred.v ? "translateY(0)" : "translateY(28px)", transition: "all 0.8s ease 0.1s" }}>
            <div style={{ background: "linear-gradient(135deg,#dc2626,#7c3aed,#2563eb,#059669)", padding: 2, borderRadius: 24 }}>
              <div style={{ background: "linear-gradient(135deg,#0f172a,#1a2744 60%,#0f172a)", borderRadius: 22, padding: isMobile ? "28px 20px" : "40px 44px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -60, right: -40, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle,rgba(220,38,38,0.1),transparent 70%)", pointerEvents: "none" }} />
                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 24 : 36, alignItems: isMobile ? "center" : "flex-start", position: "relative" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", inset: -3, borderRadius: "50%", background: "linear-gradient(135deg,#dc2626,#7c3aed,#2563eb)", animation: "spin-r 5s linear infinite" }} />
                      <img src="https://github.com/PiyushLadukar.png" alt="Piyush" style={{ width: isMobile ? 80 : 96, height: isMobile ? 80 : 96, borderRadius: "50%", border: "4px solid #0f172a", position: "relative", display: "block", objectFit: "cover" }} onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                      <a href="https://github.com/PiyushLadukar" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", textDecoration: "none", fontSize: 12, fontWeight: 600, fontFamily: F }}>
                        <Github size={13} />GitHub
                      </a>
                      <a href="https://www.linkedin.com/in/piyush-ladukar/" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: "rgba(10,102,194,0.15)", border: "1px solid rgba(10,102,194,0.3)", color: "#60a5fa", textDecoration: "none", fontSize: 12, fontWeight: 600, fontFamily: F }}>
                        <Linkedin size={13} />LinkedIn
                      </a>
                    </div>
                  </div>
                  <div style={{ flex: 1, textAlign: isMobile ? "center" : "left" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap", justifyContent: isMobile ? "center" : "flex-start" }}>
                      <h3 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px", margin: 0, fontFamily: F }}>Piyush Ladukar</h3>
                    </div>
                    <p style={{ color: "#64748b", fontSize: 12, marginBottom: 0, fontFamily: F }}>github.com/PiyushLadukar</p>
                    <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "14px 0" }} />
                    <p style={{ fontSize: isMobile ? 13 : 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.75, marginBottom: 18, fontFamily: F }}>
                      Built <strong style={{ color: "#fff" }}>आतंकदृष्टि</strong> — a full-stack data science project analyzing global terrorism via the GTD dataset. Python pipelines, Flask API, AI clustering, NLP, and React TypeScript dashboard.
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: isMobile ? "center" : "flex-start" }}>
                      {tech.map((t, i) => (
                        <span key={i} style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: t.bg, color: t.c, border: `1px solid ${t.c}25`, fontFamily: F }}>{t.l}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 28, opacity: cred.v ? 1 : 0, transition: "all 0.8s ease 0.4s" }}>
            <p style={{ color: "#94a3b8", fontSize: 13, fontStyle: "italic", fontFamily: F }}>
              "Understanding Terrorism Through Data, Not Assumptions" · {new Date().getFullYear()}
            </p>
          </div>
        </div>
        <style>{`@keyframes spin-r{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </section>

      {/* Footer */}
      <footer style={{ background: "#0f172a", padding: isMobile ? "28px 18px" : "36px 60px", display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", gap: 16, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
        <Logo size={isMobile ? 26 : 30} />
        <span style={{ fontSize: 11, color: "#334155", fontFamily: F }}>GTD, START Center, University of Maryland · Research use only · {new Date().getFullYear()}</span>
        <div style={{ display: "flex", gap: 16 }}>
          <a href="https://www.start.umd.edu/gtd/" target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#475569", textDecoration: "none", fontFamily: F }}>GTD Source</a>
          <span onClick={onCitations} style={{ fontSize: 11, color: "#475569", cursor: "pointer", fontFamily: F }}>Data Sources</span>
          <a href="https://github.com/PiyushLadukar/AatankDrishti" target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#475569", textDecoration: "none", fontFamily: F }}>GitHub</a>
        </div>
      </footer>

      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');`}</style>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ onBack }: { onBack: () => void }) {
  const { isMobile, isTablet } = useBreakpoint();
  const sum = useApi<Summary>("summary");
  const ideo = useApi<IdeologyData[]>("ideology");
  const tl = useApi<TimelineData[]>("timeline");
  const reg = useApi<RegionData[]>("region");
  const groups = useApi<GroupData[]>("top-groups");
  const relig = useApi<ReligionData[]>("religion-subtype");

  const [sel, setSel] = useState("All");
  const [yr, setYr] = useState<[number, number]>([1970, 2020]);
  const [tab, setTab] = useState<"overview" | "ideology" | "groups" | "insights">("overview");
  const [search, setSearch] = useState("");

  const tlByYear = tl.data
    ? Object.values(tl.data.reduce((acc: any, r) => {
        if (!acc[r.year]) acc[r.year] = { year: r.year };
        acc[r.year][r.ideology] = r.incidents; return acc;
      }, {})).sort((a: any, b: any) => a.year - b.year).filter((d: any) => d.year >= yr[0] && d.year <= yr[1])
    : [];

  const regTotals = reg.data
    ? Object.values(reg.data.reduce((acc: any, r) => {
        if (!acc[r.region]) acc[r.region] = { region: r.region, total: 0 };
        acc[r.region].total += r.incidents; return acc;
      }, {})).sort((a: any, b: any) => (b as any).total - (a as any).total).slice(0, isMobile ? 6 : 10)
    : [];

  const s = sum.data;
  const filteredGroups = (groups.data || []).filter((g: GroupData) => {
    return (sel === "All" || g.ideology === sel) && (!search || g.group_name.toLowerCase().includes(search.toLowerCase()));
  }).slice(0, 20);

  const pad = isMobile ? "16px 14px" : "24px 28px";

  const SC = ({ icon, label, value, sub, color }: any) => (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 14, padding: isMobile ? "16px" : "22px", flex: 1, minWidth: isMobile ? "calc(50% - 8px)" : 140, position: "relative", overflow: "hidden", transition: "box-shadow 0.2s,transform 0.2s" }} onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = `0 6px 24px ${color}12`; el.style.transform = "translateY(-2px)"; }} onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.boxShadow = "none"; el.style.transform = "translateY(0)"; }}>
      <div style={{ position: "absolute", top: 0, right: 0, width: 60, height: 60, background: `${color}07`, borderRadius: "0 0 0 60px" }} />
      <div style={{ width: isMobile ? 30 : 34, height: isMobile ? 30 : 34, borderRadius: 9, background: `${color}10`, color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>{icon}</div>
      <div style={{ color: "#64748b", fontSize: 9, textTransform: "uppercase", letterSpacing: "0.8px", fontWeight: 600, fontFamily: F }}>{label}</div>
      <div style={{ color: "#0f172a", fontSize: isMobile ? 20 : 24, fontWeight: 800, marginTop: 3, letterSpacing: "-0.8px", fontFamily: F }}>
        {typeof value === "number" ? <Num v={value} /> : value}
      </div>
      {sub && <div style={{ color: "#94a3b8", fontSize: 10, marginTop: 1, fontFamily: F }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: F }}>
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: isMobile ? "0 14px" : "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: isMobile ? 52 : 58, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 18, minWidth: 0 }}>
          <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "1px solid #e2e8f0", borderRadius: 7, padding: isMobile ? "5px 10px" : "6px 13px", color: "#64748b", fontSize: isMobile ? 12 : 13, cursor: "pointer", fontWeight: 500, fontFamily: F, flexShrink: 0 }}>← Home</button>
          <Logo size={isMobile ? 24 : 28} />
          {!isMobile && (<><span style={{ color: "#e2e8f0", fontSize: 18 }}>|</span><span style={{ color: "#64748b", fontSize: 13, fontWeight: 500 }}>Analysis Dashboard</span></>)}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {!isMobile && (<div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 7, padding: "5px 10px", fontSize: 12, color: "#64748b", display: "flex", alignItems: "center", gap: 5, fontFamily: F }}><Clock size={12} />GTD 1970–2020</div>)}
        </div>
      </div>

      <div style={{ padding: pad }}>
        {s && (
          <div style={{ display: "flex", gap: isMobile ? 8 : 12, flexWrap: "wrap", marginBottom: isMobile ? 16 : 22 }}>
            <SC icon={<Activity size={14} />} label="Total Incidents" value={s.total_incidents} sub={s.years_covered} color="#dc2626" />
            <SC icon={<Users size={14} />} label="Total Killed" value={s.total_killed} color="#7c3aed" />
            <SC icon={<Zap size={14} />} label="Total Wounded" value={s.total_wounded} color="#d97706" />
            <SC icon={<Globe size={14} />} label="Countries" value={s.countries} color="#2563eb" />
            {!isMobile && <SC icon={<Shield size={14} />} label="Active Groups" value={s.groups} sub="documented" color="#059669" />}
            {!isMobile && <SC icon={<Target size={14} />} label="Ideology Types" value={s.ideology_categories} color="#0891b2" />}
          </div>
        )}

        <div style={{ display: "flex", gap: isMobile ? 3 : 4, marginBottom: isMobile ? 12 : 16, background: "#fff", borderRadius: 10, padding: 3, border: "1px solid #e2e8f0", width: "100%", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflowX: "auto" }}>
          {([
            { id: "overview", label: "Overview", icon: <BarChart2 size={13} /> },
            { id: "ideology", label: "Ideology", icon: <Target size={13} /> },
            { id: "groups", label: "Groups", icon: <Users size={13} /> },
            { id: "insights", label: "Insights", icon: <Brain size={13} /> },
          ] as const).map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: isMobile ? "8px 4px" : "8px 16px", background: tab === t.id ? "#0f172a" : "transparent", color: tab === t.id ? "white" : "#64748b", border: "none", borderRadius: 8, fontSize: isMobile ? 11 : 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, transition: "all 0.18s", fontFamily: F, whiteSpace: "nowrap" }}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: isMobile ? "12px" : "14px 18px", marginBottom: isMobile ? 14 : 20, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <Filter size={12} color="#94a3b8" />
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, fontFamily: F }}>Ideology Filter:</span>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
            {["All", "Religious Extremist", "Ethno-Nationalist", "Left-Wing", "Right-Wing", "Unknown"].map(ide => (
              <button key={ide} onClick={() => setSel(ide)} style={{ padding: isMobile ? "4px 10px" : "5px 13px", background: sel === ide ? (IC[ide] || "#0f172a") : "#f8fafc", color: sel === ide ? "white" : "#475569", border: `1px solid ${sel === ide ? (IC[ide] || "#0f172a") : "#e2e8f0"}`, borderRadius: 20, fontSize: isMobile ? 10 : 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", fontFamily: F }}>{ide}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 2 }}>
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, fontFamily: F, whiteSpace: "nowrap" }}>Year Range</span>
            <RangeSlider min={1970} max={2020} value={yr} onChange={setYr} />
          </div>
        </div>

        {tab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 14 : 20 }}>
            <div style={{ background: "#fff", borderRadius: 14, padding: isMobile ? "18px" : "24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: "#0f172a", marginBottom: 3, fontFamily: F }}>Incidents Over Time — By Ideology</div>
              <div style={{ fontSize: isMobile ? 11 : 13, color: "#64748b", marginBottom: 16, fontFamily: F }}>50 years of global terrorism patterns</div>
              {tl.loading ? <Loader /> : (
                <ResponsiveContainer width="100%" height={isMobile ? 220 : 290}>
                  <AreaChart data={tlByYear}>
                    <defs>{Object.entries(IC).map(([ide, col]) => <linearGradient key={ide} id={`g${ide.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={col} stopOpacity={0.15} /><stop offset="95%" stopColor={col} stopOpacity={0} /></linearGradient>)}</defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="year" stroke="#94a3b8" tick={{ fontSize: isMobile ? 9 : 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis stroke="#94a3b8" tick={{ fontSize: isMobile ? 9 : 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={isMobile ? 32 : 40} />
                    <Tooltip content={<CT />} />
                    <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12, fontFamily: F }} />
                    {Object.entries(IC).filter(([ide]) => sel === "All" || ide === sel).map(([ide, col]) => (
                      <Area key={ide} type="monotone" dataKey={ide} stroke={col} fill={`url(#g${ide.replace(/\s+/g, "")})`} strokeWidth={isMobile ? 1.5 : 2} dot={false} />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 14 : 20 }}>
              <div style={{ background: "#fff", borderRadius: 14, padding: isMobile ? "18px" : "24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: "#0f172a", marginBottom: 3, fontFamily: F }}>Incidents by Region</div>
                <div style={{ fontSize: isMobile ? 11 : 13, color: "#64748b", marginBottom: 16, fontFamily: F }}>Top affected regions</div>
                {reg.loading ? <Loader /> : (
                  <ResponsiveContainer width="100%" height={isMobile ? 200 : 260}>
                    <BarChart data={regTotals} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="region" stroke="#94a3b8" tick={{ fontSize: isMobile ? 8 : 10, fill: "#475569" }} width={isMobile ? 110 : 140} axisLine={false} tickLine={false} />
                      <Tooltip content={<CT />} />
                      <Bar dataKey="total" radius={[0, 5, 5, 0]}>{(regTotals as any[]).map((_: any, i: number) => <Cell key={i} fill={`hsl(${220 - i * 16},68%,${53 - i * 2}%)`} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div style={{ background: "#fff", borderRadius: 14, padding: isMobile ? "18px" : "24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: "#0f172a", marginBottom: 3, fontFamily: F }}>Religious Extremism — By Faith</div>
                <div style={{ fontSize: isMobile ? 11 : 13, color: "#64748b", marginBottom: 16, fontFamily: F }}>Spans multiple religions</div>
                {relig.loading ? <Loader /> : (relig.data && relig.data.length > 0) ? (() => {
                  const total = relig.data.reduce((s: number, d: ReligionData) => s + d.incidents, 0);
                  return (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                      <PieChart width={isMobile ? 160 : 200} height={isMobile ? 160 : 200}>
                        <Pie data={relig.data} dataKey="incidents" nameKey="religion_subtype" cx="50%" cy="50%" outerRadius={isMobile ? 74 : 92} innerRadius={isMobile ? 36 : 48} label={false} labelLine={false}>
                          {relig.data.map((e: ReligionData) => <Cell key={e.religion_subtype} fill={RC[e.religion_subtype] || "#94a3b8"} />)}
                        </Pie>
                        <Tooltip content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0];
                          const val = Number(d.value ?? 0);
                          const pct = total > 0 ? ((val / total) * 100).toFixed(1) : "0";
                          return (
                            <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 9, padding: "8px 12px", boxShadow: "0 6px 20px rgba(0,0,0,0.1)", fontFamily: F }}>
                              <div style={{ fontWeight: 700, color: "#0f172a", fontSize: 12, marginBottom: 2 }}>{d.name}</div>
                              <div style={{ fontSize: 11, color: "#64748b" }}>{val.toLocaleString()} incidents</div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: d.payload?.fill || "#0f172a", marginTop: 2 }}>{pct}%</div>
                            </div>
                          );
                        }} />
                      </PieChart>
                      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: isMobile ? "6px 14px" : "8px 20px" }}>
                        {relig.data.map((e: ReligionData) => {
                          const pct = total > 0 ? ((e.incidents / total) * 100).toFixed(1) : "0";
                          const color = RC[e.religion_subtype] || "#94a3b8";
                          return (
                            <div key={e.religion_subtype} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                              <span style={{ fontSize: 12, color: "#475569", fontFamily: F, fontWeight: 500 }}>{e.religion_subtype}</span>
                              <span style={{ fontSize: 12, fontWeight: 700, color: color, fontFamily: F }}>{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })() : (
                  <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
                    <Info size={28} color="#cbd5e1" />
                    <p style={{ color: "#94a3b8", fontSize: 12, textAlign: "center", fontFamily: F }}>No religion subtype data.<br />Run notebook 02 with real GTD.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "ideology" && (
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 14 : 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 14 : 20 }}>
              {(["incidents", "killed"] as const).map(key => (
                <div key={key} style={{ background: "#fff", borderRadius: 14, padding: isMobile ? "18px" : "24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: "#0f172a", marginBottom: 3, fontFamily: F }}>{key === "incidents" ? "Incidents by Ideology" : "Killed by Ideology"}</div>
                  <div style={{ fontSize: isMobile ? 11 : 13, color: "#64748b", marginBottom: 16, fontFamily: F }}>{key === "incidents" ? "Distribution across categories" : "Total fatalities per category"}</div>
                  {ideo.loading ? <Loader /> : (
                    <ResponsiveContainer width="100%" height={isMobile ? 200 : 280}>
                      <BarChart data={ideo.data || []} layout="vertical" margin={{ left: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="ideology" stroke="#94a3b8" tick={{ fontSize: isMobile ? 9 : 11, fill: "#475569" }} width={isMobile ? 110 : 130} axisLine={false} tickLine={false} />
                        <Tooltip content={<CT />} />
                        <Bar dataKey={key} radius={[0, 5, 5, 0]}>{(ideo.data || []).map((e: IdeologyData) => <Cell key={e.ideology} fill={IC[e.ideology] || "#94a3b8"} />)}</Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : isTablet ? "1fr 1fr 1fr" : "repeat(3,1fr)", gap: isMobile ? 10 : 14 }}>
              {(ideo.data || []).map((item: IdeologyData) => (
                <div key={item.ideology} style={{ background: "#fff", border: `1px solid ${IC[item.ideology] || "#e2e8f0"}22`, borderLeft: `3px solid ${IC[item.ideology] || "#e2e8f0"}`, borderRadius: 12, padding: isMobile ? "14px" : "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ fontWeight: 700, fontSize: isMobile ? 11 : 13, color: "#0f172a", marginBottom: 10, fontFamily: F }}>{item.ideology}</div>
                  <div style={{ display: "flex", gap: 14 }}>
                    <div><div style={{ fontSize: isMobile ? 17 : 20, fontWeight: 800, color: IC[item.ideology] || "#0f172a", fontFamily: F }}><Num v={item.incidents} /></div><div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 500, fontFamily: F }}>incidents</div></div>
                    <div><div style={{ fontSize: isMobile ? 17 : 20, fontWeight: 800, color: "#0f172a", fontFamily: F }}><Num v={item.killed} /></div><div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 500, fontFamily: F }}>killed</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "groups" && (
          <div style={{ background: "#fff", borderRadius: 14, padding: isMobile ? "18px" : "24px", border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", justifyContent: "space-between", marginBottom: 18, flexDirection: isMobile ? "column" : "row", gap: 10 }}>
              <div>
                <div style={{ fontSize: isMobile ? 14 : 16, fontWeight: 700, color: "#0f172a", fontFamily: F }}>Top 20 Most Active Groups</div>
                <div style={{ fontSize: isMobile ? 11 : 13, color: "#64748b", fontFamily: F }}>Ranked by documented incidents</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "7px 12px", width: isMobile ? "100%" : "auto" }}>
                <Search size={12} color="#94a3b8" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search group..." style={{ border: "none", background: "transparent", outline: "none", fontSize: 12, color: "#0f172a", width: isMobile ? "100%" : 150, fontFamily: F }} />
              </div>
            </div>
            {groups.loading ? <Loader /> : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: isMobile ? 11 : 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                      {(isMobile ? ["#", "Group", "Ideology", "Inc."] : ["#", "Group Name", "Ideology", "Incidents", "Killed", "Lethality"]).map(h => (
                        <th key={h} style={{ textAlign: "left", padding: isMobile ? "8px 8px" : "10px 12px", color: "#64748b", fontWeight: 600, fontSize: isMobile ? 9 : 11, textTransform: "uppercase", letterSpacing: "0.5px", fontFamily: F }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGroups.map((g: GroupData, i: number) => {
                      const leth = g.incidents > 0 ? (g.killed / g.incidents).toFixed(2) : "0";
                      return (
                        <tr key={g.group_name} style={{ borderBottom: "1px solid #f8fafc", transition: "background 0.12s" }} onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#f8fafc"} onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}>
                          <td style={{ padding: isMobile ? "9px 8px" : "11px 12px", color: "#94a3b8", fontWeight: 600, fontFamily: F }}>{i + 1}</td>
                          <td style={{ padding: isMobile ? "9px 8px" : "11px 12px", color: "#0f172a", fontWeight: 600, maxWidth: isMobile ? 100 : 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: F }}>{g.group_name}</td>
                          <td style={{ padding: isMobile ? "9px 8px" : "11px 12px" }}>
                            <span style={{ background: `${IC[g.ideology] || "#64748b"}12`, color: IC[g.ideology] || "#64748b", padding: isMobile ? "2px 6px" : "2px 9px", borderRadius: 20, fontSize: isMobile ? 9 : 11, fontWeight: 700, fontFamily: F }}>{isMobile ? g.ideology.split(" ")[0] : g.ideology}</span>
                          </td>
                          <td style={{ padding: isMobile ? "9px 8px" : "11px 12px", color: "#0f172a", fontWeight: 700, fontFamily: F }}>{g.incidents.toLocaleString()}</td>
                          {!isMobile && <td style={{ padding: "11px 12px", color: "#dc2626", fontWeight: 700, fontFamily: F }}>{g.killed.toLocaleString()}</td>}
                          {!isMobile && (
                            <td style={{ padding: "11px 12px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                                <div style={{ height: 5, background: "#f1f5f9", borderRadius: 3, width: 70, overflow: "hidden" }}>
                                  <div style={{ height: "100%", background: IC[g.ideology] || "#64748b", width: `${Math.min(Number(leth) * 10, 100)}%`, borderRadius: 3 }} />
                                </div>
                                <span style={{ fontSize: 11, color: "#64748b", fontFamily: F }}>{leth}</span>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                    {filteredGroups.length === 0 && (
                      <tr><td colSpan={isMobile ? 4 : 6} style={{ padding: "32px 12px", textAlign: "center", color: "#94a3b8", fontSize: 13, fontFamily: F }}>No groups match your filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "insights" && (
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? 12 : 18 }}>
            {[
              { c: "#dc2626", icon: <AlertTriangle size={16} />, title: "On Religious Extremism", stat: "28%", sl: "of identified incidents", body: "Religious extremist incidents span Islamic, Christian, Jewish, Sikh, and cult-based groups. GTD data shows concentration in Iraq, Afghanistan, Nigeria — where geopolitical instability is the primary driver." },
              { c: "#64748b", icon: <Search size={16} />, title: "The Unknown Problem", stat: "~38%", sl: "unidentified perpetrator", body: "A significant share of GTD incidents have no confirmed perpetrator. Assigning ideology to these is methodologically unsound and produces misleading conclusions." },
              { c: "#2563eb", icon: <Globe size={16} />, title: "Ethno-Nationalist Terrorism", stat: "20%", sl: "of total incidents", body: "IRA, LTTE, ETA, and PKK caused the most cumulative casualties over multi-decade campaigns. Chronically underreported in Western media." },
              { c: "#7c3aed", icon: <TrendingUp size={16} />, title: "Rising Right-Wing Trend", stat: "+4×", sl: "growth since 2010", body: "Right-wing terrorism increased significantly in Western countries post-2010. Documented in GTD data but receives less media coverage than other categories." },
              { c: "#d97706", icon: <Activity size={16} />, title: "Left-Wing Historical Peak", stat: "1970s", sl: "peak decade", body: "In 1970s–80s, Left-Wing groups (FARC, Red Brigades, Weather Underground) dominated global terrorism — often absent from modern narratives." },
              { c: "#059669", icon: <Map size={16} />, title: "Geography Predicts More", stat: "12", sl: "regions analyzed", body: "A region's political history — state collapse, colonial legacy, ethnic conflicts — predicts terrorism type more reliably than ideology alone." },
            ].map((ins, i) => (
              <div key={i} style={{ background: "#fff", borderRadius: 14, padding: isMobile ? "18px" : "24px", border: "1px solid #e2e8f0", borderLeft: `4px solid ${ins.c}`, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", transition: "transform 0.2s,box-shadow 0.2s" }} onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = `0 8px 28px ${ins.c}12`; }} onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.transform = "translateY(0)"; el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, color: ins.c, fontWeight: 700, fontSize: isMobile ? 13 : 14, fontFamily: F }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: `${ins.c}10`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ins.icon}</div>
                    {ins.title}
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                    <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: ins.c, letterSpacing: "-0.5px", fontFamily: F }}>{ins.stat}</div>
                    <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 500, fontFamily: F }}>{ins.sl}</div>
                  </div>
                </div>
                <p style={{ fontSize: isMobile ? 12 : 13, color: "#475569", lineHeight: 1.7, margin: 0, fontFamily: F }}>{ins.body}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 28, paddingTop: 16, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: isMobile ? 10 : 12, color: "#94a3b8", flexWrap: "wrap", gap: 6, fontFamily: F }}>
          <span>Data: GTD · START Center, University of Maryland</span>
          {!isMobile && <span>All ideology classifications based on documented academic sources · Research use only</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<"home" | "dashboard" | "citations">("home");
  useEffect(() => { window.scrollTo(0, 0); }, [page]);

  if (page === "dashboard") return <Dashboard onBack={() => setPage("home")} />;
  if (page === "citations") return <CitationsPage onBack={() => setPage("home")} />;
  return <Homepage onEnter={() => setPage("dashboard")} onCitations={() => setPage("citations")} />;
}