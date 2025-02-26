using Microsoft.Extensions.Hosting;

namespace EP.Service.SocialMediaAPI.model.Domain
{
    public class Share
    {
        public Guid ShareId { get; set; } = Guid.NewGuid();
        public Guid PostId { get; set; }
        public Guid SharedFromUserId { get; set; }
        public Guid SharedToUserId { get; set; }
        public string ShareableUrl { get; set; }
        public DateTime SharedAt { get; set; } = DateTime.UtcNow;
    }
}
