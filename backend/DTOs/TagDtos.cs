namespace Backend.DTOs;

/// <summary>
/// Request payload to create a new tag.
/// </summary>
/// <param name="Title">Tag title or label.</param>
public record CreateTagRequest(string Title);

/// <summary>
/// Tag details response.
/// </summary>
/// <param name="Id">Tag unique identifier.</param>
/// <param name="Title">Tag title.</param>
public record TagResponse(Guid Id, string Title);
