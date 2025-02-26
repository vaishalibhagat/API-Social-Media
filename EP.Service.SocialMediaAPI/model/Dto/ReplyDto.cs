namespace EP.Service.SocialMediaAPI.model.Dto
{
    public class ReplyDto
    {
        public Guid CommentId { get; set; }
        public Guid UserId { get; set; }
        public string Text { get; set; }
    }
}
