using EP.Service.SocialMediaAPI.Model.Domain;

namespace EP.Service.SocialMediaAPI.model.Domain
{
    public class User
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; }
        public string ImageUrl { get; set; }
        public ICollection<SavedPost> SavedPosts { get; set; }

        //public ICollection<ArchivedPost> ArchivedPosts { get; set; }  

    }
}
