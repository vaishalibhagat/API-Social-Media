using EP.Service.SocialMediaAPI.model.Domain;
using EP.Service.SocialMediaAPI.model.Dto;
using EP.Service.SocialMediaAPI.Models.Dto;
using System.Threading.Tasks;

namespace EP.Service.SocialMediaAPI.Repositories.IRepositories
{
    public interface ISocialMediaRepositories
    {
        Task<ResponseDto> CreateUserAsync(UserDto userDto);
        Task<ResponseDto> GetAllUsersAsync(int pageNumber, int pageSize);
        Task<ResponseDto> DeleteUserAsync(Guid userId);
        Task<ResponseDto> CreateSocialPostAsync(SocialMediaDto socialMediaDto);
        Task<ResponseDto> GetAllSocialMediaAsync(int pageNumber, int pageSize, string searchVal = null);
        Task<ResponseDto> GetUserSocialMediaPostsAsync(Guid userId, int pageNumber, int pageSize);
        Task<ResponseDto> UpdateSocialMediaAsync(Guid socialPostId, SocialMediaDto socialMediaDto);
        Task<ResponseDto> DeleteSocialMediaAsync(Guid socialPostId);
        Task<ResponseDto> ToggleLikeAsync(Guid socialMediaId, Guid userId);
        Task<ResponseDto> GetAllLikesAsync(Guid socialPostId, int pageNumber, int pageSize);
        Task<Guid> AddCommentAsync(Guid socialMediaId, Guid userId, string commentText);
        Task<ResponseDto> GetAllCommentsAsync(Guid socialPostId, int pageNumber, int pageSize, bool? includePinned = null);
        Task<ResponseDto> UpdateCommentAsync(Guid commentId, string newCommentText);
        Task<ResponseDto> DeleteCommentAsync(Guid commentId);
        Task<ResponseDto> VerifyUserExistsAsync(Guid userId);
        Task<ResponseDto> ToggleSavePostAsync(Guid userId, Guid postId);
        Task<ResponseDto> GetSavedPostsByUserIdAsync(Guid userId, int pageNumber, int pageSize);
        Task<ResponseDto> GetAllSavedPostsAsync(int pageNumber, int pageSize);
        Task<ResponseDto> ToggleArchivePostAsync(Guid userId, Guid postId);
        Task<ResponseDto> GetArchivedPostsAsync(Guid userId, int pageNumber, int pageSize);
        Task<ResponseDto> AddReplyAsync(ReplyDto replyDto);
        Task<ResponseDto> GetAllRepliesWithCommentsAsync(int pageNumber, int pageSize);
        Task<ResponseDto> ToggleLikeOnCommentAsync(Guid commentId, Guid userId);
        Task<ResponseDto> SharePostAsync(SharePostDto sharePostDto);
        Task<ResponseDto> GetSharedPostsByUserIdAsync(Guid userId);
        Task<ResponseDto> PinCommentAsync(Guid commentId, Guid userId, Guid socialMediaId, bool isPinned);


    }
}
    