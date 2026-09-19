namespace Backend.Entities;

public class Bookmark
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Url { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public bool IsStarred { get; set; } = false;
    public bool ToRead { get; set; } = false;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid? FolderId { get; set; }
    public Folder? Folder { get; set; }

    public ICollection<Tag> Tags { get; set; } = new List<Tag>();
}