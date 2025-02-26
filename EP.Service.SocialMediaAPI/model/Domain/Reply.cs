namespace EP.Service.SocialMediaAPI.model.Domain
{
    public class Reply
    {
        public Guid ReplyId { get; set; } = Guid.NewGuid();  
        public Guid CommentId { get; set; }           
        public Guid UserId { get; set; }                   
        public string Text { get; set; }                   
        public DateTime RepliedOn { get; set; } = DateTime.UtcNow; 

        // Navigation properties
        public Comment ParentComment { get; set; }
        public User User { get; set; }
    }
}
