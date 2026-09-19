namespace Backend.Services;

public record WebMetadata(string? Title, string? Description, string? ImageUrl);

public interface IWebMetadataService
{
    Task<WebMetadata> ExtractMetadataAsync(string url, CancellationToken cancellationToken = default);
}
