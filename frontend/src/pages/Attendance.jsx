import { useState } from "react";
import AttendanceForm from "../components/AttendanceForm";
import AttendanceList from "../components/AttendanceList";

function Attendance() {
  const [refresh, setRefresh] = useState(false);

  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <AttendanceForm onMarked={handleRefresh} />
      <AttendanceList refresh={refresh} />
    </div>
  );
}

export default Attendance;