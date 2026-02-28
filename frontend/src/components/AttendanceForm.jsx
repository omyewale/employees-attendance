import { useState } from "react";
import API from "../services/api";

function AttendanceForm({ onMarked }) {
  const [formData, setFormData] = useState({
    employee_id: "",
    date: "",
    status: "Present"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
    setSuccess("");

    try {
      await API.post("/attendance", {
        employee_id: formData.employee_id,
        date: formData.date,
        status: formData.status
      });

      setSuccess("Attendance marked successfully");

      // reset form
      setFormData({
        employee_id: "",
        date: "",
        status: "Present"
      });

      onMarked();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to mark attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-xl font-semibold text-gray-800">Mark Attendance</h2>
        <p className="text-sm text-gray-500 mt-1">Record daily attendance for an employee.</p>
      </div>

      <div className="p-6">
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 col-span-1 md:col-span-1">
              <label htmlFor="employee_id" className="block text-sm font-medium text-gray-700">Employee ID</label>
              <input
                id="employee_id"
                type="text"
                name="employee_id"
                placeholder="e.g. EMP-001"
                value={formData.employee_id}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                required
              />
            </div>

            <div className="space-y-2 col-span-1 md:col-span-1">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input
                id="date"
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm"
                required
              />
            </div>

            <div className="space-y-2 col-span-1 md:col-span-1">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors shadow-sm bg-white"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Half Day">Half Day</option>
                <option value="Leave">Leave</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`inline-flex justify-center items-center px-6 py-2.5 rounded-lg font-medium text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${loading
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 hover:shadow-md active:bg-green-800"
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : "Mark Attendance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AttendanceForm;