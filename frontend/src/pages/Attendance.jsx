import { useState, useEffect, useCallback } from "react";
import API from "../services/api";

// ── CONSTANTS ─────────────────────────────────────────
const STATUSES = {
  Present:     { color: "#10B981", bg: "#ECFDF5", border: "#A7F3D0", dot: "#10B981" },
  Absent:      { color: "#EF4444", bg: "#FEF2F2", border: "#FECACA", dot: "#EF4444" },
  Late:        { color: "#F59E0B", bg: "#FFFBEB", border: "#FDE68A", dot: "#F59E0B" },
  "Half Day":  { color: "#8B5CF6", bg: "#F5F3FF", border: "#DDD6FE", dot: "#8B5CF6" },
  "Sick Leave":{ color: "#0EA5E9", bg: "#F0F9FF", border: "#BAE6FD", dot: "#0EA5E9" },
};

const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// ── TOAST ─────────────────────────────────────────────
function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type==="success"?"✓":t.type==="error"?"✕":"i"}</span>
          <span>{t.message}</span>
          <button className="toast-close" onClick={()=>removeToast(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

// ── MARK ATTENDANCE TAB ───────────────────────────────
function MarkAttendanceTab({ employees, showToast }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm]     = useState({ employee_id:"", date:today, status:"Present" });
  const [loading, setLoading] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug] = useState(false);

  const handleInputChange = (val) => {
    setInputVal(val);
    setForm(f=>({...f, employee_id: val}));
    if (val.length > 0) {
      const filtered = employees.filter(e =>
        e.employee_id.toLowerCase().includes(val.toLowerCase()) ||
        e.full_name.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSug(true);
    } else {
      setSuggestions([]);
      setShowSug(false);
    }
  };

  const selectEmp = (emp) => {
    setInputVal(emp.full_name);
    setForm(f=>({...f, employee_id: emp.employee_id}));
    setSuggestions([]);
    setShowSug(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.employee_id) { showToast("Please select an employee.", "error"); return; }
    setLoading(true);
    try {
      await API.post("/attendance", form);
      showToast(`Attendance marked as ${form.status} for ${form.date}.`, "success");
      setForm(f=>({...f, employee_id:"", date:today}));
      setInputVal("");
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail==="string" ? detail : Array.isArray(detail) ? detail[0].msg : "Failed to mark attendance.";
      showToast(msg, "error");
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xl font-semibold text-gray-800">Mark Attendance</h2>
        <p className="text-sm text-gray-500 mt-1">Record daily attendance for an employee.</p>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Employee search */}
            <div className="space-y-2" style={{ position:"relative" }}>
              <label>Employee Name / ID</label>
              <input type="text" placeholder="Search by name or employee ID"
                value={inputVal} onChange={e=>handleInputChange(e.target.value)}
                onBlur={()=>setTimeout(()=>setShowSug(false),150)}
                onFocus={()=>inputVal&&setShowSug(true)} required />
              {showSug && suggestions.length > 0 && (
                <div style={{ position:"absolute",top:"100%",left:0,right:0,background:"white",borderRadius:10,border:"1.5px solid #E2E8F0",boxShadow:"0 8px 24px rgba(0,0,0,0.10)",zIndex:50,overflow:"hidden" }}>
                  {suggestions.map(emp=>(
                    <div key={emp.id} onMouseDown={()=>selectEmp(emp)}
                      style={{ padding:"0.75rem 1rem",cursor:"pointer",display:"flex",alignItems:"center",gap:"0.75rem",borderBottom:"1px solid #F8FAFC" }}
                      onMouseEnter={e=>e.currentTarget.style.background="#EFF6FF"}
                      onMouseLeave={e=>e.currentTarget.style.background="white"}>
                      <div style={{ width:32,height:32,borderRadius:"50%",background:"linear-gradient(135deg,#1D4ED8,#0EA5E9)",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.85rem",flexShrink:0 }}>
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

            {/* Date */}
            <div className="space-y-2">
              <label>Date</label>
              <input type="date" value={form.date}
                onChange={e=>setForm(f=>({...f,date:e.target.value}))} required />
            </div>
          </div>

          {/* Status selector */}
          <div style={{ marginTop:"1.5rem" }}>
            <label style={{ display:"block",fontSize:"0.72rem",fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",color:"#94A3B8",marginBottom:"0.75rem" }}>Attendance Status</label>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"0.75rem" }}>
              {Object.entries(STATUSES).map(([key, s]) => (
                <button key={key} type="button" onClick={()=>setForm(f=>({...f,status:key}))}
                  style={{
                    padding:"0.875rem 0.5rem", borderRadius:12,
                    border:`2px solid ${form.status===key ? s.color : "#E2E8F0"}`,
                    background: form.status===key ? s.bg : "white",
                    cursor:"pointer", textAlign:"center",
                    transition:"all 0.15s",
                    boxShadow: form.status===key ? `0 4px 12px ${s.color}25` : "none"
                  }}>
                  <div style={{ width:10,height:10,borderRadius:"50%",background:s.dot,margin:"0 auto 0.5rem" }} />
                  <div style={{ fontSize:"0.75rem",fontWeight:700,color:form.status===key ? s.color : "#64748B",lineHeight:1.3 }}>{key}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected summary */}
          {form.employee_id && (
            <div style={{ marginTop:"1.5rem",padding:"1rem 1.25rem",background:"#F8FAFC",borderRadius:12,border:"1px solid #E2E8F0",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"0.5rem" }}>
              <div>
                <div style={{ fontSize:"0.7rem",fontWeight:600,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"0.2rem" }}>Summary</div>
                <div style={{ fontSize:"0.875rem",fontWeight:600,color:"#0F172A" }}>
                  {employees.find(e=>e.employee_id===form.employee_id)?.full_name || form.employee_id}
                  <span style={{ color:"#94A3B8",fontWeight:400 }}> · </span>
                  {new Date(form.date+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}
                </div>
              </div>
              <span style={{ background:STATUSES[form.status].bg,color:STATUSES[form.status].color,border:`1px solid ${STATUSES[form.status].border}`,padding:"0.25rem 0.875rem",borderRadius:20,fontSize:"0.78rem",fontWeight:700 }}>
                {form.status}
              </span>
            </div>
          )}

          <div style={{ marginTop:"1.5rem",display:"flex",justifyContent:"flex-end" }}>
            <button type="submit" disabled={loading}
              style={{ display:"inline-flex",alignItems:"center",gap:"0.5rem",background:"#1D4ED8",color:"white",border:"none",borderRadius:10,padding:"0.65rem 2rem",fontWeight:700,fontSize:"0.875rem",cursor:loading?"not-allowed":"pointer",boxShadow:"0 4px 14px rgba(29,78,216,0.3)",opacity:loading?0.7:1,fontFamily:"Sora,sans-serif" }}>
              {loading ? "Saving..." : "Mark Attendance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── MARK MODAL (for calendar click) ──────────────────
function MarkModal({ date, employeeId, existing, onSave, onClose }) {
  const [status, setStatus] = useState(existing || "Present");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.post("/attendance", { employee_id:employeeId, date, status });
      onSave(date, status, null);
    } catch (err) {
      onSave(date, status, "exists");
    } finally { setSaving(false); }
  };

  const formatted = new Date(date+"T00:00:00").toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"});

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.55)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"1rem" }}>
      <div style={{ background:"white",borderRadius:20,maxWidth:420,width:"100%",overflow:"hidden",boxShadow:"0 25px 60px rgba(0,0,0,0.18)",animation:"modalIn 0.2s ease" }}>
        <div style={{ background:"linear-gradient(135deg,#1D4ED8,#0EA5E9)",padding:"1.5rem 2rem",position:"relative" }}>
          <button onClick={onClose} style={{ position:"absolute",top:"1rem",right:"1rem",background:"rgba(255,255,255,0.2)",border:"none",color:"white",width:30,height:30,borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.875rem",fontWeight:700 }}>✕</button>
          <div style={{ color:"rgba(255,255,255,0.7)",fontSize:"0.7rem",fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"0.25rem" }}>Mark Attendance</div>
          <div style={{ color:"white",fontWeight:800,fontSize:"1rem" }}>{formatted}</div>
          <div style={{ color:"rgba(255,255,255,0.8)",fontSize:"0.8rem",marginTop:"0.2rem" }}>Employee ID: <strong>{employeeId}</strong></div>
        </div>
        <div style={{ padding:"1.5rem 2rem 2rem" }}>
          <div style={{ fontSize:"0.7rem",fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"1rem" }}>Select Status</div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem",marginBottom:"1.5rem" }}>
            {Object.entries(STATUSES).map(([key, s]) => (
              <button key={key} onClick={()=>setStatus(key)} type="button"
                style={{ padding:"0.875rem 1rem",borderRadius:12,border:`2px solid ${status===key?s.color:"#E2E8F0"}`,background:status===key?s.bg:"white",cursor:"pointer",display:"flex",alignItems:"center",gap:"0.75rem",transition:"all 0.15s",boxShadow:status===key?`0 4px 12px ${s.color}25`:"none" }}>
                <div style={{ width:10,height:10,borderRadius:"50%",background:s.dot,flexShrink:0 }} />
                <span style={{ fontSize:"0.82rem",fontWeight:700,color:status===key?s.color:"#334155" }}>{key}</span>
                {status===key && <span style={{ marginLeft:"auto",color:s.color,fontSize:"0.875rem",fontWeight:800 }}>✓</span>}
              </button>
            ))}
          </div>
          <div style={{ display:"flex",gap:"0.75rem" }}>
            <button onClick={onClose} type="button" style={{ flex:1,padding:"0.65rem",background:"#F1F5F9",color:"#334155",border:"none",borderRadius:10,fontWeight:600,fontSize:"0.875rem",cursor:"pointer",fontFamily:"Sora,sans-serif" }}>Cancel</button>
            <button onClick={handleSave} disabled={saving} type="button" style={{ flex:2,padding:"0.65rem",background:"#1D4ED8",color:"white",border:"none",borderRadius:10,fontWeight:700,fontSize:"0.875rem",cursor:"pointer",boxShadow:"0 4px 14px rgba(29,78,216,0.3)",opacity:saving?0.7:1,fontFamily:"Sora,sans-serif" }}>
              {saving ? "Saving..." : `Mark as ${status}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CALENDAR TAB ──────────────────────────────────────
function CalendarTab({ employees, showToast }) {
  const today    = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const [year, setYear]   = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [empId, setEmpId] = useState("");
  const [inputVal, setInputVal]   = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSug, setShowSug]     = useState(false);
  const [records, setRecords]     = useState({});
  const [loading, setLoading]     = useState(false);
  const [markDate, setMarkDate]   = useState(null);

  const fetchAttendance = useCallback(async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await API.get(`/attendance/${id}`);
      const map = {};
      res.data.forEach(r=>{ map[r.date]=r.status; });
      setRecords(map);
    } catch {
      showToast("Could not fetch attendance records.", "error");
      setRecords({});
    } finally { setLoading(false); }
  },[showToast]);

  const handleInputChange = (val) => {
    setInputVal(val);
    if (val.length > 0) {
      setSuggestions(employees.filter(e=>e.employee_id.toLowerCase().includes(val.toLowerCase())||e.full_name.toLowerCase().includes(val.toLowerCase())).slice(0,5));
      setShowSug(true);
    } else { setSuggestions([]); setShowSug(false); }
  };

  const selectEmp = (emp) => {
    setInputVal(emp.full_name);
    setEmpId(emp.employee_id);
    setSuggestions([]);
    setShowSug(false);
    fetchAttendance(emp.employee_id);
  };

  const handleLoad = () => {
    const found = employees.find(e=>e.employee_id.toLowerCase()===inputVal.toLowerCase()||e.full_name.toLowerCase()===inputVal.toLowerCase());
    const id = found ? found.employee_id : inputVal;
    setEmpId(id);
    fetchAttendance(id);
    setShowSug(false);
  };

  const prevMonth = () => { if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const nextMonth = () => { if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); };

  const firstDay  = new Date(year, month, 1).getDay();
  const daysCount = new Date(year, month+1, 0).getDate();
  const prevDays  = new Date(year, month, 0).getDate();
  const cells = [];
  for(let i=firstDay-1;i>=0;i--) cells.push({day:prevDays-i,current:false});
  for(let d=1;d<=daysCount;d++) cells.push({day:d,current:true});
  while(cells.length%7!==0) cells.push({day:cells.length-firstDay-daysCount+1,current:false});

  const formatDate = (d) => `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

  const handleDayClick = (day) => {
    if(!empId){showToast("Please load an employee first.","error");return;}
    const ds = formatDate(day);
    if(new Date(ds+"T00:00:00")>today){showToast("Cannot mark future dates.","error");return;}
    setMarkDate(ds);
  };

  const handleSave = (date, status, err) => {
    setRecords(prev=>({...prev,[date]:status}));
    showToast(err ? `Updated ${date} to ${status}` : `Marked ${status} for ${date}`, "success");
    setMarkDate(null);
  };

  const mm = String(month+1).padStart(2,"0");
  const monthRecords = Object.entries(records).filter(([d])=>d.startsWith(`${year}-${mm}`));
  const summary = Object.keys(STATUSES).reduce((acc,k)=>{acc[k]=monthRecords.filter(([,v])=>v===k).length;return acc;},{});
  const empName = employees.find(e=>e.employee_id===empId)?.full_name;

  return (
    <div style={{ display:"grid",gridTemplateColumns:"1fr 300px",gap:"1.5rem",alignItems:"start" }}>

      {/* Calendar */}
      <div style={{ background:"white",borderRadius:20,border:"1px solid #E2E8F0",boxShadow:"0 4px 20px rgba(0,0,0,0.06)",overflow:"hidden" }}>

        {/* Cal header */}
        <div style={{ background:"linear-gradient(135deg,#1D4ED8,#0EA5E9)",padding:"1.5rem 2rem" }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <button onClick={prevMonth} style={{ background:"rgba(255,255,255,0.18)",border:"none",color:"white",width:36,height:36,borderRadius:10,cursor:"pointer",fontSize:"1.1rem",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center" }}>‹</button>
            <div style={{ textAlign:"center" }}>
              <div style={{ color:"white",fontWeight:800,fontSize:"1.35rem",letterSpacing:"-0.02em" }}>{MONTHS[month]} {year}</div>
              {empId && <div style={{ color:"rgba(255,255,255,0.8)",fontSize:"0.8rem",marginTop:"0.2rem" }}>{empName || empId}</div>}
            </div>
            <button onClick={nextMonth} style={{ background:"rgba(255,255,255,0.18)",border:"none",color:"white",width:36,height:36,borderRadius:10,cursor:"pointer",fontSize:"1.1rem",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center" }}>›</button>
          </div>
          {empId && monthRecords.length > 0 && (
            <div style={{ display:"flex",gap:"0.5rem",flexWrap:"wrap",justifyContent:"center",marginTop:"1rem" }}>
              {Object.entries(STATUSES).map(([k,s])=>summary[k]>0&&(
                <span key={k} style={{ background:"rgba(255,255,255,0.15)",color:"white",fontSize:"0.7rem",fontWeight:700,padding:"0.15rem 0.6rem",borderRadius:20,backdropFilter:"blur(4px)" }}>
                  {summary[k]} {k}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Day headers */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",background:"#F8FAFC",borderBottom:"1px solid #E2E8F0" }}>
          {DAYS.map(d=>(
            <div key={d} style={{ textAlign:"center",padding:"0.75rem 0",fontSize:"0.7rem",fontWeight:700,color:"#94A3B8",letterSpacing:"0.06em",textTransform:"uppercase" }}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ padding:"3rem",textAlign:"center",color:"#94A3B8",fontSize:"0.875rem" }}>Loading attendance data...</div>
        ) : (
          <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,padding:"0.875rem" }}>
            {cells.map((cell,i) => {
              if(!cell.current) return (
                <div key={i} style={{ aspectRatio:"1",display:"flex",alignItems:"center",justifyContent:"center",color:"#CBD5E1",fontSize:"0.8rem" }}>{cell.day}</div>
              );
              const ds = formatDate(cell.day);
              const status = records[ds];
              const s = status ? STATUSES[status] : null;
              const isToday = ds===todayStr;
              const isFuture = new Date(ds+"T00:00:00")>today;
              return (
                <div key={i} onClick={()=>!isFuture&&handleDayClick(cell.day)}
                  style={{
                    aspectRatio:"1",borderRadius:10,
                    background: s ? s.bg : isToday ? "#EFF6FF" : "#F8FAFC",
                    border:`2px solid ${s?s.border:isToday?"#3B82F6":"#F1F5F9"}`,
                    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                    cursor:isFuture?"default":"pointer",
                    opacity:isFuture?0.3:1,
                    transition:"transform 0.12s,box-shadow 0.12s",
                    boxShadow:s?`0 2px 8px ${s.color}18`:"none",
                  }}
                  onMouseEnter={e=>{ if(!isFuture){ e.currentTarget.style.transform="scale(1.06)"; e.currentTarget.style.zIndex="2"; e.currentTarget.style.position="relative"; }}}
                  onMouseLeave={e=>{ e.currentTarget.style.transform="scale(1)"; }}>
                  <span style={{ fontSize:"0.82rem",fontWeight:isToday?800:s?700:500,color:s?s.color:isToday?"#1D4ED8":"#334155",lineHeight:1 }}>{cell.day}</span>
                  {s && <div style={{ width:6,height:6,borderRadius:"50%",background:s.dot,marginTop:3 }} />}
                  {isToday && !s && <div style={{ width:4,height:4,borderRadius:"50%",background:"#1D4ED8",marginTop:3 }} />}
                </div>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div style={{ padding:"1rem 1.25rem 1.25rem",borderTop:"1px solid #F1F5F9" }}>
          <div style={{ fontSize:"0.68rem",fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.6rem" }}>Legend</div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:"0.5rem" }}>
            {Object.entries(STATUSES).map(([key,s])=>(
              <span key={key} style={{ display:"inline-flex",alignItems:"center",gap:"0.35rem",background:s.bg,color:s.color,border:`1px solid ${s.border}`,padding:"0.2rem 0.65rem",borderRadius:20,fontSize:"0.7rem",fontWeight:600 }}>
                <span style={{ width:6,height:6,borderRadius:"50%",background:s.dot,display:"inline-block" }} />
                {key}
              </span>
            ))}
            <span style={{ display:"inline-flex",alignItems:"center",gap:"0.35rem",background:"#EFF6FF",color:"#1D4ED8",border:"2px solid #3B82F6",padding:"0.2rem 0.65rem",borderRadius:20,fontSize:"0.7rem",fontWeight:700 }}>
              <span style={{ width:4,height:4,borderRadius:"50%",background:"#1D4ED8",display:"inline-block" }} /> Today
            </span>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ display:"flex",flexDirection:"column",gap:"1.25rem" }}>

        {/* Employee selector */}
        <div style={{ background:"white",borderRadius:16,border:"1px solid #E2E8F0",boxShadow:"0 4px 20px rgba(0,0,0,0.06)",padding:"1.25rem" }}>
          <div style={{ fontSize:"0.7rem",fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.875rem" }}>View Employee</div>
          <div style={{ position:"relative" }}>
            <div style={{ display:"flex",gap:"0.5rem" }}>
              <div style={{ flex:1,display:"flex",alignItems:"center",gap:"0.5rem",background:"#F8FAFC",border:"1.5px solid #E2E8F0",borderRadius:10,padding:"0.55rem 0.875rem",transition:"border-color 0.2s" }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#94A3B8" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" placeholder="Name or ID..."
                  value={inputVal}
                  onChange={e=>handleInputChange(e.target.value)}
                  onBlur={()=>setTimeout(()=>setShowSug(false),150)}
                  onKeyDown={e=>e.key==="Enter"&&handleLoad()}
                  style={{ border:"none",outline:"none",background:"none",fontSize:"0.82rem",color:"#0F172A",width:"100%",fontFamily:"Sora,sans-serif" }} />
              </div>
              <button onClick={handleLoad} style={{ background:"#1D4ED8",color:"white",border:"none",borderRadius:10,padding:"0 0.875rem",fontWeight:600,fontSize:"0.78rem",cursor:"pointer",whiteSpace:"nowrap",fontFamily:"Sora,sans-serif" }}>Load</button>
            </div>
            {showSug && suggestions.length>0 && (
              <div style={{ position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:"white",borderRadius:10,border:"1.5px solid #E2E8F0",boxShadow:"0 8px 24px rgba(0,0,0,0.10)",zIndex:50,overflow:"hidden" }}>
                {suggestions.map(emp=>(
                  <div key={emp.id} onMouseDown={()=>selectEmp(emp)}
                    style={{ padding:"0.65rem 0.875rem",cursor:"pointer",display:"flex",alignItems:"center",gap:"0.6rem",borderBottom:"1px solid #F8FAFC" }}
                    onMouseEnter={e=>e.currentTarget.style.background="#EFF6FF"}
                    onMouseLeave={e=>e.currentTarget.style.background="white"}>
                    <div style={{ width:28,height:28,borderRadius:"50%",background:"linear-gradient(135deg,#1D4ED8,#0EA5E9)",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:"0.78rem",flexShrink:0 }}>{emp.full_name.charAt(0)}</div>
                    <div>
                      <div style={{ fontSize:"0.8rem",fontWeight:600,color:"#0F172A" }}>{emp.full_name}</div>
                      <div style={{ fontSize:"0.68rem",color:"#94A3B8",fontFamily:"monospace" }}>{emp.employee_id}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {empId && (
            <div style={{ marginTop:"0.875rem",padding:"0.75rem",background:"#EFF6FF",borderRadius:10,border:"1px solid #DBEAFE" }}>
              <div style={{ fontSize:"0.68rem",fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:"0.15rem" }}>Currently Viewing</div>
              <div style={{ fontWeight:700,color:"#1D4ED8",fontSize:"0.875rem" }}>{empName || empId}</div>
              <div style={{ fontSize:"0.7rem",color:"#64748B",fontFamily:"monospace" }}>{empId}</div>
            </div>
          )}
        </div>

        {/* Monthly summary */}
        {empId && (
          <div style={{ background:"white",borderRadius:16,border:"1px solid #E2E8F0",boxShadow:"0 4px 20px rgba(0,0,0,0.06)",padding:"1.25rem" }}>
            <div style={{ fontSize:"0.7rem",fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"1rem" }}>{MONTHS[month]} Summary</div>
            {Object.entries(STATUSES).map(([key,s])=>(
              <div key={key} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0.5rem 0",borderBottom:"1px solid #F8FAFC" }}>
                <div style={{ display:"flex",alignItems:"center",gap:"0.5rem" }}>
                  <div style={{ width:8,height:8,borderRadius:"50%",background:s.dot,flexShrink:0 }} />
                  <span style={{ fontSize:"0.8rem",fontWeight:600,color:"#334155" }}>{key}</span>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:"0.5rem" }}>
                  <div style={{ height:5,width:52,borderRadius:99,background:"#F1F5F9",overflow:"hidden" }}>
                    <div style={{ height:"100%",width:`${Math.min(100,(summary[key]||0)/daysCount*100)}%`,background:s.color,borderRadius:99,transition:"width 0.4s" }} />
                  </div>
                  <span style={{ fontSize:"0.875rem",fontWeight:800,color:s.color,minWidth:18,textAlign:"right" }}>{summary[key]||0}</span>
                </div>
              </div>
            ))}
            <div style={{ marginTop:"0.875rem",padding:"0.65rem 0.875rem",background:"#F8FAFC",borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
              <span style={{ fontSize:"0.75rem",fontWeight:600,color:"#64748B" }}>Total marked</span>
              <span style={{ fontSize:"0.9rem",fontWeight:800,color:"#0F172A" }}>{monthRecords.length} / {daysCount} days</span>
            </div>
          </div>
        )}

        {/* Instructions when no employee */}
        {!empId && (
          <div style={{ background:"white",borderRadius:16,border:"1px solid #E2E8F0",boxShadow:"0 4px 20px rgba(0,0,0,0.06)",padding:"1.25rem" }}>
            <div style={{ fontSize:"0.7rem",fontWeight:700,color:"#94A3B8",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.875rem" }}>How to use</div>
            {["Enter an employee name or ID above","Click Load to fetch their attendance","Click any past date to mark or update","Use the month arrows to navigate"].map((text,i)=>(
              <div key={i} style={{ display:"flex",alignItems:"flex-start",gap:"0.75rem",padding:"0.5rem 0",borderBottom:i<3?"1px solid #F8FAFC":"none" }}>
                <div style={{ width:20,height:20,borderRadius:"50%",background:"#EFF6FF",color:"#1D4ED8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.68rem",fontWeight:800,flexShrink:0,marginTop:1 }}>{i+1}</div>
                <span style={{ fontSize:"0.8rem",color:"#64748B",lineHeight:1.5 }}>{text}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {markDate && (
        <MarkModal date={markDate} employeeId={empId} existing={records[markDate]} onSave={handleSave} onClose={()=>setMarkDate(null)} />
      )}
    </div>
  );
}

// ── MAIN PAGE ─────────────────────────────────────────
export default function Attendance() {
  const [tab, setTab]           = useState("mark");
  const [employees, setEmployees] = useState([]);
  const [toasts, setToasts]     = useState([]);

  const showToast = useCallback((message, type="info") => {
    const id = Date.now();
    setToasts(prev=>[...prev,{id,message,type}]);
    setTimeout(()=>setToasts(prev=>prev.filter(t=>t.id!==id)),4000);
  },[]);

  const removeToast = id => setToasts(prev=>prev.filter(t=>t.id!==id));

  useEffect(()=>{
    API.get("/employees").then(res=>setEmployees(res.data)).catch(()=>{});
  },[]);

  return (
    <>
      <style>{`@keyframes modalIn{from{transform:scale(0.95) translateY(10px);opacity:0}to{transform:scale(1) translateY(0);opacity:1}}`}</style>
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Page header */}
      <div style={{ marginBottom:"1.75rem" }}>
        <h1 style={{ fontSize:"1.5rem",fontWeight:800,color:"#0F172A",marginBottom:"0.25rem" }}>
          Attendance <span style={{ color:"#1D4ED8" }}>Management</span>
        </h1>
        <p style={{ color:"#64748B",fontSize:"0.875rem" }}>Mark and view employee attendance records.</p>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex",gap:"0",background:"#F1F5F9",borderRadius:12,padding:4,marginBottom:"1.75rem",width:"fit-content" }}>
        {[
          { key:"mark", label:"Mark Attendance" },
          { key:"calendar", label:"View Calendar" },
        ].map(t=>(
          <button key={t.key} onClick={()=>setTab(t.key)}
            style={{
              padding:"0.6rem 1.5rem",borderRadius:10,border:"none",cursor:"pointer",
              fontFamily:"Sora,sans-serif",fontSize:"0.82rem",fontWeight:700,
              background:tab===t.key?"white":"transparent",
              color:tab===t.key?"#1D4ED8":"#64748B",
              boxShadow:tab===t.key?"0 2px 8px rgba(0,0,0,0.08)":"none",
              transition:"all 0.2s"
            }}>{t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      {tab==="mark" && <MarkAttendanceTab employees={employees} showToast={showToast} />}
      {tab==="calendar" && <CalendarTab employees={employees} showToast={showToast} />}
    </>
  );
}
