import { Camera } from "lucide-react";
import "./EmptyPostsState.css";
import React, { useState, useRef, useEffect } from "react";

import { FaImage, FaPaperPlane, FaPlus, FaTimes } from "react-icons/fa";
import AvatarEditor from "react-avatar-editor";
import { useUser } from "../UserContext";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const EmptyPostsState = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [posts, setPosts] = useState([]);
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null); // State to store the cropped image
  const [isImageCropped, setIsImageCropped] = useState(false); // To track if image has been cropped
  const editor = useRef(null); // Ref for the AvatarEditor
  const { userId } = useUser(); // Get userId from UserContext

  const fetchPosts = async () => {
    if (!userId) {
      console.error("User ID is not available in context.");
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:7222/api/SocialMedia/user/${userId}?pageNumber=1&pageSize=10`,
        {
          headers: {
            Accept: "*/*", // Optional: Include any required headers
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.result && data.result.posts) {
        setPosts(data.result.posts); // Extract the posts array
      } else {
        console.error("Unexpected API response format", data);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
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
      const mime = arr[0].match(/:(.*?);/)[1];
      const byteCharacters = atob(arr[1]);
      const byteArrays = [];
      for (let offset = 0; offset < byteCharacters.length; offset++) {
        const byte = byteCharacters.charCodeAt(offset);
        byteArrays.push(byte);
      }
      const byteArray = new Uint8Array(byteArrays);
      return new File([byteArray], filename, { type: mime });
    }

    const file = base64ToFile(croppedImage, "cropped-image.png");

    const formData = new FormData();
    formData.append("UserId", userId);
    formData.append("Title", postTitle);
    formData.append("ImageUrl", file);
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

      if (!response.ok) {
        console.error("API Error:", data);
        alert("An error occurred while creating the post.");
        return;
      }

      if (data.isSuccess) {
        alert("Post created successfully!");

        // Add the new post to the local state
        const newPost = {
          id: data.result.id, // Replace with the correct key if needed
          title: postTitle,
          description: postDescription,
          imageUrl: URL.createObjectURL(file), // Temporary local URL
          // Add other fields if necessary
        };

        setPosts((prevPosts) => [newPost, ...prevPosts]);

        // Reset modal state
        setIsModalOpen(false);
        setPostTitle("");
        setPostDescription("");
        setImageFile(null);
        setCroppedImage(null);
        setIsImageCropped(false);
      } else {
        alert(data.message || "Failed to create the post.");
      }
    } catch (error) {
      console.error("Request failed:", error);
      alert("An error occurred while creating the post.");
    }
  };

  // const fetchPosts = async () => {
  //   if (!userId) {
  //     console.error("User ID is not available in context.");
  //     return;
  //   }

  //   try {
  //     const response = await fetch(
  //       `https://localhost:7222/api/SocialMedia/user/${userId}?pageNumber=1&pageSize=10`,
  //       {
  //         headers: {
  //           Accept: "*/*", // Optional: Include any required headers
  //         },
  //       }
  //     );

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();
  //     if (data.result && data.result.posts) {
  //       setPosts(data.result.posts);
  //     } else {
  //       console.error("Unexpected API response format", data);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching posts:", error);
  //   }
  // };

  const handleQuillChange = (value) => {
    setPostDescription(value);
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

  return (
    <div className="empty-state">
      {posts.length === 0 ? (
        <>
          {/* Show when no posts are available */}
          <div className="camera-icon-wrapper">
            <Camera
              onClick={handleImageIconClick}
              style={{ cursor: "pointer" }}
              size={32}
            />
          </div>
          <h2 className="empty-state-title">Share Photos</h2>
          <p className="empty-state-text">
            When you share photos, they will appear on your profile.
          </p>
          <button onClick={handleImageIconClick} className="share-photo-btn">
            Share your first photo
          </button>
        </>
      ) : (
        <>
          {/* Show when posts are available */}
          <div key={posts.length}>
            {posts.map((post) => (
              <div key={post.id}>
                <h3>{post.title}</h3>
                <p>{post.description}</p>
                <img src={post.imageUrl} alt="Post" />
              </div>
            ))}
          </div>
        </>
      )}

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

export default EmptyPostsState;
