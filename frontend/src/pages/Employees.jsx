import { useState } from "react";
import EmployeeForm from "../components/EmployeeForm";
import EmployeeList from "../components/EmployeeList";

function Employees() {
  const [refresh, setRefresh] = useState(false);

  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <EmployeeForm onEmployeeAdded={handleRefresh} />
      <EmployeeList refresh={refresh} />
    </div>
  );
}

export default Employees;