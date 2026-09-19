namespace Backend.DTOs;

public record CreateFolderRequest(string Title, string Color);
public record UpdateFolderRequest(string Title, string Color);

public record FolderResponse(Guid Id, string Title, string Color, int BookmarksCount);
