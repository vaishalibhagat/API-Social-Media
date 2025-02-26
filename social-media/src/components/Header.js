import React from "react";
import {
  FaSearch,
  FaUserFriends,
  FaCommentDots,
  FaBell,
  FaCaretDown,
} from "react-icons/fa";
import "./Header.css";
import img from "./img2.jfif";

const Header = () => {
  return (
    <header className="header">
      {/* Logo Section */}
      <div className="logo">
        <h2>Square</h2>
      </div>

      {/* Search Input */}
      <div className="search-bar">
        <input type="text" placeholder="Search" />
        <FaSearch className="search-icon" />
      </div>

      {/* Icons Section */}
      <div className="header-icons">
        {/* <FaUserFriends />
        <FaCommentDots />
        <FaBell />
        <img src={img} alt="Profile" className="profile-pic" />
        <FaCaretDown /> */}
      </div>
    </header>
  );
};

export default Header;
