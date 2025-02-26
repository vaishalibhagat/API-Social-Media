import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaHeart,
  FaComment,
  FaBookmark,
  FaArchive,
  FaRegBookmark,
} from "react-icons/fa";
import { Archive, Bookmark, Camera, MoreVertical, Trash } from "lucide-react";
import EmptySaved from "./EnhanceUi/EmptySaved";
import "./PostSection.css";

const UserDetails = () => {
  const { userId } = useParams(); // Get userId from the route
  const [userDetails, setUserDetails] = useState(null);
  const [posts, setPosts] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false); // State to manage modal visibility
  const [selectedPostId, setSelectedPostId] = useState(null); // State to store the selected post ID
  const [commentCounts, setCommentCounts] = useState({});
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const [isPostSaved, setIsPostSaved] = useState(false);
  const [isPostArchived, setIsPostArchived] = useState(false);

  const [likedPosts, setLikedPosts] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Limit the description length to 50 characters
  const maxLength = 50;
  const truncatedDescription = (description) =>
    description.length > maxLength
      ? description.slice(0, maxLength) + "..."
      : description;

  // Function to toggle full description visibility
  const toggleDescription = () => {
    setIsExpanded(!isExpanded);
  };

  useEffect(() => {
    const fetchUserDetailsAndPosts = async () => {
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
        if (data.result) {
          setUserDetails(data.result); // Store the full result object
        } else {
          console.error("Unexpected API response format", data);
        }
      } catch (error) {
        console.error("Error fetching user details and posts:", error);
      }
    };

    fetchUserDetailsAndPosts();
  }, [userId]);

  const toggleMenu = (id) => {
    setActiveMenu((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    // Load liked posts for the current user from localStorage or backend when userId changes
    const savedLikedPosts =
      JSON.parse(localStorage.getItem(`likedPosts_${userId}`)) || [];
    setLikedPosts(savedLikedPosts);
  }, [userId]);

  const handleToggleLike = async (postId) => {
    try {
      const isAlreadyLiked = likedPosts.includes(postId);
      const formData = new FormData();
      formData.append("SocialMediaId", postId);
      formData.append("UserId", userId);

      const response = await fetch(
        "https://localhost:7222/api/SocialMedia/toggle-like",
        {
          method: "POST",
          headers: {
            accept: "*/*",
          },
          body: formData,
        }
      );

      const result = await response.json();

      if (response.ok && result.isSuccess) {
        // Update the like count for the post
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.socialMediaID === postId
              ? {
                  ...post,
                  likeCount: post.likeCount + (isAlreadyLiked ? -1 : 1),
                }
              : post
          )
        );

        // Update the liked posts state
        let updatedLikedPosts = [...likedPosts];
        if (isAlreadyLiked) {
          updatedLikedPosts = updatedLikedPosts.filter((id) => id !== postId); // Remove if already liked
        } else {
          updatedLikedPosts.push(postId); // Add to liked posts
        }
        setLikedPosts(updatedLikedPosts);

        // Persist the liked posts for the current user in localStorage
        localStorage.setItem(
          `likedPosts_${userId}`,
          JSON.stringify(updatedLikedPosts)
        );
      } else {
        console.error("Error toggling like:", result.message);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleOpenCommentsModal = (postId) => {
    setSelectedPostId(postId);
    setIsCommentsModalOpen(true); // Open the modal
  };

  const handleCloseCommentsModal = () => {
    setIsCommentsModalOpen(false); // Close the modal
    setSelectedPostId(null); // Clear the selected post ID
  };

  // Function to save the post
  const savePost = async (postId) => {
    if (!userId) {
      alert("User ID is not available!");
      return;
    }

    try {
      const response = await fetch(
        `https://localhost:7222/api/SocialMedia/toggle-save-post?userId=${userId}&postId=${postId}`,
        {
          method: "POST",
          headers: {
            Accept: "*/*",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Server error:", data.message);
        throw new Error(data.message || "Failed to save post.");
      }

      if (data.isSuccess) {
        setActiveMenu(null);
        setIsPostSaved((prevState) => ({
          ...prevState,
          [postId]: !prevState[postId], // Toggle the saved state for this post
        }));
        alert(data.message);
      } else {
        alert("Failed to save post.");
      }
    } catch (error) {
      console.error("Error saving post:", error);
      alert("An error occurred while saving the post.");
    }
  };

  const handleToggleArchive = async (postId) => {
    try {
      const response = await fetch(
        `https://localhost:7222/api/SocialMedia/toggle-archive?userId=${userId}&postId=${postId}`,
        {
          method: "POST",
          headers: {
            accept: "*/*",
          },
        }
      );

      const result = await response.json();

      if (response.ok && result.isSuccess) {
        // Update the posts state to reflect the archived/unarchived status

        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.socialMediaID === postId
              ? {
                  ...post,
                  isArchived: !post.isArchived,
                }
              : post
          )
        );
        setActiveMenu(null);
        setIsPostArchived(true);
      } else {
        console.error("Error toggling archive:", result.message);
      }
    } catch (error) {
      console.error("Error toggling archive:", error);
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Just now";

    // Ensure the timestamp is treated as UTC
    const commentTime = new Date(`${timestamp}Z`); // Append "Z" if missing

    // Check for invalid date
    if (isNaN(commentTime.getTime())) {
      console.error("Invalid timestamp:", timestamp);
      return "Just now";
    }

    const now = new Date();
    const timeDiff = now - commentTime; // Difference in milliseconds

    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return "Just now";
    }
  };

  if (!userDetails) {
    return <p>Loading user details...</p>;
  }

  const handleDeletePost = async (id) => {
    try {
      const response = await fetch(
        `https://localhost:7222/api/SocialMedia/delete-socialPost/${id}`,
        {
          method: "DELETE",
          headers: {
            Accept: "*/*",
          },
        }
      );
      const data = await response.json();
      if (data.isSuccess) {
        alert(data.message);
        // Refresh posts after deletion
      } else {
        alert("Failed to delete the post.");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("An error occurred while deleting the post.");
    }
  };
  // Try accessing user details directly
  const user = userDetails.user || {}; // Ensure we safely access user object

  return (
    <div className="container">
      {/* Posts Section */}
      <div className="post-section-main">
        <ul className="posts-list">
          {userDetails.length === 0 ? (
            <EmptySaved />
          ) : userDetails.posts.length > 0 ? ( // Add a condition for posts
            userDetails.posts.map((post) => (
              <div key={post.socialMediaID} className="post">
                <div className="post-header">
                  <img
                    src={`https://localhost:7222${post.user.imageUrl}`}
                    alt={post.user.userName}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                  <div className="post-header-ele">
                    <span className="name-tag">{post.user.userName}</span>
                    <span>
                      {new Date(post.createdDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="menu-container">
                    <span className="comment-timestamp">
                      {formatTimeAgo(post.createdDate)}
                    </span>
                  </div>
                </div>
                <div className="post-description">
                  <p>
                    <span
                      dangerouslySetInnerHTML={{
                        __html: isExpanded
                          ? post.description
                          : truncatedDescription(post.description),
                      }}
                    />
                    <span className="expand-toggle" onClick={toggleDescription}>
                      {isExpanded ? "Show Less" : "Show More"}
                    </span>
                  </p>
                </div>

                <div className="post-images">
                  {post.imageUrl && (
                    <img
                      src={`https://localhost:7222${post.imageUrl}`}
                      alt="Post"
                      style={{
                        width: "100%",
                        maxHeight: "400px",
                        objectFit: "cover",
                      }}
                    />
                  )}
                </div>
                <div className="post-actions">
                  <div className="left-icons">
                    <span>
                      <FaHeart />
                    </span>
                    <FaComment
                      className="comment-icon"
                      onClick={() =>
                        handleOpenCommentsModal(post.socialMediaID)
                      }
                    />
                    <div className="comment-count">
                      {commentCounts[post.socialMediaID] || post.commentCount}
                    </div>
                  </div>
                  <div>
                    {isPostSaved[post.socialMediaID] ? (
                      <FaBookmark style={{ marginRight: "8px" }} />
                    ) : (
                      <FaRegBookmark style={{ marginRight: "8px" }} />
                    )}
                  </div>
                </div>
                <div>{post.likeCount} likes</div>
              </div>
            ))
          ) : (
            // Else part when posts exist but the array is empty
            <div className="empty-state">
              <div className="camera-icon-wrapper">
                <Camera style={{ cursor: "pointer" }} size={32} />
              </div>
              <h2 className="empty-state-title">No Photos</h2>
              <p className="empty-state-text">
                When you share photos, they will appear on your profile.
              </p>
            </div>
          )}
        </ul>
      </div>
    </div>
  );
};

export default UserDetails;
