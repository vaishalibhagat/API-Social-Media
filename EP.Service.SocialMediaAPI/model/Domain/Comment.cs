using System.Text.Json.Serialization;

namespace EP.Service.SocialMediaAPI.model.Domain
{
    public class Comment
    {
        public Guid CommentId { get; set; } = Guid.NewGuid(); // Auto-generated GUID
        public Guid UserId { get; set; }                     // ID of the user who commented
        public Guid SocialMediaId { get; set; }             // ID of the associated SocialMedia post
        public string Text { get; set; }                    // The comment text
        public DateTime CommentedOn { get; set; } = DateTime.UtcNow; // Timestamp for when the comment was made

        // Navigation properties (optional, if you have relationships set up)
        public User User { get; set; }

        [JsonIgnore]
        public SocialMedia SocialMedia { get; set; }

        [JsonIgnore]
        public ICollection<Reply> Replies { get; set; } = new List<Reply>();

        public DateTime? LastUpdatedDate { get; set; }

        public bool IsPinned { get; set; } = false;  // New Field for Pinning
    }
}
