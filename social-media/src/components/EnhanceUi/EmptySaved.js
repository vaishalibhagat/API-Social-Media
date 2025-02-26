import { Bookmark, Save } from "lucide-react";
import "./EmptyPostsState.css";
import React, { useState, useRef } from "react";
import { FaBookmark, FaSave } from "react-icons/fa";

const EmptySaved = () => {
  return (
    <div className="empty-states">
      <div className="camera-icon-wrapper">
        <Bookmark size={42} />
      </div>

      <p className="empty-state-text">
        Save photos that you want to see again. No one is notified, and only you
        can see what you've saved.
      </p>
    </div>
  );
};

export default EmptySaved;
