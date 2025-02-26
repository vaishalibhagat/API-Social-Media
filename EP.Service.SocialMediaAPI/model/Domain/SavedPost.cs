namespace EP.Service.SocialMediaAPI.model.Domain
{
    public class SavedPost
    {
        public Guid SavedPostId { get; set; } = Guid.NewGuid();  // Primary Key
        public Guid UserId { get; set; }                        // Foreign Key to User
        public Guid PostId { get; set; }                        // Foreign Key to SocialMedia Post
        public DateTime SavedOn { get; set; } = DateTime.UtcNow;

        // Navigation Properties
        public User User { get; set; }
        public SocialMedia SocialMedia { get; set; }
    }
}
