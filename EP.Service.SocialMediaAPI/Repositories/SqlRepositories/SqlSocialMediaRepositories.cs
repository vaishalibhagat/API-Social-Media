using EP.Service.SocialMediaAPI.Data;
using EP.Service.SocialMediaAPI.model.Domain;
using EP.Service.SocialMediaAPI.model.Dto;
using EP.Service.SocialMediaAPI.Model.Domain;
using EP.Service.SocialMediaAPI.Models.Dto;
using EP.Service.SocialMediaAPI.Repositories.IRepositories;
using Microsoft.EntityFrameworkCore;

namespace EP.Service.SocialMediaAPI.Repositories.SqlRepositories
{
    public class SqlSocialMediaRepositories : ISocialMediaRepositories
    {
        private readonly AppDbContext _context;
        private readonly IImageService _imageService;

        public SqlSocialMediaRepositories(AppDbContext context, IImageService imageService)
        {
            _context = context;
            _imageService = imageService;
        }

        public async Task<ResponseDto> CreateUserAsync(UserDto userDto)
        {
            try
            {
                var fileUrl = await _imageService.SaveImageAsync(userDto.ImageUrl);
                if (fileUrl == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Something went wrong while saving the image."
                    };
                }

                var user = new User
                {
                    UserId = Guid.NewGuid(), // Generate a new GUID for the user
                    UserName = userDto.UserName,
                    ImageUrl = fileUrl
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return new ResponseDto
                {
                    Result = user,
                    IsSuccess = true,
                    Message = "User created successfully."
                };
            }
            catch (Exception ex)
            {
                return new ResponseDto
                {
                    Result = null,
                    IsSuccess = false,
                    Message = $"Error while creating the user: {ex.Message}"
                };
            }
        }

        public async Task<ResponseDto> GetAllUsersAsync(int pageNumber, int pageSize)
        {
            try
            {
                var query = _context.Users
                    .AsNoTracking()
                    .AsQueryable();

                var totalCount = await query.CountAsync();

                var skipCount = (pageNumber - 1) * pageSize;

                var userList = await query
                    .OrderBy(u => u.UserId)
                    .Skip(skipCount)
                    .Take(pageSize)
                    .Select(user => new
                    {
                        user.UserId,
                        user.UserName,
                        user.ImageUrl,
                        SavedPostIds = _context.SavedPosts
                            .Where(sp => sp.UserId == user.UserId)
                            .Select(sp => sp.SavedPostId)
                            .ToList()
                    })
                    .ToListAsync();

                bool hasMoreData = (pageNumber * pageSize) < totalCount;

                var result = new
                {
                    Users = userList,
                    HasMoreData = hasMoreData
                };

                return new ResponseDto
                {
                    IsSuccess = true,
                    Result = result,
                    Message = hasMoreData ? "More users are available." : "No more users available."
                };
            }
            catch (Exception ex)
            {
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error retrieving users: {ex.Message}"
                };
            }
        }

