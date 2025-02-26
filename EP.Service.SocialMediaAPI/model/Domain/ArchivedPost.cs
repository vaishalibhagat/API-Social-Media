using EP.Service.SocialMediaAPI.model.Domain;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace EP.Service.SocialMediaAPI.Model.Domain
{
    public class ArchivedPost
    {
        public Guid ArchivedPostId { get; set; } = Guid.NewGuid(); // Unique identifier for archived post
        public Guid UserId { get; set; }                           // User who archived the post
        public Guid SocialMediaId { get; set; }                   // ID of the post being archived
        public DateTime ArchivedOn { get; set; } = DateTime.UtcNow; // Timestamp when the post was archived

        // Navigation Properties
        [ForeignKey("UserId")]
        public User User { get; set; }                            // User reference

        [ForeignKey("SocialMediaId")]
        public SocialMedia SocialMedia { get; set; }              // Social media post reference
    }
}
