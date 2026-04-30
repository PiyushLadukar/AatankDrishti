import { useState, useEffect, useRef, useCallback } from "react";
import {
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadialBarChart, RadialBar, LineChart, Line
} from "recharts";
import {
  Globe, Shield, TrendingUp, Users, AlertTriangle, Map,
  BarChart2, Activity, Search, Filter, ChevronRight,
  Eye, Target, Zap, ArrowRight, Clock, Database, Brain,Github,Linkedin,
   Code, Play, BookOpen, Layers,
  TrendingDown, Award, Info
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Summary { total_incidents:number; years_covered:string; total_killed:number; total_wounded:number; countries:number; groups:number; ideology_categories:number }
interface IdeologyData { ideology:string; incidents:number; killed:number }
interface TimelineData { year:number; ideology:string; incidents:number }
interface RegionData { region:string; ideology:string; incidents:number }
interface GroupData { group_name:string; ideology:string; incidents:number; killed:number }
interface ReligionData { religion_subtype:string; incidents:number }

// ─── Constants ────────────────────────────────────────────────────────────────
const API = "https://aatankdrishti.onrender.com/api";
const IC: Record<string,string> = {
  "Religious Extremist":"#dc2626","Ethno-Nationalist":"#2563eb",
  "Left-Wing":"#d97706","Right-Wing":"#7c3aed","Unknown":"#64748b","Single Issue":"#059669",
};
const RC: Record<string,string> = {
  "Islamic":"#15803d","Christian":"#1d4ed8","Jewish":"#b45309",
  "Sikh":"#7e22ce","Cult":"#475569","Unknown":"#94a3b8",
};
const FONT = "'Sora','Outfit',system-ui,sans-serif";

// ─── Hook ─────────────────────────────────────────────────────────────────────
function useApi<T>(ep:string) {
  const [data,setData]=useState<T|null>(null);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    fetch(`${API}/${ep}`).then(r=>r.json()).then(d=>{setData(d);setLoading(false)}).catch(()=>setLoading(false));
  },[ep]);
  return {data,loading};
}

// ─── Animated Counter ─────────────────────────────────────────────────────────
function Num({v,d=1800}:{v:number;d?:number}) {
  const [n,setN]=useState(0);
  const r=useRef<number|null>(null);
  useEffect(()=>{
    r.current=null;
    const a=(ts:number)=>{
      if(!r.current) r.current=ts;
      const p=Math.min((ts-r.current)/d,1);
      setN(Math.floor((1-Math.pow(1-p,3))*v));
      if(p<1) requestAnimationFrame(a);
    };
    requestAnimationFrame(a);
  },[v,d]);
  return <>{n.toLocaleString()}</>;
}

