// frontend/src/App.tsx
// Main dashboard application

import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// ============================================================
// Types
// ============================================================
interface Summary {
  total_incidents: number;
  years_covered: string;
  total_killed: number;
  total_wounded: number;
  countries: number;
  groups: number;
  ideology_categories: number;
}

interface IdeologyData {
  ideology: string;
  incidents: number;
  killed: number;
}

interface TimelineData {
  year: number;
  ideology: string;
  incidents: number;
}

interface RegionData {
  region: string;
  ideology: string;
  incidents: number;
}

interface GroupData {
  group_name: string;
  ideology: string;
  incidents: number;
  killed: number;
}

interface ReligionData {
  religion_subtype: string;
  incidents: number;
}

// ============================================================
// Constants
// ============================================================
const API = "http://localhost:5000/api";

const IDEOLOGY_COLORS: Record<string, string> = {
  "Religious Extremist": "#e74c3c",
  "Ethno-Nationalist":   "#3498db",
  "Left-Wing":           "#e67e22",
  "Right-Wing":          "#9b59b6",
  "Unknown":             "#95a5a6",
  "Single Issue":        "#2ecc71",
};

const RELIGION_COLORS: Record<string, string> = {
  "Islamic":       "#27ae60",
  "Christian":     "#2980b9",
  "Jewish":        "#f39c12",
  "Sikh":          "#8e44ad",
  "Cult":          "#7f8c8d",
  "Unknown":       "#bdc3c7",
};

// ============================================================
// Helper hooks
// ============================================================
function useApi<T>(endpoint: string): { data: T | null; loading: boolean; error: string | null } {
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

// ============================================================
// Sub-components
// ============================================================
function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{
      background: "#1a1f2e", border: "1px solid #2d3548", borderRadius: 12,
      padding: "20px 24px", flex: 1, minWidth: 150,
    }}>
      <div style={{ color: "#64748b", fontSize: 12, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
      <div style={{ color: "#f1f5f9", fontSize: 28, fontWeight: 700, marginTop: 6 }}>{value}</div>
      {sub && <div style={{ color: "#475569", fontSize: 12, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      color: "#f1f5f9", fontSize: 18, fontWeight: 600, marginBottom: 16,
      paddingBottom: 8, borderBottom: "1px solid #2d3548",
    }}>{children}</h2>
  );
}

function InsightBox({ color, title, children }: { color: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#1a1f2e", border: `1px solid ${color}33`,
      borderLeft: `4px solid ${color}`, borderRadius: 8, padding: "14px 18px",
    }}>
      <div style={{ color, fontWeight: 600, marginBottom: 6, fontSize: 14 }}>{title}</div>
      <div style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}

