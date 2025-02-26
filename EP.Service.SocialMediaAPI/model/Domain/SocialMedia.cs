using EP.Service.SocialMediaAPI.Model.Domain;

namespace EP.Service.SocialMediaAPI.model.Domain
{
    public class SocialMedia
    {
        
        public Guid SocialMediaID { get; set; }
        public string? ImageUrl { get; set; }
        public string Description { get; set; }     
        public User user { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime LastUpdatedDate { get; set; }

        // Navigation properties
        public List<Like> Likes { get; set; } = new List<Like>();
        public List<Comment> Comments { get; set; } = new List<Comment>();
        public ICollection<SavedPost> SavedPosts { get; set; }
        public ICollection<ArchivedPost> ArchivedPosts { get; set; }

        public SocialMedia()
        {
            CreatedDate = GetCurrentIndianTime();
            LastUpdatedDate = GetCurrentIndianTime();
        }

        // Helper method to get current Indian Standard Time
        private static DateTime GetCurrentIndianTime()
        {
            var indianTimeZone = TimeZoneInfo.FindSystemTimeZoneById("India Standard Time");
            return TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, indianTimeZone);
        }
    }
}
