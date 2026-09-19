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
        var group = app.MapGroup("/api/folders").RequireAuthorization();

        group.MapGet("/", async (
            ClaimsPrincipal userClaims, AppDbContext db
        ) =>
        {
            var userId = userClaims.GetUserId();

            var folders = await db.Folders.Where(f => f.UserId == userId).OrderBy(f => f.Title).Select(f =>
                new FolderResponse(f.Id, f.Title, f.Color, f.Bookmarks.Count)).ToListAsync();

            return Results.Ok(folders);
        });

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
        });

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
        });

        return app;
    }
}