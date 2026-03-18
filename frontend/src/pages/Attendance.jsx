import { useState, useCallback } from "react";
import API from "../services/api";

function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span style={{ fontSize: '1.1rem' }}>
            {t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span>{t.message}</span>
          <button className="toast-close" onClick={() => removeToast(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

export default function Attendance() {
  const [form, setForm] = useState({
    employee_id: "",
    date: new Date().toISOString().split("T")[0],
    status: "Present"
  });
  const [loading, setLoading]       = useState(false);
  const [fetchId, setFetchId]       = useState("");
  const [records, setRecords]       = useState([]);
  const [fetching, setFetching]     = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [toasts, setToasts]         = useState([]);

  const showToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/attendance", form);
      showToast(`Attendance marked as ${form.status} for ${form.employee_id}`, "success");
      setForm({ ...form, employee_id: "" });
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail[0].msg : (detail || "Failed to mark attendance");
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = async () => {
    if (!fetchId.trim()) { showToast("Please enter an Employee ID", "error"); return; }
    setFetching(true); setFetchError(""); setRecords([]);
    try {
      const res = await API.get(`/attendance/${fetchId}`);
      setRecords(res.data);
      if (res.data.length === 0) showToast("No attendance records found for this employee.", "info");
      else showToast(`Found ${res.data.length} attendance record(s).`, "success");
    } catch {
      setFetchError("Could not fetch attendance records.");
      showToast("Failed to fetch attendance records.", "error");
    } finally {
      setFetching(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === "Present") return "status-present";
    if (status === "Absent")  return "status-absent";
    return "status-late";
  };

  const exportCSV = () => {
    if (records.length === 0) return;
    const headers = ["Employee ID", "Date", "Status"];
    const rows = records.map(r => [r.employee_id, r.date, r.status]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `attendance_${fetchId}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Mark Attendance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50"
          style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.2rem' }}>📅</span>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Mark Attendance</h2>
            <p className="text-sm text-gray-500 mt-1">Record daily attendance for an employee.</p>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label>Employee ID</label>
                <input type="text" name="employee_id"
                  placeholder="e.g. EMP-001" value={form.employee_id}
                  onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label>Date</label>
                <input type="date" name="date"
                  value={form.date} onChange={handleChange} required />
              </div>
              <div className="space-y-2">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button type="submit" disabled={loading}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                {loading ? (
                  <>
                    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m9 12 2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
                    </svg>
                    Mark Attendance
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* View Attendance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.2rem' }}>🔍</span>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">View Attendance</h2>
              <p className="text-sm text-gray-500 mt-1">Search for an employee's attendance records.</p>
            </div>
          </div>
          {records.length > 0 && (
            <button className="btn-export" onClick={exportCSV}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5 5 5-5M12 4v11"/>
              </svg>
              Export CSV
            </button>
          )}
        </div>

        <div className="p-6">
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div className="search-bar" style={{ flex: 1 }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input type="text" placeholder="Enter Employee ID"
                value={fetchId} onChange={e => setFetchId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleFetch()} />
            </div>
            <button type="button" onClick={handleFetch} disabled={fetching}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
              {fetching ? "Fetching..." : "Fetch Records"}
            </button>
          </div>

          {records.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r, i) => (
                    <tr key={i}>
                      <td><span className="emp-id-col">{r.employee_id}</span></td>
                      <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem' }}>
                        {new Date(r.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td><span className={getStatusClass(r.status)}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
