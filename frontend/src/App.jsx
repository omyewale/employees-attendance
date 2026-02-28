import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";

function App() {
  return (
    <BrowserRouter>
      <nav className="bg-gray-800 text-white p-4 flex gap-4">
        <Link to="/">Employees</Link>
        <Link to="/attendance">Attendance</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Employees />} />
        <Route path="/attendance" element={<Attendance />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;