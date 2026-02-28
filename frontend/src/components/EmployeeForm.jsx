import { useState } from "react";
import API from "../services/api";

function EmployeeForm({ onEmployeeAdded }) {
  const [formData, setFormData] = useState({
    employee_id: "",
    full_name: "",
    email: "",
    department: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await API.post("/employees", formData);
      setFormData({
        employee_id: "",
        full_name: "",
        email: "",
        department: ""
      });
      onEmployeeAdded(); // refresh list
    } catch (err) {
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          setError(detail[0].msg);
        } else {
          setError(detail);
        }
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xl font-semibold text-gray-800">Add New Employee</h2>
        <p className="text-sm text-gray-500 mt-1">Register a new employee into the system.</p>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700">Employee ID</label>
              <input
                id="employee_id"
                type="text"
                name="employee_id"
                placeholder="e.g. EMP-001"
                value={formData.employee_id}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                id="full_name"
                type="text"
                name="full_name"
                placeholder="John Doe"
                value={formData.full_name}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="john.doe@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
              <input
                id="department"
                type="text"
                name="department"
                placeholder="Engineering, HR, etc."
                value={formData.department}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm"
                required
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex justify-center items-center px-6 py-2.5 rounded-lg font-medium text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 hover:shadow-md active:bg-blue-800"
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmployeeForm;