using EP.Service.SocialMediaAPI.model.Domain;
using EP.Service.SocialMediaAPI.Model.Domain;
using Microsoft.EntityFrameworkCore;

namespace EP.Service.SocialMediaAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<SocialMedia> SocialMedias { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Like> Likes { get; set; }
        public DbSet<Comment> Comments { get; set; }
        public DbSet<SavedPost> SavedPosts { get; set; }
        public DbSet<ArchivedPost> ArchivedPosts { get; set; }
        public DbSet<Reply> Replies { get; set; }
        public DbSet<CommentLike> commentLike { get; set; }
        public DbSet<Share> Shares { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships for SocialMedia
            modelBuilder.Entity<SocialMedia>()
                .HasOne(sm => sm.user)
                .WithMany()
                .HasForeignKey("UserId")
                .OnDelete(DeleteBehavior.Cascade);

            //// Configure relationships for Like
            //modelBuilder.Entity<Like>()
            //    .HasOne(l => l.LikedBy)
            //    .WithMany()
            //    .HasForeignKey(l => l.LikedById)
            //    .OnDelete(DeleteBehavior.Cascade);

            //modelBuilder.Entity<Like>()
            //    .HasOne(l => l.LikedOn)
            //    .WithMany()
            //    .HasForeignKey(l => l.LikedOnId)
            //    .OnDelete(DeleteBehavior.Cascade);

            //// Configure relationships for Comment
            //modelBuilder.Entity<Comment>()
            //    .HasOne(c => c.CommentedBy)
            //    .WithMany()
            //    .HasForeignKey(c => c.CommentedById)
            //    .OnDelete(DeleteBehavior.Cascade);

            //modelBuilder.Entity<Comment>()
            //    .HasOne(c => c.CommentedOn)
            //    .WithMany()
            //    .HasForeignKey(c => c.CommentedOnId)
            //    .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<SavedPost>()
          .HasOne(sp => sp.User)
          .WithMany(u => u.SavedPosts)
          .HasForeignKey(sp => sp.UserId);

            modelBuilder.Entity<SavedPost>()
                .HasOne(sp => sp.SocialMedia)
                .WithMany(sm => sm.SavedPosts)
                .HasForeignKey(sp => sp.PostId);



         //   modelBuilder.Entity<ArchivedPost>()
         //.HasOne(ap => ap.User)
         //.WithMany(u => u.ArchivedPosts)
         //.HasForeignKey(ap => ap.UserId)
         //.OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ArchivedPost>()
                .HasOne(ap => ap.SocialMedia)
                .WithMany(sm => sm.ArchivedPosts)
                .HasForeignKey(ap => ap.SocialMediaId)
                .OnDelete(DeleteBehavior.Cascade);



            modelBuilder.Entity<Reply>()
           .HasOne(r => r.ParentComment)
           .WithMany(c => c.Replies)
           .HasForeignKey(r => r.CommentId)
           .OnDelete(DeleteBehavior.Cascade);

            //base.OnModelCreating(modelBuilder);
        }
    }
}
