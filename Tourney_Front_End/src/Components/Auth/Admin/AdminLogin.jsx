import React from "react";
import "../CSS/PlayerLogin.css";
import { useState, useContext } from "react";
import { IoChevronBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { AdminContext } from "../../../Contexts/AdminContext/AdminContext";
import { toast } from "react-toastify";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginAdmin, token, admin } = useContext(AdminContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password.trim()) return;

    setIsSubmitting(true);

    // Simulate API call delay
    setTimeout(() => {
      const loginResult = loginAdmin(formData.email, formData.password);

      if (loginResult.success) {
        toast.success("Welcome Admin! Login successful");
        console.log("JWT Token:", loginResult.token);
        navigate("/admin/dashboard");
      } else {
        toast.error(loginResult.message);
      }

      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="player-login-container">
      <div className="player-login-wrapper">
        <button
          className="player-back-button"
          onClick={() => {
            navigate("/roleSelection");
          }}
        >
          <IoChevronBack className="player-back-icon" />
          Back to role selection
        </button>

        <div className="player-login-card">
          <div className="player-login-header">
            <h1 className="player-login-title">Admin Login</h1>
            <p className="player-login-subtitle">Access your admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="player-login-form">
            <div className="player-form-group">
              <label htmlFor="adminEmail" className="player-form-label">
                Email
              </label>
              <input
                type="email"
                id="adminEmail"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="player-form-input"
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="player-form-group">
              <label htmlFor="adminPassword" className="player-form-label">
                Password
              </label>
              <input
                type="password"
                id="adminPassword"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="player-form-input"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="player-signin-button"
              disabled={
                isSubmitting ||
                !formData.email.trim() ||
                !formData.password.trim()
              }
            >
              {isSubmitting ? "Signing In..." : "Sign In as Admin"}
            </button>

            {/* Demo credentials */}
            <div
              className="demo-credentials"
              style={{
                marginTop: "20px",
                padding: "15px",
                backgroundColor: "#f8f9fa",
                borderRadius: "8px",
                border: "1px solid #e9ecef",
              }}
            >
              <h4
                style={{
                  margin: "0 0 10px 0",
                  color: "#333",
                  fontSize: "14px",
                }}
              >
                Demo Login Credentials:
              </h4>
              <div style={{ fontSize: "12px", color: "#666" }}>
                <p style={{ margin: "5px 0" }}>
                  <strong>Email:</strong> admin@sportshub.com
                </p>
                <p style={{ margin: "5px 0" }}>
                  <strong>Password:</strong> admin123
                </p>
              </div>

              {/* Show current session info */}
              {token && admin && (
                <div
                  style={{
                    marginTop: "15px",
                    padding: "10px",
                    backgroundColor: "#d4edda",
                    borderRadius: "6px",
                    borderLeft: "4px solid #28a745",
                  }}
                >
                  <p
                    style={{ margin: "0", fontSize: "12px", color: "#155724" }}
                  >
                    ✅ <strong>Logged in as:</strong> {admin.name}
                  </p>
                  <p
                    style={{
                      margin: "5px 0 0 0",
                      fontSize: "11px",
                      color: "#155724",
                      fontFamily: "monospace",
                    }}
                  >
                    <strong>Token:</strong> {token.substring(0, 20)}...
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;