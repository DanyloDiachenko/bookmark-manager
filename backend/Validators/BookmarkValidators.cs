using Backend.DTOs;
using FluentValidation;

namespace Backend.Validators;

public class CreateBookmarkRequestValidator : AbstractValidator<CreateBookmarkRequest>
{
    public CreateBookmarkRequestValidator()
    {
        RuleFor(x => x.Url)
            .NotEmpty().WithMessage("URL is required")
            .Must(IsValidUrl).WithMessage("URL must be a valid HTTP or HTTPS address");

        RuleFor(x => x.Title)
            .MaximumLength(150).WithMessage("Title cannot exceed 150 characters")
            .When(x => !string.IsNullOrEmpty(x.Title));
    }

    private static bool IsValidUrl(string? url)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            return false;
        }

        return Uri.TryCreate(url, UriKind.Absolute, out var uriResult)
            && (uriResult.Scheme == Uri.UriSchemeHttp || uriResult.Scheme == Uri.UriSchemeHttps);
    }
}
