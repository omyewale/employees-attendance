import { useState, useEffect } from "react";
import API from "../services/api";

function AttendanceList({ refresh }) {
  const [employeeId, setEmployeeId] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Attempt to refresh data if it was already searched
  useEffect(() => {
    if (hasSearched && employeeId) {
      fetchAttendance();
    }
  }, [refresh]);

  const fetchAttendance = async () => {
    if (!employeeId.trim()) {
      setError("Please enter an Employee ID to search");
      return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const res = await API.get(`/attendance/${employeeId}`);
      if (Array.isArray(res.data)) {
        setRecords(res.data);
      } else {
        setRecords([]);
        setError("Invalid data format received.");
      }
    } catch {
      setRecords([]);
      // A common case when searching for an ID that doesn't exist
      setError("Failed to load attendance or employee not found");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "present":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Present</span>;
      case "absent":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Absent</span>;
      case "leave":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Leave</span>;
      case "half day":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Half Day</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">View Attendance</h2>
          <p className="text-sm text-gray-500 mt-1">Search for an employee's attendance records.</p>
        </div>

        <div className="flex w-full md:w-auto mt-2 md:mt-0">
          <div className="relative flex items-stretch flex-grow rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              name="employeeId"
              id="employeeId"
              className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-gray-300 px-4 py-2 border transition-colors bg-white"
              placeholder="Enter Employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchAttendance()}
            />
          </div>
          <button
            type="button"
            onClick={fetchAttendance}
            className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-blue-600 text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            Fetch
          </button>
        </div>
      </div>

      <div className="p-0">
        {loading && (
          <div className="p-12 flex justify-center items-center">
            <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-500 font-medium">Loading records...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-8 text-center bg-red-50 border-b border-red-100">
            <p className="text-red-600 font-medium">{error}</p>
          </div>
        )}

        {!hasSearched && !loading && !error && (
          <div className="p-12 text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-lg font-medium text-gray-900">Search for Records</p>
            <p className="text-sm mt-1">Enter an Employee ID above to view their attendance history.</p>
          </div>
        )}

        {hasSearched && !loading && records.length === 0 && !error && (
          <div className="p-12 text-center text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium text-gray-900">No records found</p>
            <p className="text-sm mt-1">This employee currently has no attendance records.</p>
          </div>
        )}

        {records.length > 0 && !loading && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Attended Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {new Date(rec.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(rec.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceList;