import React, { useState, useRef } from "react";
import "./PostBox.css";
import { FaImage, FaPaperPlane, FaPlus, FaTimes } from "react-icons/fa";
import AvatarEditor from "react-avatar-editor";
import { useUser } from "../components/UserContext"; // Import the custom hook to get the user context
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import upload from "./upload.png";

const PostBox = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null); // State to store the cropped image
  const [isImageCropped, setIsImageCropped] = useState(false); // To track if image has been cropped
  const editor = useRef(null); // Ref for the AvatarEditor
  const { userId, imageUrl } = useUser(); // Get userId from UserContext

  const handleImageIconClick = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setImageFile(null);
    setCroppedImage(null);
    setIsImageCropped(false); // Reset the cropped state
  };

  const handlePost = async () => {
    if (!postDescription || !croppedImage) {
      alert("Description and cropped image are required.");
      return;
    }

    function base64ToFile(base64, filename) {
      const arr = base64.split(",");

      // Decode the base64 string
      const mime = arr[0].match(/:(.*?);/)[1]; // Extract MIME type
      const byteCharacters = atob(arr[1]); // Decode the base64 string

      // Create a byte array
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset++) {
        const byte = byteCharacters.charCodeAt(offset);
        byteArrays.push(byte);
      }

      // Create a file object from the byte array
      const byteArray = new Uint8Array(byteArrays);
      return new File([byteArray], filename, { type: mime });
    }

    // Example usage if `croppedImage` is a base64 string:
    const file = base64ToFile(croppedImage, "cropped-image.png");

    // Now you can append the file to FormData
    const formData = new FormData();
    formData.append("UserId", userId); // Use the userId from context to save post
    formData.append("Title", postTitle); // Title is optional
    formData.append("ImageUrl", file); // Send cropped image as a file
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

      const data = await response.json(); // Get the response body

      if (!response.ok) {
        console.error("API Error:", data); // Log the full response (errors)
        alert("An error occurred while creating the post.");
        return;
      }

      if (data.isSuccess) {
        alert("Post created successfully!");
        setIsModalOpen(false);
        setPostDescription("");
        setImageFile(null);
      } else {
        alert(data.message || "Failed to create the post.");
      }
    } catch (error) {
      console.error("Request failed:", error);
      alert("An error occurred while creating the post.");
    }
  };

  // Handle the image file upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    setCroppedImage(null); // Clear previous cropped image if any
    setIsImageCropped(false); // Reset the cropped image state
  };

  // Get cropped image from AvatarEditor
  const handleSave = () => {
    if (editor.current) {
      const canvas = editor.current.getImageScaledToCanvas(); // Get the canvas element
      setCroppedImage(canvas.toDataURL()); // Save the cropped image as a data URL
      setIsImageCropped(true); // Set cropped image state to true
    }
  };

  // Preview the selected image
  const imagePreviewUrl = imageFile ? URL.createObjectURL(imageFile) : null;

  const handleQuillChange = (value) => {
    setPostDescription(value);
  };

  return (
    <div className="postbox-container">
      <div className="postbox-header">Post Something</div>
      <div className="postbox-content">
        <img
          src={`https://localhost:7222${imageUrl}`}
          alt="Profile"
          className="profile-picss"
        />
        <input
          type="text"
          placeholder="What’s on your mind?"
          className="postbox-input"
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
        />
        <div className="create-post-icon">
          <img
            src={upload}
            onClick={handleImageIconClick}
            style={{
              width: "40px",
              height: "40px",
              objectFit: "cover",
              cursor: "pointer",
            }}
          />
        </div>
      </div>

      {isModalOpen && (
        <div className="modall">
          <div className="modall-content">
            <button onClick={handleCancel} className="modal-cancel-btn">
              <FaTimes />
            </button>

            <input
              className="input-img"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {imageFile && !isImageCropped && (
              <div>
                <AvatarEditor
                  ref={editor}
                  image={imageFile}
                  width={250}
                  height={250}
                  border={50}
                  color={[255, 255, 255, 0.6]} // Border color
                  scale={1.2} // Optional: Scale the image inside the editor
                />
                <button onClick={handleSave} className="save">
                  Save Cropped Image
                </button>
              </div>
            )}
            {isImageCropped && (
              <div className="image-preview">
                <img
                  src={croppedImage}
                  alt="Cropped Preview"
                  className="preview-img"
                />
              </div>
            )}
            {/* Description and post button */}
            {isImageCropped && (
              <>
                <div className="quill-wrapper">
                  <ReactQuill
                    theme="snow"
                    id="description"
                    name="description"
                    value={postDescription}
                    onChange={handleQuillChange} // Correct handler for ReactQuill
                    placeholder="Enter description here..."
                  />
                </div>
                {/* <input
                  type="text"
                  placeholder="Description here"
                  className="modal-input"
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                /> */}
                <div className="modal-buttons">
                  <button onClick={handlePost} className="modal-post-btn">
                    <FaPaperPlane style={{ marginRight: "5px" }} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostBox;