// ============================================================
// Main App
// ============================================================
export default function App() {
  const summary    = useApi<Summary>("summary");
  const ideology   = useApi<IdeologyData[]>("ideology");
  const timeline   = useApi<TimelineData[]>("timeline");
  const region     = useApi<RegionData[]>("region");
  const topGroups  = useApi<GroupData[]>("top-groups");
  const religion   = useApi<ReligionData[]>("religion-subtype");

  // Process timeline: pivot by year
  const timelineByYear = timeline.data
    ? Object.values(
        timeline.data.reduce((acc: Record<number, Record<string, unknown>>, row) => {
          if (!acc[row.year]) acc[row.year] = { year: row.year };
          (acc[row.year] as Record<string, unknown>)[row.ideology] = row.incidents;
          return acc;
        }, {})
      ).sort((a: any, b: any) => a.year - b.year)
    : [];

  // Region totals for bar chart
  const regionTotals = region.data
    ? Object.values(
        region.data.reduce((acc: Record<string, Record<string, unknown>>, row) => {
          if (!acc[row.region]) acc[row.region] = { region: row.region, total: 0 };
          (acc[row.region] as any).total += row.incidents;
          return acc;
        }, {})
      ).sort((a: any, b: any) => b.total - a.total).slice(0, 10)
    : [];

  const s = summary.data;

  return (
    <div style={{
      background: "#0f1117", minHeight: "100vh", padding: "0 0 60px 0",
      fontFamily: "'Inter', -apple-system, sans-serif", color: "#f1f5f9",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #1a1f2e 0%, #0f1117 100%)",
        borderBottom: "1px solid #2d3548", padding: "24px 40px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 40, height: 40, background: "#e74c3c22", borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
          }}>🌍</div>
          <div>
            <h1 style={{ color: "#f1f5f9", fontSize: 22, fontWeight: 700, margin: 0 }}>
              Global Terrorism Analysis
            </h1>
            <p style={{ color: "#64748b", fontSize: 13, margin: "2px 0 0 0" }}>
              Data-driven insights · Based on Global Terrorism Database (GTD)
            </p>
          </div>
        </div>

        {/* Warning banner */}
        <div style={{
          marginTop: 16, background: "#f59e0b11", border: "1px solid #f59e0b33",
          borderRadius: 8, padding: "10px 16px", fontSize: 13, color: "#fbbf24",
        }}>
          ⚠️ <strong>Research Note:</strong> Terrorism spans ALL ideological categories. This dashboard presents
          documented, data-driven facts only — no predetermined conclusions. "Unknown" represents
          a significant portion of incidents where group identity was not confirmed.
        </div>
      </div>

      <div style={{ padding: "32px 40px" }}>

        {/* Stat Cards */}
        {s && (
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
            <StatCard label="Total Incidents" value={s.total_incidents.toLocaleString()} sub={s.years_covered} />
            <StatCard label="Total Killed" value={s.total_killed.toLocaleString()} />
            <StatCard label="Total Wounded" value={s.total_wounded.toLocaleString()} />
            <StatCard label="Countries" value={s.countries} />
            <StatCard label="Groups" value={s.groups} sub="documented" />
            <StatCard label="Ideology Categories" value={s.ideology_categories} />
          </div>
        )}

        {/* Row 1: Ideology breakdown + Religion subtype */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>

          {/* Ideology Bar Chart */}
          <div style={{ background: "#1a1f2e", borderRadius: 12, padding: 24, border: "1px solid #2d3548" }}>
            <SectionTitle>Incidents by Ideology Category</SectionTitle>
            {ideology.loading ? <div style={{ color: "#64748b" }}>Loading...</div> :
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={ideology.data || []} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3548" />
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="ideology" stroke="#64748b" tick={{ fontSize: 11 }} width={130} />
                  <Tooltip
                    contentStyle={{ background: "#1e2537", border: "1px solid #3d4860", borderRadius: 8 }}
                    labelStyle={{ color: "#f1f5f9" }}
                  />
                  <Bar dataKey="incidents" radius={[0, 4, 4, 0]}>
                    {(ideology.data || []).map((entry) => (
                      <Cell key={entry.ideology} fill={IDEOLOGY_COLORS[entry.ideology] || "#64748b"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            }
          </div>

          {/* Religion subtype pie */}
          <div style={{ background: "#1a1f2e", borderRadius: 12, padding: 24, border: "1px solid #2d3548" }}>
            <SectionTitle>Religious Extremism — By Religion</SectionTitle>
            <p style={{ color: "#64748b", fontSize: 12, marginBottom: 12 }}>
              Religious extremist incidents span multiple faiths — not one religion alone.
            </p>
            {religion.loading ? <div style={{ color: "#64748b" }}>Loading...</div> :
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={religion.data || []}
                    dataKey="incidents"
                    nameKey="religion_subtype"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {(religion.data || []).map((entry) => (
                      <Cell key={entry.religion_subtype}
                        fill={RELIGION_COLORS[entry.religion_subtype] || "#64748b"} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1e2537", border: "1px solid #3d4860", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            }
          </div>
        </div>

        {/* Row 2: Timeline */}
        <div style={{ background: "#1a1f2e", borderRadius: 12, padding: 24, border: "1px solid #2d3548", marginBottom: 32 }}>
          <SectionTitle>Incidents Over Time — By Ideology</SectionTitle>
          {timeline.loading ? <div style={{ color: "#64748b" }}>Loading...</div> :
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineByYear}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3548" />
                <XAxis dataKey="year" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "#1e2537", border: "1px solid #3d4860", borderRadius: 8 }} />
                <Legend />
                {Object.entries(IDEOLOGY_COLORS).map(([ideology, color]) => (
                  <Line key={ideology} type="monotone" dataKey={ideology}
                    stroke={color} dot={false} strokeWidth={2} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          }
        </div>

        {/* Row 3: Region + Top groups */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>

          {/* Region bar chart */}
          <div style={{ background: "#1a1f2e", borderRadius: 12, padding: 24, border: "1px solid #2d3548" }}>
            <SectionTitle>Top 10 Regions by Incidents</SectionTitle>
            {region.loading ? <div style={{ color: "#64748b" }}>Loading...</div> :
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={regionTotals} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3548" />
                  <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="region" stroke="#64748b" tick={{ fontSize: 10 }} width={160} />
                  <Tooltip contentStyle={{ background: "#1e2537", border: "1px solid #3d4860", borderRadius: 8 }} />
                  <Bar dataKey="total" fill="#3498db" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            }
          </div>

          {/* Top groups table */}
          <div style={{ background: "#1a1f2e", borderRadius: 12, padding: 24, border: "1px solid #2d3548" }}>
            <SectionTitle>Top 15 Most Active Groups</SectionTitle>
            <div style={{ overflowY: "auto", maxHeight: 300 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ color: "#64748b", borderBottom: "1px solid #2d3548" }}>
                    <th style={{ textAlign: "left", padding: "6px 8px" }}>#</th>
                    <th style={{ textAlign: "left", padding: "6px 8px" }}>Group</th>
                    <th style={{ textAlign: "left", padding: "6px 8px" }}>Ideology</th>
                    <th style={{ textAlign: "right", padding: "6px 8px" }}>Incidents</th>
                  </tr>
                </thead>
                <tbody>
                  {(topGroups.data || []).slice(0, 15).map((g, i) => (
                    <tr key={g.group_name} style={{ borderBottom: "1px solid #1e2537" }}>
                      <td style={{ padding: "5px 8px", color: "#475569" }}>{i + 1}</td>
                      <td style={{ padding: "5px 8px", color: "#cbd5e1", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {g.group_name}
                      </td>
                      <td style={{ padding: "5px 8px" }}>
                        <span style={{
                          background: `${IDEOLOGY_COLORS[g.ideology] || "#64748b"}22`,
                          color: IDEOLOGY_COLORS[g.ideology] || "#64748b",
                          padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                        }}>
                          {g.ideology}
                        </span>
                      </td>
                      <td style={{ padding: "5px 8px", textAlign: "right", color: "#f1f5f9" }}>
                        {g.incidents.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Insights Section */}
        <div style={{ marginBottom: 32 }}>
          <SectionTitle>📊 Key Research Insights</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <InsightBox color="#e74c3c" title="On Religious Extremism">
              Religious extremist incidents span multiple faiths including Islamic, Christian, Jewish,
              Sikh, and cult-based groups. The GTD data shows religious extremism concentrated 
              in specific conflict zones (Iraq, Afghanistan, Nigeria) where geopolitical instability 
              is often the primary driver — not religion alone.
            </InsightBox>
            <InsightBox color="#95a5a6" title="On the 'Unknown' Category">
              A significant percentage of GTD incidents have no confirmed perpetrator group.
              Assigning ideology to these would be methodologically unsound.
              Any analysis that ignores this produces misleading conclusions.
            </InsightBox>
            <InsightBox color="#3498db" title="On Ethno-Nationalist Terrorism">
              Historically, ethno-nationalist groups (IRA, LTTE, ETA, PKK) have caused the most 
              cumulative casualties over multi-decade campaigns. This category is often underreported 
              in media relative to religious terrorism.
            </InsightBox>
            <InsightBox color="#9b59b6" title="On Right-Wing Terrorism">
              Right-wing and white supremacist terrorism has increased significantly in Western countries
              post-2010. This trend is reflected in GTD data but often receives less media attention 
              than attacks attributed to other ideologies.
            </InsightBox>
          </div>
        </div>

        {/* Footer */}
        <div style={{ color: "#334155", fontSize: 12, borderTop: "1px solid #2d3548", paddingTop: 16 }}>
          Data source: Global Terrorism Database (GTD), START Center, University of Maryland.
          All ideology classifications based on documented academic sources.
          This tool is for research and education purposes only.
        </div>
      </div>
    </div>
  );
}