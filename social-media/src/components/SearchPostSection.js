import React, { useEffect, useState } from "react";
import "./PostSection.css";
import {
  FaHeart,
  FaComment,
  FaBookmark,
  FaArchive,
  FaRegBookmark,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Archive, Bookmark, MoreVertical, Trash } from "lucide-react";
import PostBox from "./PostBox";
import CommentsModal from "./CommentsSection"; // Import the CommentsModal
import Sidebar from "./Sidebar";
import { UserProvider, useUser } from "./UserContext";

const SearchPostSection = ({ currentPage, searchQuery }) => {
  const [posts, setPosts] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false); // State to manage modal visibility
  const [selectedPostId, setSelectedPostId] = useState(null); // State to store the selected post ID
  const [commentCounts, setCommentCounts] = useState({});
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10); // Fixed page size
  const [totalPages, setTotalPages] = useState(1);
  const [currentPages, setCurrentPage] = useState(1);

  const { userId } = useUser();

  const [isPostSaved, setIsPostSaved] = useState(false);
  const [isPostArchived, setIsPostArchived] = useState(false);

  const [likedPosts, setLikedPosts] = useState([]); // Track liked posts in local state

  const [hasMorePosts, setHasMorePosts] = useState(true); // Flag to indicate if there are more posts

  useEffect(() => {
    if (searchQuery && searchQuery.trim()) {
      // Check if searchQuery is not undefined or null
      fetch(
        `https://localhost:7222/api/SocialMedia?pageNumber=${currentPage}&pageSize=10&searchVal=${searchQuery}`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.isSuccess && data.result?.posts) {
            setPosts(data.result.posts);
            setHasMorePosts(data.result.hasMorePosts);
          } else {
            setPosts([]);
            setHasMorePosts(false);
          }
        })
        .catch((error) => console.error("Error fetching posts:", error));
    }
  }, [searchQuery, currentPage]);

  const nextPage = () => {
    if (hasMorePosts) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

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

  return (
    <div className="post-section">
      {posts.map((post) => (
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
              </span>{" "}
            </div>

            <div className="menu-container">
              <span className="comment-timestamp">
                {formatTimeAgo(post.createdDate)}
              </span>
              <MoreVertical
                className="menu-icon"
                onClick={() => toggleMenu(post.socialMediaID)}
              />
              {activeMenu === post.socialMediaID && (
                <div className="menu-dropdown">
                  <div
                    className="menu-item"
                    onClick={() => savePost(post.socialMediaID)}
                  >
                    <FaBookmark style={{ marginRight: "8px" }} />
                    {isPostSaved ? "Unsave Post" : "Save Post"}
                  </div>

                  <div
                    className="menu-item"
                    onClick={() => handleToggleArchive(post.socialMediaID)}
                    style={{ cursor: "pointer" }} // Add pointer cursor for better UX
                  >
                    <FaArchive style={{ marginRight: "8px" }} />
                    {post.isArchived ? "Unarchive Post" : "Archive Post"}
                  </div>
                </div>
              )}
            </div>
          </div>
          <p>{post.description}</p>
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
              <span
                className={`heart-icon ${
                  likedPosts.includes(post.socialMediaID) ? "liked" : ""
                }`}
                onClick={() => handleToggleLike(post.socialMediaID)}
              >
                <FaHeart />
              </span>
              <FaComment
                className="comment-icon"
                onClick={() => handleOpenCommentsModal(post.socialMediaID)}
              />{" "}
              <div className="comment-count">
                {commentCounts[post.socialMediaID] || post.commentCount}
              </div>
            </div>
            <div
              onClick={() => savePost(post.socialMediaID)} // Trigger savePost when clicked
            >
              {isPostSaved[post.socialMediaID] ? (
                <FaBookmark style={{ marginRight: "8px" }} /> // Filled bookmark for saved
              ) : (
                <FaRegBookmark style={{ marginRight: "8px" }} /> // Empty bookmark for unsaved
              )}
            </div>
          </div>
          <div>{post.likeCount} likes</div>
        </div>
      ))}

      {/* Comments Modal */}
      {isCommentsModalOpen && (
        <UserProvider>
          <CommentsModal
            socialMediaID={selectedPostId}
            onClose={handleCloseCommentsModal}
          />
        </UserProvider>
      )}
    </div>
  );
};

export default SearchPostSection;