// ─── Scroll Reveal ────────────────────────────────────────────────────────────
function useReveal(threshold=0.12) {
  const ref=useRef<HTMLDivElement>(null);
  const [v,setV]=useState(false);
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting)setV(true)},{threshold});
    if(ref.current) obs.observe(ref.current);
    return()=>obs.disconnect();
  },[threshold]);
  return {ref,v};
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CT=({active,payload,label}:any)=>{
  if(!active||!payload?.length) return null;
  return(
    <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,padding:"10px 16px",boxShadow:"0 8px 32px rgba(0,0,0,0.1)",fontFamily:FONT}}>
      <p style={{fontWeight:700,color:"#0f172a",fontSize:13,marginBottom:4}}>{label}</p>
      {payload.map((p:any,i:number)=>(
        <p key={i} style={{color:p.color||p.fill,fontSize:12,margin:"2px 0"}}>
          {p.name}: <strong>{p.value?.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

// ─── Loader ───────────────────────────────────────────────────────────────────
function Loader() {
  return(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:200,flexDirection:"column",gap:12}}>
      <div style={{width:36,height:36,border:"3px solid #f1f5f9",borderTop:"3px solid #0f172a",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>
      <span style={{color:"#94a3b8",fontSize:13,fontFamily:FONT}}>Fetching from API...</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── Animated Gradient Badge ──────────────────────────────────────────────────
function LiveBadge({text,color="#dc2626"}:{text:string;color?:string}) {
  return(
    <div style={{display:"inline-flex",alignItems:"center",gap:8,background:`${color}10`,border:`1px solid ${color}30`,borderRadius:100,padding:"6px 16px"}}>
      <div style={{width:7,height:7,borderRadius:"50%",background:color,animation:"pulse-b 1.8s ease infinite"}}/>
      <span style={{color,fontSize:13,fontWeight:600,fontFamily:FONT}}>{text}</span>
      <style>{`@keyframes pulse-b{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(0.7)}}`}</style>
    </div>
  );
}

// ─── TICKER ───────────────────────────────────────────────────────────────────
function Ticker() {
  const items=["180,000+ Incidents Documented","205 Countries Analyzed","50 Years · 1970–2020","3,500+ Terrorist Groups","6 Ideology Categories","411K+ Deaths Recorded","GTD — START Center, UMD","AI Clustering + NLP","Religious · Nationalist · Left-Wing · Right-Wing","Research-Grade Intelligence Platform"];
  return(
    <div style={{background:"#0f172a",overflow:"hidden",padding:"13px 0",borderTop:"1px solid rgba(255,255,255,0.04)",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
      <div style={{display:"flex",animation:"tick 32s linear infinite",whiteSpace:"nowrap"}}>
        {[...items,...items].map((it,i)=>(
          <span key={i} style={{fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.4)",padding:"0 32px",display:"inline-flex",alignItems:"center",gap:12,fontFamily:FONT}}>
            <span style={{width:4,height:4,background:"#dc2626",borderRadius:"50%",display:"inline-block",flexShrink:0}}/>
            {it}
          </span>
        ))}
      </div>
      <style>{`@keyframes tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

// ─── LOGO ─────────────────────────────────────────────────────────────────────
function Logo({size=36,showText=true}:{size?:number;showText?:boolean}) {
  return(
    <div style={{display:"flex",alignItems:"center",gap:10}}>
      <div style={{
        width:size,height:size,borderRadius:Math.round(size*0.28),
        background:"linear-gradient(135deg,#dc2626 0%,#7c3aed 100%)",
        display:"flex",alignItems:"center",justifyContent:"center",
        boxShadow:"0 4px 14px rgba(220,38,38,0.35)",
        flexShrink:0, position:"relative", overflow:"hidden",
      }}>
        {/* Inner radar rings */}
        <div style={{position:"absolute",width:"200%",height:"200%",borderRadius:"50%",border:"1px solid rgba(255,255,255,0.15)",top:"-50%",left:"-50%"}}/>
        <div style={{position:"absolute",width:"140%",height:"140%",borderRadius:"50%",border:"1px solid rgba(255,255,255,0.1)",top:"-20%",left:"-20%"}}/>
        <svg width={size*0.5} height={size*0.5} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="3"/>
          <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
        </svg>
      </div>
      {showText && (
        <div>
          <div style={{fontWeight:800,fontSize:Math.round(size*0.44),color:"#0f172a",letterSpacing:"-0.4px",lineHeight:1,fontFamily:FONT}}>आतंकदृष्टि</div>
          <div style={{fontSize:9,color:"#94a3b8",letterSpacing:"1.5px",textTransform:"uppercase",fontWeight:600,marginTop:1,fontFamily:FONT}}>AatankDrishti</div>
        </div>
      )}
    </div>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const {ref,v}=useReveal();
  const steps=[
    {n:"01",icon:<Database size={22}/>,c:"#2563eb",bg:"#eff6ff",title:"Data Ingestion",desc:"Raw GTD CSV loaded and cleaned. 135 columns reduced to 20 essential. Missing values replaced, dates standardized.",tag:"cleaner.py"},
    {n:"02",icon:<Brain size={22}/>,c:"#7c3aed",bg:"#f5f3ff",title:"Ideology Mapping",desc:"70+ terror groups mapped to ideology categories via START, RAND, TRAC academic sources. Zero arbitrary assumptions.",tag:"ideology_mapper.py"},
    {n:"03",icon:<BarChart2 size={22}/>,c:"#dc2626",bg:"#fef2f2",title:"AI Pattern Discovery",desc:"KMeans clustering finds 6 natural incident clusters. NLP detects ideology signals in news. Feature engineering for ML.",tag:"clustering.py"},
    {n:"04",icon:<Eye size={22}/>,c:"#059669",bg:"#f0fdf4",title:"Live Dashboard",desc:"Flask REST API serves 7 endpoints. React frontend renders 12+ interactive charts, live filters, 4 analysis tabs.",tag:"app.py + App.tsx"},
  ];
  return(
    <section style={{padding:"96px 60px",background:"#fff"}}>
      <div ref={ref} style={{maxWidth:1200,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:64,opacity:v?1:0,transform:v?"translateY(0)":"translateY(24px)",transition:"all 0.7s ease"}}>
          <div style={{display:"inline-block",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:99,padding:"5px 16px",marginBottom:14}}>
            <span style={{color:"#dc2626",fontSize:11,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",fontFamily:FONT}}>How It Works</span>
          </div>
          <h2 style={{fontSize:"clamp(28px,4vw,42px)",fontWeight:800,color:"#0f172a",letterSpacing:"-1.5px",fontFamily:FONT}}>From Raw CSV to Intelligence Dashboard</h2>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:24}}>
          {steps.map((s,i)=>(
            <div key={i} style={{textAlign:"center",opacity:v?1:0,transform:v?"translateY(0)":"translateY(32px)",transition:`all 0.7s ease ${i*0.1}s`}}>
              <div style={{width:80,height:80,borderRadius:"50%",background:s.bg,border:`2px solid ${s.c}18`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",color:s.c,position:"relative",boxShadow:`0 8px 24px ${s.c}12`}}>
                {s.icon}
                <div style={{position:"absolute",top:-8,right:-8,width:24,height:24,borderRadius:"50%",background:s.c,color:"#fff",fontSize:9,fontWeight:800,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:FONT}}>{s.n}</div>
              </div>
              <h3 style={{fontSize:16,fontWeight:700,color:"#0f172a",marginBottom:10,fontFamily:FONT}}>{s.title}</h3>
              <p style={{fontSize:13,color:"#64748b",lineHeight:1.7,marginBottom:14,fontFamily:FONT}}>{s.desc}</p>
              <span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,background:s.bg,color:s.c,fontFamily:"monospace"}}>{s.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── NUMBERS SECTION ──────────────────────────────────────────────────────────
function Numbers() {
  const {ref,v}=useReveal();
  const facts=[
    {val:"181,691",label:"Total GTD Incidents",sub:"1970 to 2020",c:"#dc2626"},
    {val:"411,000+",label:"People Killed",sub:"documented fatalities",c:"#7c3aed"},
    {val:"522,000+",label:"People Wounded",sub:"documented injuries",c:"#d97706"},
    {val:"205",label:"Countries Affected",sub:"globally",c:"#2563eb"},
    {val:"3,500+",label:"Terrorist Groups",sub:"named in GTD",c:"#059669"},
    {val:"~38%",label:"Unknown Perpetrators",sub:"no confirmed group",c:"#64748b"},
  ];
  return(
    <section style={{background:"#0f172a",padding:"96px 60px"}}>
      <div ref={ref} style={{maxWidth:1200,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:64,opacity:v?1:0,transform:v?"translateY(0)":"translateY(24px)",transition:"all 0.7s ease"}}>
          <div style={{display:"inline-block",background:"rgba(220,38,38,0.15)",border:"1px solid rgba(220,38,38,0.3)",borderRadius:99,padding:"5px 16px",marginBottom:14}}>
            <span style={{color:"#fca5a5",fontSize:11,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",fontFamily:FONT}}>The Scale</span>
          </div>
          <h2 style={{fontSize:"clamp(28px,4vw,42px)",fontWeight:800,color:"#fff",letterSpacing:"-1.5px",fontFamily:FONT}}>Terrorism by the Numbers</h2>
          <p style={{color:"#475569",fontSize:15,marginTop:10,fontFamily:FONT}}>Every number represents real incidents, real people, real consequences.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
          {facts.map((f,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.03)",border:`1px solid ${f.c}20`,borderTop:`3px solid ${f.c}`,borderRadius:16,padding:"32px 28px",opacity:v?1:0,transform:v?"translateY(0)":"translateY(28px)",transition:`all 0.7s ease ${i*0.08}s`,backdropFilter:"blur(8px)"}}>
              <div style={{fontSize:44,fontWeight:800,color:f.c,letterSpacing:"-2px",marginBottom:8,fontFamily:FONT}}>{f.val}</div>
              <div style={{fontSize:16,fontWeight:600,color:"#fff",marginBottom:4,fontFamily:FONT}}>{f.label}</div>
              <div style={{fontSize:13,color:"#475569",fontFamily:FONT}}>{f.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PREVIEW CHARTS ───────────────────────────────────────────────────────────
function PreviewCharts({onEnter}:{onEnter:()=>void}) {
  const {ref,v}=useReveal();
  const ideologyData=[
    {ideology:"Unknown",incidents:68000,fill:"#64748b"},
    {ideology:"Religious Ext.",incidents:50000,fill:"#dc2626"},
    {ideology:"Ethno-Nationalist",incidents:36000,fill:"#2563eb"},
    {ideology:"Left-Wing",incidents:14000,fill:"#d97706"},
    {ideology:"Right-Wing",incidents:7000,fill:"#7c3aed"},
  ];
  const timelineData=[
    {y:1970,v:600},{y:1975,v:1400},{y:1980,v:2600},{y:1985,v:3200},
    {y:1990,v:4200},{y:1995,v:3400},{y:2000,v:1800},{y:2005,v:5200},
    {y:2010,v:8400},{y:2015,v:14200},{y:2018,v:9800},{y:2020,v:7200},
  ];
  return(
    <section style={{background:"#f8fafc",padding:"96px 60px"}}>
      <div ref={ref} style={{maxWidth:1200,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:56,opacity:v?1:0,transform:v?"translateY(0)":"translateY(24px)",transition:"all 0.7s ease"}}>
          <div style={{display:"inline-block",background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:99,padding:"5px 16px",marginBottom:14}}>
            <span style={{color:"#2563eb",fontSize:11,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",fontFamily:FONT}}>Live Preview</span>
          </div>
          <h2 style={{fontSize:"clamp(28px,4vw,42px)",fontWeight:800,color:"#0f172a",letterSpacing:"-1.5px",fontFamily:FONT}}>See the Data in Action</h2>
          <p style={{color:"#64748b",fontSize:15,marginTop:10,fontFamily:FONT}}>Previews below. The real dashboard uses your actual GTD data with live filters.</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
          <div style={{background:"#fff",borderRadius:20,padding:28,border:"1px solid #e2e8f0",boxShadow:"0 4px 24px rgba(0,0,0,0.05)",opacity:v?1:0,transform:v?"translateY(0)":"translateY(28px)",transition:"all 0.8s ease 0.1s"}}>
            <div style={{fontSize:16,fontWeight:700,color:"#0f172a",marginBottom:3,fontFamily:FONT}}>Incidents by Ideology</div>
            <div style={{fontSize:12,color:"#94a3b8",marginBottom:20,fontFamily:FONT}}>Preview — real data loads in dashboard</div>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={ideologyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/>
                <XAxis type="number" tick={{fontSize:10,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                <YAxis type="category" dataKey="ideology" tick={{fontSize:11,fill:"#475569"}} width={120} axisLine={false} tickLine={false}/>
                <Tooltip content={<CT/>}/>
                <Bar dataKey="incidents" radius={[0,6,6,0]}>{ideologyData.map((e,i)=><Cell key={i} fill={e.fill}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{background:"#fff",borderRadius:20,padding:28,border:"1px solid #e2e8f0",boxShadow:"0 4px 24px rgba(0,0,0,0.05)",opacity:v?1:0,transform:v?"translateY(0)":"translateY(28px)",transition:"all 0.8s ease 0.2s"}}>
            <div style={{fontSize:16,fontWeight:700,color:"#0f172a",marginBottom:3,fontFamily:FONT}}>Incidents Over Time</div>
            <div style={{fontSize:12,color:"#94a3b8",marginBottom:20,fontFamily:FONT}}>50-year trend · 2011–15 spike = ISIL expansion</div>
            <ResponsiveContainer width="100%" height={210}>
              <AreaChart data={timelineData}>
                <defs><linearGradient id="pg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#dc2626" stopOpacity={0.2}/><stop offset="95%" stopColor="#dc2626" stopOpacity={0}/></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                <XAxis dataKey="y" tick={{fontSize:10,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:10,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                <Tooltip content={<CT/>}/>
                <Area type="monotone" dataKey="v" name="Incidents" stroke="#dc2626" fill="url(#pg)" strokeWidth={2.5} dot={false}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:36,opacity:v?1:0,transition:"all 0.8s ease 0.4s"}}>
          <button onClick={onEnter} style={{padding:"14px 36px",background:"linear-gradient(135deg,#0f172a,#1e293b)",color:"white",border:"none",borderRadius:12,fontSize:15,fontWeight:700,cursor:"pointer",display:"inline-flex",alignItems:"center",gap:10,boxShadow:"0 8px 32px rgba(15,23,42,0.25)",transition:"transform 0.2s",fontFamily:FONT}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.transform="translateY(-2px)"} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.transform="translateY(0)"}>
            <Play size={16} fill="white"/>Open Live Dashboard with Real Data
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── BUILDER CREDIT ───────────────────────────────────────────────────────────
function Credit() {
  const {ref,v}=useReveal();
  const tech=[

  ];
  return(
    <section style={{background:"#fff",padding:"96px 60px",borderTop:"1px solid #e2e8f0"}}>
      <div ref={ref} style={{maxWidth:860,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:52,opacity:v?1:0,transform:v?"translateY(0)":"translateY(24px)",transition:"all 0.7s ease"}}>
          <div style={{fontSize:11,fontWeight:700,color:"#94a3b8",letterSpacing:"3px",textTransform:"uppercase",marginBottom:10,fontFamily:FONT}}>Designed & Built By</div>
          <h2 style={{fontSize:34,fontWeight:800,color:"#0f172a",letterSpacing:"-1px",fontFamily:FONT}}>The Creator</h2>
        </div>
        <div style={{opacity:v?1:0,transform:v?"translateY(0)":"translateY(32px)",transition:"all 0.8s ease 0.1s"}}>
          {/* Gradient-border card */}
          <div style={{background:"linear-gradient(135deg,#dc2626,#7c3aed,#2563eb,#059669)",padding:2,borderRadius:28}}>
            <div style={{background:"linear-gradient(135deg,#0f172a 0%,#1a2744 60%,#0f172a 100%)",borderRadius:26,padding:"44px 48px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-80,right:-60,width:280,height:280,borderRadius:"50%",background:"radial-gradient(circle,rgba(220,38,38,0.1),transparent 70%)",pointerEvents:"none"}}/>
              <div style={{position:"absolute",bottom:-60,left:-50,width:220,height:220,borderRadius:"50%",background:"radial-gradient(circle,rgba(37,99,235,0.08),transparent 70%)",pointerEvents:"none"}}/>
              <div style={{display:"flex",gap:40,alignItems:"flex-start",position:"relative",flexWrap:"wrap"}}>
                {/* Avatar col */}
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:14,flexShrink:0}}>
                  <div style={{position:"relative"}}>
                    <div style={{position:"absolute",inset:-3,borderRadius:"50%",background:"linear-gradient(135deg,#dc2626,#7c3aed,#2563eb)",animation:"spin-r 5s linear infinite"}}/>
                    <img src="https://github.com/PiyushLadukar.png" alt="Piyush" style={{width:100,height:100,borderRadius:"50%",border:"4px solid #0f172a",position:"relative",display:"block",objectFit:"cover"}}
                      onError={e=>{(e.target as HTMLImageElement).style.display="none"}}/>
                  </div>
                  <a href="https://github.com/PiyushLadukar" target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:7,padding:"8px 16px",borderRadius:9,background:"rgba(255,255,255,0.07)",border:"1px solid rgba(255,255,255,0.1)",color:"#e2e8f0",textDecoration:"none",fontSize:13,fontWeight:600,transition:"background 0.2s",width:"100%",justifyContent:"center",fontFamily:FONT}} onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.background="rgba(255,255,255,0.14)"} onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.background="rgba(255,255,255,0.07)"}>
                    <Github size={14}/>GitHub
                  </a>
                  <a href="https://www.linkedin.com/in/piyush-ladukar/" target="_blank" rel="noreferrer" style={{display:"flex",alignItems:"center",gap:7,padding:"8px 16px",borderRadius:9,background:"rgba(10,102,194,0.15)",border:"1px solid rgba(10,102,194,0.3)",color:"#60a5fa",textDecoration:"none",fontSize:13,fontWeight:600,transition:"background 0.2s",width:"100%",justifyContent:"center",fontFamily:FONT}} onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.background="rgba(10,102,194,0.28)"} onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.background="rgba(10,102,194,0.15)"}>
                    <Linkedin size={14}/>LinkedIn
                  </a>
                </div>
                {/* Info col */}
                <div style={{flex:1,minWidth:220}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6,flexWrap:"wrap"}}>
                    <h3 style={{fontSize:28,fontWeight:800,color:"#fff",letterSpacing:"-0.5px",margin:0,fontFamily:FONT}}>Piyush Ladukar</h3>
    
                  </div>
                  <p style={{color:"#64748b",fontSize:13,marginBottom:0,fontFamily:FONT}}>github.com/PiyushLadukar</p>
                  <div style={{height:1,background:"rgba(255,255,255,0.07)",margin:"18px 0"}}/>
                  <p style={{fontSize:14,color:"rgba(255,255,255,0.65)",lineHeight:1.78,marginBottom:20,fontFamily:FONT}}>
                    Built <strong style={{color:"#fff"}}>आतंकदृष्टि</strong> as a full-stack data science project analyzing global terrorism via the GTD dataset. Combines Python data pipelines, Flask REST API, AI clustering, NLP news analysis, and a React TypeScript dashboard for research-grade insights accessible to everyone.
                  </p>
                  <div style={{display:"flex",gap:24,marginBottom:20,flexWrap:"wrap"}}>
                    
                  </div>
                  <div>
                   
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {tech.map((t,i)=>(
                        <span key={i} style={{fontSize:12,fontWeight:600,padding:"4px 11px",borderRadius:20,background:t.bg,color:t.c,border:`1px solid ${t.c}25`,fontFamily:FONT}}>{t.l}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div style={{textAlign:"center",marginTop:36,opacity:v?1:0,transition:"all 0.8s ease 0.4s"}}>
          <p style={{color:"#94a3b8",fontSize:14,fontStyle:"italic",fontFamily:FONT}}>
            "Understanding Terrorism Through Data, Not Assumptions" · {new Date().getFullYear()}
          </p>
        </div>
      </div>
      <style>{`@keyframes spin-r{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </section>
  );
}

// ─── HOMEPAGE ─────────────────────────────────────────────────────────────────
function Homepage({onEnter}:{onEnter:()=>void}) {
  const [vis,setVis]=useState(false);
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{
    setTimeout(()=>setVis(true),60);
    const fn=()=>setScrolled(window.scrollY>40);
    window.addEventListener("scroll",fn);
    return()=>window.removeEventListener("scroll",fn);
  },[]);

  const features=[
    {icon:<Globe size={20}/>,title:"180K+ Incidents",desc:"Full GTD spanning 1970–2020 across 205 countries",color:"#dc2626"},
    {icon:<Brain size={20}/>,title:"AI-Powered Analysis",desc:"KMeans clustering + zero-shot NLP for pattern discovery",color:"#2563eb"},
    {icon:<BarChart2 size={20}/>,title:"Ideology Mapping",desc:"70+ groups mapped to 6 categories via academic sources",color:"#d97706"},
    {icon:<Map size={20}/>,title:"Regional Insights",desc:"Heatmaps showing ideology mix per world region",color:"#7c3aed"},
    {icon:<Activity size={20}/>,title:"50-Year Timeline",desc:"Stacked area charts showing ideology shifts per decade",color:"#059669"},
    {icon:<Shield size={20}/>,title:"Research Grade",desc:"No assumptions — all mappings cite documented sources",color:"#0891b2"},
  ];

  return(
    <div style={{fontFamily:FONT,background:"#fff",overflowX:"hidden"}}>

      {/* ── Nav ── */}
      <nav style={{
        display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 60px",height:68,
        background:scrolled?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.8)",
        backdropFilter:"blur(20px)",
        borderBottom:scrolled?"1px solid #e2e8f0":"1px solid transparent",
        position:"sticky",top:0,zIndex:200,
        boxShadow:scrolled?"0 2px 20px rgba(0,0,0,0.06)":"none",
        transition:"all 0.3s ease",
      }}>
        <Logo size={36}/>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          {["About","Research","Data"].map(l=>(
            <div key={l} style={{padding:"8px 16px",borderRadius:8,color:"#475569",fontSize:14,cursor:"pointer",fontWeight:500,transition:"background 0.2s"}} onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background="#f1f5f9"} onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>{l}</div>
          ))}
          <div style={{width:1,height:20,background:"#e2e8f0",margin:"0 8px"}}/>
          <button onClick={onEnter} style={{
            padding:"9px 22px",background:"linear-gradient(135deg,#0f172a,#1e293b)",color:"white",border:"none",borderRadius:9,
            fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:7,
            boxShadow:"0 4px 14px rgba(15,23,42,0.22)",transition:"transform 0.2s,box-shadow 0.2s",fontFamily:FONT,
          }} onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.transform="translateY(-1px)";(e.currentTarget as HTMLButtonElement).style.boxShadow="0 6px 20px rgba(15,23,42,0.32)"}} onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.transform="translateY(0)";(e.currentTarget as HTMLButtonElement).style.boxShadow="0 4px 14px rgba(15,23,42,0.22)"}}>
            Open Dashboard <ArrowRight size={14}/>
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div style={{
        padding:"110px 60px 96px",
        background:"linear-gradient(150deg,#fafafa 0%,#f0f4ff 55%,#fdf4f8 100%)",
        position:"relative",overflow:"hidden",
        opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(24px)",
        transition:"all 0.9s cubic-bezier(0.16,1,0.3,1)",
      }}>
        {/* Decorative blobs */}
        <div style={{position:"absolute",top:-120,right:-120,width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,237,0.06),transparent 65%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-80,left:-80,width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle,rgba(220,38,38,0.05),transparent 65%)",pointerEvents:"none"}}/>
        {/* Floating animated dots */}
        {Array.from({length:14},(_,i)=>(
          <div key={i} style={{position:"absolute",left:`${10+i*6.5}%`,top:`${20+Math.sin(i)*40}%`,width:Math.random()*4+3,height:Math.random()*4+3,borderRadius:"50%",background:"rgba(220,38,38,0.08)",animation:`fd ${4+i*0.4}s ease-in-out ${i*0.3}s infinite alternate`,pointerEvents:"none"}}/>
        ))}

        <div style={{maxWidth:1200,margin:"0 auto",position:"relative"}}>
          <LiveBadge text="Data-Driven Research Platform · GTD 1970–2020"/>
          <h1 style={{fontSize:"clamp(56px,8vw,100px)",fontWeight:800,color:"#0f172a",lineHeight:1.0,letterSpacing:"-4px",maxWidth:820,marginBottom:12,marginTop:24,fontFamily:FONT}}>
            आतंकदृष्टि
          </h1>
          <h2 style={{fontSize:"clamp(18px,2.5vw,28px)",fontWeight:400,color:"#64748b",letterSpacing:"-0.5px",marginBottom:20,fontFamily:FONT}}>
            Global Terrorism Intelligence Dashboard
          </h2>
          <p style={{fontSize:18,color:"#475569",lineHeight:1.78,maxWidth:560,marginBottom:44,fontFamily:FONT}}>
            Analyze <strong style={{color:"#0f172a"}}>180,000+</strong> documented terrorism incidents across 50 years. Explore ideology patterns, regional data, and AI-discovered insights — from the Global Terrorism Database.
          </p>
          <div style={{display:"flex",gap:16,flexWrap:"wrap",marginBottom:72}}>
            <button onClick={onEnter} style={{padding:"15px 38px",background:"linear-gradient(135deg,#0f172a,#334155)",color:"white",border:"none",borderRadius:12,fontSize:16,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:11,boxShadow:"0 8px 32px rgba(15,23,42,0.28)",transition:"transform 0.2s,box-shadow 0.2s",fontFamily:FONT}}
              onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.transform="translateY(-2px)";(e.currentTarget as HTMLButtonElement).style.boxShadow="0 12px 40px rgba(15,23,42,0.38)"}}
              onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.transform="translateY(0)";(e.currentTarget as HTMLButtonElement).style.boxShadow="0 8px 32px rgba(15,23,42,0.28)"}}>
              <Play size={18} fill="white"/>Launch Dashboard
            </button>
            <a href="https://www.start.umd.edu/gtd/" target="_blank" rel="noreferrer" style={{padding:"15px 38px",background:"#fff",color:"#0f172a",border:"1.5px solid #e2e8f0",borderRadius:12,fontSize:16,fontWeight:600,display:"flex",alignItems:"center",gap:11,textDecoration:"none",transition:"border-color 0.2s,box-shadow 0.2s",fontFamily:FONT}}
              onMouseEnter={e=>{(e.currentTarget as HTMLAnchorElement).style.borderColor="#94a3b8";(e.currentTarget as HTMLAnchorElement).style.boxShadow="0 4px 16px rgba(0,0,0,0.08)"}}
              onMouseLeave={e=>{(e.currentTarget as HTMLAnchorElement).style.borderColor="#e2e8f0";(e.currentTarget as HTMLAnchorElement).style.boxShadow="none"}}>
              <Database size={18}/>GTD Data Source
            </a>
          </div>
          {/* Stat row */}
          <div style={{display:"inline-flex",background:"#fff",border:"1px solid #e2e8f0",borderRadius:18,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.06)"}}>
            {[{v:"180,000+",l:"Incidents"},{v:"205",l:"Countries"},{v:"50+",l:"Years"},{v:"6",l:"Ideologies"}].map((s,i)=>(
              <div key={i} style={{padding:"22px 32px",textAlign:"center",borderRight:i<3?"1px solid #e2e8f0":"none"}}>
                <div style={{fontSize:24,fontWeight:800,color:"#0f172a",letterSpacing:"-1px",fontFamily:FONT}}>{s.v}</div>
                <div style={{fontSize:11,color:"#64748b",marginTop:3,fontWeight:500,fontFamily:FONT}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <style>{`@keyframes fd{0%{transform:translateY(0) scale(1);opacity:0.3}100%{transform:translateY(-16px) scale(1.2);opacity:0.7}}`}</style>
      </div>

      <Ticker/>

      {/* ── Features ── */}
      <section style={{padding:"96px 60px",background:"#fff"}}>
        <div style={{maxWidth:1200,margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:52}}>
            <div style={{display:"inline-block",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:99,padding:"5px 16px",marginBottom:14}}>
              <span style={{color:"#dc2626",fontSize:11,fontWeight:700,letterSpacing:"2px",textTransform:"uppercase",fontFamily:FONT}}>Platform Capabilities</span>
            </div>
            <h2 style={{fontSize:"clamp(26px,4vw,40px)",fontWeight:800,color:"#0f172a",letterSpacing:"-1.5px",fontFamily:FONT}}>Everything you need to analyze terrorism data</h2>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
            {features.map((f,i)=>(
              <div key={i} style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:18,padding:"28px",transition:"transform 0.25s,box-shadow 0.25s,border-color 0.25s",cursor:"default"}}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform="translateY(-5px)";el.style.boxShadow=`0 16px 48px ${f.color}12`;el.style.borderColor=`${f.color}30`}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform="translateY(0)";el.style.boxShadow="none";el.style.borderColor="#e2e8f0"}}>
                <div style={{width:48,height:48,background:`${f.color}0d`,border:`1px solid ${f.color}1e`,borderRadius:14,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:18,color:f.color}}>{f.icon}</div>
                <div style={{fontWeight:700,fontSize:16,color:"#0f172a",marginBottom:8,fontFamily:FONT}}>{f.title}</div>
                <div style={{fontSize:14,color:"#64748b",lineHeight:1.68,fontFamily:FONT}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks/>
      <Numbers/>
      <PreviewCharts onEnter={onEnter}/>

      {/* ── CTA Banner ── */}
      <section style={{padding:"0 60px 96px",background:"#f8fafc"}}>
        <div style={{maxWidth:1200,margin:"0 auto",background:"linear-gradient(135deg,#0f172a 0%,#1e293b 100%)",borderRadius:24,padding:"64px 72px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:32,boxShadow:"0 24px 64px rgba(15,23,42,0.2)",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-100,right:160,width:320,height:320,borderRadius:"50%",background:"rgba(220,38,38,0.06)",pointerEvents:"none"}}/>
          <div>
            <h2 style={{fontSize:34,fontWeight:800,color:"#fff",letterSpacing:"-1px",marginBottom:10,fontFamily:FONT}}>Ready to explore the data?</h2>
            <p style={{fontSize:15,color:"#475569",maxWidth:480,lineHeight:1.7,fontFamily:FONT}}>180,000+ documented incidents. 50 years. All ideologies. No assumptions. Real research, real data.</p>
          </div>
          <button onClick={onEnter} style={{padding:"16px 44px",background:"#fff",color:"#0f172a",border:"none",borderRadius:12,fontSize:16,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:9,whiteSpace:"nowrap",boxShadow:"0 4px 16px rgba(0,0,0,0.18)",transition:"transform 0.2s,box-shadow 0.2s",fontFamily:FONT}}
            onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.transform="scale(1.04)";(e.currentTarget as HTMLButtonElement).style.boxShadow="0 8px 28px rgba(0,0,0,0.26)"}}
            onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.transform="scale(1)";(e.currentTarget as HTMLButtonElement).style.boxShadow="0 4px 16px rgba(0,0,0,0.18)"}}>
            Launch Dashboard<ChevronRight size={17}/>
          </button>
        </div>
      </section>

      <Credit/>

      {/* Footer */}
      <footer style={{background:"#0f172a",padding:"40px 60px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16,borderTop:"1px solid rgba(255,255,255,0.04)"}}>
        <Logo size={30}/>
        <span style={{fontSize:12,color:"#334155",fontFamily:FONT}}>Data: GTD, START Center, University of Maryland · Research use only · {new Date().getFullYear()}</span>
        <div style={{display:"flex",gap:16}}>
          <a href="https://www.start.umd.edu/gtd/" target="_blank" rel="noreferrer" style={{fontSize:12,color:"#475569",textDecoration:"none",fontFamily:FONT}}>GTD Source</a>
          <a href="https://github.com/PiyushLadukar" target="_blank" rel="noreferrer" style={{fontSize:12,color:"#475569",textDecoration:"none",fontFamily:FONT}}>GitHub</a>
        </div>
      </footer>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({onBack}:{onBack:()=>void}) {
  const sum    =useApi<Summary>("summary");
  const ideo   =useApi<IdeologyData[]>("ideology");
  const tl     =useApi<TimelineData[]>("timeline");
  const reg    =useApi<RegionData[]>("region");
  const groups =useApi<GroupData[]>("top-groups");
  const relig  =useApi<ReligionData[]>("religion-subtype");

  const [sel,setSel]=useState("All");
  const [yr,setYr]=useState<[number,number]>([1970,2020]);
  const [tab,setTab]=useState<"overview"|"ideology"|"groups"|"insights">("overview");
  const [search,setSearch]=useState("");

  const tlByYear = tl.data
    ?Object.values(tl.data.reduce((acc:any,r)=>{
        if(!acc[r.year])acc[r.year]={year:r.year};
        acc[r.year][r.ideology]=r.incidents;return acc;
      },{})).sort((a:any,b:any)=>a.year-b.year).filter((d:any)=>d.year>=yr[0]&&d.year<=yr[1])
    :[];

  const regTotals = reg.data
    ?Object.values(reg.data.reduce((acc:any,r)=>{
        if(!acc[r.region])acc[r.region]={region:r.region,total:0};
        acc[r.region].total+=r.incidents;return acc;
      },{})).sort((a:any,b:any)=>(b as any).total-(a as any).total).slice(0,10)
    :[];

  const s=sum.data;

  const filteredGroups=(groups.data||[]).filter((g:GroupData)=>{
    const matchIdeo=sel==="All"||g.ideology===sel;
    const matchSearch=!search||g.group_name.toLowerCase().includes(search.toLowerCase());
    return matchIdeo&&matchSearch;
  }).slice(0,20);

  const SC=({icon,label,value,sub,color}:any)=>(
    <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:16,padding:"22px 24px",flex:1,minWidth:150,position:"relative",overflow:"hidden",transition:"box-shadow 0.2s,transform 0.2s",cursor:"default"}}
      onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.boxShadow=`0 8px 32px ${color}12`;el.style.transform="translateY(-2px)"}}
      onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.boxShadow="none";el.style.transform="translateY(0)"}}>
      <div style={{position:"absolute",top:0,right:0,width:72,height:72,background:`${color}07`,borderRadius:"0 0 0 72px"}}/>
      <div style={{width:36,height:36,borderRadius:10,background:`${color}10`,color,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12}}>{icon}</div>
      <div style={{color:"#64748b",fontSize:10,textTransform:"uppercase",letterSpacing:"0.8px",fontWeight:600,fontFamily:FONT}}>{label}</div>
      <div style={{color:"#0f172a",fontSize:26,fontWeight:800,marginTop:4,letterSpacing:"-1px",fontFamily:FONT}}>
        {typeof value==="number"?<Num v={value}/>:value}
      </div>
      {sub&&<div style={{color:"#94a3b8",fontSize:11,marginTop:2,fontFamily:FONT}}>{sub}</div>}
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:FONT}}>

      {/* Top bar */}
      <div style={{background:"#fff",borderBottom:"1px solid #e2e8f0",padding:"0 32px",display:"flex",alignItems:"center",justifyContent:"space-between",height:60,position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 8px rgba(0,0,0,0.04)"}}>
        <div style={{display:"flex",alignItems:"center",gap:20}}>
          <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"1px solid #e2e8f0",borderRadius:8,padding:"6px 14px",color:"#64748b",fontSize:13,cursor:"pointer",fontWeight:500,fontFamily:FONT,transition:"background 0.2s"}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background="#f8fafc"} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background="none"}>← Home</button>
          <Logo size={28}/>
          <span style={{color:"#e2e8f0",fontSize:18}}>|</span>
          <span style={{color:"#64748b",fontSize:13,fontWeight:500}}>Analysis Dashboard</span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          
          <div style={{background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:8,padding:"6px 12px",fontSize:13,color:"#64748b",display:"flex",alignItems:"center",gap:6,fontFamily:FONT}}>
            <Clock size={13}/>GTD 1970–2020
          </div>
        </div>
      </div>

      

      <div style={{padding:"28px 32px"}}>

        {/* Stat cards */}
        {s&&(
          <div style={{display:"flex",gap:14,flexWrap:"wrap",marginBottom:26}}>
            <SC icon={<Activity size={16}/>} label="Total Incidents" value={s.total_incidents} sub={s.years_covered} color="#dc2626"/>
            <SC icon={<Users size={16}/>} label="Total Killed" value={s.total_killed} color="#7c3aed"/>
            <SC icon={<Zap size={16}/>} label="Total Wounded" value={s.total_wounded} color="#d97706"/>
            <SC icon={<Globe size={16}/>} label="Countries" value={s.countries} color="#2563eb"/>
            <SC icon={<Shield size={16}/>} label="Active Groups" value={s.groups} sub="documented" color="#059669"/>
            <SC icon={<Target size={16}/>} label="Ideology Types" value={s.ideology_categories} color="#0891b2"/>
          </div>
        )}

        {/* Tabs + Filters row */}
        <div style={{display:"flex",gap:16,marginBottom:22,flexWrap:"wrap",alignItems:"center"}}>
          <div style={{display:"flex",gap:4,background:"#fff",borderRadius:11,padding:4,border:"1px solid #e2e8f0",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
            {([{id:"overview",label:"Overview",icon:<BarChart2 size={14}/>},{id:"ideology",label:"Ideology",icon:<Target size={14}/>},{id:"groups",label:"Groups",icon:<Users size={14}/>},{id:"insights",label:"Insights",icon:<Brain size={14}/>}] as const).map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"8px 18px",background:tab===t.id?"#0f172a":"transparent",color:tab===t.id?"white":"#64748b",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,transition:"all 0.18s",fontFamily:FONT}}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          {/* Ideology filter pills */}
          <div style={{display:"flex",gap:6,flexWrap:"wrap",flex:1}}>
            {["All","Religious Extremist","Ethno-Nationalist","Left-Wing","Right-Wing","Unknown"].map(ide=>(
              <button key={ide} onClick={()=>setSel(ide)} style={{padding:"6px 14px",background:sel===ide?(IC[ide]||"#0f172a"):"#fff",color:sel===ide?"#fff":"#475569",border:`1px solid ${sel===ide?(IC[ide]||"#0f172a"):"#e2e8f0"}`,borderRadius:20,fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.15s",fontFamily:FONT}}>{ide}</button>
            ))}
          </div>

          {/* Year range */}
          <div style={{display:"flex",alignItems:"center",gap:10,background:"#fff",border:"1px solid #e2e8f0",borderRadius:11,padding:"10px 16px",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
            <Filter size={13} color="#94a3b8"/>
            <span style={{fontSize:12,color:"#64748b",fontWeight:500,fontFamily:FONT}}>{yr[0]}–{yr[1]}</span>
            <input type="range" min={1970} max={2020} value={yr[0]} onChange={e=>setYr([+e.target.value,yr[1]])} style={{width:72,accentColor:"#0f172a"}}/>
            <input type="range" min={1970} max={2020} value={yr[1]} onChange={e=>setYr([yr[0],+e.target.value])} style={{width:72,accentColor:"#0f172a"}}/>
          </div>
        </div>

        {/* ── OVERVIEW TAB ── */}
        {tab==="overview"&&(
          <div style={{display:"flex",flexDirection:"column",gap:22}}>
            <div style={{background:"#fff",borderRadius:16,padding:"28px",border:"1px solid #e2e8f0",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{fontSize:17,fontWeight:700,color:"#0f172a",marginBottom:3,fontFamily:FONT}}>Incidents Over Time — By Ideology</div>
              <div style={{fontSize:13,color:"#64748b",marginBottom:20,fontFamily:FONT}}>50 years of global terrorism patterns · use year sliders to zoom</div>
              {tl.loading?<Loader/>:
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={tlByYear}>
                    <defs>{Object.entries(IC).map(([ide,col])=><linearGradient key={ide} id={`g${ide.replace(/\s+/g,"")}`} x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={col} stopOpacity={0.15}/><stop offset="95%" stopColor={col} stopOpacity={0}/></linearGradient>)}</defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                    <XAxis dataKey="year" stroke="#94a3b8" tick={{fontSize:11,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                    <YAxis stroke="#94a3b8" tick={{fontSize:11,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                    <Tooltip content={<CT/>}/>
                    <Legend wrapperStyle={{fontSize:12,fontFamily:FONT}}/>
                    {Object.entries(IC).filter(([ide])=>sel==="All"||ide===sel).map(([ide,col])=>(
                      <Area key={ide} type="monotone" dataKey={ide} stroke={col} fill={`url(#g${ide.replace(/\s+/g,"")})`} strokeWidth={2} dot={false}/>
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              }
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:22}}>
              <div style={{background:"#fff",borderRadius:16,padding:"28px",border:"1px solid #e2e8f0",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                <div style={{fontSize:17,fontWeight:700,color:"#0f172a",marginBottom:3,fontFamily:FONT}}>Incidents by Region</div>
                <div style={{fontSize:13,color:"#64748b",marginBottom:20,fontFamily:FONT}}>Top 10 affected world regions</div>
                {reg.loading?<Loader/>:
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={regTotals} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/>
                      <XAxis type="number" stroke="#94a3b8" tick={{fontSize:10,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                      <YAxis type="category" dataKey="region" stroke="#94a3b8" tick={{fontSize:10,fill:"#475569"}} width={148} axisLine={false} tickLine={false}/>
                      <Tooltip content={<CT/>}/>
                      <Bar dataKey="total" radius={[0,6,6,0]}>{regTotals.map((_:any,i:number)=><Cell key={i} fill={`hsl(${220-i*16},68%,${53-i*2}%)`}/>)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                }
              </div>
              <div style={{background:"#fff",borderRadius:16,padding:"28px",border:"1px solid #e2e8f0",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                <div style={{fontSize:17,fontWeight:700,color:"#0f172a",marginBottom:3,fontFamily:FONT}}>Religious Extremism — By Faith</div>
                <div style={{fontSize:13,color:"#64748b",marginBottom:20,fontFamily:FONT}}>Spans multiple religions </div>
                {relig.loading?<Loader/>:
                  (relig.data&&relig.data.length>0)?(
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie data={relig.data} dataKey="incidents" nameKey="religion_subtype" cx="50%" cy="50%" outerRadius={105} innerRadius={52} label={({name,percent})=>`${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                          {relig.data.map((e:ReligionData)=><Cell key={e.religion_subtype} fill={RC[e.religion_subtype]||"#94a3b8"}/>)}
                        </Pie>
                        <Tooltip content={<CT/>}/>
                      </PieChart>
                    </ResponsiveContainer>
                  ):(
                    <div style={{height:280,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:10}}>
                      <Info size={32} color="#cbd5e1"/>
                      <p style={{color:"#94a3b8",fontSize:13,textAlign:"center",fontFamily:FONT}}>No religion subtype data.<br/>Ensure gtd_processed.csv has religion_subtype column.</p>
                    </div>
                  )
                }
              </div>
            </div>
          </div>
        )}

        {/* ── IDEOLOGY TAB ── */}
        {tab==="ideology"&&(
          <div style={{display:"flex",flexDirection:"column",gap:22}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:22}}>
              {(["incidents","killed"] as const).map(key=>(
                <div key={key} style={{background:"#fff",borderRadius:16,padding:"28px",border:"1px solid #e2e8f0",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                  <div style={{fontSize:17,fontWeight:700,color:"#0f172a",marginBottom:3,fontFamily:FONT}}>{key==="incidents"?"Incidents by Ideology":"Killed by Ideology"}</div>
                  <div style={{fontSize:13,color:"#64748b",marginBottom:20,fontFamily:FONT}}>{key==="incidents"?"Distribution across all categories":"Total fatalities per category"}</div>
                  {ideo.loading?<Loader/>:
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={ideo.data||[]} layout="vertical" margin={{left:8}}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false}/>
                        <XAxis type="number" stroke="#94a3b8" tick={{fontSize:11,fill:"#94a3b8"}} axisLine={false} tickLine={false}/>
                        <YAxis type="category" dataKey="ideology" stroke="#94a3b8" tick={{fontSize:11,fill:"#475569"}} width={138} axisLine={false} tickLine={false}/>
                        <Tooltip content={<CT/>}/>
                        <Bar dataKey={key} radius={[0,6,6,0]}>{(ideo.data||[]).map((e:IdeologyData)=><Cell key={e.ideology} fill={IC[e.ideology]||"#94a3b8"}/>)}</Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  }
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
              {(ideo.data||[]).map((item:IdeologyData)=>(
                <div key={item.ideology} style={{background:"#fff",border:`1px solid ${IC[item.ideology]||"#e2e8f0"}22`,borderLeft:`4px solid ${IC[item.ideology]||"#e2e8f0"}`,borderRadius:12,padding:"20px 22px",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                  <div style={{fontWeight:700,fontSize:14,color:"#0f172a",marginBottom:12,fontFamily:FONT}}>{item.ideology}</div>
                  <div style={{display:"flex",gap:20}}>
                    <div><div style={{fontSize:22,fontWeight:800,color:IC[item.ideology]||"#0f172a",letterSpacing:"-0.5px",fontFamily:FONT}}><Num v={item.incidents}/></div><div style={{fontSize:10,color:"#94a3b8",fontWeight:500,fontFamily:FONT}}>incidents</div></div>
                    <div><div style={{fontSize:22,fontWeight:800,color:"#0f172a",letterSpacing:"-0.5px",fontFamily:FONT}}><Num v={item.killed}/></div><div style={{fontSize:10,color:"#94a3b8",fontWeight:500,fontFamily:FONT}}>killed</div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── GROUPS TAB ── */}
        {tab==="groups"&&(
          <div style={{background:"#fff",borderRadius:16,padding:"28px",border:"1px solid #e2e8f0",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
              <div>
                <div style={{fontSize:17,fontWeight:700,color:"#0f172a",fontFamily:FONT}}>Top 20 Most Active Groups</div>
                <div style={{fontSize:13,color:"#64748b",fontFamily:FONT}}>Ranked by documented incidents · use ideology filter + search</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:9,padding:"8px 14px"}}>
                <Search size={13} color="#94a3b8"/>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search group..." style={{border:"none",background:"transparent",outline:"none",fontSize:13,color:"#0f172a",width:160,fontFamily:FONT}}/>
              </div>
            </div>
            {groups.loading?<Loader/>:
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead>
                    <tr style={{borderBottom:"2px solid #f1f5f9"}}>
                      {["#","Group Name","Ideology","Incidents","Killed","Lethality Ratio"].map(h=>(
                        <th key={h} style={{textAlign:"left",padding:"10px 14px",color:"#64748b",fontWeight:600,fontSize:11,textTransform:"uppercase",letterSpacing:"0.5px",fontFamily:FONT}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredGroups.map((g:GroupData,i:number)=>{
                      const leth=g.incidents>0?(g.killed/g.incidents).toFixed(2):"0";
                      return(
                        <tr key={g.group_name} style={{borderBottom:"1px solid #f8fafc",transition:"background 0.12s"}}
                          onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background="#f8fafc"}
                          onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background="transparent"}>
                          <td style={{padding:"12px 14px",color:"#94a3b8",fontWeight:600,fontFamily:FONT}}>{i+1}</td>
                          <td style={{padding:"12px 14px",color:"#0f172a",fontWeight:600,maxWidth:220,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontFamily:FONT}}>{g.group_name}</td>
                          <td style={{padding:"12px 14px"}}>
                            <span style={{background:`${IC[g.ideology]||"#64748b"}12`,color:IC[g.ideology]||"#64748b",padding:"3px 10px",borderRadius:20,fontSize:11,fontWeight:700,fontFamily:FONT}}>{g.ideology}</span>
                          </td>
                          <td style={{padding:"12px 14px",color:"#0f172a",fontWeight:700,fontFamily:FONT}}>{g.incidents.toLocaleString()}</td>
                          <td style={{padding:"12px 14px",color:"#dc2626",fontWeight:700,fontFamily:FONT}}>{g.killed.toLocaleString()}</td>
                          <td style={{padding:"12px 14px"}}>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <div style={{height:6,background:"#f1f5f9",borderRadius:3,width:80,overflow:"hidden"}}>
                                <div style={{height:"100%",background:IC[g.ideology]||"#64748b",width:`${Math.min(Number(leth)*10,100)}%`,borderRadius:3,transition:"width 0.5s ease"}}/>
                              </div>
                              <span style={{fontSize:12,color:"#64748b",fontFamily:FONT}}>{leth}</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredGroups.length===0&&(
                      <tr><td colSpan={6} style={{padding:"40px 14px",textAlign:"center",color:"#94a3b8",fontSize:14,fontFamily:FONT}}>No groups match your filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            }
          </div>
        )}

        {/* ── INSIGHTS TAB ── */}
        {tab==="insights"&&(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18}}>
            {[
              {c:"#dc2626",icon:<AlertTriangle size={18}/>,title:"On Religious Extremism",stat:"28%",sl:"of identified incidents",body:"Religious extremist incidents span Islamic, Christian, Jewish, Sikh, and cult-based groups. GTD data shows concentration in Iraq, Afghanistan, Nigeria — where geopolitical instability is the primary driver, not religion alone."},
              {c:"#64748b",icon:<Search size={18}/>,title:"The Unknown Problem",stat:"~38%",sl:"unidentified perpetrator",body:"A significant share of GTD incidents have no confirmed perpetrator. Assigning ideology to these is methodologically unsound. Any analysis ignoring this category produces misleading conclusions."},
              {c:"#2563eb",icon:<Globe size={18}/>,title:"Ethno-Nationalist Terrorism",stat:"20%",sl:"of total incidents",body:"IRA, LTTE, ETA, and PKK caused the most cumulative casualties over multi-decade campaigns. This category is chronically underreported in Western media relative to its actual documented scale."},
              {c:"#7c3aed",icon:<TrendingUp size={18}/>,title:"Rising Right-Wing Trend",stat:"+4×",sl:"growth since 2010",body:"Right-wing and white supremacist terrorism increased significantly in Western countries post-2010. This is documented in GTD data but consistently receives less media coverage than other categories."},
              {c:"#d97706",icon:<Activity size={18}/>,title:"Left-Wing Historical Peak",stat:"1970s",sl:"peak decade",body:"In 1970s–80s, Left-Wing groups (FARC, Red Brigades, Weather Underground, Shining Path) dominated global terrorism — a fact often absent from contemporary narratives about the nature of terrorism."},
              {c:"#059669",icon:<Map size={18}/>,title:"Geography Predicts More",stat:"12",sl:"regions analyzed",body:"A region's political history — state collapse, colonial legacy, ethnic conflicts — predicts terrorism type more reliably than ideology alone. Context explains what ideology cannot."},
            ].map((ins,i)=>(
              <div key={i} style={{background:"#fff",borderRadius:16,padding:"26px",border:"1px solid #e2e8f0",borderLeft:`4px solid ${ins.c}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)",transition:"transform 0.2s,box-shadow 0.2s",cursor:"default"}}
                onMouseEnter={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform="translateY(-3px)";el.style.boxShadow=`0 10px 36px ${ins.c}12`}}
                onMouseLeave={e=>{const el=e.currentTarget as HTMLDivElement;el.style.transform="translateY(0)";el.style.boxShadow="0 1px 4px rgba(0,0,0,0.04)"}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,color:ins.c,fontWeight:700,fontSize:15,fontFamily:FONT}}>
                    <div style={{width:34,height:34,borderRadius:9,background:`${ins.c}10`,display:"flex",alignItems:"center",justifyContent:"center"}}>{ins.icon}</div>
                    {ins.title}
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:24,fontWeight:800,color:ins.c,letterSpacing:"-0.5px",fontFamily:FONT}}>{ins.stat}</div>
                    <div style={{fontSize:10,color:"#94a3b8",fontWeight:500,fontFamily:FONT}}>{ins.sl}</div>
                  </div>
                </div>
                <p style={{fontSize:13.5,color:"#475569",lineHeight:1.72,margin:0,fontFamily:FONT}}>{ins.body}</p>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div style={{marginTop:36,paddingTop:18,borderTop:"1px solid #e2e8f0",display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:12,color:"#94a3b8",flexWrap:"wrap",gap:8,fontFamily:FONT}}>
          <span>Data: GTD · START Center, University of Maryland</span>
          <span>All ideology classifications based on documented academic sources · Research use only</span>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page,setPage]=useState<"home"|"dashboard">("home");
  useEffect(()=>{window.scrollTo(0,0);},[page]);
  return page==="home"
    ?<Homepage onEnter={()=>setPage("dashboard")}/>
    :<Dashboard onBack={()=>setPage("home")}/>;
}
