namespace EP.Service.SocialMediaAPI.Repositories
{
    public class SQLImageService : IImageService
    {
        private readonly string _uploadsFolder;

        public SQLImageService()
        {
            _uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");

            if (!Directory.Exists(_uploadsFolder))
            {
                Directory.CreateDirectory(_uploadsFolder);
            }
        }

        public async Task<string> SaveImageAsync(IFormFile imageFile)
        {
            if (imageFile == null || imageFile.Length == 0)
            {
                throw new ArgumentException("Invalid image file.");
            }

            var uniqueFileName = Guid.NewGuid().ToString() + "_" + imageFile.FileName;
            var filePath = Path.Combine(_uploadsFolder, uniqueFileName);

            using (var fileStream = new FileStream(filePath, FileMode.Create))
            {
                await imageFile.CopyToAsync(fileStream);
            }

            return $"/images/{uniqueFileName}";
        }
        public async Task DeleteImageAsync(string imageUrl)
        {
            if (string.IsNullOrWhiteSpace(imageUrl))
            {
                throw new ArgumentException("Invalid image URL.");
            }

            var fileName = Path.GetFileName(imageUrl);
            var filePath = Path.Combine(_uploadsFolder, fileName);

            if (File.Exists(filePath))
            {
                File.Delete(filePath);
                await Task.CompletedTask; // Ensure the method is async
            }
        }
    }

}
