namespace Backend.DTOs;

public record CreateTagRequest(string Title);

public record TagResponse(Guid Id, string Title);
