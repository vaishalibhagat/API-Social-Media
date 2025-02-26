namespace EP.Service.SocialMediaAPI.model.Dto
{
    public class SocialMediaDto
    {
        public Guid UserId { get; set; }
        public IFormFile ImageUrl { get; set; }
        public string Description { get; set; }
        //public UserDto UserD { get; set; }
    }
}