        public async Task<ResponseDto> DeleteUserAsync(Guid userId)
        {
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "user not found"
                    };
                }

                _context.Users.Remove(user);
                await _context.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "user deleted successefully"
                };
            }

            catch(Exception ex)
            {
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error deleting user: {ex.Message}"
                };
            }
        }

        public async Task<ResponseDto> CreateSocialPostAsync(SocialMediaDto socialMediaDto)
        {
            try
            {
                // Validate if the image file is provided
                if (socialMediaDto.ImageUrl == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Image file can't be null."
                    };
                }

                // Use the image service to save the image and get the URL
                var fileUrl = await _imageService.SaveImageAsync(socialMediaDto.ImageUrl);
                if (fileUrl == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Something went wrong while saving the image."
                    };
                }


                var socialMedia = new SocialMedia
                {
                    SocialMediaID = Guid.NewGuid(),
                    Description = socialMediaDto.Description,
                    ImageUrl = fileUrl,
                    CreatedDate = DateTime.UtcNow,
                    LastUpdatedDate = DateTime.UtcNow,
                    user = await _context.Users.FindAsync(socialMediaDto.UserId)
                };

                // Add the SocialMedia entity to the context and save it
                await _context.SocialMedias.AddAsync(socialMedia);
                await _context.SaveChangesAsync();

                // Return success response
                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Social Media created successfully.",
                    Result = socialMedia
                };
            }
            catch (Exception ex)
            {

                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error creating social media: {ex.Message}"
                };
            }
        }

        public async Task<ResponseDto> GetAllSocialMediaAsync(int pageNumber, int pageSize, string searchVal = null)
        {
            try
            {
                var query = _context.SocialMedias
                    .Include(s => s.user) // Assuming 'user' is the navigation property for User
                    .Where(s => !_context.ArchivedPosts.Any(ap => ap.SocialMediaId == s.SocialMediaID)) // Exclude archived posts
                    .AsQueryable();

                // Apply search filter if searchVal is provided
                if (!string.IsNullOrEmpty(searchVal))
                {
                    query = query.Where(s => s.Description.Contains(searchVal));  // Searching by Description field
                }

                var totalPosts = await query.CountAsync();
                var skipCount = (pageNumber - 1) * pageSize;

                var socialMediaPosts = await query
                    .OrderByDescending(s => s.CreatedDate) // Order by latest created posts
                    .Skip(skipCount)
                    .Take(pageSize)
                    .Select(post => new
                    {
                        post.SocialMediaID,
                        post.Description,
                        post.ImageUrl,
                        post.user,
                        post.CreatedDate,
                        post.LastUpdatedDate,
                        LikeCount = post.Likes.Count(),
                        CommentCount = post.Comments.Count(),
                        SharedCount = _context.Shares.Count(share => share.PostId == post.SocialMediaID),
                    })
                    .ToListAsync();

                bool hasMorePosts = (pageNumber * pageSize) < totalPosts;

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = hasMorePosts ? "More posts available." : "No more posts available.",
                    Result = new
                    {
                        TotalPosts = totalPosts,
                        CurrentPage = pageNumber,
                        PageSize = pageSize,
                        Posts = socialMediaPosts,
                        HasMorePosts = hasMorePosts
                    }
                };
            }
            catch (Exception ex)
            {
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error retrieving social media posts: {ex.Message}"
                };
            }
        }

        public async Task<ResponseDto> GetUserSocialMediaPostsAsync(Guid userId, int pageNumber, int pageSize)
        {
            try
            {
                // Fetch social media posts for the specific user
                var query = _context.SocialMedias
                    .Include(post => post.Likes)
                    .Include(post => post.Comments)
                    .Include(post => post.user)
                    .Where(post => post.user.UserId == userId)
                    .OrderByDescending(post => post.CreatedDate)
                    .AsNoTracking();

                // Total count of user's social media posts
                var totalPosts = await query.CountAsync();

                // Pagination logic
                var skipCount = (pageNumber - 1) * pageSize;

                var userPosts = await query
                    .Skip(skipCount)
                    .Take(pageSize)
                    .Select(post => new
                    {
                        post.SocialMediaID,
                        post.user,
                        post.Description,
                        post.ImageUrl,
                        post.CreatedDate,
                        post.LastUpdatedDate,
                        LikeCount = post.Likes.Count,
                        CommentCount = post.Comments.Count,
                    })
                    .ToListAsync();

                // Check if there are more posts
                bool hasMorePosts = (pageNumber * pageSize) < totalPosts;

                // Prepare result
                var result = new
                {
                    TotalPosts = totalPosts,
                    CurrentPage = pageNumber,
                    PageSize = pageSize,
                    Posts = userPosts,
                    HasMorePosts = hasMorePosts
                };

                return new ResponseDto
                {
                    IsSuccess = true,
                    Result = result,
                    Message = hasMorePosts ? "More posts available." : "No more posts available."
                };
            }
            catch (Exception ex)
            {
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error retrieving user's posts: {ex.Message}"
                };
            }
        }

        public async Task<ResponseDto> UpdateSocialMediaAsync(Guid socialPostId, SocialMediaDto socialMediaDto)
        {
            try
            {
                // Find the SocialMedia post by its ID
                var socialMediaPost = await _context.SocialMedias.FindAsync(socialPostId);
                if (socialMediaPost == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Social Media post not found."
                    };
                }

                // Update the properties of the SocialMedia post

                socialMediaPost.Description = socialMediaDto.Description;

                // If a new image is provided, upload and update the image URL
                if (socialMediaDto.ImageUrl != null)
                {
                    var fileUrl = await _imageService.SaveImageAsync(socialMediaDto.ImageUrl);
                    if (fileUrl != null)
                    {
                        socialMediaPost.ImageUrl = fileUrl;
                    }
                    else
                    {
                        return new ResponseDto
                        {
                            IsSuccess = false,
                            Message = "Failed to upload the image."
                        };
                    }
                }

                // Update the LastUpdatedDate to the current time
                socialMediaPost.LastUpdatedDate = DateTime.UtcNow;

                // Save the changes to the database
                await _context.SaveChangesAsync();

                // Return success response
                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Social Media post updated successfully."
                };
            }
            catch (Exception ex)
            {
                // Handle any errors that occur during the update
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error updating Social Media post: {ex.Message}"
                };
            }
        }

        public async Task<ResponseDto> DeleteSocialMediaAsync(Guid socialPostId)
        {
            try
            {
                // Find the social media post by ID
                var socialMediaPost = await _context.SocialMedias.FindAsync(socialPostId);
                if (socialMediaPost == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Social Media post not found."
                    };
                }

                // Remove the social media post from the context
                _context.SocialMedias.Remove(socialMediaPost);
                await _context.SaveChangesAsync();

                // Return success response
                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Social Media post deleted successfully."
                };
            }
            catch (Exception ex)
            {
                // Handle any exceptions that occur during the deletion
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error deleting social media post: {ex.Message}"
                };
            }
        }

        public async Task<ResponseDto> ToggleLikeAsync(Guid socialMediaId, Guid userId)
        {
            try
            {
                // Check if the Social Media post exists
                var socialMediaPost = await _context.SocialMedias.FindAsync(socialMediaId);
                if (socialMediaPost == null)
                {
                    throw new Exception("Social Media post not found.");
                }

                // Check if the user has already liked the post
                var existingLike = await _context.Likes
                    .FirstOrDefaultAsync(l => l.SocialMediaId == socialMediaId && l.UserId == userId);

                if (existingLike != null)
                {
                    // Unlike the post (remove the like)
                    _context.Likes.Remove(existingLike);
                    await _context.SaveChangesAsync();

                    return new ResponseDto
                    {
                        IsSuccess = true,
                        Message = "Post unliked successfully."
                    };
                }
                else
                {
                    // Add a new like
                    var like = new Like
                    {
                        SocialMediaId = socialMediaId,
                        UserId = userId
                    };

                    await _context.Likes.AddAsync(like);
                    await _context.SaveChangesAsync();

                    return new ResponseDto
                    {
                        IsSuccess = true,
                        Message = "Post liked successfully."
                    };
                }
            }
            catch (Exception ex)
            {
                // Handle errors
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error toggling like: {ex.Message}"
                };
            }
        }

        public async Task<ResponseDto> GetAllLikesAsync(Guid socialMediaId, int pageNumber, int pageSize)
        {
            try
            {
                var query = _context.Likes
                    .Where(like => like.SocialMediaId == socialMediaId)
                    .Include(like => like.User)
                    .AsQueryable();

                var totalLikes = await query.CountAsync();

                var skipCount = (pageNumber - 1) * pageSize;

                var likes = await query
                    .OrderByDescending(like => like.LikedOn)
                    .Skip(skipCount)
                    .Take(pageSize)
                    .Select(like => new
                    {
                        like.LikeId,
                        LikedByUser = new
                        {
                            like.User.UserId,
                            like.User.UserName
                        },
                        like.SocialMediaId,
                        LikedOn = like.LikedOn
                    })
                    .ToListAsync();

                bool hasMoreLikes = (pageNumber * pageSize) < totalLikes;

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = hasMoreLikes ? "More likes available." : "No more likes available.",
                    Result = new
                    {
                        TotalLikes = totalLikes,
                        CurrentPage = pageNumber,
                        PageSize = pageSize,
                        Likes = likes,
                        HasMoreLikes = hasMoreLikes
                    }
                };
            }
            catch (Exception ex)
            {
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error retrieving likes: {ex.Message}"
                };
            }
        }

        public async Task<Guid> AddCommentAsync(Guid socialMediaId, Guid userId, string commentText)
        {
            try
            {
                // Check if the SocialMedia post exists
                var socialMediaPost = await _context.SocialMedias.FindAsync(socialMediaId);
                if (socialMediaPost == null)
                    throw new Exception("Social Media post not found.");

                // Check if the user exists
                var user = await _context.Users.FindAsync(userId);
                if (user == null)
                    throw new Exception("User not found.");

                // Create a new Comment object
                var comment = new Comment
                {
                    SocialMediaId = socialMediaId,
                    UserId = userId,
                    Text = commentText
                };

                // Add the comment to the database
                await _context.Comments.AddAsync(comment);
                await _context.SaveChangesAsync();

                return comment.CommentId; // Return the generated CommentId
            }
            catch (Exception ex)
            {
                // Log the error (optional logging mechanism)
                throw new Exception($"Error adding comment: {ex.Message}");
            }
        }

        public async Task<ResponseDto> GetAllCommentsAsync(Guid socialPostId, int pageNumber, int pageSize, bool? includePinned = null)
        {
            try
            {
                var query = _context.Comments
                    .Where(c => c.SocialMediaId == socialPostId)
                    .Include(c => c.User) // Include user details if needed
                    .AsQueryable();

                // If a filter for pinned comments is provided, apply it
                if (includePinned.HasValue)
                {
                    query = query.Where(c => c.IsPinned == includePinned.Value);
                }

                // Total count of comments
                var totalCount = await query.CountAsync();

                // Calculate the skip amount for the current page
                var skipCount = (pageNumber - 1) * pageSize;

                // Fetch paginated comments, order pinned comments first if necessary
                var comments = await query
                    .OrderByDescending(c => c.IsPinned)  // Pinned comments first, then unpinned
                    .ThenBy(c => c.UserId)               // Then order by UserId (you can change the order as needed)
                    .Skip(skipCount)
                    .Take(pageSize)
                    .ToListAsync();

                // Determine if there are more comments
                bool hasMoreComments = (pageNumber * pageSize) < totalCount;

                if (!comments.Any())
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "No comments found for this social media post."
                    };
                }

                // Prepare the result with comments and HasMore field
                var result = new
                {
                    TotalComments = totalCount,
                    CurrentPage = pageNumber,
                    PageSize = pageSize,
                    Comments = comments,
                    HasMoreComments = hasMoreComments
                };

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = hasMoreComments ? "More comments available." : "No more comments available.",
                    Result = result
                };
            }
            catch (Exception ex)
            {
                // Return failure response with error details
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error retrieving comments: {ex.Message}"
                };
            }
        }

        public async Task<ResponseDto> UpdateCommentAsync(Guid commentId, string newCommentText)
        {
            try
            {
                // Find the comment by ID
                var comment = await _context.Comments.FindAsync(commentId);
                if (comment == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Comment not found."
                    };
                }

                // Update the comment text
                comment.Text = newCommentText;
                //comment.LastUpdatedDate = DateTime.UtcNow;

                // Save changes to the database
                await _context.SaveChangesAsync();

                // Return success response
                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Comment updated successfully."
                };
            }
            catch (Exception ex)
            {
                // Handle any exceptions that occur during the update
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error updating comment: {ex.Message}"
                };
            }
        }

        public async Task<ResponseDto> DeleteCommentAsync(Guid commentId)
        {
            try
            {
                // Find the comment by ID
                var comment = await _context.Comments.FindAsync(commentId);
                if (comment == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Comment not found."
                    };
                }

                // Remove the comment from the context
                _context.Comments.Remove(comment);
                await _context.SaveChangesAsync();

                // Return success response
                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Comment deleted successfully."
                };
            }
            catch (Exception ex)
            {
                // Handle any exceptions that occur during the deletion
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error deleting comment: {ex.Message}"
                };
            }
        }

        public async Task<ResponseDto> VerifyUserExistsAsync(Guid userId)
        {
            var response = new ResponseDto();

            try
            {
                // Fetch the user by ID
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    // Include the ID and message in the Result field as an object
                    response.Result = new
                    {
                        Id = user.UserId,
                        Name = user.UserName,
                        Profile = user.ImageUrl,
                        Message = "User exists."
                    };
                    response.IsSuccess = true;
                }
                //if (user != null)
                //{
                //    // Map user to UserDto using AutoMapper
                //    response.Result = _mapper.Map<UserDto>(user);
                //    response.IsSuccess = true;
                //    response.Message = "User exists.";
                //}
                else
                {
                    // Handle user not found scenario
                    response.Result = null;
                    response.IsSuccess = false;
                    response.Message = "User not found.";
                }
            }
            catch (Exception ex)
            {
                // Log the error and set response for exception
                response.Result = null;
                response.IsSuccess = false;
                response.Message = $"Error verifying user: {ex.Message}";
            }

            return response;
        }

        public async Task<ResponseDto> ToggleSavePostAsync(Guid userId, Guid postId)
        {
            try
            {
                // Check if the post exists
                var post = await _context.SocialMedias.FindAsync(postId);
                if (post == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Post not found."
                    };
                }

                // Check if the post is already saved by the user
                var savedPost = await _context.SavedPosts
                    .FirstOrDefaultAsync(sp => sp.UserId == userId && sp.PostId == postId);

                if (savedPost != null)
                {
                    // Unsave the post
                    _context.SavedPosts.Remove(savedPost);
                    await _context.SaveChangesAsync();

                    return new ResponseDto
                    {
                        IsSuccess = true,
                        Message = "Post unsaved successfully."
                    };
                }
                else
                {
                    // Save the post
                    var newSavedPost = new SavedPost
                    {
                        UserId = userId,
                        PostId = postId
                    };

                    await _context.SavedPosts.AddAsync(newSavedPost);
                    await _context.SaveChangesAsync();

                    return new ResponseDto
                    {
                        IsSuccess = true,
                        Message = "Post saved successfully."
                    };
                }
            }
            catch (Exception ex)
            {
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error toggling save/unsave post: {ex.Message}"
                };
            }
        }

        public async Task<ResponseDto> GetSavedPostsByUserIdAsync(Guid userId, int pageNumber, int pageSize)
        {
            try
            {
                // Fetch the total count of saved posts for the user
                var totalPosts = await _context.SavedPosts
                    .Where(sp => sp.UserId == userId)
                    .CountAsync();

                // Check if there are no saved posts
                if (totalPosts == 0)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "No saved posts found for this user."
                    };
                }

                // Calculate the skip count for pagination
                var skipCount = (pageNumber - 1) * pageSize;

                // Fetch the paginated saved posts
                var savedPosts = await _context.SavedPosts
      .Where(sp => sp.UserId == userId)
      .Skip(skipCount)
      .Take(pageSize)
      .Select(sp => new
      {
          sp.SavedPostId,                             // SavedPostId
          sp.PostId,                                  // Post ID
          sp.SocialMedia.Description,                 // Post description
          sp.SocialMedia.ImageUrl,                    // Post image URL
          LikesCount = _context.Likes                 // Count likes for the post
              .Where(like => like.SocialMediaId == sp.PostId)
              .Count(),
          CommentsCount = _context.Comments           // Count comments for the post
              .Where(comment => comment.SocialMediaId == sp.PostId)
              .Count(),
          Comments = _context.Comments               // Fetch the comments
              .Where(comment => comment.SocialMediaId == sp.PostId)
              .Select(comment => new
              {
                  comment.CommentId,
                  comment.UserId,
                  comment.SocialMediaId,
                  comment.Text,
                  comment.CommentedOn,
                  User = new
                  {
                      comment.User.UserId,
                      comment.User.UserName,
                      comment.User.ImageUrl,
                  },
                  comment.LastUpdatedDate,
                  comment.IsPinned
              }).ToList()
      })
      .ToListAsync();


                // Check if there are no posts in the current page
                if (!savedPosts.Any())
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "No more saved posts available."
                    };
                }

                // Determine if there is more data available
                bool hasMoreData = (pageNumber * pageSize) < totalPosts;

                var result = new
                {
                    SavedPosts = savedPosts,
                    HasMoreData = hasMoreData,
                    TotalPosts = totalPosts
                };

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Saved posts retrieved successfully.",
                    Result = result
                };
            }
            catch (Exception ex)
            {
                // Handle exceptions and return an error response
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error fetching saved posts: {ex.Message}"
                };
            }
        }

        public async Task<ResponseDto> GetAllSavedPostsAsync(int pageNumber, int pageSize)
        {
            try
            {
                // Calculate the total count of saved posts
                var totalSavedPosts = await _context.SavedPosts.CountAsync();

                // Fetch paginated saved posts with associated details
                var savedPosts = await _context.SavedPosts
                    .OrderBy(sp => sp.SavedPostId) // Order by a specific field for consistency
                    .Skip((pageNumber - 1) * pageSize) // Skip posts for previous pages
                    .Take(pageSize) // Take posts for the current page
                    .Select(sp => new
                    {
                        sp.SavedPostId,                              // SavedPostId
                        sp.UserId,                                   // User ID
                        sp.PostId,                                   // Post ID
                        UserName = sp.User.UserName,                 // User's name (from User model)
                        sp.SocialMedia.Description,                 // Post description
                        sp.SocialMedia.ImageUrl                     // Post image URL (if any)
                    })
                    .ToListAsync();

                // Calculate HasMoreData
                var hasMoreData = (pageNumber * pageSize) < totalSavedPosts;

                // Check if no saved posts exist
                if (!savedPosts.Any())
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "No saved posts found.",
                        Result = new
                        {
                            HasMoreData = false,
                            Data = new List<object>()
                        }
                    };
                }

                // Return the paginated list of saved posts
                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Saved posts retrieved successfully.",
                    Result = new
                    {
                        HasMoreData = hasMoreData,
                        Data = savedPosts
                    }
                };
            }
            catch (Exception ex)
            {
                // Handle exceptions and return an error response
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error fetching saved posts: {ex.Message}"
                };
            }
        }

        public async Task<ResponseDto> ToggleArchivePostAsync(Guid userId, Guid postId)
        {
            try
            {
                // Check if the post exists
                var post = await _context.SocialMedias
                    .FirstOrDefaultAsync(sm => sm.SocialMediaID == postId);

                if (post == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Post not found."
                    };
                }

                // Check if the post is already archived by the user
                var archivedPost = await _context.ArchivedPosts
                    .FirstOrDefaultAsync(ap => ap.UserId == userId && ap.SocialMediaId == postId);

                if (archivedPost != null)
                {
                    // Unarchive the post (remove from ArchivedPosts)
                    _context.ArchivedPosts.Remove(archivedPost);
                    await _context.SaveChangesAsync();

                    return new ResponseDto
                    {
                        IsSuccess = true,
                        Message = "Post unarchived successfully."
                    };
                }
                else
                {
                    // Archive the post
                    var newArchivedPost = new ArchivedPost
                    {
                        ArchivedPostId = Guid.NewGuid(),
                        UserId = userId,
                        SocialMediaId = postId,
                        ArchivedOn = DateTime.UtcNow
                    };

                    await _context.ArchivedPosts.AddAsync(newArchivedPost);
                    await _context.SaveChangesAsync();

                    return new ResponseDto
                    {
                        IsSuccess = true,
                        Message = "Post archived successfully."
                    };
                }
            }
            catch (Exception ex)
            {
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error toggling archive state: {ex.Message}"
                };
            }
        }

        public async Task<ResponseDto> GetArchivedPostsAsync(Guid userId, int pageNumber, int pageSize)
        {
            try
            {
                var query = _context.ArchivedPosts
                    .Where(ap => ap.UserId == userId)
                    .Include(ap => ap.SocialMedia)
                    .Include(sm => sm.SocialMedia.Likes)
                    .Include(ap => ap.SocialMedia.Comments)
                    .Include(ap => ap.SocialMedia.user)
                    .Select(ap => ap.SocialMedia)
                    .AsNoTracking();

                var totalPosts = await query.CountAsync();

                var skipCount = (pageNumber - 1) * pageSize;

                var paginatedPosts = await query
                    .OrderByDescending(sm => sm.CreatedDate)
                    .Skip(skipCount)
                    .Take(pageSize)
                    .ToListAsync();

                bool hasMorePosts = (pageNumber * pageSize) < totalPosts;

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = hasMorePosts ? "More archived posts available." : "No more archived posts available.",
                    Result = new
                    {
                        TotalArchivedPosts = totalPosts,
                        CurrentPage = pageNumber,
                        PageSize = pageSize,
                        ArchivedPosts = paginatedPosts,
                        HasMorePosts = hasMorePosts
                    }
                };
            }
            catch (Exception ex)
            {
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error retrieving archived posts: {ex.Message}"
                };
            }
        }

        public async Task<ResponseDto> AddReplyAsync(ReplyDto replyDto)
        {
            try
            {
                // Validate parent comment existence
                var parentComment = await _context.Comments.FindAsync(replyDto.CommentId);
                if (parentComment == null)
                    throw new Exception("Parent comment not found.");

                // Validate user existence
                var user = await _context.Users.FindAsync(replyDto.UserId);
                if (user == null)
                    throw new Exception("User not found.");

                // Create and save the reply
                var reply = new Reply
                {
                    CommentId = replyDto.CommentId,
                    UserId = replyDto.UserId,
                    Text = replyDto.Text
                };

                await _context.Replies.AddAsync(reply);
                await _context.SaveChangesAsync();

                // Return a ResponseDto with the reply's ID and success status
                return new ResponseDto
                {
                    Result = reply.ReplyId, 
                    IsSuccess = true,         
                    Message = "Reply added successfully"
                };
            }
            catch (Exception ex)
            {
                // Handle errors gracefully and return a ResponseDto with failure status
                return new ResponseDto
                {
                    Result = null,        
                    IsSuccess = false,         
                    Message = $"Error adding reply: {ex.Message}"  
                };
            }
        }

        public async Task<ResponseDto> GetAllRepliesWithCommentsAsync(int pageNumber, int pageSize)
        {
            try
            {
                var query = _context.Replies
                    .Include(r => r.ParentComment)
                    .ThenInclude(c => c.User) // Ensure Comment's User details are included
                    .Include(r => r.User) // Ensure Reply's User details are included
                    .AsQueryable();

                // Total count of replies (for pagination metadata)
                var totalCount = await query.CountAsync();

                // Skip and take for pagination
                var skipCount = (pageNumber - 1) * pageSize;

                var repliesWithComments = await query
                    .OrderBy(r => r.ReplyId) // Change order if needed
                    .Skip(skipCount)
                    .Take(pageSize)
                    .Select(r => new
                    {
                        Comment = new
                        {
                            r.ParentComment.CommentId,
                            r.ParentComment.Text,
                            r.ParentComment.UserId,
                            CommentUser = r.ParentComment.User.UserName
                        },
                        Reply = new
                        {
                            r.UserId,
                            r.ReplyId,
                            r.Text,
                            ReplyUser = r.User.UserName
                        }
                    })
                    .ToListAsync();

                // Determine if there are more replies
                bool hasMoreReplies = (pageNumber * pageSize) < totalCount;

                if (!repliesWithComments.Any())
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "No replies found for the given criteria."
                    };
                }

                // Prepare the paginated result
                var result = new
                {
                    TotalReplies = totalCount,
                    CurrentPage = pageNumber,
                    PageSize = pageSize,
                    HasMoreReplies = hasMoreReplies,
                    Replies = repliesWithComments
                };

                return new ResponseDto
                {
                    Result = result,
                    IsSuccess = true,
                    Message = "Replies with comments fetched successfully."
                };
            }
            catch (Exception ex)
            {
                return new ResponseDto
                {
                    Result = null,
                    IsSuccess = false,
                    Message = $"Error fetching replies with comments: {ex.Message}"
                };
            }
        }

        public async Task<ResponseDto> ToggleLikeOnCommentAsync(Guid commentId, Guid userId)
        {
            try
            {
                // Check if the comment exists
                var comment = await _context.Comments.FindAsync(commentId);
                if (comment == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Comment not found."
                    };
                }

                // Check if the user has already liked the comment
                var existingLike = await _context.commentLike
                    .FirstOrDefaultAsync(cl => cl.CommentId == commentId && cl.UserId == userId);

                if (existingLike != null)
                {
                    // Unlike the comment if already liked (remove the like)
                    _context.commentLike.Remove(existingLike);
                    await _context.SaveChangesAsync();

                    return new ResponseDto
                    {
                        IsSuccess = true,
                        Message = "Like removed from comment."
                    };
                }
                else
                {
                    // Add a new like if the user has not liked the comment yet
                    var like = new CommentLike
                    {
                        CommentId = commentId,
                        UserId = userId,
                        LikedOn = DateTime.UtcNow
                    };

                    // Add the like to the database
                    await _context.commentLike.AddAsync(like);
                    await _context.SaveChangesAsync();

                    return new ResponseDto
                    {
                        IsSuccess = true,
                        Message = "Like added to comment."
                    };
                }
            }
            catch (Exception ex)
            {
                // Return a failure response with the error details
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error toggling like: {ex.Message}"
                };
            }
        }

        public async Task<ResponseDto> SharePostAsync(SharePostDto sharePostDto)
        {
            try
            {
                // Validate Post
                var post = await _context.SocialMedias.FindAsync(sharePostDto.PostId);
                if (post == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Post not found."
                    };
                }

                // Validate SharedFrom User
                var fromUser = await _context.Users.FindAsync(sharePostDto.SharedFromUserId);
                if (fromUser == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Sender user not found."
                    };
                }

                // Validate SharedTo User
                var toUser = await _context.Users.FindAsync(sharePostDto.SharedToUserId);
                if (toUser == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Recipient user not found."
                    };
                }

                // Generate Shareable URL
                string baseUrl = "https://yourapp.com/posts";  // Replace with your domain
                string shareableUrl = $"{baseUrl}/{sharePostDto.PostId}";

                // Save Share
                var share = new Share
                {
                    PostId = sharePostDto.PostId,
                    SharedFromUserId = sharePostDto.SharedFromUserId,
                    SharedToUserId = sharePostDto.SharedToUserId,
                    ShareableUrl = shareableUrl
                };

                _context.Shares.Add(share);
                await _context.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = "Post shared successfully.",
                    Result = shareableUrl  // Return the shareable URL
                };
            }
            catch (Exception ex)
            {
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error while sharing the post: {ex.Message}"
                };
            }
        }

        public async Task<ResponseDto> GetSharedPostsByUserIdAsync(Guid userId)
        {
            try
            {
                // Check if the user exists
                var userExists = await _context.Users.AnyAsync(u => u.UserId == userId);
                if (!userExists)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "User not found."
                    };
                }

                // Fetch all posts shared to the user
                var sharedPosts = await _context.Shares
                    .Where(s => s.SharedToUserId == userId)
                    .Select(s => new
                    {
                        s.PostId,
                        SharedFromUserId = s.SharedFromUserId,
                        SharedFromUserName = _context.Users
                            .Where(u => u.UserId == s.SharedFromUserId)
                            .Select(u => u.UserName)
                            .FirstOrDefault(),

                        // Dynamically generated shareable URL
                        ShareableUrl = $"https://yourapp.com/api/socialmedia/view-post/{s.PostId}",

                        // Fetching post details
                        Description = _context.SocialMedias
                            .Where(p => p.SocialMediaID == s.PostId)
                            .Select(p => p.Description) // Assuming your posts have a Description field
                            .FirstOrDefault(),

                        ImageUrl = _context.SocialMedias
                            .Where(p => p.SocialMediaID == s.PostId)
                            .Select(p => p.ImageUrl) // Assuming your posts have an ImageUrl field
                            .FirstOrDefault(),

                        // Fetching the user details
                        User = new
                        {
                            UserId = userId,
                            UserName = _context.Users
                                .Where(u => u.UserId == userId)
                                .Select(u => u.UserName)
                                .FirstOrDefault(),
                            ImageUrl = _context.Users
                                .Where(u => u.UserId == userId)
                                .Select(u => u.ImageUrl) // Assuming the users table has an ImageUrl field
                                .FirstOrDefault(),
                            SavedPosts = _context.SavedPosts
                                .Where(sp => sp.UserId == userId)
                                .Select(sp => sp.PostId) // Assuming the SavedPosts table stores saved post Ids
                                .ToList()
                        },

                        CreatedDate = _context.SocialMedias
                            .Where(p => p.SocialMediaID == s.PostId)
                            .Select(p => p.CreatedDate) // Assuming posts have CreatedDate
                            .FirstOrDefault(),

                        LastUpdatedDate = _context.SocialMedias
                            .Where(p => p.SocialMediaID == s.PostId)
                            .Select(p => p.LastUpdatedDate) // Assuming posts have LastUpdatedDate
                            .FirstOrDefault(),

                      

                        SharedCount = _context.Shares
                            .Where(sh => sh.PostId == s.PostId)
                            .Count()
                    })
                    .ToListAsync();

                if (!sharedPosts.Any())
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "No posts shared to this user."
                    };
                }

                return new ResponseDto
                {
                    IsSuccess = true,
                    Result = sharedPosts,
                    Message = "Shared posts retrieved successfully."
                };
            }
            catch (Exception ex)
            {
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error retrieving shared posts: {ex.Message}"
                };
            }
        }


        public async Task<ResponseDto> PinCommentAsync(Guid commentId, Guid userId, Guid socialMediaId, bool isPinned)
        {
            try
            {
                var comment = await _context.Comments
                    .FirstOrDefaultAsync(c => c.CommentId == commentId && c.UserId == userId && c.SocialMediaId == socialMediaId);

                if (comment == null)
                {
                    return new ResponseDto
                    {
                        IsSuccess = false,
                        Message = "Comment not found for the specified user and post."
                    };
                }

                comment.IsPinned = isPinned;
                comment.LastUpdatedDate = DateTime.UtcNow;

                _context.Comments.Update(comment);
                await _context.SaveChangesAsync();

                return new ResponseDto
                {
                    IsSuccess = true,
                    Message = isPinned ? "Comment pinned successfully." : "Comment unpinned successfully."
                };
            }
            catch (Exception ex)
            {
                return new ResponseDto
                {
                    IsSuccess = false,
                    Message = $"Error while pinning the comment: {ex.Message}"
                };
            }
        }

    }
}
