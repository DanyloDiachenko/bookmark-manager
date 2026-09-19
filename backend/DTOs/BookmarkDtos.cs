namespace Backend.DTOs;

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
