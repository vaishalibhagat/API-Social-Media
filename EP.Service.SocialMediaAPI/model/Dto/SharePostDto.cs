namespace EP.Service.SocialMediaAPI.model.Dto
{
    public class SharePostDto
    {
        public Guid PostId { get; set; }
        public Guid SharedFromUserId { get; set; }
        public Guid SharedToUserId { get; set; }
    }
}
