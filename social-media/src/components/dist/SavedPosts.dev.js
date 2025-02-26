"use strict";

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _react = _interopRequireWildcard(require("react"));

var _UserContext = require("../components/UserContext");

require("./SavedPosts.css");

var _fa = require("react-icons/fa");

var _EmptySaved = _interopRequireDefault(require("./EnhanceUi/EmptySaved"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

// Import the useUser hook
// Added FaEllipsisV for the dropdown menu icon
var savePost = function savePost(postId) {
  var encodedPostId, encodedUserId, response, data;
  return regeneratorRuntime.async(function savePost$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log("Attempting to toggle save for postId:", postId);

          if (userId) {
            _context.next = 4;
            break;
          }

          alert("User ID is not available!");
          return _context.abrupt("return");

        case 4:
          _context.prev = 4;
          // Use the correct postId for the API request
          encodedPostId = encodeURIComponent(postId);
          encodedUserId = encodeURIComponent(userId);
          _context.next = 9;
          return regeneratorRuntime.awrap(fetch("https://localhost:7222/api/SocialMedia/toggle-save-post?userId=".concat(encodedUserId, "&postId=").concat(encodedPostId), {
            method: "POST",
            headers: {
              Accept: "application/json"
            }
          }));

        case 9:
          response = _context.sent;
          _context.next = 12;
          return regeneratorRuntime.awrap(response.json());

        case 12:
          data = _context.sent;
          console.log("Response from API:", data);

          if (response.ok && data.isSuccess) {
            console.log("Post saved/unsaved successfully:", postId);
            setSavedPosts(function (prevPosts) {
              return prevPosts.filter(function (post) {
                return post.savedPostId !== postId;
              });
            });
            alert(data.message);
          } else {
            alert("Failed to save/unsave post.");
          }

          _context.next = 21;
          break;

        case 17:
          _context.prev = 17;
          _context.t0 = _context["catch"](4);
          console.error("Error saving post:", _context.t0);
          alert("An error occurred while saving the post.");

        case 21:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[4, 17]]);
};

var _default = SavedPosts;
exports["default"] = _default;