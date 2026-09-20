namespace Backend.DTOs;

/// <summary>
/// Request payload to create a new bookmark folder.
/// </summary>
/// <param name="Title">Folder title.</param>
/// <param name="Color">Hex color code (e.g. #3B82F6).</param>
public record CreateFolderRequest(string Title, string Color);

/// <summary>
/// Request payload to update an existing folder.
/// </summary>
/// <param name="Title">Updated folder title.</param>
/// <param name="Color">Updated hex color code (e.g. #3B82F6).</param>
public record UpdateFolderRequest(string Title, string Color);

/// <summary>
/// Folder details response.
/// </summary>
/// <param name="Id">Folder unique identifier.</param>
/// <param name="Title">Folder title.</param>
/// <param name="Color">Hex color code.</param>
/// <param name="BookmarksCount">Number of bookmarks inside this folder.</param>
public record FolderResponse(Guid Id, string Title, string Color, int BookmarksCount);
