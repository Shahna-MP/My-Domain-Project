import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Helper to format date safely
const formatDate = (value) => {
  if (!value) return "N/A";
  const date = new Date(value);
  return isNaN(date) ? "N/A" : date.toLocaleDateString();
};

function DomainList() {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/");
      return;
    }

    axios
      .get(`${import.meta.env.VITE_API_URL}/api/domains`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      .then((res) => setDomains(res.data))
      .catch((err) => {
        console.error("❌ API error:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/");
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  return (
    <div
      className="container my-5 p-4 rounded shadow-sm"
      style={{ maxWidth: "95vw", backgroundColor: "#f8fdf6" }}
    >
      <h1 className="mb-4 text-success fw-bold text-center">Domain List</h1>

      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-success text-success">
            <tr className="uniform-row text-center">
              <th>Sr. No.</th>
              <th>Domain</th>
              <th>Customer Name</th>
              <th>Company</th>
              <th>Email</th>
              <th>Creation Date</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Transfer Lock</th>
              <th>Domain Type</th>
              <th>Auto Renew</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {domains.map((d, i) => (
              <tr key={i} className="table-light uniform-row">
                <td>{i + 1}</td>
                <td>{d.domainName || "N/A"}</td>
                <td>{d.customerName || "N/A"}</td>
                <td>{d.company || "N/A"}</td>
                <td>{d.email || "N/A"}</td>
                <td>{formatDate(d.creationDate)}</td>
                <td>{formatDate(d.expiryDate)}</td>
                <td
                  className={
                    d.status?.toLowerCase() === "active"
                      ? "text-success"
                      : "text-danger"
                  }
                >
                  {d.status
                    ? d.status.charAt(0).toUpperCase() +
                      d.status.slice(1).toLowerCase()
                    : "N/A"}
                </td>
                <td>
                  {d.transferLock === true ? (
                    <span className="badge bg-success">Locked</span>
                  ) : d.transferLock === false ? (
                    <span className="badge bg-warning text-dark">Unlocked</span>
                  ) : (
                    <span className="badge bg-secondary">N/A</span>
                  )}
                </td>
                <td>{d.domainType || "N/A"}</td>
                <td>
                  {d.autoRenew === true ? (
                    <span className="badge bg-success">Enabled</span>
                  ) : d.autoRenew === false ? (
                    <span className="badge bg-danger">Disabled</span>
                  ) : (
                    <span className="badge bg-secondary">N/A</span>
                  )}
                </td>
                <td>{d.source || "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DomainList;
