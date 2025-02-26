import React, { useState, useEffect } from "react";
import "./CommentsSection.css";
import { FaPaperPlane, FaTimes } from "react-icons/fa";
import { useUser } from "./UserContext";
import { AiFillPushpin, AiOutlinePushpin } from "react-icons/ai";

const CommentsSection = ({
  userId,
  userName,
  userImageUrl,
  socialMediaID,
  onClose,
}) => {
  const [comments, setComments] = useState([]);
  const [totalComments, setTotalComments] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState("");
  const [replies, setReplies] = useState({}); // Track replies for each comment
  const [visibleReplies, setVisibleReplies] = useState({}); // Track visibility of replies
  const [shouldRefetch, setShouldRefetch] = useState(false);

  // Fetch comments from the backend
  const fetchComments = async () => {
    try {
      const response = await fetch(
        `https://localhost:7222/api/SocialMedia/get-all-comments/${socialMediaID}?pageNumber=1&pageSize=10`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      if (data.isSuccess) {
        setComments(data.result.comments || []);

        setTotalComments(data.result.totalComments || 0);
      } else {
        setComments([]);
        console.warn(data.message || "No comments available.");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [socialMediaID, shouldRefetch]);

  // Fetch replies for a specific comment
  const fetchReplies = async (commentId) => {
    try {
      const response = await fetch(
        `https://localhost:7222/api/SocialMedia/replies-with-comments?pageNumber=1&pageSize=10`
      );
      const data = await response.json();

      if (data.isSuccess) {
        const repliesData = data.result?.replies || [];

        // Filter replies based on the current commentId
        const filteredReplies = repliesData.filter(
          (reply) => reply.comment.commentId === commentId
        );
        setReplies((prevReplies) => ({
          ...prevReplies,
          [commentId]: filteredReplies, // Store replies for this specific comment
        }));
      } else {
        console.error("Failed to fetch replies:", data.message);
      }
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  // Toggle the visibility of replies
  const toggleRepliesVisibility = (commentId) => {
    setVisibleReplies((prevState) => ({
      ...prevState,
      [commentId]: !prevState[commentId],
    }));

    // Fetch replies only if they haven't been fetched already
    if (!replies[commentId]) {
      fetchReplies(commentId);
    }
  };

  const handleSubmitReply = async (commentId, replyText, userId) => {
    if (!replyText.trim()) {
      console.error("Reply text cannot be empty.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("CommentId", commentId);
      formData.append("UserId", userId);
      formData.append("Text", replyText);

      const response = await fetch(
        "https://localhost:7222/api/SocialMedia/Reply-on-comment",
        {
          method: "POST",
          body: formData, // Send FormData
        }
      );

      if (!response.ok) {
        console.error("Failed to submit reply:", response.statusText);
        return;
      }

      const data = await response.json();

      // Match with the updated API response structure
      if (data.replyId && data.replyId.isSuccess) {
        const { result: replyId, isSuccess, message } = data.replyId;

        // Add other details if your API response includes them (currently not available in the response)
        const username = userName;
        const imageUrl = userImageUrl;

        // Update the replies state
        setReplies((prevReplies) => ({
          ...prevReplies,
          [commentId]: [
            ...(prevReplies[commentId] || []),
            {
              replyId,
              userId,
              username,
              imageUrl,
              text: replyText, // Use replyText as the text for now
              createdAt: new Date().toISOString(), // Use current timestamp as placeholder
            },
          ],
        }));

        console.log("Reply submitted successfully:", message);
      } else {
        console.error(
          "Failed to submit reply:",
          data.replyId?.message || "Unknown error."
        );
      }
    } catch (error) {
      console.error("Error submitting reply:", error);
    }
  };

  // Handle adding a new comment
  const handleSubmitComment = async () => {
    if (!newCommentText.trim()) {
      alert("Please enter a comment!");
      return;
    }

    try {
      if (!userId) {
        alert("User is not logged in!");
        return;
      }

      const formData = new FormData();
      formData.append("SocialMediaId", socialMediaID);
      formData.append("UserId", userId); // Use userId from context
      formData.append("Text", newCommentText);

      const response = await fetch(
        "https://localhost:7222/api/SocialMedia/add-comment",
        {
          method: "POST",
          headers: {
            accept: "*/*",
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to add comment");
      }

      const data = await response.json();

      if (data) {
        // Add the new comment to the comments state
        const newComment = {
          commentId: data.commentId,
          text: newCommentText,
          user: {
            userName: userName, // Assuming userName comes from context
            imageUrl: userImageUrl, // Use user image from context
          },
          commentedOn: new Date().toISOString(),
        };

        setShouldRefetch(true);

        setComments((prevComments) => [newComment, ...prevComments]);

        setNewCommentText(""); // Clear input after submission
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handlePin = async (commentId, isPinned) => {
    if (!commentId) {
      console.error("Invalid commentId:", commentId);
      return;
    }

    // Optimistically update the state before the server call
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId ? { ...comment, isPinned: !isPinned } : comment
      )
    );

    const url = `https://localhost:7222/api/SocialMedia/pin-comment?commentId=${commentId}&userId=${userId}&socialMediaId=${socialMediaID}&isPinned=${!isPinned}`;

    try {
      const response = await fetch(url, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to pin the comment");
      }

      const data = await response.json();

      if (data.isSuccess) {
        alert("Success");
        // Refresh the comments list to ensure it's up-to-date
        fetchComments(); // Call your fetch function here
      } else {
        console.error("Failed to pin the comment:", data.message);
        // Revert the optimistic update if the request fails
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === commentId
              ? { ...comment, isPinned } // Revert isPinned
              : comment
          )
        );
      }
    } catch (error) {
      console.error("Error pinning comment:", error);
      // Revert the optimistic update on error
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === commentId
            ? { ...comment, isPinned } // Revert isPinned
            : comment
        )
      );
    }
  };

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Just now";

    const commentTime = new Date(`${timestamp}Z`);

    if (isNaN(commentTime.getTime())) {
      return "Just now";
    }

    const now = new Date();
    const timeDiff = now - commentTime;

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

  const deleteComment = async (commentId) => {
    try {
      const response = await fetch(
        `https://localhost:7222/api/SocialMedia/delete-comment/${commentId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      const data = await response.json();

      if (data.isSuccess) {
        // Remove the deleted comment from the comments state
        setComments((prevComments) =>
          prevComments.filter((comment) => comment.commentId !== commentId)
        );
      } else {
        console.error("Failed to delete comment:", data.message);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <>
      <div className="profile-posts">
        <div className="saved-modal">
          <div className="comments-modal">
            <div className="modal-header">
              <div className="modal-cmt">
                <h2>Comments </h2>
              </div>
              <button onClick={onClose} className="close-button">
                &times;
              </button>
            </div>
            <div className="modal-content">
              {loading ? (
                <p>Loading comments...</p>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.commentId} className="comment-item">
                    <div className="comment-content">
                      <div className="comment-bubble">
                        <div className="comment-div">
                          <img
                            src={`https://localhost:7222${comment.user.imageUrl}`}
                            alt={comment.user.userName}
                            className="comment-avatar"
                          />
                          <p className="comment-username">
                            {comment.user.userName}
                          </p>
                          <p className="comment-timestamp">
                            {formatTimeAgo(comment.commentedOn)}
                          </p>

                          <p className="comment-text">{comment.text}</p>
                          <button
                            className="comment-pin"
                            onClick={() =>
                              handlePin(comment.commentId, comment.isPinned)
                            }
                          >
                            {comment.isPinned ? (
                              <AiFillPushpin />
                            ) : (
                              <AiOutlinePushpin />
                            )}
                          </button>
                          <button
                            className="delete-comment-button"
                            onClick={() => deleteComment(comment.commentId)}
                          >
                            &times;
                          </button>
                        </div>
                      </div>

                      <div className="comment-actions">
                        {/* Delete Button */}
                        {/* {userId === comment.user.userId && (
                          <button
                            className="delete-comment-button"
                            onClick={() => deleteComment(comment.commentId)}
                          >
                            <FaTimes />
                          </button>
                        )} */}

                        <div className="reply-section">
                          <button
                            onClick={() =>
                              toggleRepliesVisibility(comment.commentId)
                            }
                          >
                            {visibleReplies[comment.commentId]
                              ? "Hide Replies"
                              : "View Replies"}
                          </button>
                          {visibleReplies[comment.commentId] && (
                            <div className="replies-list">
                              {(replies[comment.commentId] || []).map(
                                (reply) => {
                                  // Extract reply details with optional chaining
                                  const replyUser =
                                    reply?.reply?.username || "Unknown User"; // Fallback for undefined user
                                  const replyText =
                                    reply?.reply?.text ||
                                    "No content available"; // Fallback for undefined text
                                  const imageUrl =
                                    reply?.reply?.imageUrl ||
                                    "/default-avatar.jpg"; // Default image if none provided
                                  const repliedOn = reply?.reply?.repliedOn
                                    ? formatTimeAgo(reply?.reply?.repliedOn)
                                    : "Unknown time";

                                  return (
                                    <div
                                      key={reply?.replyId}
                                      className="reply-item"
                                    >
                                      <div className="reply-content">
                                        {/* Display user image */}
                                        <img
                                          src={
                                            reply?.imageUrl
                                              ? `https://localhost:7222${reply.imageUrl}`
                                              : "/default-avatar.png"
                                          }
                                          alt={`${reply?.username}'s avatar`}
                                          className="comment-avatar"
                                        />
                                        {/* Display reply details */}
                                        <div className="reply-content-comment">
                                          <p className="reply-username">
                                            {reply?.username}
                                          </p>
                                          <p className="reply-timestamp">
                                            {formatTimeAgo(reply?.createdAt)}
                                          </p>
                                        </div>
                                      </div>
                                      <p className="reply-text">
                                        {reply?.text}
                                      </p>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          )}

                          <div className="send-reply">
                            <input
                              type="text"
                              placeholder="Reply"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && userId) {
                                  const replyText = e.target.value.trim(); // Trim whitespace to avoid empty replies
                                  if (replyText) {
                                    handleSubmitReply(
                                      comment.commentId,
                                      replyText,
                                      userId
                                    );
                                    e.target.value = ""; // Clear input after submission
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-comments">
                  <h2 className="empty-state-text">No Comments Yet</h2>{" "}
                  <p className="empty-state-text">Start the conversation.</p>
                </div>
              )}
            </div>

            <div className="comment-input">
              <img
                src={`https://localhost:7222${userImageUrl}`}
                alt="User Avatar"
                className="comment-avatar"
              />

              <input
                type="text"
                className="comment-text-input"
                placeholder="Add a comment..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
              />
              <button
                onClick={handleSubmitComment}
                className="send-comment-button"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CommentsSection;
