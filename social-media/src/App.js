import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Sidebar from "./components/Sidebar";
import PostSection from "./components/PostSection";
import Friends from "./components/Friends";
import Header from "./components/Header";
import PostPage from "./components/PostPage";
import SavedPosts from "./components/SavedPosts";
import ArchivePosts from "./components/ArchivePosts";
import Login from "./components/Login";
import PostBox from "./components/PostBox";
import { UserProvider } from "./components/UserContext";
import UserDetails from "./components/UserDetails";
import VerifyUserForm from "./components/VerifyUserForm";
import SharedPosts from "./components/sharepost/SharedPosts";

const AppContent = () => {
  const location = useLocation();
  const [redirectToAccount, setRedirectToAccount] = useState(true);

  useEffect(() => {
    // Set a timeout to switch behavior after the first render
    const timer = setTimeout(() => {
      setRedirectToAccount(false);
    }, 0); // Adjust delay as needed, e.g., 1000ms for 1-second delay

    return () => clearTimeout(timer); // Cleanup the timeout
  }, []);

  // Routes where Sidebar should be hidden
  const hideSidebarRoutes = ["/account", "/login", "/createpost"];

  const shouldHideSidebar = hideSidebarRoutes.includes(location.pathname);

  return (
    <div
      style={{
        background: "#1d1f26",
        height: "100vh",
        overflow: "hidden",
        width: "1390px",
        borderBottom: "1px solid white",
      }}
    >
      {/* Main Content */}
      <div
        style={{
          display: "flex",
          height: "100%",
        }}
      >
        {/* Conditionally Render Sidebar */}
        {!shouldHideSidebar && (
          <Sidebar
            style={{
              position: "fixed",
              top: "60px",
              left: 0,
              bottom: 0,
              width: "20%",
              marginTop: "30px",
            }}
          />
        )}

        {/* Dynamic Content Section */}
        <div
          style={{
            flex: 2,
            overflowY: "auto",
            height: "calc(100vh - 8px)",
            scrollbarWidth: "none",
            padding: "3px 3px",
          }}
        >
          <Routes>
            {/* Redirect from "/" to "/account" */}
            {/* Redirect initially, then render PostSection */}
            {redirectToAccount ? (
              <Route path="/" element={<Navigate to="/account" replace />} />
            ) : (
              <Route path="/" element={<PostSection />} />
            )}
            {/* Other routes */}
            <Route path="/" element={<PostSection />} />
            <Route path="/post" element={<PostPage />} />
            <Route path="/saved" element={<SavedPosts />} />
            <Route path="/archive" element={<ArchivePosts />} />
            <Route path="/account" element={<VerifyUserForm />} />
            <Route path="/login" element={<Login />} />
            <Route path="/createpost" element={<PostBox />} />
            <Route path="/user/:userId" element={<UserDetails />} />
            <Route path="/friends" element={<Friends />} />
            <Route path="/shared" element={<SharedPosts />} />
          </Routes>
        </div>

        {/* Right Section (Friends) */}
        <Routes>
          <Route
            path="/"
            element={
              <Friends
                style={{
                  position: "fixed",
                  top: "60px",
                  right: 0,
                  bottom: 0,
                  width: "25%",
                }}
              />
            }
          />
          <Route
            path="/user/:userId"
            element={
              <Friends
                style={{
                  position: "fixed",
                  top: "60px",
                  right: 0,
                  bottom: 0,
                  width: "20%",
                }}
              />
            }
          />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
};

export default App;
