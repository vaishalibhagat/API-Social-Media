import React from "react";
import { useUser } from "./UserContext";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const LogoutButton = () => {
  const { logout, userName } = useUser();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    alert("User Log-out..!");
    navigate("/account"); // Redirect to login page
  };

  return (
    <button className="login-buttons" onClick={handleLogout}>
      Log out of {userName}
    </button>
  );
};

export default LogoutButton;
