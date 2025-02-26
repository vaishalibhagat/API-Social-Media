import React, { createContext, useState, useContext, useEffect } from "react";

// Create the context
const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || null
  );
  const [imageUrl, setImageUrl] = useState(
    localStorage.getItem("imageUrl") || null
  );

  // Persist user data to localStorage when they change
  useEffect(() => {
    if (userId && userName && imageUrl) {
      localStorage.setItem("userId", userId);
      localStorage.setItem("userName", userName);
      localStorage.setItem("imageUrl", imageUrl);
    } else {
      // Clear localStorage if any field is null
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("imageUrl");
    }
  }, [userId, userName, imageUrl]);

  // Logout function to clear user data
  const logout = () => {
    setUserId(null);
    setUserName(null);
    setImageUrl(null);
    localStorage.clear();
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        setUserId,
        userName,
        setUserName,
        imageUrl,
        setImageUrl,
        logout, // Provide the logout function
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the context
export const useUser = () => {
  return useContext(UserContext);
};
