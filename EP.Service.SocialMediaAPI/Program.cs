using EP.Service.SocialMediaAPI.Data;
using EP.Service.SocialMediaAPI.Mappings;
using EP.Service.SocialMediaAPI.model;
using EP.Service.SocialMediaAPI.Repositories;
using EP.Service.SocialMediaAPI.Repositories.IRepositories;
using EP.Service.SocialMediaAPI.Repositories.SqlRepositories;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("MySQLDBString"),
    new MySqlServerVersion(new Version(8, 0, 39))));

builder.Services.AddScoped<IImageService, SQLImageService>();
builder.Services.AddScoped<ISocialMediaRepositories, SqlSocialMediaRepositories>();
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
                builder =>
                {
                    builder.WithOrigins("http://localhost:3000") // Replace with your React.js client's URL
                            .AllowAnyHeader()
                           .AllowAnyMethod()
                           .AllowCredentials();

                });
});

builder.Services.AddAutoMapper(typeof(AutoMappingProfile));
var app = builder.Build();







// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles(); // Add this line to serve static files

app.UseCors("AllowSpecificOrigin");

app.UseAuthorization();

app.MapControllers();
//ApplyMigration();

app.Run();

//auto migration if something is pending
void ApplyMigration()
{
    using (var scope = app.Services.CreateScope())
    {
        var _db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        if (_db.Database.GetPendingMigrations().Count() > 0)
        {
            _db.Database.Migrate();
        }
    }
}