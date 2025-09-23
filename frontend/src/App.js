import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import EasyPlamLogin from "./pages/EasyPlamLogin";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import Mainpage from "./pages/mainpage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Mainpage />} />
        <Route path="/login" element={<EasyPlamLogin />} />
        <Route path="/dashboard" element={<EmployeeDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
