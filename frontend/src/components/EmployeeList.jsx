import { useEffect, useState } from "react";
import API from "../services/api";

function EmployeeList({ refresh }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEmployees = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await API.get("/employees");
      setEmployees(res.data);
    } catch (err) {
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) return;

    try {
      await API.delete(`/employees/${id}`);
      fetchEmployees();
    } catch {
      alert("Delete failed");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [refresh]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex justify-center items-center">
        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-500 font-medium">Loading employees...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <p className="text-red-500 font-medium">{error}</p>
        <button onClick={fetchEmployees} className="mt-4 text-blue-600 hover:underline text-sm font-medium">Try Again</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center sm:flex-row flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Employee Directory</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all your currently active employees.</p>
        </div>
        <div className="text-sm font-medium text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200">
          Total: {employees.length}
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="p-12 text-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-lg font-medium text-gray-900">No employees found</p>
          <p className="text-sm mt-1">Add a new employee using the form above to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Employee Id</th>
                <th className="px-6 py-4 font-semibold">Employee Name</th>                
                <th className="px-6 py-4 font-semibold">Contact Info</th>
                <th className="px-6 py-4 font-semibold">Department</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-gray-50 transition-colors group">
                  
                    <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {emp.employee_id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {emp.full_name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {emp.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {emp.department}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="text-red-500 hover:text-red-700 font-medium px-3 py-1.5 rounded hover:bg-red-50 transition-colors text-sm border border-transparent hover:border-red-100 focus:outline-none focus:ring-2 focus:ring-red-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EmployeeList;