namespace Backend.DTOs;

/// <summary>
/// Request payload to create a new bookmark.
/// </summary>
/// <param name="Url">Webpage URL to bookmark.</param>
/// <param name="Title">Custom title (optional; will be extracted from webpage if omitted).</param>
/// <param name="Description">Custom description (optional; will be extracted from webpage if omitted).</param>
/// <param name="FolderId">ID of an existing folder to assign.</param>
/// <param name="Folder">Name of folder to match or create automatically.</param>
/// <param name="TagIds">List of tag IDs to associate with this bookmark.</param>
/// <param name="IsStarred">Mark bookmark as starred/favorite.</param>
/// <param name="IsReadLater">Mark bookmark to read later.</param>
public record CreateBookmarkRequest(
    string Url,
    string? Title = null,
    string? Description = null,
    Guid? FolderId = null,
    string? Folder = null,
    List<Guid>? TagIds = null,
    bool? IsStarred = false,
    bool? IsReadLater = false
);

/// <summary>
/// Request payload to update an existing bookmark.
/// </summary>
/// <param name="Url">Updated webpage URL (re-fetches metadata if changed).</param>
/// <param name="Title">Updated title.</param>
/// <param name="Description">Updated description.</param>
/// <param name="FolderId">Updated folder ID (or Guid.Empty to remove folder).</param>
/// <param name="TagIds">Updated list of tag IDs.</param>
/// <param name="IsStarred">Updated starred flag.</param>
/// <param name="IsReadLater">Updated read-later flag.</param>
public record UpdateBookmarkRequest(
    string? Url = null,
    string? Title = null,
    string? Description = null,
    Guid? FolderId = null,
    List<Guid>? TagIds = null,
    bool? IsStarred = null,
    bool? IsReadLater = null
);

/// <summary>
/// Bookmark details response.
/// </summary>
/// <param name="Id">Bookmark unique identifier.</param>
/// <param name="Url">Target webpage URL.</param>
/// <param name="Title">Bookmark title.</param>
/// <param name="Description">Bookmark description.</param>
/// <param name="ImageUrl">Extracted preview image URL.</param>
/// <param name="CreatedAt">Date and time when bookmark was created.</param>
/// <param name="IsStarred">Whether bookmark is starred/favorite.</param>
/// <param name="IsReadLater">Whether bookmark is saved for reading later.</param>
/// <param name="Folder">Associated folder info, if any.</param>
/// <param name="Tags">Associated tags list.</param>
public record BookmarkResponse(
    Guid Id,
    string Url,
    string Title,
    string? Description,
    string? ImageUrl,
    DateTime CreatedAt,
    bool IsStarred,
    bool IsReadLater,
    FolderResponse? Folder,
    List<TagResponse> Tags
);

/// <summary>
/// Global counts for bookmarks.
/// </summary>
/// <param name="All">Total bookmarks count.</param>
/// <param name="Starred">Starred bookmarks count.</param>
/// <param name="ReadLater">Read later bookmarks count.</param>
public record BookmarkStatsResponse(
    int All,
    int Starred,
    int ReadLater
);

