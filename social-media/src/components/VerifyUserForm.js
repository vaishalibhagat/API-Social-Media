import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import "./Login.css";

const VerifyUserForm = () => {
  const [userIdInput, setUserIdInput] = useState("");
  const [error, setError] = useState("");
  const { setUserId, setUserName, setImageUrl } = useUser(); // Access the context setters
  const navigate = useNavigate();

  const handleVerifyUser = async (e) => {
    e.preventDefault();

    if (!userIdInput) {
      setError("User ID is required.");
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:7222/api/SocialMedia/verify-user/${userIdInput}`,
        {
          method: "GET",
          headers: {
            Accept: "*/*",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.isSuccess) {
        const { id, name, profile } = data.result;

        // Update context with the user details
        setUserId(id);
        setUserName(name);
        setImageUrl(profile);

        // Navigate to the main page
        navigate("/");
      } else {
        setError(data.message || "User not found.");
      }
    } catch (error) {
      console.error("Error verifying user:", error);
      setError("An error occurred while verifying the user.");
    }
  };

  return (
    <div className="login-container">
      <div className="welcome-section">
        <h1>Welcome Here .!</h1>
        <button className="skip-button" onClick={() => navigate("/")}>
          Skip the lag?
        </button>
      </div>
      <div className="login-section">
        <p>Glad you're here.!</p>
        <h1>Verify User</h1>
        <form onSubmit={handleVerifyUser}>
          <div className="input-group">
            <label htmlFor="userId">User ID</label>
            <input
              type="text"
              id="userId"
              placeholder="Enter User ID"
              value={userIdInput}
              onChange={(e) => setUserIdInput(e.target.value)}
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-button">
            Verify
          </button>
          <p></p>
          <button
            className="navigate-login-button"
            onClick={() => navigate("/login")}
          >
            <span
              style={{
                backgroundColor: "transparent",
                color: "white",
                textDecoration: "none",
                marginRight: "5px",
              }}
            >
              No Account
            </span>
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyUserForm;
