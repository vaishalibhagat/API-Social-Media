import React, { useState } from "react";
import "./PostBox.css";

import { FaImage, FaPaperPlane, FaPlus, FaTimes } from "react-icons/fa";

const CreateUser = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const handleImageIconClick = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setImageFile(null);
  };

  const handlePost = async () => {
    if (!postDescription || !imageFile) {
      alert("Description and image are required.");
      return;
    }

    const formData = new FormData();
    formData.append("UserId", "5368ee71-f46f-40ce-919a-2ffa03880277");
    formData.append("Title", postTitle); // This will allow title to be nullable
    formData.append("ImageUrl", imageFile);
    formData.append("Description", postDescription);

    try {
      const response = await fetch(
        "https://localhost:7222/api/SocialMedia/create-SocialPost",
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
        alert("Post created successfully!");
        setIsModalOpen(false);
        setPostDescription("");
        setImageFile(null);
      } else {
        alert(data.message || "Failed to create the post.");
      }
    } catch (error) {
      alert("An error occurred while creating the post.");
    }
  };

  return (
    <div className="postbox-container">
      <div className="postbox-header">Post Something</div>
      <div className="postbox-content">
        <img
          src="https://via.placeholder.com/40"
          alt="Profile"
          className="profile-pic"
        />
        <input
          type="text"
          placeholder="What’s on your mind?"
          className="postbox-input"
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
        />
        <div className="create-post-icon">
          <FaPlus
            onClick={handleImageIconClick}
            style={{ cursor: "pointer" }}
          />
        </div>
      </div>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <button onClick={handleCancel} className="modal-cancel-btn">
              <FaTimes />
            </button>
            <input
              className="input-img"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />{" "}
            <input
              type="text"
              placeholder="Descryption here"
              className="modal-input"
              value={postDescription}
              onChange={(e) => setPostDescription(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={handlePost} className="modal-post-btn">
                <FaPaperPlane style={{ marginRight: "5px" }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateUser;
