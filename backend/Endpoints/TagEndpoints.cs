using System.Security.Claims;
using Backend.Data;
using Backend.DTOs;
using Backend.Entities;
using Backend.Extensions;
using Microsoft.EntityFrameworkCore;

namespace Backend.Endpoints;

public static class TagEndpoints
{
    public static IEndpointRouteBuilder MapTagEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/tags")
            .RequireAuthorization()
            .WithTags("Tags");

        group.MapGet("/", async (ClaimsPrincipal userClaims, AppDbContext db) =>
        {
            var userId = userClaims.GetUserId();

            var tags = await db.Tags
                .Where(t => t.UserId == userId)
                .OrderBy(t => t.Title)
                .Select(t => new TagResponse(
                    t.Id,
                    t.Title
                ))
                .ToListAsync();

            return Results.Ok(tags);
        })
        .WithName("GetTags")
        .WithSummary("Get all tags")
        .WithDescription("Returns all tags created by the authenticated user.")
        .Produces<List<TagResponse>>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized);

        group.MapPost("/", async (CreateTagRequest request, ClaimsPrincipal userClaims, AppDbContext db) =>
        {
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return Results.BadRequest(new { message = "Tag title can not be empty" });
            }

            var userId = userClaims.GetUserId();
            var title = request.Title.Trim().ToLower();

            var exists = await db.Tags.AnyAsync(t => t.UserId == userId && t.Title == title);
            if (exists)
            {
                return Results.Conflict(new { message = "Tag with this title already exists" });
            }

            var tag = new Tag
            {
                UserId = userId,
                Title = title
            };

            db.Tags.Add(tag);
            await db.SaveChangesAsync();

            return Results.Created($"/api/tags/{tag.Id}", new TagResponse(tag.Id, tag.Title));
        })
        .WithName("CreateTag")
        .WithSummary("Create a new tag")
        .WithDescription("Creates a new unique tag for the authenticated user.")
        .Produces<TagResponse>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status409Conflict)
        .Produces(StatusCodes.Status401Unauthorized);

        group.MapDelete("/{id:guid}", async (Guid id, ClaimsPrincipal userClaims, AppDbContext db) =>
        {
            var userId = userClaims.GetUserId();

            var tag = await db.Tags.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
            if (tag == null)
            {
                return Results.NotFound(new { message = "Tag was not found" });
            }

            db.Tags.Remove(tag);
            await db.SaveChangesAsync();

            return Results.NoContent();
        })
        .WithName("DeleteTag")
        .WithSummary("Delete a tag")
        .WithDescription("Deletes a tag by its unique ID.")
        .Produces(StatusCodes.Status204NoContent)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status401Unauthorized);

        return app;
    }
}