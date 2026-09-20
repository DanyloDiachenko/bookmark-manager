using System.Security.Claims;
using Backend.Data;
using Backend.DTOs;
using Backend.Extensions;
using Backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace Backend.Endpoints;

public static class FolderEndpoints
{
    public static IEndpointRouteBuilder MapFolderEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/folders")
            .RequireAuthorization()
            .WithTags("Folders");

        group.MapGet("/", async (
            ClaimsPrincipal userClaims, AppDbContext db
        ) =>
        {
            var userId = userClaims.GetUserId();

            var folders = await db.Folders.Where(f => f.UserId == userId).OrderBy(f => f.Title).Select(f =>
                new FolderResponse(f.Id, f.Title, f.Color, f.Bookmarks.Count)).ToListAsync();

            return Results.Ok(folders);
        })
        .WithName("GetFolders")
        .WithSummary("Get all folders")
        .WithDescription("Returns all folders created by the authenticated user.")
        .Produces<List<FolderResponse>>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized);

        group.MapPost("/", async (
        CreateFolderRequest request, ClaimsPrincipal userClaims, AppDbContext db
        ) =>
        {
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return Results.BadRequest(new { message = "Folder title is required." });
            }
            if (string.IsNullOrWhiteSpace(request.Color))
            {
                return Results.BadRequest(new { message = "Folder color is required." });
            }

            var userId = userClaims.GetUserId();
            var folder = new Folder
            {
                UserId = userId,
                Title = request.Title.Trim(),
                Color = request.Color.Trim()
            };

            db.Folders.Add(folder);
            await db.SaveChangesAsync();

            return Results.Created($"/api/folders/{folder.Id}", new FolderResponse(folder.Id, folder.Title, folder.Color, 0));
        })
        .WithName("CreateFolder")
        .WithSummary("Create a new folder")
        .WithDescription("Creates a new folder with the specified title and color.")
        .Produces<FolderResponse>(StatusCodes.Status201Created)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .Produces(StatusCodes.Status401Unauthorized);

        group.MapPut("{id:guid}", async (
            Guid id,
            UpdateFolderRequest request,
            ClaimsPrincipal userClaims,
            AppDbContext db
        ) =>
        {
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return Results.BadRequest(new { message = "Folder title is required." });
            }
            if (string.IsNullOrWhiteSpace(request.Color))
            {
                return Results.BadRequest(new { message = "Folder color is required." });
            }

            var userId = userClaims.GetUserId();
            var folder = await db.Folders
                .Include(f => f.Bookmarks)
                .FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);

            if (folder == null)
            {
                return Results.NotFound(new { message = "Folder was not found" });
            }

            folder.Title = request.Title.Trim();
            folder.Color = request.Color.Trim();

            await db.SaveChangesAsync();

            return Results.Ok(new FolderResponse(folder.Id, folder.Title, folder.Color, folder.Bookmarks.Count));
        })
        .WithName("UpdateFolder")
        .WithSummary("Update a folder")
        .WithDescription("Updates the title and color of an existing folder.")
        .Produces<FolderResponse>(StatusCodes.Status200OK)
        .ProducesProblem(StatusCodes.Status400BadRequest)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status401Unauthorized);

        group.MapDelete("{id:guid}", async (
        Guid id, ClaimsPrincipal userClaims, AppDbContext db
        ) =>
        {
            var userId = userClaims.GetUserId();
            var folder = await db.Folders.FirstOrDefaultAsync(f => f.Id == id && f.UserId == userId);

            if (folder == null)
            {
                return Results.NotFound(new { message = "Folder was not found" });
            }

            db.Folders.Remove(folder);
            await db.SaveChangesAsync();

            return Results.NoContent();
        })
        .WithName("DeleteFolder")
        .WithSummary("Delete a folder")
        .WithDescription("Deletes the folder by its unique ID.")
        .Produces(StatusCodes.Status204NoContent)
        .ProducesProblem(StatusCodes.Status404NotFound)
        .Produces(StatusCodes.Status401Unauthorized);

        return app;
    }
}