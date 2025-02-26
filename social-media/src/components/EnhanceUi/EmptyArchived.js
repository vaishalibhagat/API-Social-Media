import { Bookmark, History, Save } from "lucide-react";
import "./EmptyPostsState.css";
import React, { useState, useRef } from "react";
import { FaBookmark, FaSave } from "react-icons/fa";

const EmptyArchived = () => {
  return (
    <div className="empty-states">
      <div className="camera-icon-wrapper">
        <History size={42} />
      </div>
      <h2 className="empty-state-title">Your Archive</h2>

      <p className="empty-state-text">
        Only you can see what's in your archive.
      </p>
    </div>
  );
};

export default EmptyArchived;
