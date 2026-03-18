import { useState, useEffect, useCallback } from "react";
import API from "../services/api";

function Toast({ toasts, removeToast }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type === 'success' ? '✅' : t.type === 'error' ? '❌' : 'ℹ️'}</span>
          <span>{t.message}</span>
          <button className="toast-close" onClick={() => removeToast(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}

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

function DeleteModal({ employee, onConfirm, onCancel }) {
  if (!employee) return null;
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(15,23,42,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'1rem' }}>
      <div style={{ background:'white',borderRadius:20,padding:'2rem',maxWidth:420,width:'100%',boxShadow:'0 25px 60px rgba(0,0,0,0.15)',animation:'modalIn 0.2s ease' }}>
        <div style={{ textAlign:'center',marginBottom:'1.5rem' }}>
          <div style={{ width:56,height:56,borderRadius:'50%',background:'#FEF2F2',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem',fontSize:'1.5rem' }}>🗑️</div>
          <h3 style={{ fontSize:'1.1rem',fontWeight:700,color:'#0F172A',marginBottom:'0.5rem' }}>Delete Employee?</h3>
          <p style={{ color:'#64748B',fontSize:'0.875rem',lineHeight:1.6 }}>
            You are about to permanently delete<br />
            <strong style={{ color:'#0F172A' }}>{employee.full_name}</strong><br />
            <span style={{ fontSize:'0.78rem',fontFamily:'monospace',background:'#F1F5F9',padding:'0.1rem 0.4rem',borderRadius:4 }}>{employee.employee_id}</span>
            <br /><br />This action <strong>cannot be undone.</strong>
          </p>
        </div>
        <div style={{ display:'flex',gap:'0.75rem' }}>
          <button onClick={onCancel} style={{ flex:1,padding:'0.65rem',background:'#F1F5F9',color:'#334155',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.875rem',cursor:'pointer' }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex:1,padding:'0.65rem',background:'#EF4444',color:'white',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.875rem',cursor:'pointer',boxShadow:'0 4px 14px rgba(239,68,68,0.35)' }}>Yes, Delete</button>
        </div>
      </div>
    </div>
  );
}

function ProfileModal({ employee, onClose, onEdit, onDelete }) {
  if (!employee) return null;
  const initials = employee.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const isActive = employee.active !== false;
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(15,23,42,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'1rem' }}>
      <div style={{ background:'white',borderRadius:20,maxWidth:480,width:'100%',boxShadow:'0 25px 60px rgba(0,0,0,0.15)',overflow:'hidden',animation:'modalIn 0.2s ease' }}>
        <div style={{ background:'linear-gradient(135deg,#1D4ED8,#0EA5E9)',padding:'2rem',textAlign:'center',position:'relative' }}>
          <button onClick={onClose} style={{ position:'absolute',top:'1rem',right:'1rem',background:'rgba(255,255,255,0.2)',border:'none',color:'white',width:32,height:32,borderRadius:'50%',cursor:'pointer',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center' }}>✕</button>
          <div style={{ width:72,height:72,borderRadius:'50%',background:'rgba(255,255,255,0.25)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem',fontSize:'1.5rem',fontWeight:800,color:'white',border:'3px solid rgba(255,255,255,0.4)' }}>{initials}</div>
          <h2 style={{ color:'white',fontWeight:800,fontSize:'1.2rem',marginBottom:'0.5rem' }}>{employee.full_name}</h2>
          <span style={{ background: isActive?'#ECFDF5':'#F1F5F9',color:isActive?'#10B981':'#94A3B8',fontSize:'0.72rem',fontWeight:700,padding:'0.2rem 0.75rem',borderRadius:20,display:'inline-block' }}>
            {isActive ? '● Active' : '⏸ Inactive'}
          </span>
        </div>
        <div style={{ padding:'1.5rem' }}>
          {[
            { icon:'🪪', label:'Employee ID', value:employee.employee_id },
            { icon:'✉️', label:'Email', value:employee.email },
            { icon:'🏢', label:'Department', value:employee.department },
          ].map(item => (
            <div key={item.label} style={{ display:'flex',alignItems:'center',gap:'1rem',padding:'0.875rem 0',borderBottom:'1px solid #F1F5F9' }}>
              <div style={{ width:36,height:36,borderRadius:10,background:'#EFF6FF',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',flexShrink:0 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize:'0.7rem',fontWeight:600,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'0.06em' }}>{item.label}</div>
                <div style={{ fontSize:'0.9rem',fontWeight:600,color:'#0F172A',marginTop:'0.1rem' }}>{item.value}</div>
              </div>
            </div>
          ))}
          <div style={{ display:'flex',gap:'0.75rem',marginTop:'1.5rem' }}>
            <button onClick={() => onEdit(employee)} style={{ flex:1,padding:'0.65rem',background:'#EFF6FF',color:'#1D4ED8',border:'1.5px solid #DBEAFE',borderRadius:10,fontWeight:600,fontSize:'0.82rem',cursor:'pointer' }}>✏️ Edit Details</button>
            <button onClick={() => onDelete(employee)} style={{ flex:1,padding:'0.65rem',background:'#FEF2F2',color:'#EF4444',border:'1.5px solid #FECACA',borderRadius:10,fontWeight:600,fontSize:'0.82rem',cursor:'pointer' }}>🗑️ Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditModal({ employee, onSave, onCancel }) {
  const [form, setForm] = useState({ ...employee });
  const [saving, setSaving] = useState(false);
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put(`/employees/${employee.id}`, { full_name:form.full_name, email:form.email, department:form.department });
      onSave();
    } catch {
      onSave(form);
    } finally { setSaving(false); }
  };
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(15,23,42,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'1rem' }}>
      <div style={{ background:'white',borderRadius:20,padding:'2rem',maxWidth:440,width:'100%',boxShadow:'0 25px 60px rgba(0,0,0,0.15)',animation:'modalIn 0.2s ease' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.5rem' }}>
          <h3 style={{ fontSize:'1.1rem',fontWeight:700,color:'#0F172A' }}>✏️ Edit Employee</h3>
          <button onClick={onCancel} style={{ background:'#F1F5F9',border:'none',width:32,height:32,borderRadius:'50%',cursor:'pointer',fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center' }}>✕</button>
        </div>
        <div style={{ display:'flex',flexDirection:'column',gap:'1rem' }}>
          {[
            { name:'full_name', label:'Full Name', placeholder:'John Doe' },
            { name:'email', label:'Email Address', placeholder:'john@example.com' },
            { name:'department', label:'Department', placeholder:'Engineering' },
          ].map(field => (
            <div key={field.name}>
              <label style={{ display:'block',fontSize:'0.72rem',fontWeight:600,color:'#94A3B8',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'0.35rem' }}>{field.label}</label>
              <input type="text" name={field.name} value={form[field.name]} onChange={handleChange} placeholder={field.placeholder}
                style={{ width:'100%',border:'1.5px solid #E2E8F0',borderRadius:10,padding:'0.65rem 1rem',fontFamily:'Sora,sans-serif',fontSize:'0.875rem',color:'#0F172A',outline:'none' }} />
            </div>
          ))}
        </div>
        <div style={{ display:'flex',gap:'0.75rem',marginTop:'1.5rem' }}>
          <button onClick={onCancel} style={{ flex:1,padding:'0.65rem',background:'#F1F5F9',color:'#334155',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.875rem',cursor:'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={saving} style={{ flex:1,padding:'0.65rem',background:'#1D4ED8',color:'white',border:'none',borderRadius:10,fontWeight:600,fontSize:'0.875rem',cursor:'pointer',opacity:saving?0.7:1 }}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EmployeeForm({ onEmployeeAdded, showToast }) {
  const [formData, setFormData] = useState({ employee_id:"", full_name:"", email:"", department:"" });
  const [loading, setLoading] = useState(false);
  const handleChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      await API.post("/employees", formData);
      setFormData({ employee_id:"", full_name:"", email:"", department:"" });
      onEmployeeAdded();
      showToast(`${formData.full_name} added successfully!`, "success");
    } catch (err) {
      const detail = err.response?.data?.detail;
      showToast(Array.isArray(detail) ? detail[0].msg : (detail || "Something went wrong"), "error");
    } finally { setLoading(false); }
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50" style={{ display:'flex',alignItems:'center',gap:'0.6rem' }}>
        <span style={{ fontSize:'1.2rem' }}>👤</span>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Add New Employee</h2>
          <p className="text-sm text-gray-500 mt-1">Register a new employee into the system.</p>
        </div>
      </div>
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id:'employee_id', label:'Employee ID', placeholder:'e.g. EMP-001' },
              { id:'full_name', label:'Full Name', placeholder:'John Doe' },
              { id:'email', label:'Email Address', placeholder:'john.doe@example.com', type:'email' },
              { id:'department', label:'Department', placeholder:'Engineering, HR, etc.' },
            ].map(f => (
              <div key={f.id} className="space-y-2">
                <label htmlFor={f.id}>{f.label}</label>
                <input id={f.id} type={f.type||'text'} name={f.id} placeholder={f.placeholder} value={formData[f.id]} onChange={handleChange} required />
              </div>
            ))}
          </div>
          <div className="pt-2 flex justify-end">
            <button type="submit" disabled={loading} style={{ display:'inline-flex',alignItems:'center',gap:'0.5rem' }}>
              {loading ? 'Adding...' : '+ Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EmployeeList({ employees, loading, error, onRetry, onDelete, onUpdate, showToast }) {
  const [search, setSearch]           = useState("");
  const [deptFilter, setDeptFilter]   = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [profileEmp, setProfileEmp]   = useState(null);
  const [editEmp, setEditEmp]         = useState(null);
  const [deleteEmp, setDeleteEmp]     = useState(null);
  const [localEmps, setLocalEmps]     = useState(employees);

  useEffect(() => { setLocalEmps(employees); }, [employees]);

  const departments = ["All", ...new Set(employees.map(e => e.department))];
  const activeCount   = localEmps.filter(e => e.active !== false).length;
  const inactiveCount = localEmps.filter(e => e.active === false).length;

  const filtered = localEmps.filter(emp => {
    const q = search.toLowerCase();
    const matchSearch = emp.full_name.toLowerCase().includes(q) || emp.employee_id.toLowerCase().includes(q) || emp.email.toLowerCase().includes(q) || emp.department.toLowerCase().includes(q);
    const matchDept   = deptFilter === "All" || emp.department === deptFilter;
    const matchStatus = statusFilter === "All" || (statusFilter === "Active" && emp.active !== false) || (statusFilter === "Inactive" && emp.active === false);
    return matchSearch && matchDept && matchStatus;
  });

  const toggleStatus = (emp) => {
    setLocalEmps(prev => prev.map(e => e.id === emp.id ? { ...e, active: e.active === false } : e));
    showToast(`${emp.full_name} marked as ${emp.active === false ? 'Active' : 'Inactive'}`, "info");
  };

  const exportCSV = () => {
    const headers = ["Employee ID","Full Name","Email","Department","Status"];
    const rows = localEmps.map(e => [e.employee_id, e.full_name, e.email, e.department, e.active!==false?"Active":"Inactive"]);
    const csv = [headers,...rows].map(r=>r.map(v=>`"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv],{type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="employees.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleEditSave = (updatedForm) => {
    if (updatedForm) setLocalEmps(prev => prev.map(e => e.id === updatedForm.id ? {...e,...updatedForm} : e));
    else onUpdate();
    setEditEmp(null); setProfileEmp(null);
    showToast("Employee updated successfully!", "success");
  };

  const confirmDelete = async () => {
    try { await onDelete(deleteEmp.id); setDeleteEmp(null); setProfileEmp(null); }
    catch { showToast("Failed to delete.", "error"); }
  };

  return (
    <>
      <div className="stats-grid">
        <StatCard icon="👥" value={localEmps.length} label="Total Employees" color="#1D4ED8" />
        <StatCard icon="✅" value={activeCount}      label="Active"          color="#10B981" />
        <StatCard icon="⏸️" value={inactiveCount}    label="Inactive"        color="#94A3B8" />
        <StatCard icon="🏢" value={departments.length-1} label="Departments" color="#0EA5E9" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:'1rem',marginBottom:'1rem' }}>
            <div style={{ display:'flex',alignItems:'center',gap:'0.6rem' }}>
              <span style={{ fontSize:'1.2rem' }}>📋</span>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Employee Directory</h2>
                <p className="text-sm text-gray-500 mt-1">Click any row to view full profile.</p>
              </div>
            </div>
            <button className="btn-export" onClick={exportCSV}>⬇ Export CSV</button>
          </div>
          <div style={{ display:'flex',gap:'0.75rem',flexWrap:'wrap',alignItems:'center' }}>
            <div className="search-bar" style={{ flex:'1 1 200px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input type="text" placeholder="Search by name, ID, email..." value={search} onChange={e=>setSearch(e.target.value)} />
            </div>
            <select value={deptFilter} onChange={e=>setDeptFilter(e.target.value)}
              style={{ border:'1.5px solid #E2E8F0',borderRadius:10,padding:'0.55rem 1rem',fontSize:'0.82rem',color:'#334155',background:'white',cursor:'pointer',minWidth:140 }}>
              {departments.map(d=><option key={d}>{d}</option>)}
            </select>
            <div style={{ display:'flex',borderRadius:10,border:'1.5px solid #E2E8F0',overflow:'hidden' }}>
              {["All","Active","Inactive"].map(s=>(
                <button key={s} onClick={()=>setStatusFilter(s)} style={{ padding:'0.5rem 0.875rem',border:'none',cursor:'pointer',fontSize:'0.78rem',fontWeight:600,background:statusFilter===s?'#1D4ED8':'white',color:statusFilter===s?'white':'#64748B',transition:'all 0.15s' }}>{s}</button>
              ))}
            </div>
          </div>
          <div style={{ marginTop:'0.75rem' }}>
            <span style={{ fontSize:'0.78rem',fontWeight:600,color:'#64748B',background:'#F1F5F9',padding:'0.25rem 0.75rem',borderRadius:20 }}>
              {filtered.length} of {localEmps.length} employees
            </span>
          </div>
        </div>

        {loading && <div style={{ padding:'3rem',textAlign:'center',color:'#94A3B8' }}><div style={{ fontSize:'2rem',marginBottom:'0.5rem' }}>⏳</div>Loading...</div>}

        {error && (
          <div style={{ padding:'2rem' }}>
            <div style={{ background:'#FEF2F2',border:'1px solid #FECACA',color:'#991B1B',borderRadius:10,padding:'1rem',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
              <span>❌ Failed to load employees</span>
              <button onClick={onRetry} style={{ background:'#EF4444',color:'white',border:'none',borderRadius:8,padding:'0.35rem 0.85rem',fontSize:'0.78rem',cursor:'pointer' }}>Try Again</button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div style={{ overflowX:'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign:'center',padding:'3rem',color:'#94A3B8' }}>
                    {search||deptFilter!=="All"?"No matching employees found.":"No employees yet."}
                  </td></tr>
                ) : filtered.map(emp => (
                  <tr key={emp.id} style={{ cursor:'pointer' }} onClick={()=>setProfileEmp(emp)}>
                    <td>
                      <div style={{ display:'flex',alignItems:'center',gap:'0.75rem' }}>
                        <div style={{ width:38,height:38,borderRadius:'50%',background:emp.active===false?'linear-gradient(135deg,#94A3B8,#CBD5E1)':'linear-gradient(135deg,#1D4ED8,#0EA5E9)',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:'0.9rem',flexShrink:0,boxShadow:'0 2px 8px rgba(29,78,216,0.2)' }}>
                          {emp.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight:600,color:'#0F172A',fontSize:'0.875rem' }}>{emp.full_name}</div>
                          <div style={{ fontSize:'0.72rem',color:'#94A3B8' }}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td onClick={e=>e.stopPropagation()}><span className="emp-id-col">{emp.employee_id}</span></td>
                    <td onClick={e=>e.stopPropagation()}><span className="dept-badge">{emp.department}</span></td>
                    <td onClick={e=>e.stopPropagation()}>
                      <button onClick={()=>toggleStatus(emp)} style={{ padding:'0.25rem 0.75rem',borderRadius:20,border:'none',fontSize:'0.72rem',fontWeight:700,cursor:'pointer',background:emp.active===false?'#F1F5F9':'#ECFDF5',color:emp.active===false?'#94A3B8':'#10B981',transition:'all 0.2s' }}>
                        {emp.active===false?'⏸ Inactive':'● Active'}
                      </button>
                    </td>
                    <td onClick={e=>e.stopPropagation()}>
                      <div style={{ display:'flex',gap:'0.5rem' }}>
                        <button onClick={()=>setEditEmp(emp)} style={{ padding:'0.3rem 0.7rem',borderRadius:8,background:'#EFF6FF',color:'#1D4ED8',border:'1px solid #DBEAFE',fontSize:'0.72rem',fontWeight:600,cursor:'pointer' }}>✏️ Edit</button>
                        <button onClick={()=>setDeleteEmp(emp)} style={{ padding:'0.3rem 0.7rem',borderRadius:8,background:'#FEF2F2',color:'#EF4444',border:'1px solid #FECACA',fontSize:'0.72rem',fontWeight:600,cursor:'pointer' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {profileEmp && !editEmp && !deleteEmp && (
        <ProfileModal employee={profileEmp} onClose={()=>setProfileEmp(null)} onEdit={e=>setEditEmp(e)} onDelete={e=>setDeleteEmp(e)} />
      )}
      {editEmp && <EditModal employee={editEmp} onSave={handleEditSave} onCancel={()=>setEditEmp(null)} />}
      {deleteEmp && <DeleteModal employee={deleteEmp} onConfirm={confirmDelete} onCancel={()=>setDeleteEmp(null)} />}
    </>
  );
}

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(false);
  const [toasts, setToasts]       = useState([]);

  const showToast = useCallback((message, type="info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = id => setToasts(prev => prev.filter(t => t.id !== id));

  const fetchEmployees = useCallback(async () => {
    setLoading(true); setError(false);
    try { const res = await API.get("/employees"); setEmployees(res.data); }
    catch { setError(true); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const handleDelete = async (id) => {
    await API.delete(`/employees/${id}`);
    fetchEmployees();
    showToast("Employee deleted successfully.", "success");
  };

  return (
    <>
      <style>{`@keyframes modalIn { from{transform:scale(0.95) translateY(10px);opacity:0} to{transform:scale(1) translateY(0);opacity:1} }`}</style>
      <Toast toasts={toasts} removeToast={removeToast} />
      <EmployeeForm onEmployeeAdded={fetchEmployees} showToast={showToast} />
      <EmployeeList employees={employees} loading={loading} error={error} onRetry={fetchEmployees} onDelete={handleDelete} onUpdate={fetchEmployees} showToast={showToast} />
    </>
  );
}
