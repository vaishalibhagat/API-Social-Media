import { useLocation } from "react-router-dom";
import { useUser } from "../UserContext";

const ProfileVisble = () => {
  const { userName, imageUrl } = useUser(); // Access user details from context
  const location = useLocation(); // Get the current route

  return (
    <div>
      {location.pathname === "/" && userName && imageUrl && (
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
  );
};

export default ProfileVisble;
