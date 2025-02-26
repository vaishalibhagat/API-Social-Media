using System.Text.Json.Serialization;

namespace EP.Service.SocialMediaAPI.model.Domain
{
    public class Like
    {
        public Guid LikeId { get; set; } = Guid.NewGuid(); 
        public Guid UserId { get; set; }                 
        public Guid SocialMediaId { get; set; }          
        public DateTime LikedOn { get; set; } = DateTime.UtcNow;
        public User User { get; set; }

        [JsonIgnore]
        public SocialMedia SocialMedia { get; set; }
    }
}
