import React, { useEffect, useState } from "react";
import { useUser } from "../components/UserContext"; // Import the useUser hook
import { FaBookmark, FaComment, FaHeart } from "react-icons/fa"; // Added icons for likes and comments
import EmptySaved from "./EnhanceUi/EmptySaved";
import "./SavedPosts.css";
import { AiFillPushpin, AiOutlinePushpin } from "react-icons/ai";

const SavedPosts = () => {
  const { userId, userName, imageUrl } = useUser(); // Access user details from context
  const [savedPosts, setSavedPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null); // State to track selected post for the modal
  const backendBaseUrl = "https://localhost:7222";
  const [shouldRefetch, setShouldRefetch] = useState(false);

  // Function to fetch saved posts
  const fetchSavedPosts = async () => {
    try {
      const response = await fetch(
        `https://localhost:7222/api/SocialMedia/saved-posts/${userId}?pageNumber=1&pageSize=10`
      );
      const data = await response.json();
      // console.log(data);
      setSavedPosts(data.result.savedPosts || []);
    } catch (error) {
      console.error("Error fetching saved posts:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchSavedPosts();
    }
  }, [userId, shouldRefetch]); // Dependency on shouldRefetch to trigger re-fetching when toggling

  // Function to toggle save/unsave a post
  const toggleSavePost = async (postId) => {
    try {
      const response = await fetch(
        `https://localhost:7222/api/SocialMedia/toggle-save-post?userId=${userId}&postId=${postId}`,
        { method: "POST" }
      );
      const data = await response.json();

      if (data.isSuccess) {
        console.log(data);
        // Update the saved posts list immediately
        setSavedPosts((prevPosts) =>
          prevPosts.filter((post) => post.postId !== postId)
        );

        // Close the modal
        setSelectedPost(null);

        alert("Post Unsaved Successfully");
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error toggling save post:", error);
    }
  };

  return (
    <div className="profile-posts">
      <div>
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
      </div>

      <div className="saved-headings">
        <FaBookmark />
        <h4 className="saved-name">Saved</h4>
      </div>
      <div className="saved-posts">
        {savedPosts.length === 0 ? (
          <EmptySaved />
        ) : (
          savedPosts.map((post) => (
            <div
              className="post"
              key={post.savedPostId}
              onClick={() => setSelectedPost(post)} // Open modal with selected post details
            >
              <div className="archived-post-image-container">
                <div className="saved-post-card">
                  <img
                    src={`${backendBaseUrl}${post.imageUrl}`}
                    alt={post.description}
                    className="saved-post-image"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedPost && (
        <div className="saved-modal">
          <div className="saved-modal-content">
            <button
              className="close-modal"
              onClick={() => setSelectedPost(null)} // Close the modal
            >
              ✖
            </button>
            <div className="modal-left">
              <div className="post-description">
                <p
                  dangerouslySetInnerHTML={{ __html: selectedPost.description }}
                />
              </div>

              <img
                src={`${backendBaseUrl}${selectedPost.imageUrl}`}
                alt={selectedPost.description}
                className="modal-image"
              />
              <div className="modal-likes-comments">
                <span>
                  <FaHeart /> {selectedPost.likesCount || 0} Likes
                </span>

                {/* Bookmark icon in modal */}
                <div
                  className="bookmark-icon-modal"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSavePost(selectedPost.postId);
                  }}
                >
                  <FaBookmark
                    className={selectedPost.isSaved ? "saved" : "unsaved"}
                  />
                </div>
              </div>
            </div>
            <div className="modal-right">
              <h4>Comments ({selectedPost.comments?.length || 0})</h4>
              <div className="comments-section">
                {selectedPost.comments?.map((comment) => (
                  <div className="comment">
                    <p>{comment.userName}</p>
                    <p>{comment.text}</p>

                    <small>By User - {comment.user.userName}</small>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavedPosts;
