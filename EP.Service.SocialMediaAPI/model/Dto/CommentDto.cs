namespace EP.Service.SocialMediaAPI.model.Dto
{
    public class CommentDto
    {

        public Guid SocialMediaId { get; set; }
        public Guid UserId { get; set; }
        public string Text { get; set; }
    }
}
