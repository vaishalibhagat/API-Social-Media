using EP.Service.SocialMediaAPI.model.Domain;
using EP.Service.SocialMediaAPI.model.Dto;
using EP.Service.SocialMediaAPI.Models.Dto;
using EP.Service.SocialMediaAPI.Repositories.IRepositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace EP.Service.SocialMediaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SocialMediaController : ControllerBase
    {
        private readonly ISocialMediaRepositories _socialMediaRepository;

        public SocialMediaController(ISocialMediaRepositories socialMediaRepository)
        {
            _socialMediaRepository = socialMediaRepository;
        }


        [HttpPost("create-user")]
        public async Task<IActionResult> CreateUser([FromForm] UserDto userDto)
        {
            try
            {
                var response = await _socialMediaRepository.CreateUserAsync(userDto);
                if (response.IsSuccess)
                {
                    return Ok(response); // Return success response with the created user
                }

                return BadRequest(response); // Return failure response
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Internal server error: {ex.Message}"
                });
            }
        }


        [HttpGet("get-all-users")]
        public async Task<IActionResult> GetAllUsers([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var response = await _socialMediaRepository.GetAllUsersAsync(pageNumber, pageSize);

                if (response.IsSuccess)
                {
                    return Ok(response);  // Return success response with paginated users
                }

                return BadRequest(response);  // Return failure response if pagination fails
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Internal server error: {ex.Message}"
                });
            }
        }


        [HttpDelete("{UserId}")]
        public async Task<IActionResult> DeleteUser(Guid UserId)
        {
            var response = await _socialMediaRepository.DeleteUserAsync(UserId);

            if (!response.IsSuccess)
            {
                return NotFound(response);
            }

            return Ok(response);
        }


        [HttpPost("create-SocialPost")]
        public async Task<IActionResult> CreateSocialPost([FromForm] SocialMediaDto socialMediaDto)
        {
            try
            {
                // Call the repository method to create social media
                var response = await _socialMediaRepository.CreateSocialPostAsync(socialMediaDto);

                if (!response.IsSuccess)
                {
                    return BadRequest(response); // Return failure response
                }

                return Ok(response); // Return success response with the created object
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new ResponseDto
                {
                    IsSuccess = false,
                    Message = ex.Message
                });
            }
        }


        [HttpGet]
        public async Task<IActionResult> GetAllSocialMediaAsync(int pageNumber = 1, int pageSize = 10, string searchVal = null)
        {
            try
            {
                // Call the service method to get social media posts with pagination and search
                var response = await _socialMediaRepository.GetAllSocialMediaAsync(pageNumber, pageSize, searchVal);

                if (response.IsSuccess)
                {
                    return Ok(response); // Return success response with posts
                }
                else
                {
                    return BadRequest(response); // Return failure response if something goes wrong
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error retrieving social media posts: {ex.Message}"
                });
            }
        }


        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetUserSocialMediaPosts(Guid userId, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var response = await _socialMediaRepository.GetUserSocialMediaPostsAsync(userId, pageNumber, pageSize);

                if (!response.IsSuccess)
                    return BadRequest(response);

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred while fetching user posts: {ex.Message}"
                });
            }
        }


        [HttpPut("update-socialPost/{socialPostId}")]
        public async Task<IActionResult> UpdateSocialMedia(Guid socialPostId, [FromForm] SocialMediaDto socialMediaDto)
        {
            try
            {
                // Validate the request
                if (socialMediaDto == null || string.IsNullOrWhiteSpace(socialMediaDto.Description))
                {
                    return BadRequest("Invalid input data.Description is required.");
                }

                // Call the repository method to update the social media post
                var response = await _socialMediaRepository.UpdateSocialMediaAsync(socialPostId, socialMediaDto);

                if (!response.IsSuccess)
                {
                    return NotFound(response); // Return failure response if the post is not found
                }

                return Ok(response); // Return success response
            }
            catch (Exception ex)
            {
                // Return internal server error response with exception details
                return StatusCode(StatusCodes.Status500InternalServerError, new ResponseDto
                {
                    IsSuccess = false,
                    Message = ex.Message
                });
            }
        }


        [HttpDelete("delete-socialPost/{socialPostId}")]
        public async Task<IActionResult> DeleteSocialMedia(Guid socialPostId)
        {
            try
            {
                // Call the repository method to delete the social media post
                var response = await _socialMediaRepository.DeleteSocialMediaAsync(socialPostId);

                if (!response.IsSuccess)
                {
                    return NotFound(response); // Return failure response if the social media post is not found
                }

                return Ok(response); // Return success response
            }
            catch (Exception ex)
            {
                // Return internal server error response with exception details
                return StatusCode(StatusCodes.Status500InternalServerError, new ResponseDto
                {
                    IsSuccess = false,
                    Message = ex.Message
                });
            }
        }     


        [HttpPost("toggle-like")]
        public async Task<IActionResult> ToggleLike([FromForm] LikeDto request)
        {
            try
            {
                // Validate input
                if (request.SocialMediaId == Guid.Empty || request.UserId == Guid.Empty)
                {
                    return BadRequest(new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Invalid SocialMediaId or UserId."
                    });
                }

                // Call the repository method
                var response = await _socialMediaRepository.ToggleLikeAsync(request.SocialMediaId, request.UserId);

                if (!response.IsSuccess)
                {
                    return BadRequest(response); // Return failure response
                }

                return Ok(response); // Return success response
            }
            catch (Exception ex)
            {
                // Handle server errors
                return StatusCode(StatusCodes.Status500InternalServerError, new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Internal server error: {ex.Message}"
                });
            }
        }


        [HttpGet("get-all-likes/{socialMediaId}")]
        public async Task<IActionResult> GetAllLikes(Guid socialMediaId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                // Call the repository method to fetch paginated likes
                var response = await _socialMediaRepository.GetAllLikesAsync(socialMediaId, pageNumber, pageSize);

                if (!response.IsSuccess)
                {
                    return NotFound(response); // Return failure response if no likes found
                }

                return Ok(response); // Return success response with likes
            }
            catch (Exception ex)
            {
                // Return server error response with exception details
                return StatusCode(StatusCodes.Status500InternalServerError, new ResponseDto
                {
                    IsSuccess = false,
                    Message = ex.Message
                });
            }
        }


        [HttpPost("add-comment")]
        public async Task<IActionResult> AddComment([FromForm] CommentDto request)
        {
            try
            {
                // Validate the request
                if (request.SocialMediaId == Guid.Empty || request.UserId == Guid.Empty || string.IsNullOrWhiteSpace(request.Text))
                    return BadRequest("Invalid input data.");

                // Call the repository method
                var commentId = await _socialMediaRepository.AddCommentAsync(request.SocialMediaId, request.UserId, request.Text);

                return Ok(new
                {
                    Message = "Comment added successfully.",
                    CommentId = commentId
                });
            }
            catch (Exception ex)
            {
                // Return the error response
                return StatusCode(500, new
                {
                    Message = "An error occurred while adding the comment.",
                    Error = ex.Message
                });
            }
        }


        [HttpGet("get-all-comments/{socialPostId}")]
        public async Task<IActionResult> GetAllComments(Guid socialPostId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                // Call the repository method to fetch paginated comments for the specific social media post
                var response = await _socialMediaRepository.GetAllCommentsAsync(socialPostId, pageNumber, pageSize);

                if (!response.IsSuccess)
                {
                    return NotFound(response); // Return failure response if no comments found
                }

                return Ok(response); // Return success response with comments
            }
            catch (Exception ex)
            {
                // Return server error response with exception details
                return StatusCode(StatusCodes.Status500InternalServerError, new ResponseDto
                {
                    IsSuccess = false,
                    Message = ex.Message
                });
            }
        }


        [HttpPut("update-comment/{commentId}")]
        public async Task<IActionResult> UpdateComment(Guid commentId, [FromForm] CommentDto request)
        {
            try
            {
                // Validate the request
                if (string.IsNullOrWhiteSpace(request.Text))
                {
                    return BadRequest("Invalid input data. Comment text is required.");
                }

                // Call the repository method to update the comment
                var response = await _socialMediaRepository.UpdateCommentAsync(commentId, request.Text);

                if (!response.IsSuccess)
                {
                    return NotFound(response); // Return failure response if the comment is not found
                }

                return Ok(response); // Return success response
            }
            catch (Exception ex)
            {
                // Return internal server error response with exception details
                return StatusCode(StatusCodes.Status500InternalServerError, new ResponseDto
                {
                    IsSuccess = false,
                    Message = ex.Message
                });
            }
        }


        [HttpDelete("delete-comment/{commentId}")]
        public async Task<IActionResult> DeleteComment(Guid commentId)
        {
            try
            {
                // Call the repository method to delete the comment
                var response = await _socialMediaRepository.DeleteCommentAsync(commentId);

                if (!response.IsSuccess)
                {
                    return NotFound(response); // Return failure response if the comment is not found
                }

                return Ok(response); // Return success response
            }
            catch (Exception ex)
            {
                // Return internal server error response with exception details
                return StatusCode(StatusCodes.Status500InternalServerError, new ResponseDto
                {
                    IsSuccess = false,
                    Message = ex.Message
                });
            }
        }


        [HttpGet("verify-user/{userId}")]
        public async Task<IActionResult> VerifyUser(Guid userId)
        {
            var response = await _socialMediaRepository.VerifyUserExistsAsync(userId);

            if (response.IsSuccess)
            {
                // Return 200 OK with the response DTO
                return Ok(response);
            }
            else
            {
                // Return 404 Not Found with the response DTO
                return NotFound(response);
            }
        }


        [HttpPost("toggle-save-post")]
        public async Task<IActionResult> ToggleSavePost([FromQuery] Guid userId, [FromQuery] Guid postId)
        {
            try
            {
                var response = await _socialMediaRepository.ToggleSavePostAsync(userId, postId);

                if (!response.IsSuccess)
                {
                    return BadRequest(response); // Return failure response
                }

                return Ok(response); // Return success response
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error toggling save/unsave post: {ex.Message}"
                });
            }
        }


        [HttpGet("saved-posts/{userId:guid}")]
        public async Task<IActionResult> GetSavedPostsByUserId(Guid userId, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                // Call the repository method to get saved posts with pagination
                var response = await _socialMediaRepository.GetSavedPostsByUserIdAsync(userId, pageNumber, pageSize);

                // Check the response and return appropriate status codes
                if (response.IsSuccess)
                {
                    return Ok(response); // Return 200 OK with the result
                }
                else
                {
                    return NotFound(response); // Return 404 Not Found if no posts
                }
            }
            catch (Exception ex)
            {
                // Return a 500 Internal Server Error for unexpected errors
                return StatusCode(500, new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred while fetching saved posts: {ex.Message}"
                });
            }
        }


        [HttpGet("saved-posts/all")]
        public async Task<IActionResult> GetAllSavedPosts([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                // Validate pagination parameters
                if (pageNumber <= 0 || pageSize <= 0)
                {
                    return BadRequest(new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Page number and page size must be greater than zero."
                    });
                }

                // Call the repository method to get paginated saved posts
                var response = await _socialMediaRepository.GetAllSavedPostsAsync(pageNumber, pageSize);

                // Check the response and return appropriate status codes
                if (response.IsSuccess)
                {
                    return Ok(response); // Return 200 OK with the result
                }
                else
                {
                    return NotFound(response); // Return 404 Not Found if no posts
                }
            }
            catch (Exception ex)
            {
                // Return a 500 Internal Server Error for unexpected errors
                return StatusCode(500, new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred while fetching all saved posts: {ex.Message}"
                });
            }
        }


        [HttpPost("toggle-archive")]
        public async Task<IActionResult> ToggleArchivePost([FromQuery] Guid userId, [FromQuery] Guid postId)
        {
            try
            {
                var response = await _socialMediaRepository.ToggleArchivePostAsync(userId, postId);

                if (!response.IsSuccess)
                {
                    return BadRequest(response); // Return failure response
                }

                return Ok(response); // Return success response
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error toggling archive state: {ex.Message}"
                });
            }
        }


        [HttpGet("archived-posts/{userId}")]
        public async Task<IActionResult> GetArchivedPosts(Guid userId, int pageNumber = 1, int pageSize = 10)
        {
            try
            {
                var response = await _socialMediaRepository.GetArchivedPostsAsync(userId, pageNumber, pageSize);

                if (!response.IsSuccess)
                {
                    return response.Result == null
                        ? NotFound(response)
                        : BadRequest(response);
                }

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error retrieving archived posts: {ex.Message}"
                });
            }
        }


        [HttpPost("Reply-on-comment")]
        public async Task<IActionResult> AddReply([FromForm] ReplyDto replyDto)
        {
            try
            {
                var replyId = await _socialMediaRepository.AddReplyAsync(replyDto);
                return Ok(new { ReplyId = replyId });
            }
            catch (Exception ex)
            {

                return BadRequest(new { Message = $"Error adding reply: {ex.Message}" });
            }
        }


        [HttpGet("replies-with-comments")]
        public async Task<IActionResult> GetAllRepliesWithComments([FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                // Call the repository method with pagination parameters
                var response = await _socialMediaRepository.GetAllRepliesWithCommentsAsync(pageNumber, pageSize);

                if (response.IsSuccess)
                {
                    return Ok(response); // Return success response
                }
                else
                {
                    return BadRequest(response); // Return bad request if unsuccessful
                }
            }
            catch (Exception ex)
            {
                // Log error (optional) and return general error response
                var errorResponse = new ResponseDto
                {
                    Result = null,
                    IsSuccess = false,
                    Message = $"An error occurred while fetching replies: {ex.Message}"
                };
                return StatusCode(500, errorResponse);
            }
        }


        [HttpPost("toggle-like-on-comment")]
        public async Task<IActionResult> ToggleLikeOnComment([FromQuery] Guid commentId, [FromQuery] Guid userId)
        {
            try
            {
                // Validate input parameters
                if (commentId == Guid.Empty || userId == Guid.Empty)
                {
                    return BadRequest(new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Invalid CommentId or UserId."
                    });
                }

                // Call the repository method to toggle like
                var response = await _socialMediaRepository.ToggleLikeOnCommentAsync(commentId, userId);

                if (!response.IsSuccess)
                {
                    return BadRequest(response); // Return failure response if an error occurs
                }

                return Ok(response); // Return success response
            }
            catch (Exception ex)
            {
                // Handle server errors
                return StatusCode(StatusCodes.Status500InternalServerError, new ResponseDto
                {
                    IsSuccess = false,
                    Message = ex.Message
                });
            }
        }


        [HttpPost("share-post")]
        public async Task<IActionResult> SharePost([FromBody] SharePostDto sharePostDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Invalid data provided."
                    });
                }

                var response = await _socialMediaRepository.SharePostAsync(sharePostDto);

                if (response.IsSuccess)
                {
                    return Ok(response);
                }

                return BadRequest(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred while sharing the post: {ex.Message}"
                });
            }
        }


        [HttpGet("shared-posts/{userId}")]
        public async Task<IActionResult> GetSharedPostsByUserId(Guid userId)
        {
            try
            {
                var response = await _socialMediaRepository.GetSharedPostsByUserIdAsync(userId);

                if (response.IsSuccess)
                {
                    return Ok(response);
                }

                return NotFound(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error retrieving shared posts: {ex.Message}"
                });
            }
        }


        [HttpPost("pin-comment")]
        public async Task<IActionResult> PinComment(Guid commentId, Guid userId, Guid socialMediaId, bool isPinned)
        {
            try
            {
                var response = await _socialMediaRepository.PinCommentAsync(commentId, userId, socialMediaId, isPinned);

                if (response.IsSuccess)
                {
                    return Ok(response);
                }

                return BadRequest(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"An error occurred: {ex.Message}"
                });
            }
        }
    }

}

