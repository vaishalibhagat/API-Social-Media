import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

import React, { useState, useRef } from "react";
import "./PostBox.css";
import { FaImage, FaPaperPlane, FaPlus, FaTimes } from "react-icons/fa";
import AvatarEditor from "react-avatar-editor";

import "react-quill/dist/quill.snow.css";
import "./Login.css";
import { ImageDown, Upload } from "lucide-react";
import upload from "./upload.png";

const Login = () => {
  const [userName, setUserNames] = useState("");

  const { setUserId, setUserName, setImageUrl } = useUser(); // Access new setters for user details
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null); // State to store the cropped image
  const [isImageCropped, setIsImageCropped] = useState(false); // To track if image has been cropped
  const editor = useRef(null); // Ref for the AvatarEditor
  const { userId } = useUser(); // Get userId from UserContext
  const adminUsername = "admin"; // Static admin username

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

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.isSuccess) {
        alert("User created successfully!");
        const userRole = userName === adminUsername ? "admin" : "user";

        setUserId(data.result.userId); // Set the userId dynamically from the response
        setUserName(data.result.userName); // Set the username dynamically
        setImageUrl(data.result.imageUrl); // Set the imageUrl dynamically

        navigate("/"); // Redirect to the main page
      } else {
        alert(data.message || "Failed to create user.");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      alert("An error occurred while creating the user.");
    }
  };

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

  const handleSave = () => {
    if (editor.current) {
      const canvas = editor.current.getImageScaledToCanvas();
      setCroppedImage(canvas.toDataURL()); // Save the cropped image as a data URL
      setIsImageCropped(true);
      setIsModalOpen(false); // Close the modal after saving the cropped image
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
        <button
          className="navigate-signup-button"
          onClick={() => navigate("/account")}
        >
          <span
            style={{
              backgroundColor: "transparent",
              color: "white",

              marginRight: "5px",
            }}
          >
            Already have Account
          </span>
          Login
        </button>
        <p>Glad you're here.!</p>
        <form onSubmit={handleCreateUser}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              placeholder="Username"
              value={userName}
              onChange={(e) => setUserNames(e.target.value)}
            />
          </div>

          {/* Move the image-preview above the login button */}
          {croppedImage && (
            <div className="image-preview">
              <img
                src={croppedImage}
                alt="Cropped Preview"
                className="preview-img"
                style={{
                  width: "50%",
                  height: "150px",
                  objectFit: "cover",
                  margin: "10px 0",
                }}
              />
            </div>
          )}
          <div className="create-post-icon">
            <label>Upload</label>
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

          <button type="submit" className="login-button">
            Login
          </button>
        </form>

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

              {/* Description and post button */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
