import { useState, useEffect, useCallback } from "react";
import API from "../services/api";

// ── CONSTANTS ─────────────────────────────────────────
const STATUSES = {
  Present:   { color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0", icon: "✅", label: "Present" },
  Absent:    { color: "#EF4444", bg: "#FEF2F2", border: "#FECACA", icon: "❌", label: "Absent" },
  Late:      { color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", icon: "⏰", label: "Late" },
  "Half Day":{ color: "#8B5CF6", bg: "#F5F3FF", border: "#DDD6FE", icon: "🌓", label: "Half Day" },
  "Sick Leave":{ color: "#0EA5E9", bg: "#F0F9FF", border: "#BAE6FD", icon: "🤒", label: "Sick Leave" },
};

const DAYS   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ── TOAST ─────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type==='success'?'✅':t.type==='error'?'❌':'ℹ️'}</span>
          <span>{t.message}</span>
          <button className="toast-close" onClick={()=>removeToast(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ── MARK ATTENDANCE MODAL ─────────────────────────────
function MarkModal({ date, employeeId, existing, onSave, onClose }) {
  const [status, setStatus] = useState(existing || "Present");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.post("/attendance", { employee_id: employeeId, date, status });
      onSave(date, status);
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === "string" ? detail : "Failed to save attendance";
      onSave(date, status, msg);
    } finally { setSaving(false); }
  };

  const formatted = new Date(date + "T00:00:00").toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"1rem" }}>
      <div style={{ background:"white",borderRadius:24,maxWidth:420,width:"100%",overflow:"hidden",boxShadow:"0 25px 60px rgba(0,0,0,0.18)",animation:"modalIn 0.2s ease" }}>
        <div style={{ background:"linear-gradient(135deg,#1D4ED8,#0EA5E9)",padding:"1.5rem 2rem",position:"relative" }}>
          <button onClick={onClose} style={{ position:"absolute",top:"1rem",right:"1rem",background:"rgba(255,255,255,0.2)",border:"none",color:"white",width:30,height:30,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
          <div style={{ color:"rgba(255,255,255,0.7)",fontSize:"0.75rem",fontWeight:600,marginBottom:"0.25rem" }}>MARKING ATTENDANCE</div>
          <div style={{ color:"white",fontWeight:800,fontSize:"1.05rem" }}>{formatted}</div>
          <div style={{ color:"rgba(255,255,255,0.8)",fontSize:"0.82rem",marginTop:"0.25rem" }}>Employee: <strong>{employeeId}</strong></div>
        </div>

        <div style={{ padding:"1.5rem 2rem 2rem" }}>
          <div style={{ fontSize:"0.72rem",fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"1rem" }}>Select Status</div>

          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem",marginBottom:"1.5rem" }}>
            {Object.entries(STATUSES).map(([key, s]) => (
              <button key={key} onClick={()=>setStatus(key)} style={{
                padding:"0.875rem 1rem",borderRadius:14,border:`2px solid ${status===key ? s.color : "#E2E8F0"}`,
                background: status===key ? s.bg : "white",
                cursor:"pointer",display:"flex",alignItems:"center",gap:"0.6rem",
                transition:"all 0.15s",
                boxShadow: status===key ? `0 4px 14px ${s.color}30` : "none"
              }}>
                <span style={{ fontSize:"1.2rem" }}>{s.icon}</span>
                <div style={{ textAlign:"left" }}>
                  <div style={{ fontSize:"0.82rem",fontWeight:700,color: status===key ? s.color : "#334155" }}>{s.label}</div>
                </div>
                {status===key && <span style={{ marginLeft:"auto",color:s.color,fontWeight:800 }}>✓</span>}
              </button>
            ))}
          </div>

          <div style={{ display:"flex",gap:"0.75rem" }}>
            <button onClick={onClose} style={{ flex:1,padding:"0.7rem",background:"#F1F5F9",color:"#334155",border:"none",borderRadius:12,fontWeight:600,fontSize:"0.875rem",cursor:"pointer" }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} style={{ flex:2,padding:"0.7rem",background:"#1D4ED8",color:"white",border:"none",borderRadius:12,fontWeight:700,fontSize:"0.875rem",cursor:"pointer",boxShadow:"0 4px 14px rgba(29,78,216,0.35)",opacity:saving?0.7:1,display:"flex",alignItems:"center",justifyContent:"center",gap:"0.4rem" }}>
              {saving ? "Saving..." : `Mark as ${status}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── MAIN ATTENDANCE PAGE ──────────────────────────────
export default function Attendance() {
  const today       = new Date();
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [empId, setEmpId] = useState("");
  const [inputId, setInputId] = useState("");
  const [employees, setEmployees] = useState([]);
  const [records, setRecords]     = useState({});  // { "YYYY-MM-DD": status }
  const [loading, setLoading]     = useState(false);
  const [markDate, setMarkDate]   = useState(null);
  const [toasts, setToasts]       = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug]     = useState(false);

  const showToast = useCallback((message, type="info") => {
    const id = Date.now();
    setToasts(prev=>[...prev,{id,message,type}]);
    setTimeout(()=>setToasts(prev=>prev.filter(t=>t.id!==id)),4000);
  },[]);

  const removeToast = id => setToasts(prev=>prev.filter(t=>t.id!==id));

  // Fetch all employees for autocomplete
  useEffect(()=>{
    API.get("/employees").then(res=>setEmployees(res.data)).catch(()=>{});
  },[]);

  // Fetch attendance when empId or month/year changes
  const fetchAttendance = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await API.get(`/attendance/${id}`);
      const map = {};
      res.data.forEach(r => { map[r.date] = r.status; });
      setRecords(map);
    } catch {
      showToast("Could not fetch attendance for this employee.", "error");
      setRecords({});
    } finally { setLoading(false); }
  },[showToast]);

  useEffect(()=>{ fetchAttendance(empId); },[empId, fetchAttendance]);

  // Autocomplete
  const handleInputChange = (val) => {
    setInputId(val);
    if (val.length > 0) {
      const filtered = employees.filter(e =>
        e.employee_id.toLowerCase().includes(val.toLowerCase()) ||
        e.full_name.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 6);
      setSuggestions(filtered);
      setShowSug(true);
    } else {
      setSuggestions([]);
      setShowSug(false);
    }
  };

  const selectEmployee = (emp) => {
    setInputId(emp.full_name);
    setEmpId(emp.employee_id);
    setSuggestions([]);
    setShowSug(false);
  };

  const handleSearch = () => {
    const found = employees.find(e =>
      e.employee_id.toLowerCase() === inputId.toLowerCase() ||
      e.full_name.toLowerCase() === inputId.toLowerCase()
    );
    if (found) { setEmpId(found.employee_id); }
    else if (inputId) { setEmpId(inputId); }
    setShowSug(false);
  };

  // Calendar grid
  const firstDay  = new Date(year, month, 1).getDay();
  const daysCount = new Date(year, month + 1, 0).getDate();
  const prevDays  = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ day: prevDays - i, current: false });
  }
  for (let d = 1; d <= daysCount; d++) {
    cells.push({ day: d, current: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - firstDay - daysCount + 1, current: false });
  }

  const formatDate = (d) => {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${year}-${mm}-${dd}`;
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y=>y-1); } else setMonth(m=>m-1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y=>y+1); } else setMonth(m=>m+1); };

  const handleDayClick = (day) => {
    if (!empId) { showToast("Please select an employee first.", "error"); return; }
    const dateStr = formatDate(day);
    const clickedDate = new Date(dateStr + "T00:00:00");
    if (clickedDate > today) { showToast("Cannot mark future dates.", "error"); return; }
    setMarkDate(dateStr);
  };

  const handleSaveAttendance = (date, status, error) => {
    if (error) {
      // Already marked — update locally
      setRecords(prev => ({ ...prev, [date]: status }));
      showToast(`Updated: ${date} → ${status}`, "info");
    } else {
      setRecords(prev => ({ ...prev, [date]: status }));
      showToast(`${STATUSES[status].icon} Marked ${status} for ${date}`, "success");
    }
    setMarkDate(null);
  };

  // Summary stats
  const monthRecords = Object.entries(records).filter(([d]) => d.startsWith(`${year}-${String(month+1).padStart(2,"0")}`));
  const summary = Object.keys(STATUSES).reduce((acc, k) => {
    acc[k] = monthRecords.filter(([,v]) => v === k).length;
    return acc;
  }, {});

  const todayStr = today.toISOString().split("T")[0];

  return (
    <>
      <style>{`
        @keyframes modalIn { from{transform:scale(0.95) translateY(10px);opacity:0} to{transform:scale(1) translateY(0);opacity:1} }
        .cal-day:hover { transform: scale(1.04); z-index: 2; }
        .cal-day { transition: transform 0.15s, box-shadow 0.15s; }
      `}</style>
      <Toast toasts={toasts} removeToast={removeToast} />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:"1.5rem", alignItems:"start" }}>

        {/* ── LEFT: CALENDAR ── */}
        <div style={{ background:"white",borderRadius:20,boxShadow:"0 4px 24px rgba(0,0,0,0.07)",border:"1px solid #E2E8F0",overflow:"hidden" }}>

          {/* Calendar Header */}
          <div style={{ background:"linear-gradient(135deg,#1D4ED8,#0EA5E9)",padding:"1.5rem 2rem" }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1rem" }}>
              <button onClick={prevMonth} style={{ background:"rgba(255,255,255,0.2)",border:"none",color:"white",width:36,height:36,borderRadius:10,cursor:"pointer",fontSize:"1.1rem",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700 }}>‹</button>
              <div style={{ textAlign:"center" }}>
                <div style={{ color:"white",fontWeight:800,fontSize:"1.4rem",letterSpacing:"-0.02em" }}>
                  {MONTHS[month]} {year}
                </div>
                {empId && (
                  <div style={{ color:"rgba(255,255,255,0.8)",fontSize:"0.8rem",marginTop:"0.25rem" }}>
                    📋 {employees.find(e=>e.employee_id===empId)?.full_name || empId}
                  </div>
                )}
              </div>
              <button onClick={nextMonth} style={{ background:"rgba(255,255,255,0.2)",border:"none",color:"white",width:36,height:36,borderRadius:10,cursor:"pointer",fontSize:"1.1rem",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700 }}>›</button>
            </div>

            {/* Summary pills */}
            {empId && (
              <div style={{ display:"flex",gap:"0.5rem",flexWrap:"wrap",justifyContent:"center" }}>
                {Object.entries(STATUSES).map(([key, s]) => summary[key] > 0 && (
                  <span key={key} style={{ background:"rgba(255,255,255,0.15)",color:"white",fontSize:"0.72rem",fontWeight:700,padding:"0.2rem 0.65rem",borderRadius:20,backdropFilter:"blur(4px)" }}>
                    {s.icon} {summary[key]} {key}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Day headers */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",background:"#F8FAFC",borderBottom:"1px solid #E2E8F0" }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign:"center",padding:"0.75rem 0",fontSize:"0.72rem",fontWeight:700,color:"#94A3B8",letterSpacing:"0.06em",textTransform:"uppercase" }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,padding:"1rem" }}>
            {cells.map((cell, i) => {
              if (!cell.current) {
                return <div key={i} style={{ aspectRatio:"1",borderRadius:12,background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#CBD5E1",fontSize:"0.82rem",fontWeight:500 }}>{cell.day}</div>;
              }
              const dateStr = formatDate(cell.day);
              const status  = records[dateStr];
              const s       = status ? STATUSES[status] : null;
              const isToday = dateStr === todayStr;
              const isFuture = new Date(dateStr+"T00:00:00") > today;

              return (
                <div key={i} className="cal-day" onClick={()=>!isFuture && handleDayClick(cell.day)}
                  style={{
                    aspectRatio:"1", borderRadius:12,
                    background: s ? s.bg : isToday ? "#EFF6FF" : "#F8FAFC",
                    border: `2px solid ${s ? s.border : isToday ? "#3B82F6" : "#F1F5F9"}`,
                    display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                    cursor: isFuture ? "default" : "pointer",
                    opacity: isFuture ? 0.35 : 1,
                    position:"relative",
                    boxShadow: s ? `0 2px 8px ${s.color}20` : "none"
                  }}>
                  <div style={{ fontSize:"0.85rem",fontWeight: isToday ? 800 : s ? 700 : 500, color: s ? s.color : isToday ? "#1D4ED8" : "#334155", lineHeight:1 }}>
                    {cell.day}
                  </div>
                  {s && <div style={{ fontSize:"0.75rem",marginTop:2 }}>{s.icon}</div>}
                  {isToday && !s && (
                    <div style={{ width:4,height:4,borderRadius:"50%",background:"#1D4ED8",marginTop:3 }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ padding:"1rem 1.5rem 1.5rem",borderTop:"1px solid #F1F5F9" }}>
            <div style={{ fontSize:"0.7rem",fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.75rem" }}>Legend</div>
            <div style={{ display:"flex",flexWrap:"wrap",gap:"0.5rem" }}>
              {Object.entries(STATUSES).map(([key, s]) => (
                <span key={key} style={{ display:"inline-flex",alignItems:"center",gap:"0.3rem",background:s.bg,color:s.color,border:`1px solid ${s.border}`,padding:"0.2rem 0.65rem",borderRadius:20,fontSize:"0.72rem",fontWeight:600 }}>
                  {s.icon} {s.label}
                </span>
              ))}
              <span style={{ display:"inline-flex",alignItems:"center",gap:"0.3rem",background:"#EFF6FF",color:"#1D4ED8",border:"2px solid #3B82F6",padding:"0.2rem 0.65rem",borderRadius:20,fontSize:"0.72rem",fontWeight:700 }}>
                ● Today
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{ display:"flex",flexDirection:"column",gap:"1.25rem" }}>

          {/* Employee Selector */}
          <div style={{ background:"white",borderRadius:20,boxShadow:"0 4px 24px rgba(0,0,0,0.07)",border:"1px solid #E2E8F0",padding:"1.5rem" }}>
            <div style={{ fontSize:"0.72rem",fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"1rem" }}>👤 Select Employee</div>
            <div style={{ position:"relative" }}>
              <div style={{ display:"flex",gap:"0.5rem" }}>
                <div style={{ flex:1,display:"flex",alignItems:"center",gap:"0.5rem",background:"#F8FAFC",border:"1.5px solid #E2E8F0",borderRadius:12,padding:"0.6rem 0.875rem" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#94A3B8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                  <input type="text" placeholder="Name or Employee ID..."
                    value={inputId}
                    onChange={e=>handleInputChange(e.target.value)}
                    onKeyDown={e=>e.key==="Enter"&&handleSearch()}
                    style={{ border:"none",outline:"none",background:"none",fontSize:"0.82rem",color:"#0F172A",width:"100%",fontFamily:"Sora,sans-serif" }} />
                </div>
                <button onClick={handleSearch} style={{ background:"#1D4ED8",color:"white",border:"none",borderRadius:12,padding:"0 1rem",fontWeight:600,fontSize:"0.78rem",cursor:"pointer",whiteSpace:"nowrap" }}>
                  Load
                </button>
              </div>

              {/* Autocomplete */}
              {showSug && suggestions.length > 0 && (
                <div style={{ position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:"white",borderRadius:12,border:"1.5px solid #E2E8F0",boxShadow:"0 8px 24px rgba(0,0,0,0.10)",zIndex:50,overflow:"hidden" }}>
                  {suggestions.map(emp=>(
                    <div key={emp.id} onClick={()=>selectEmployee(emp)}
                      style={{ padding:"0.75rem 1rem",cursor:"pointer",display:"flex",alignItems:"center",gap:"0.75rem",borderBottom:"1px solid #F8FAFC",transition:"background 0.1s" }}
                      onMouseEnter={e=>e.currentTarget.style.background="#EFF6FF"}
                      onMouseLeave={e=>e.currentTarget.style.background="white"}>
                      <div style={{ width:30,height:30,borderRadius:"50%",background:"linear-gradient(135deg,#1D4ED8,#0EA5E9)",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.8rem",fontWeight:700,flexShrink:0 }}>
                        {emp.full_name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize:"0.82rem",fontWeight:600,color:"#0F172A" }}>{emp.full_name}</div>
                        <div style={{ fontSize:"0.7rem",color:"#94A3B8",fontFamily:"monospace" }}>{emp.employee_id}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {empId && (
              <div style={{ marginTop:"1rem",padding:"0.875rem",background:"#EFF6FF",borderRadius:12,border:"1px solid #DBEAFE" }}>
                <div style={{ fontSize:"0.72rem",fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"0.25rem" }}>Viewing</div>
                <div style={{ fontWeight:700,color:"#1D4ED8",fontSize:"0.9rem" }}>{employees.find(e=>e.employee_id===empId)?.full_name || empId}</div>
                <div style={{ fontSize:"0.72rem",color:"#64748B",fontFamily:"monospace",marginTop:"0.1rem" }}>{empId}</div>
              </div>
            )}
          </div>

          {/* Monthly Summary */}
          {empId && (
            <div style={{ background:"white",borderRadius:20,boxShadow:"0 4px 24px rgba(0,0,0,0.07)",border:"1px solid #E2E8F0",padding:"1.5rem" }}>
              <div style={{ fontSize:"0.72rem",fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"1rem" }}>
                📊 {MONTHS[month]} Summary
              </div>
              {Object.entries(STATUSES).map(([key, s]) => (
                <div key={key} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.6rem 0",borderBottom:"1px solid #F8FAFC" }}>
                  <div style={{ display:"flex",alignItems:"center",gap:"0.5rem" }}>
                    <span style={{ fontSize:"1rem" }}>{s.icon}</span>
                    <span style={{ fontSize:"0.82rem",fontWeight:600,color:"#334155" }}>{s.label}</span>
                  </div>
                  <div style={{ display:"flex",alignItems:"center",gap:"0.5rem" }}>
                    <div style={{ height:6,width:60,borderRadius:99,background:"#F1F5F9",overflow:"hidden" }}>
                      <div style={{ height:"100%",width:`${Math.min(100,(summary[key]||0)/daysCount*100)}%`,background:s.color,borderRadius:99,transition:"width 0.4s" }} />
                    </div>
                    <span style={{ fontSize:"0.875rem",fontWeight:800,color:s.color,minWidth:20,textAlign:"right" }}>{summary[key]||0}</span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop:"0.875rem",padding:"0.75rem",background:"#F8FAFC",borderRadius:12,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <span style={{ fontSize:"0.78rem",fontWeight:600,color:"#64748B" }}>Total marked</span>
                <span style={{ fontSize:"1rem",fontWeight:800,color:"#0F172A" }}>{monthRecords.length} / {daysCount} days</span>
              </div>
            </div>
          )}

          {/* Instructions */}
          {!empId && (
            <div style={{ background:"white",borderRadius:20,boxShadow:"0 4px 24px rgba(0,0,0,0.07)",border:"1px solid #E2E8F0",padding:"1.5rem" }}>
              <div style={{ fontSize:"0.72rem",fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"1rem" }}>📖 How to use</div>
              {[
                { icon:"1️⃣", text:"Type employee name or ID above" },
                { icon:"2️⃣", text:"Click Load or press Enter" },
                { icon:"3️⃣", text:"Click any date on the calendar" },
                { icon:"4️⃣", text:"Choose attendance status & save" },
              ].map((item, i) => (
                <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:"0.75rem",padding:"0.6rem 0",borderBottom:i<3?"1px solid #F8FAFC":"none" }}>
                  <span style={{ fontSize:"1rem",flexShrink:0 }}>{item.icon}</span>
                  <span style={{ fontSize:"0.82rem",color:"#64748B",lineHeight:1.5 }}>{item.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Quick mark today */}
          {empId && (
            <div style={{ background:"linear-gradient(135deg,#1D4ED8,#0EA5E9)",borderRadius:20,padding:"1.5rem",cursor:"pointer" }}
              onClick={()=>handleDayClick(today.getDate())}>
              <div style={{ color:"rgba(255,255,255,0.8)",fontSize:"0.72rem",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.5rem" }}>⚡ Quick Mark</div>
              <div style={{ color:"white",fontWeight:800,fontSize:"1rem" }}>Mark Today's Attendance</div>
              <div style={{ color:"rgba(255,255,255,0.7)",fontSize:"0.78rem",marginTop:"0.25rem" }}>
                {today.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}
              </div>
              {records[todayStr] && (
                <div style={{ marginTop:"0.75rem",background:"rgba(255,255,255,0.2)",borderRadius:10,padding:"0.4rem 0.75rem",display:"inline-flex",alignItems:"center",gap:"0.4rem" }}>
                  <span>{STATUSES[records[todayStr]]?.icon}</span>
                  <span style={{ color:"white",fontSize:"0.78rem",fontWeight:700 }}>{records[todayStr]}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mark Modal */}
      {markDate && (
        <MarkModal
          date={markDate}
          employeeId={empId}
          existing={records[markDate]}
          onSave={handleSaveAttendance}
          onClose={()=>setMarkDate(null)}
        />
      )}
    </>
  );
}
