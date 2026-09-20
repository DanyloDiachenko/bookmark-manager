namespace Backend.DTOs;

/// <summary>
/// Request payload for user registration.
/// </summary>
/// <param name="Email">User's email address.</param>
/// <param name="Password">User's password (minimum 6 characters).</param>
public record RegisterRequest(string Email, string Password);

/// <summary>
/// Request payload for user login.
/// </summary>
/// <param name="Email">Registered user email address.</param>
/// <param name="Password">Account password.</param>
public record LoginRequest(string Email, string Password);

/// <summary>
/// Authentication response containing JWT token and user info.
/// </summary>
/// <param name="Token">JWT Bearer authentication token.</param>
/// <param name="UserId">Unique user ID.</param>
/// <param name="Email">User email address.</param>
public record AuthResponse(string Token, Guid UserId, string Email);