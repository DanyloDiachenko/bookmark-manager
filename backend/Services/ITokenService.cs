using Backend.Entities;
namespace Backend.Services;
public interface ITokenService
{
    string GenerateToken(User user);
}