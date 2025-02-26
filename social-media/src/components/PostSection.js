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
  FaSearch,
  FaShareAlt,
  FaTimes,
  FaPaperPlane,
} from "react-icons/fa";
import { Archive, Bookmark, MoreVertical, Trash } from "lucide-react";
import PostBox from "./PostBox";
import CommentsModal from "./CommentsSection"; // Import the CommentsModal
import Sidebar from "./Sidebar";
import { UserProvider, useUser } from "./UserContext";
import CommentsSection from "./CommentsSection";
import SavedPosts from "./SavedPosts";

const PostSection = ({ onNextPage, onPrevPage }) => {
  const [posts, setPosts] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false); // State to manage modal visibility
  const [selectedPostId, setSelectedPostId] = useState(null); // State to store the selected post ID
  const [commentCounts, setCommentCounts] = useState({});
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10); // Fixed page size

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [savedPostId, setSavedPostId] = useState(null);

  const { userId, userName, imageUrl } = useUser();

  const [isPostSaved, setIsPostSaved] = useState({});
  const [PostSaved, setPostSaved] = useState(false);
  const [isPostArchived, setIsPostArchived] = useState(false);
  const [showModal, setShowModal] = useState(false); // Modal visibility
  // const [selectedPostId, setSelectedPostId] = useState(null); // ID of the selected post to share
  const [sharedToUserId, setSharedToUserId] = useState("");

  const [likedPosts, setLikedPosts] = useState([]); // Track liked posts in local state

  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState("");

  const [postStats, setPostStats] = useState({});

  useEffect(() => {
    const savedState =
      JSON.parse(localStorage.getItem("savedPostsState")) || {};
    setIsPostSaved(savedState); // Set the saved state to the isPostSaved state
  }, []);

  // Fetch posts whenever the currentPage or searchQuery changes
  useEffect(
    (postId) => {
      // Construct the API URL based on the presence of a search query
      const apiUrl =
        searchQuery && searchQuery.trim()
          ? `https://localhost:7222/api/SocialMedia?pageNumber=${currentPage}&pageSize=10&searchVal=${searchQuery.trim()}`
          : `https://localhost:7222/api/SocialMedia?pageNumber=${currentPage}&pageSize=10`; // No search query parameter

      fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
          if (data.isSuccess && data.result?.posts) {
            setIsPostSaved((prevState) => ({
              ...prevState,
              [postId]: !prevState[postId], // Toggle the saved state for this post
            }));
            setPosts(data.result.posts);
            const initialStats = {};
            data.result.posts.forEach((post) => {
              initialStats[post.socialMediaID] = {
                commentCount: post.commentCount || 0,
                sharedCount: post.sharedCount || 0,
                likeCount: post.likeCount || 0,
              };
            });
            setPostStats(initialStats);
            setHasMorePosts(data.result.hasMorePosts);
          } else {
            setPosts([]);
            setHasMorePosts(false);
          }
        })
        .catch((error) => console.error("Error fetching posts:", error));
    },
    [searchQuery, currentPage]
  );

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
        // Update postStats for likes
        setPostStats((prev) => ({
          ...prev,
          [postId]: {
            ...prev[postId],
            likeCount: prev[postId].likeCount + (isAlreadyLiked ? -1 : 1),
          },
        }));

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
        setIsPostSaved((prevState) => {
          const newState = { ...prevState, [postId]: !prevState[postId] };
          // Persist the updated saved state in localStorage
          localStorage.setItem("savedPostsState", JSON.stringify(newState));
          return newState;
        });
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

  const handleOpenShareModal = (postId) => {
    setSelectedPostId(postId); // Set selected post ID
    setShowModal(true); // Show modal
  };

  const handleSharePost = () => {
    if (!sharedToUserId) {
      alert("Please enter the user ID to share with.");
      return;
    }

    const shareData = {
      postId: selectedPostId,
      sharedFromUserId: userId, // Current logged-in user's ID
      sharedToUserId,
    };

    fetch("https://localhost:7222/api/SocialMedia/share-post", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(shareData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.isSuccess) {
          // Update share count in postStats
          setPostStats((prev) => ({
            ...prev,
            [selectedPostId]: {
              ...prev[selectedPostId],
              sharedCount: (prev[selectedPostId]?.sharedCount || 0) + 1,
            },
          }));
          alert(data.message || "Post shared successfully!");
          setShowModal(false); // Close modal on success
          setSharedToUserId(""); // Clear input
        } else {
          alert(data.message || "Failed to share the post.");
        }
      })
      .catch((error) => {
        console.error("Error sharing post:", error);
        alert("An error occurred while sharing the post.");
      });
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(
        `https://localhost:7222/api/SocialMedia/get-all-users?pageNumber=1&pageSize=10`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user details. Please try again.");
      }

      const data = await response.json();

      // Extract the list of users from the API response
      const users = data.result.users;

      // Find the user matching the provided userId
      const user = users.find((u) => u.userId === userId);

      if (user) {
        // Update the state with user details, including the image URL
        setUserDetails({
          id: user.userId,
          username: user.userName,
          profile: user.imageUrl || "/default-profile.png", // Fallback for missing imageUrl
        });

        setError(""); // Clear any previous errors
      } else {
        setError("User not found. Please check the User ID.");
        setUserDetails(null);
      }
    } catch (err) {
      // Handle API errors and update state accordingly
      setError(err.message || "An error occurred while fetching user details.");
      setUserDetails(null);
    }
  };

  const handleUserIdChange = (e) => {
    const userId = e.target.value;
    setSharedToUserId(userId);

    if (userId) {
      fetchUserDetails(userId);
    } else {
      setUserDetails(null); // Clear user details when input is empty
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
    <>
      {" "}
      <div className="container">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FaSearch className="search-icon" />
        </div>
        <div className="post-section-main">
          <div className="post-input">
            <PostBox setPosts={setPosts} />
          </div>
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
                        {isPostSaved[post.socialMediaID]
                          ? "Unsave Post"
                          : "Save Post"}
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
              <div className="post-description">
                <p dangerouslySetInnerHTML={{ __html: post.description }} />
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
                    {postStats[post.socialMediaID]?.commentCount || 0}
                  </div>
                  <span
                    onClick={() => handleOpenShareModal(post.socialMediaID)}
                  >
                    <FaPaperPlane className="share-icon" />
                  </span>
                  {postStats[post.socialMediaID]?.sharedCount || 0}
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
              <div> {postStats[post.socialMediaID]?.likeCount || 0} likes</div>
            </div>
          ))}

          <div className="pagination">
            <div className="pagi-prev">
              <button onClick={prevPage} disabled={currentPage === 1}>
                <FaChevronLeft />
              </button>
              <span>Prev</span>
            </div>{" "}
            <div className="pagi-next">
              <span>Next</span>
              <button onClick={nextPage} disabled={!hasMorePosts}>
                <FaChevronRight />
              </button>{" "}
            </div>
          </div>
          {/* 
          <UserProvider>
            {console.log("isPostSaved:", isPostSaved)}
            {isPostSaved && <SavedPosts isPostSaved={isPostSaved} />}
          </UserProvider> */}

          {/* Comments Modal */}

          {isCommentsModalOpen && (
            <UserProvider>
              <CommentsSection
                userId={userId}
                userName={userName}
                userImageUrl={imageUrl}
                socialMediaID={selectedPostId}
                onClose={handleCloseCommentsModal}
              />
            </UserProvider>
          )}

          {/* Modal for Sharing Post */}
          {showModal && (
            <div className="modal-share">
              <div className="modal-content-share">
                <h2>Share</h2>
                <div className="modal-share-labal">
                  <label className="label-share">
                    Enter User ID to Share With:
                    <input
                      type="text"
                      className="input-share"
                      value={sharedToUserId}
                      onChange={handleUserIdChange}
                      placeholder="User ID"
                    />
                  </label>

                  {/* Display user details if available */}
                  {userDetails && (
                    <div className="user-details">
                      <img
                        src={`https://localhost:7222${userDetails.profile}`}
                        alt={`${userDetails.profile}'s profile`}
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                        }}
                      />
                      <p>{userDetails.username}</p>
                    </div>
                  )}

                  {/* Display error if any */}
                  {error && <p className="error-message">{error}</p>}
                </div>

                <div className="modal-actions-share">
                  <button
                    onClick={handleSharePost}
                    className="btn btn-share-share"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="btn btn-cancel-share"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PostSection;
