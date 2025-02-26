import React, { useEffect, useState } from "react";
import "./ArchivePost.css";
import {
  FaArchive,
  FaComment,
  FaHeart,
  FaHistory,
  FaEllipsisV,
} from "react-icons/fa";
import { useUser } from "./UserContext";
import EmptyArchived from "./EnhanceUi/EmptyArchived";

const ArchivePosts = () => {
  const [archivedPosts, setArchivedPosts] = useState([]);
  const backendBaseUrl = "https://localhost:7222";
  const { userId, userName, imageUrl } = useUser();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    const fetchArchivedPosts = async () => {
      try {
        const response = await fetch(
          `https://localhost:7222/api/SocialMedia/archived-posts/${userId}?pageNumber=1&pageSize=10`
        );
        const data = await response.json();
        setArchivedPosts(data.result.archivedPosts || []);
      } catch (error) {
        console.error("Error fetching archived posts:", error);
      }
    };
    fetchArchivedPosts();
  }, [userId]);

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
        setArchivedPosts((prevPosts) =>
          prevPosts.filter((post) => post.socialMediaID !== postId)
        );
        alert("Post Archived Successfully");
        setActiveMenu(null);
      } else {
        console.error("Error toggling archive:", result.message);
      }
    } catch (error) {
      console.error("Error toggling archive:", error);
    }
  };

  const toggleMenu = (postId) => {
    setActiveMenu((prevMenu) => (prevMenu === postId ? null : postId));
  };

  return (
    <>
      <div className="profile-posts">
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
        <div className="saved-headings">
          <FaHistory />
          <h4 className="saved-name">Archived</h4>
        </div>
      </div>

      <div className="archived-posts">
        {archivedPosts.length > 0 ? (
          archivedPosts.map((post) => (
            <div key={post.socialMediaID} className="post">
              <div className="archived-post-image-container">
                <div className="saved-post-card">
                  <img
                    src={`${backendBaseUrl}${post.imageUrl}`}
                    alt={post.description}
                    className="saved-post-image"
                  />
                  <div className="archived-post-hover-details">
                    <span className="date">
                      <span className="month">
                        {new Date(post.createdDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                          }
                        )}
                      </span>{" "}
                      <span className="day">
                        {new Date(post.createdDate).toLocaleDateString(
                          "en-US",
                          {
                            day: "numeric",
                          }
                        )}
                      </span>
                    </span>

                    <div className="center-details">
                      <p>
                        <FaHeart /> {post.likes?.length || 0}
                      </p>
                      <p>
                        <FaComment /> {post.comments?.length || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="menu-container">
                  <button
                    className="menu-button"
                    onClick={() => toggleMenu(post.socialMediaID)}
                  >
                    <FaEllipsisV />
                  </button>
                  {activeMenu === post.socialMediaID && (
                    <div className="dropdown-menu">
                      <button
                        className="menu-item"
                        onClick={() => handleToggleArchive(post.socialMediaID)}
                      >
                        Unarchive
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyArchived />
        )}
      </div>
    </>
  );
};

export default ArchivePosts;
