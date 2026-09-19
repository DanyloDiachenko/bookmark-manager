using System.Net;
using System.Text.RegularExpressions;

namespace Backend.Services;

public partial class WebMetadataService : IWebMetadataService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<WebMetadataService> _logger;

    public WebMetadataService(HttpClient httpClient, ILogger<WebMetadataService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _httpClient.Timeout = TimeSpan.FromSeconds(5);
        if (!_httpClient.DefaultRequestHeaders.Contains("User-Agent"))
        {
            _httpClient.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (compatible; BookmarkManagerBot/1.0)");
        }
    }

    public async Task<WebMetadata> ExtractMetadataAsync(string url, CancellationToken cancellationToken = default)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var baseUri) ||
            (baseUri.Scheme != Uri.UriSchemeHttp && baseUri.Scheme != Uri.UriSchemeHttps))
        {
            return new WebMetadata(null, null, null);
        }

        try
        {
            using var response = await _httpClient.GetAsync(baseUri, HttpCompletionOption.ResponseHeadersRead, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                return new WebMetadata(null, null, null);
            }

            var contentType = response.Content.Headers.ContentType?.MediaType;
            if (contentType != null && !contentType.Contains("html", StringComparison.OrdinalIgnoreCase))
            {
                return new WebMetadata(null, null, null);
            }

            var html = await response.Content.ReadAsStringAsync(cancellationToken);
            return ParseHtml(html, baseUri);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to fetch metadata for URL: {Url}", url);
            return new WebMetadata(null, null, null);
        }
    }

    public static WebMetadata ParseHtml(string html, Uri baseUri)
    {
        if (string.IsNullOrWhiteSpace(html))
        {
            return new WebMetadata(null, null, null);
        }

        var title = ExtractMetaContent(html, "og:title", isProperty: true)
                    ?? ExtractTitleTag(html);

        var description = ExtractMetaContent(html, "og:description", isProperty: true)
                          ?? ExtractMetaContent(html, "description", isProperty: false);

        var imageUrl = ExtractMetaContent(html, "og:image", isProperty: true)
                       ?? ExtractMetaContent(html, "twitter:image", isProperty: false)
                       ?? ExtractLinkHref(html, "image_src")
                       ?? ExtractLinkHref(html, "apple-touch-icon")
                       ?? ExtractLinkHref(html, "icon");

        if (!string.IsNullOrEmpty(imageUrl))
        {
            imageUrl = ResolveUri(baseUri, imageUrl);
        }

        if (!string.IsNullOrEmpty(title))
        {
            title = WebUtility.HtmlDecode(title).Trim();
            if (title.Length > 150)
            {
                title = title[..150];
            }
        }

        if (!string.IsNullOrEmpty(description))
        {
            description = WebUtility.HtmlDecode(description).Trim();
        }

        return new WebMetadata(title, description, imageUrl);
    }

    private static string? ExtractMetaContent(string html, string nameOrProperty, bool isProperty)
    {
        var attrName = isProperty ? "property" : "name";
        // Matches <meta ... property="name" ... content="value" ... /> or <meta ... content="value" ... property="name" ... />
        var pattern1 = $@"<meta\s+[^>]*{attrName}\s*=\s*[""']{Regex.Escape(nameOrProperty)}[""'][^>]*content\s*=\s*[""']([^""']+)[""']";
        var pattern2 = $@"<meta\s+[^>]*content\s*=\s*[""']([^""']+)[""'][^>]*{attrName}\s*=\s*[""']{Regex.Escape(nameOrProperty)}[""']";

        var match = Regex.Match(html, pattern1, RegexOptions.IgnoreCase);
        if (match.Success)
        {
            return match.Groups[1].Value.Trim();
        }

        match = Regex.Match(html, pattern2, RegexOptions.IgnoreCase);
        return match.Success ? match.Groups[1].Value.Trim() : null;
    }

    private static string? ExtractTitleTag(string html)
    {
        var match = Regex.Match(html, @"<title[^>]*>(.*?)</title>", RegexOptions.IgnoreCase | RegexOptions.Singleline);
        return match.Success ? match.Groups[1].Value.Trim() : null;
    }

    private static string? ExtractLinkHref(string html, string relValue)
    {
        var pattern1 = $@"<link\s+[^>]*rel\s*=\s*[""'](?:[^""']*\s+)?{Regex.Escape(relValue)}(?:\s+[^""']*)?[""'][^>]*href\s*=\s*[""']([^""']+)[""']";
        var pattern2 = $@"<link\s+[^>]*href\s*=\s*[""']([^""']+)[""'][^>]*rel\s*=\s*[""'](?:[^""']*\s+)?{Regex.Escape(relValue)}(?:\s+[^""']*)?[""']";

        var match = Regex.Match(html, pattern1, RegexOptions.IgnoreCase);
        if (match.Success)
        {
            return match.Groups[1].Value.Trim();
        }

        match = Regex.Match(html, pattern2, RegexOptions.IgnoreCase);
        return match.Success ? match.Groups[1].Value.Trim() : null;
    }

    private static string? ResolveUri(Uri baseUri, string relativeOrAbsolute)
    {
        if (string.IsNullOrWhiteSpace(relativeOrAbsolute))
        {
            return null;
        }

        if (Uri.TryCreate(relativeOrAbsolute, UriKind.Absolute, out var absUri) &&
            (absUri.Scheme == Uri.UriSchemeHttp || absUri.Scheme == Uri.UriSchemeHttps))
        {
            return absUri.ToString();
        }

        if (Uri.TryCreate(baseUri, relativeOrAbsolute, out var combinedUri))
        {
            return combinedUri.ToString();
        }

        return null;
    }
}
