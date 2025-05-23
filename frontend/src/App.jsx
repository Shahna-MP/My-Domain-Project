import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import DomainList from "./pages/DomainList";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/domains" element={<DomainList />} />
    </Routes>
  );
}

export default App;
