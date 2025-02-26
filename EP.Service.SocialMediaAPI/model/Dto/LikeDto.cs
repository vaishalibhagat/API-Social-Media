namespace EP.Service.SocialMediaAPI.model.Dto
{
    public class LikeDto
    {
        public Guid SocialMediaId { get; set; }
        public Guid UserId { get; set; }
        public Guid CommentId { get; set; } // For liking a comment
    
    }
}
