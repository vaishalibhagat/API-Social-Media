using System.ComponentModel.DataAnnotations;

namespace EP.Service.SocialMediaAPI.model.Domain
{
    public class CommentLike
    {
        [Key]
        public Guid LikeId { get; set; } = Guid.NewGuid(); // Primary Key
        public Guid CommentId { get; set; } // Foreign Key to the Comment
        public Guid UserId { get; set; } // Foreign Key to the User
        public DateTime LikedOn { get; set; } = DateTime.UtcNow;

        // Navigation properties (optional)
        public Comment Comment { get; set; }
        public User User { get; set; }
    }
}
