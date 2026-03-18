import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";

function Navbar() {
  const location = useLocation();
  return (
    <nav className="bg-gray-800 text-white p-4 flex gap-4">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, #1D4ED8, #0EA5E9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '1rem', fontWeight: 800
        }}>◈</span>
        <Link to="/" style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
          Employees<span style={{ color: '#3B82F6' }}>Attendance</span>
        </Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Link
          to="/attendance"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            fontSize: '0.78rem', fontWeight: 600,
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
            <path d="m9 16 2 2 4-4"/>
          </svg>
          Attendance
        </Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="page-wrapper">
        <Routes>
          <Route path="/" element={<Employees />} />
          <Route path="/attendance" element={<Attendance />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
