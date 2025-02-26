import React, { useState } from "react";
import { FaPaperPlane } from "react-icons/fa";
import "./Login.css";

const UserLogin = () => {
  const [userName, setUserName] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!userName || !imageFile) {
      alert("Username and image are required.");
      return;
    }

    const formData = new FormData();
    formData.append("UserName", userName);
    formData.append("ImageUrl", imageFile);

    try {
      const response = await fetch(
        "https://localhost:7222/api/SocialMedia/create-user",
        {
          method: "POST",
          headers: {
            Accept: "*/*",
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (data.isSuccess) {
        alert("User created successfully!");
        setUserName("");
        setImageFile(null);
      } else {
        alert(data.message || "Failed to create user.");
      }
    } catch (error) {
      alert("An error occurred while creating the user.");
    }
  };

  return (
    <div className="login-container">
      <div className="welcome-section">
        <h1>Welcome Here .!</h1>
        <button className="skip-button">Skip the lag ?</button>
      </div>
      <div className="login-section">
        <p>Glad you're here.!</p>
        <form onSubmit={handleCreateUser}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>

          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;
