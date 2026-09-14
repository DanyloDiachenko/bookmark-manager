using Backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Bookmark> Bookmarks => Set<Bookmark>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<Folder> Folders => Set<Folder>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(user =>
        {
            user.HasIndex(u => u.Email).IsUnique();
            user.Property(u => u.Email).HasMaxLength(256).IsRequired();
        });

        modelBuilder.Entity<Bookmark>(bookmark =>
        {
            bookmark.Property(b => b.Url).IsRequired();
            bookmark.Property(b => b.Title).HasMaxLength(150).IsRequired();

            bookmark.HasOne(b => b.Folder)
                .WithMany(f => f.Bookmarks)
                .HasForeignKey(b => b.FolderId)
                .OnDelete(DeleteBehavior.SetNull);

            bookmark.HasIndex(b => new { b.UserId, b.IsStarred });
            bookmark.HasIndex(b => new { b.UserId, b.ToRead });
        });

        modelBuilder.Entity<Tag>(tag =>
        {
            tag.Property(t => t.Title).HasMaxLength(50).IsRequired();

            tag.HasIndex(t => new { t.UserId, t.Title }).IsUnique();
        });

        modelBuilder.Entity<Folder>(folder =>
        {
            folder.Property(f => f.Title).HasMaxLength(100).IsRequired();
            folder.Property(f => f.Color).HasMaxLength(30);

            folder.HasOne(f => f.User)
                .WithMany(u => u.Folders)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}