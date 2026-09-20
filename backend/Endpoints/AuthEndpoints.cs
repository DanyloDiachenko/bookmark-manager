using System.Security.Claims;
using Backend.Data;
using Backend.DTOs;
using Backend.Entities;
using Backend.Extensions;
using Backend.Services;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
namespace Backend.Endpoints;

public static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/register", async (
            RegisterRequest request,
            IValidator<RegisterRequest> validator,
            AppDbContext db,
            ITokenService tokenService
        ) =>
        {
            var validationResult = await validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var emailExists = await db.Users.AnyAsync(u => u.Email == request.Email.ToLower().Trim());
            if (emailExists)
            {
                return Results.Conflict(new { message = "User with this email already exists" });
            }

            var user = new User
            {
                Email = request.Email.ToLower().Trim(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password)
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();

            var token = tokenService.GenerateToken(user);
            return Results.Ok(new AuthResponse(token, user.Id, user.Email));
        })
        .WithName("Register")
        .WithSummary("Register a new user")
        .WithDescription("Creates a new user account with hashed password and returns a JWT authentication token.")
        .Produces<AuthResponse>(StatusCodes.Status200OK)
        .ProducesValidationProblem()
        .ProducesProblem(StatusCodes.Status409Conflict)
        .AllowAnonymous();

        group.MapPost("/login", async (
            LoginRequest request,
            IValidator<LoginRequest> validator,
            AppDbContext db,
            ITokenService tokenService
        ) =>
        {
            var validationResult = await validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                return Results.ValidationProblem(validationResult.ToDictionary());
            }

            var user = await db.Users.FirstOrDefaultAsync(u => u.Email == request.Email.ToLower().Trim());
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return Results.Unauthorized();
            }

            var token = tokenService.GenerateToken(user);
            return Results.Ok(new AuthResponse(token, user.Id, user.Email));
        })
        .WithName("Login")
        .WithSummary("Log in user")
        .WithDescription("Authenticates user credentials and returns a JWT authentication token.")
        .Produces<AuthResponse>(StatusCodes.Status200OK)
        .ProducesValidationProblem()
        .Produces(StatusCodes.Status401Unauthorized)
        .AllowAnonymous();

        group.MapGet("/profile", async (
            ClaimsPrincipal userClaims,
            AppDbContext db
        ) =>
        {
            var userId = userClaims.GetUserId();
            var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                return Results.Unauthorized();
            }

            return Results.Ok(new UserProfileResponse(user.Id, user.Email));
        })
        .WithName("GetProfile")
        .WithSummary("Get current user profile")
        .WithDescription("Validates the JWT token and returns the current user profile.")
        .Produces<UserProfileResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized)
        .RequireAuthorization();

        return group;
    }
}