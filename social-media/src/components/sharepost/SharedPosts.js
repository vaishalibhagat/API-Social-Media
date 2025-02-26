import React, { useEffect, useState } from "react";
import "./SharedPosts.css";
import { useUser } from "../UserContext";

const SharedPosts = () => {
  const [sharedPosts, setSharedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { userId, userName, imageUrl } = useUser();

  const apiUrl = `https://localhost:7222/api/SocialMedia/shared-posts/${userId}`;
  const baseImageUrl = "https://localhost:7222"; // Base URL of your server

  useEffect(() => {
    const fetchSharedPosts = async () => {
      try {
        const response = await fetch(apiUrl, { method: "GET" });
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        console.log(data);
        if (data.isSuccess) {
          setSharedPosts(data.result);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSharedPosts();
  }, [apiUrl]);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container">
      <h1>Shared Posts</h1>
      {sharedPosts.length === 0 ? (
        <div className="no-posts">
          <p>No shared posts available</p>
        </div>
      ) : (
        <div
          className={`grid ${
            sharedPosts.length > 1 ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {sharedPosts.map((post) => (
            <div className="post-card" key={post.postId}>
              <img
                src={`${baseImageUrl}${post.imageUrl}`}
                alt="Post"
                onError={(e) => (e.target.src = "/default-image.png")} // Fallback image
              />
              <div className="content">
                <h2 dangerouslySetInnerHTML={{ __html: post.description }}></h2>
                <div className="user-info">
                  <img
                    src={`${baseImageUrl}${post.user.imageUrl}`}
                    alt={post.user.userName}
                    onError={(e) => (e.target.src = "/default-user.png")} // Fallback image
                  />
                  <span className="username">{post.user.userName}</span>
                </div>
                <p>Shared by: {post.sharedFromUserName}</p>
                {/* <p>Shared: {post.sharedCount} times</p> */}
              </div>
              <div className="actions">
                <a
                  href={post.shareableUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Post
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedPosts;
