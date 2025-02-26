import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Friends.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Friends = () => {
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Current page number
  const [hasMoreData, setHasMoreData] = useState(true); // Flag to indicate if there's more data
  const [selectedUser, setSelectedUser] = useState(null); // Track selected user
  const navigate = useNavigate(); // Initialize useNavigate

  // Fetch users whenever the currentPage changes
  useEffect(() => {
    fetch(
      `https://localhost:7222/api/SocialMedia/get-all-users?pageNumber=${currentPage}&pageSize=8`
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.isSuccess && data.result?.users) {
          setUsers(data.result.users);
          setHasMoreData(data.result.hasMoreData); // Update based on the response
        }
      })
      .catch((error) => console.error("Error fetching users:", error));
  }, [currentPage]);

  const handleUserClick = (userId) => {
    setSelectedUser(userId); // Set the clicked user as selected
    navigate(`/user/${userId}`); // Navigate to the UserDetails route with the userId as a parameter
  };

  const nextPage = () => {
    if (hasMoreData) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <div className="friends">
      <h3>FRIENDS</h3>
      {users.length > 0 ? (
        users.map((user) => (
          <div
            key={user.userId}
            className={`post-header ${
              selectedUser === user.userId ? "selected" : ""
            }`} // Apply "selected" class if user is selected
            onClick={() => handleUserClick(user.userId)} // Handle user click
          >
            <img
              src={`https://localhost:7222${user.imageUrl}`}
              alt={user.userName}
            />
            <div className="users">
              <p>{user.userName}</p>
              <span> Active Now</span>
            </div>
          </div>
        ))
      ) : (
        <p>No friends available.</p>
      )}

      <div className="pagination">
        <div className="pagi-prev">
          <button onClick={prevPage} disabled={currentPage === 1}>
            <FaChevronLeft />
          </button>{" "}
          <span>Prev</span>
        </div>
        <div className="pagi-next">
          <span>Next</span>

          <button onClick={nextPage} disabled={!hasMoreData}>
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Friends;
