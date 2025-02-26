namespace EP.Service.SocialMediaAPI.Repositories
{
    public interface IImageService
    {
        Task<string> SaveImageAsync(IFormFile imageFile);
        Task DeleteImageAsync(string imageUrl);
    }
}
