// src/Sidebar.js
import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaUserFriends,
  FaImages,
  FaArchive,
  FaBookmark,
  FaPlusSquare,
  FaGear,
  FaTimes,
  FaPaperPlane,
  FaChevronUp,
  FaChevronDown,
  FaShare,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useUser } from "../components/UserContext"; // Import the custom hook
import "./Sidebar.css";
import logo from "./image.png";
import LogoutButton from "./LogoutButton";
import { Share } from "lucide-react";
import { PiShareDuotone } from "react-icons/pi";

const Sidebar = () => {
  const navigate = useNavigate();
  // const { userId } = useUser(); // Get userId from context
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userNames, setUserName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const { userId, userName, imageUrl } = useUser();
  const currentPage = location.pathname;

  useEffect(() => {
    fetch(
      "https://localhost:7222/api/SocialMedia/get-all-users?pageNumber=1&pageSize=10"
    )
      .then((response) => response.json())
      .then((data) => {
        setUsers(data.result.users);
        // Find the user with the userId from context
        const selectedUser = data.result.users.find(
          (user) => user.userId === userId
        );
        if (selectedUser) {
          setCurrentUser(selectedUser);
        }
      })
      .catch((error) => console.error("Error fetching users:", error));
  }, [userId]); // Re-run effect if userId changes

  const handleUserChange = (userId) => {
    const selectedUser = users.find((user) => user.userId === userId);
    if (selectedUser) {
      setCurrentUser(selectedUser);
    }
  };

  const handleSwitchAccount = (user) => {
    setCurrentUser(user);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prevState) => !prevState);
  };

  const handleAccountClick = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setUserName("");
    setImageFile(null);
  };

  const handleCreateUser = async () => {
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
        setIsModalOpen(false);
        setUserName("");
        setImageFile(null);
        // Refetch users after creating a new user
        fetch(
          "https://localhost:7222/api/SocialMedia/get-all-users?pageNumber=1&pageSize=10"
        )
          .then((response) => response.json())
          .then((data) => setUsers(data.result.users));
      } else {
        alert(data.message || "Failed to create user.");
      }
    } catch (error) {
      alert("An error occurred while creating the user.");
    }
  };

  return (
    <div className="sidebar">
      {/* <div>
        {userName && imageUrl && (
          <div className="profile-section">
            <img
              src={`https://localhost:7222${imageUrl}`}
              alt="Profile"
              className="profile-pic"
            />
            <div>
              <h4>{userName}</h4>
              <span>@{userName.toLowerCase()}</span>
            </div>
          </div>
        )}
      </div> */}
      <div className="logout">
        {" "}
        <LogoutButton />
      </div>
      <div className="logos">
        <h2 style={{ color: "#2e8ef1", marginLeft: "3px" }}>
          Media
          <span style={{ color: "lightgreen", marginLeft: "3px" }}>wow</span>
        </h2>
      </div>
      {/* Menu Section */}
      <ul className="menu">
        <li
          onClick={() => navigate("/")}
          className={currentPage === "/" ? "selected" : ""}
        >
          <FaHome /> Home
        </li>
        <li
          onClick={() => navigate("/friends")}
          className={currentPage === "/friends" ? "selected" : ""}
        >
          <FaUserFriends /> Friends
        </li>
        <li
          onClick={() => navigate("/account")}
          className={currentPage === "/account" ? "selected" : ""}
        >
          <FaPlusSquare /> Account
        </li>
        <li
          onClick={() => navigate("/post")}
          className={currentPage === "/post" ? "selected" : ""}
        >
          <FaImages /> Profile
        </li>
        <li
          onClick={() => navigate("/archive")}
          className={currentPage === "/archive" ? "selected" : ""}
        >
          <FaArchive /> Archive
        </li>
        <li
          onClick={() => navigate("/saved")}
          className={currentPage === "/saved" ? "selected" : ""}
        >
          <FaBookmark /> Saved
        </li>
        <li
          onClick={() => navigate("/shared")}
          className={currentPage === "/shared" ? "selected" : ""}
        >
          <FaShare /> Shared Post
        </li>
      </ul>{" "}
      {/* Modal Section */}
      {isModalOpen && (
        <div className="modall">
          <div className="modall-content">
            <button onClick={handleCancel} className="modal-cancel-btn">
              <FaTimes />
            </button>
            <input
              type="file"
              className="input-img"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
            <input
              type="text"
              placeholder="Enter username"
              value={userName}
              className="modal-input"
              onChange={(e) => setUserName(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={handleCreateUser} className="modal-post-btn">
                <FaPaperPlane style={{ marginRight: "5px" }} />
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
