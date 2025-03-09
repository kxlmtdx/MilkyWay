using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MilkyWay.Data;
using System.Security.Claims;

namespace MilkyWay.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GameController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public GameController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpPost("save-score")]
        public async Task<IActionResult> SaveScore([FromBody] SaveScoreRequest request)
        {
            // Получаем ID текущего пользователя из аутентификационных куки
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Пользователь не авторизован");
            }

            // Ищем пользователя в базе данных
            var user = await _db.Users.FindAsync(int.Parse(userId));

            if (user == null)
            {
                return NotFound("Пользователь не найден");
            }

            // Обновляем HighScore, если новый счет больше текущего
            if (request.Score > user.HighScore || user.HighScore == null)
            {
                user.HighScore = request.Score;
                await _db.SaveChangesAsync();
            }

            return Ok(new { message = "Счет успешно обновлен", highScore = user.HighScore });
        }
    }

    public class SaveScoreRequest
    {
        public int Score { get; set; }
    }
}