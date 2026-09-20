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
        var group = app.MapGroup("/api/bookmarks")
            .RequireAuthorization()
            .WithTags("Bookmarks");

        group.MapGet("/", async (
            [FromQuery] bool? isStarred,
            [FromQuery] bool? isReadLater,
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

            if (isReadLater.HasValue)
            {
                query = query.Where(b => b.ToRead == isReadLater.Value);
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
        })
        .WithName("GetBookmarks")
        .WithSummary("Get bookmarks with optional filtering")
        .WithDescription("Returns bookmarks for the authenticated user. Allows filtering by isStarred, isReadLater, folder/folderId, tag/tagId, and search keyword.")
        .Produces<List<BookmarkResponse>>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized);

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
        })
        .WithName("GetBookmarkById")
        .WithSummary("Get bookmark by ID")
        .WithDescription("Returns details of a specific bookmark belonging to the authenticated user.")
        .Produces<BookmarkResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status401Unauthorized);

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

            var bookmarkExists = await db.Bookmarks.AnyAsync(b => b.UserId == userId && b.Title.ToLower() == title.ToLower());
            if (bookmarkExists)
            {
                return Results.Conflict(new { message = "Bookmark with this title already exists." });
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
            if (request.TagIds != null && request.TagIds.Count > 0)
            {
                var distinctTagIds = request.TagIds.Distinct().ToList();
                tagsList = await db.Tags
                    .Where(t => t.UserId == userId && distinctTagIds.Contains(t.Id))
                    .ToListAsync();
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
        })
        .WithName("CreateBookmark")
        .WithSummary("Create a new bookmark")
        .WithDescription("Creates a bookmark for the specified URL. Automatically extracts web metadata (title, description, preview image) from the webpage. Allows associating existing or newly created folders, and assigning tags.")
        .Produces<BookmarkResponse>(StatusCodes.Status201Created)
        .ProducesValidationProblem()
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status409Conflict)
        .Produces(StatusCodes.Status401Unauthorized);

        group.MapPut("/{id:guid}", async (
            Guid id,
            UpdateBookmarkRequest request,
            IValidator<UpdateBookmarkRequest> validator,
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

            var bookmark = await db.Bookmarks
                .Include(b => b.Folder)
                .Include(b => b.Tags)
                .FirstOrDefaultAsync(b => b.Id == id && b.UserId == userId);

            if (bookmark == null)
            {
                return Results.NotFound(new { message = "Bookmark was not found" });
            }

            if (request.Url != null)
            {
                var newUrl = request.Url.Trim();
                if (!string.Equals(bookmark.Url, newUrl, StringComparison.OrdinalIgnoreCase))
                {
                    bookmark.Url = newUrl;
                    var metadata = await metadataService.ExtractMetadataAsync(newUrl);
                    if (!string.IsNullOrWhiteSpace(metadata.ImageUrl))
                    {
                        bookmark.ImageUrl = metadata.ImageUrl;
                    }
                    if (string.IsNullOrWhiteSpace(request.Title) && !string.IsNullOrWhiteSpace(metadata.Title))
                    {
                        bookmark.Title = metadata.Title.Length > 150 ? metadata.Title[..150] : metadata.Title;
                    }
                    if (request.Description == null && !string.IsNullOrWhiteSpace(metadata.Description))
                    {
                        bookmark.Description = metadata.Description;
                    }
                }
            }

            if (request.Title != null)
            {
                var trimmedTitle = request.Title.Trim();
                var newTitle = trimmedTitle.Length > 150 ? trimmedTitle[..150] : trimmedTitle;

                var titleExists = await db.Bookmarks.AnyAsync(b => b.UserId == userId && b.Id != id && b.Title.ToLower() == newTitle.ToLower());
                if (titleExists)
                {
                    return Results.Conflict(new { message = "Bookmark with this title already exists." });
                }

                bookmark.Title = newTitle;
            }

            if (request.Description != null)
            {
                bookmark.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
            }

            if (request.IsStarred.HasValue)
            {
                bookmark.IsStarred = request.IsStarred.Value;
            }

            if (request.IsReadLater.HasValue)
            {
                bookmark.ToRead = request.IsReadLater.Value;
            }

            if (request.FolderId.HasValue)
            {
                if (request.FolderId.Value == Guid.Empty)
                {
                    bookmark.FolderId = null;
                    bookmark.Folder = null;
                }
                else
                {
                    var folder = await db.Folders.FirstOrDefaultAsync(f => f.Id == request.FolderId.Value && f.UserId == userId);
                    if (folder == null)
                    {
                        return Results.BadRequest(new { message = "Folder not found" });
                    }
                    bookmark.FolderId = folder.Id;
                    bookmark.Folder = folder;
                }
            }

            if (request.TagIds != null)
            {
                var distinctTagIds = request.TagIds.Distinct().ToList();
                var newTags = await db.Tags
                    .Where(t => t.UserId == userId && distinctTagIds.Contains(t.Id))
                    .ToListAsync();

                bookmark.Tags.Clear();
                foreach (var tag in newTags)
                {
                    bookmark.Tags.Add(tag);
                }
            }

            await db.SaveChangesAsync();

            var folderBookmarksCount = bookmark.FolderId.HasValue
                ? await db.Bookmarks.CountAsync(b => b.FolderId == bookmark.FolderId.Value)
                : 0;

            var response = new BookmarkResponse(
                bookmark.Id,
                bookmark.Url,
                bookmark.Title,
                bookmark.Description,
                bookmark.ImageUrl,
                bookmark.CreatedAt,
                bookmark.IsStarred,
                bookmark.ToRead,
                bookmark.Folder != null ? new FolderResponse(bookmark.Folder.Id, bookmark.Folder.Title, bookmark.Folder.Color, folderBookmarksCount) : null,
                bookmark.Tags.Select(t => new TagResponse(t.Id, t.Title)).ToList()
            );

            return Results.Ok(response);
        })
        .WithName("UpdateBookmark")
        .WithSummary("Update a bookmark")
        .WithDescription("Updates fields of an existing bookmark. If URL is modified, metadata is re-extracted.")
        .Produces<BookmarkResponse>(StatusCodes.Status200OK)
        .ProducesValidationProblem()
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .ProducesProblem(StatusCodes.Status409Conflict)
        .Produces(StatusCodes.Status401Unauthorized);

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
        })
        .WithName("DeleteBookmark")
        .WithSummary("Delete a bookmark")
        .WithDescription("Deletes an existing bookmark by its ID.")
        .Produces(StatusCodes.Status204NoContent)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status401Unauthorized);

        return app;
    }
}
