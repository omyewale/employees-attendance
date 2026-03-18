import { useState, useEffect, useCallback } from "react";
import API from "../services/api";

// ── TOAST SYSTEM ──────────────────────────────────────
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

// ── STATS CARD ────────────────────────────────────────
function StatCard({ icon, value, label, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: color + '18' }}>
        <span style={{ fontSize: '1.2rem' }}>{icon}</span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ── EMPLOYEE FORM ─────────────────────────────────────
function EmployeeForm({ onEmployeeAdded, showToast }) {
  const [formData, setFormData] = useState({
    employee_id: "", full_name: "", email: "", department: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/employees", formData);
      setFormData({ employee_id: "", full_name: "", email: "", department: "" });
      onEmployeeAdded();
      showToast("Employee added successfully!", "success");
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = Array.isArray(detail) ? detail[0].msg : (detail || "Something went wrong");
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50"
        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{ fontSize: '1.2rem' }}>👤</span>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Add New Employee</h2>
          <p className="text-sm text-gray-500 mt-1">Register a new employee into the system.</p>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="employee_id">Employee ID</label>
              <input id="employee_id" type="text" name="employee_id"
                placeholder="e.g. EMP-001" value={formData.employee_id}
                onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="full_name">Full Name</label>
              <input id="full_name" type="text" name="full_name"
                placeholder="John Doe" value={formData.full_name}
                onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="email">Email Address</label>
              <input id="email" type="email" name="email"
                placeholder="john.doe@example.com" value={formData.email}
                onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="department">Department</label>
              <input id="department" type="text" name="department"
                placeholder="Engineering, HR, etc." value={formData.department}
                onChange={handleChange} required />
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
                  Adding...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                  </svg>
                  Add Employee
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── EMPLOYEE LIST ─────────────────────────────────────
function EmployeeList({ employees, loading, error, onRetry, onDelete }) {
  const [search, setSearch] = useState("");

  const filtered = employees.filter(emp =>
    emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
    emp.employee_id.toLowerCase().includes(search.toLowerCase()) ||
    emp.department.toLowerCase().includes(search.toLowerCase()) ||
    emp.email.toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = () => {
    const headers = ["Employee ID", "Full Name", "Email", "Department"];
    const rows = employees.map(e => [e.employee_id, e.full_name, e.email, e.department]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "employees.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  // Stats
  const departments = [...new Set(employees.map(e => e.department))];

  return (
    <>
      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon="👥" value={employees.length} label="Total Employees" color="#1D4ED8" />
        <StatCard icon="🏢" value={departments.length} label="Departments" color="#0EA5E9" />
        <StatCard icon="✅" value={employees.length > 0 ? "Active" : "—"} label="Status" color="#10B981" />
        <StatCard icon="📅" value={new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} label="Today" color="#F59E0B" />
      </div>

      {/* Directory */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.2rem' }}>📋</span>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Employee Directory</h2>
                <p className="text-sm text-gray-500 mt-1">Manage all your currently active employees.</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              {/* Search */}
              <div className="search-bar" style={{ width: 220 }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input type="text" placeholder="Search employees..."
                  value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              {/* Export */}
              <button className="btn-export" onClick={exportCSV}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M7 10l5 5 5-5M12 4v11"/>
                </svg>
                Export CSV
              </button>
            </div>
          </div>

          <div style={{ marginTop: '0.875rem' }}>
            <span className="total-count">
              <span>{filtered.length}</span> of {employees.length} employees
            </span>
          </div>
        </div>

        <div className="p-6" style={{ padding: 0 }}>
          {loading && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-400)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
              Loading employees...
            </div>
          )}

          {error && (
            <div style={{ padding: '2rem' }}>
              <div style={{ background: 'var(--error-bg)', border: '1px solid #FECACA', color: '#991B1B', borderRadius: 10, padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>❌ Failed to load employees</span>
                <button onClick={onRetry} style={{ background: 'var(--error)', color: 'white', border: 'none', borderRadius: 8, padding: '0.35rem 0.85rem', fontSize: '0.78rem', cursor: 'pointer' }}>
                  Try Again
                </button>
              </div>
            </div>
          )}

          {!loading && !error && (
            <div style={{ overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Employee ID</th>
                    <th>Contact Info</th>
                    <th>Department</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>
                        {search ? `No results for "${search}"` : "No employees yet. Add your first employee above."}
                      </td>
                    </tr>
                  ) : filtered.map(emp => (
                    <tr key={emp.id}>
                      <td>
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase">
                            {emp.full_name.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{emp.full_name}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="emp-id-col">{emp.employee_id}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <rect width="20" height="16" x="2" y="4" rx="2"/>
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                          </svg>
                          <span style={{ fontSize: '0.82rem', color: 'var(--gray-500)' }}>{emp.email}</span>
                        </div>
                      </td>
                      <td>
                        <span className="dept-badge">{emp.department}</span>
                      </td>
                      <td>
                        <button onClick={() => onDelete(emp.id)}>Delete</button>
                      </td>
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

// ── MAIN PAGE ─────────────────────────────────────────
export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [toasts, setToasts]     = useState([]);

  const showToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const fetchEmployees = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const res = await API.get("/employees");
      setEmployees(res.data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await API.delete(`/employees/${id}`);
      fetchEmployees();
      showToast("Employee deleted successfully.", "success");
    } catch {
      showToast("Failed to delete employee.", "error");
    }
  };

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      <EmployeeForm onEmployeeAdded={fetchEmployees} showToast={showToast} />
      <EmployeeList
        employees={employees} loading={loading} error={error}
        onRetry={fetchEmployees} onDelete={handleDelete}
      />
    </>
  );
}
