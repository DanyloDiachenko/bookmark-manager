using System.Security.Claims;
using Backend.Data;
using Backend.DTOs;
using Backend.Entities;
using Backend.Extensions;
using Backend.Services;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Endpoints;

public static class BookmarkEndpoints
{
    public static IEndpointRouteBuilder MapBookmarkEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/bookmarks").RequireAuthorization();

        group.MapGet("/", async (
            [FromQuery] bool? isStarred,
            [FromQuery] bool? isReadLater,
            [FromQuery] bool? isRealLater,
            [FromQuery] string? folder,
            [FromQuery] Guid? folderId,
            [FromQuery] string? tag,
            [FromQuery] Guid? tagId,
            [FromQuery] string? search,
            ClaimsPrincipal userClaims,
            AppDbContext db
        ) =>
        {
            var userId = userClaims.GetUserId();
            var query = db.Bookmarks
                .AsNoTracking()
                .Where(b => b.UserId == userId);

            if (isStarred.HasValue)
            {
                query = query.Where(b => b.IsStarred == isStarred.Value);
            }

            var readLater = isReadLater ?? isRealLater;
            if (readLater.HasValue)
            {
                query = query.Where(b => b.ToRead == readLater.Value);
            }

            if (folderId.HasValue)
            {
                query = query.Where(b => b.FolderId == folderId.Value);
            }
            else if (!string.IsNullOrWhiteSpace(folder))
            {
                var folderTrimmed = folder.Trim();
                if (Guid.TryParse(folderTrimmed, out var parsedFolderGuid))
                {
                    query = query.Where(b => b.FolderId == parsedFolderGuid);
                }
                else
                {
                    var folderLower = folderTrimmed.ToLower();
                    query = query.Where(b => b.Folder != null && b.Folder.Title.ToLower() == folderLower);
                }
            }

            if (tagId.HasValue)
            {
                query = query.Where(b => b.Tags.Any(t => t.Id == tagId.Value));
            }
            else if (!string.IsNullOrWhiteSpace(tag))
            {
                var tagTrimmed = tag.Trim();
                if (Guid.TryParse(tagTrimmed, out var parsedTagGuid))
                {
                    query = query.Where(b => b.Tags.Any(t => t.Id == parsedTagGuid));
                }
                else
                {
                    var tagLower = tagTrimmed.ToLower();
                    query = query.Where(b => b.Tags.Any(t => t.Title.ToLower() == tagLower));
                }
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.Trim().ToLower();
                query = query.Where(b =>
                    b.Title.ToLower().Contains(s) ||
                    (b.Description != null && b.Description.ToLower().Contains(s)) ||
                    b.Url.ToLower().Contains(s));
            }

            var bookmarks = await query
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => new BookmarkResponse(
                    b.Id,
                    b.Url,
                    b.Title,
                    b.Description,
                    b.ImageUrl,
                    b.CreatedAt,
                    b.IsStarred,
                    b.ToRead,
                    b.Folder != null ? new FolderResponse(b.Folder.Id, b.Folder.Title, b.Folder.Color, b.Folder.Bookmarks.Count) : null,
                    b.Tags.Select(t => new TagResponse(t.Id, t.Title)).ToList()
                ))
                .ToListAsync();

            return Results.Ok(bookmarks);
        });

        group.MapGet("/{id:guid}", async (Guid id, ClaimsPrincipal userClaims, AppDbContext db) =>
        {
            var userId = userClaims.GetUserId();
            var bookmark = await db.Bookmarks
                .AsNoTracking()
                .Where(b => b.Id == id && b.UserId == userId)
                .Select(b => new BookmarkResponse(
                    b.Id,
                    b.Url,
                    b.Title,
                    b.Description,
                    b.ImageUrl,
                    b.CreatedAt,
                    b.IsStarred,
                    b.ToRead,
                    b.Folder != null ? new FolderResponse(b.Folder.Id, b.Folder.Title, b.Folder.Color, b.Folder.Bookmarks.Count) : null,
                    b.Tags.Select(t => new TagResponse(t.Id, t.Title)).ToList()
                ))
                .FirstOrDefaultAsync();

            return bookmark is not null ? Results.Ok(bookmark) : Results.NotFound(new { message = "Bookmark not found" });
        });

        group.MapPost("/", async (
            CreateBookmarkRequest request,
            IValidator<CreateBookmarkRequest> validator,
            ClaimsPrincipal userClaims,
            AppDbContext db,
            IWebMetadataService metadataService
        ) =>
        {
            var validationResult = await validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var userId = userClaims.GetUserId();

            var metadata = await metadataService.ExtractMetadataAsync(request.Url);

            var title = !string.IsNullOrWhiteSpace(request.Title)
                ? request.Title.Trim()
                : !string.IsNullOrWhiteSpace(metadata.Title)
                    ? metadata.Title.Trim()
                    : Uri.TryCreate(request.Url, UriKind.Absolute, out var uri)
                        ? uri.Host
                        : "Untitled Bookmark";

            if (title.Length > 150)
            {
                title = title[..150];
            }

            var description = !string.IsNullOrWhiteSpace(request.Description)
                ? request.Description.Trim()
                : metadata.Description;

            var imageUrl = metadata.ImageUrl;
            var isStarred = request.IsStarred ?? false;
            var toRead = request.IsReadLater ?? false;

            Folder? folder = null;
            if (request.FolderId.HasValue)
            {
                folder = await db.Folders.FirstOrDefaultAsync(f => f.Id == request.FolderId.Value && f.UserId == userId);
                if (folder == null)
                {
                    return Results.BadRequest(new { message = "Folder not found" });
                }
            }
            else if (!string.IsNullOrWhiteSpace(request.Folder))
            {
                var folderTrimmed = request.Folder.Trim();
                if (Guid.TryParse(folderTrimmed, out var parsedFolderGuid))
                {
                    folder = await db.Folders.FirstOrDefaultAsync(f => f.Id == parsedFolderGuid && f.UserId == userId);
                    if (folder == null)
                    {
                        return Results.BadRequest(new { message = "Folder not found" });
                    }
                }
                else
                {
                    var folderLower = folderTrimmed.ToLower();
                    folder = await db.Folders.FirstOrDefaultAsync(f => f.UserId == userId && f.Title.ToLower() == folderLower);
                    if (folder == null)
                    {
                        folder = new Folder
                        {
                            UserId = userId,
                            Title = folderTrimmed,
                            Color = "#3B82F6"
                        };
                        db.Folders.Add(folder);
                    }
                }
            }

            var tagsList = new List<Tag>();
            if (request.Tags != null && request.Tags.Count > 0)
            {
                foreach (var tagItem in request.Tags.Distinct(StringComparer.OrdinalIgnoreCase))
                {
                    if (string.IsNullOrWhiteSpace(tagItem))
                    {
                        continue;
                    }

                    var tagTrimmed = tagItem.Trim();
                    Tag? tagEntity = null;

                    if (Guid.TryParse(tagTrimmed, out var parsedTagGuid))
                    {
                        tagEntity = await db.Tags.FirstOrDefaultAsync(t => t.Id == parsedTagGuid && t.UserId == userId);
                    }

                    if (tagEntity == null)
                    {
                        var tagLower = tagTrimmed.ToLower();
                        tagEntity = await db.Tags.FirstOrDefaultAsync(t => t.UserId == userId && t.Title.ToLower() == tagLower);
                    }

                    if (tagEntity == null)
                    {
                        tagEntity = new Tag
                        {
                            UserId = userId,
                            Title = tagTrimmed.ToLower()
                        };
                        db.Tags.Add(tagEntity);
                    }

                    tagsList.Add(tagEntity);
                }
            }

            var bookmark = new Bookmark
            {
                UserId = userId,
                Url = request.Url.Trim(),
                Title = title,
                Description = description,
                ImageUrl = imageUrl,
                IsStarred = isStarred,
                ToRead = toRead,
                Folder = folder,
                Tags = tagsList
            };

            db.Bookmarks.Add(bookmark);
            await db.SaveChangesAsync();

            var response = new BookmarkResponse(
                bookmark.Id,
                bookmark.Url,
                bookmark.Title,
                bookmark.Description,
                bookmark.ImageUrl,
                bookmark.CreatedAt,
                bookmark.IsStarred,
                bookmark.ToRead,
                folder != null ? new FolderResponse(folder.Id, folder.Title, folder.Color, folder.Bookmarks.Count) : null,
                tagsList.Select(t => new TagResponse(t.Id, t.Title)).ToList()
            );

            return Results.Created($"/api/bookmarks/{bookmark.Id}", response);
        });

        group.MapDelete("/{id:guid}", async (Guid id, ClaimsPrincipal userClaims, AppDbContext db) =>
        {
            var userId = userClaims.GetUserId();
            var bookmark = await db.Bookmarks.FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

            if (bookmark == null)
            {
                return Results.NotFound(new { message = "Bookmark was not found" });
            }

            db.Bookmarks.Remove(bookmark);
            await db.SaveChangesAsync();

            return Results.NoContent();
        });

        return app;
    }
}
