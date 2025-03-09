using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Mvc;
using MilkyWay.Data;
using MilkyWay.Models;
using System.Diagnostics;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace MilkyWay.Controllers
{
    public class HomeController : Controller
    {

        private readonly ApplicationDbContext _db;

        public HomeController(ApplicationDbContext db)
        {
            _db = db;
        }
        public IActionResult Index()
        {
            return View();
        }

        public IActionResult LeaderBoard()
        {
            if (HttpContext.User.Identity.IsAuthenticated)
            {
                var leaderboardData = _db.Users
                   .OrderByDescending(u => u.HighScore)
                   .ToList();

                ViewData["LeaderboardData"] = leaderboardData;

                return View("LeaderBoard");
            }
            else
            {
                return View("Login");
            }
        }

        public IActionResult Login()
        {
            if (HttpContext.User.Identity.IsAuthenticated)
            {
                return View("~/Views/Home/Logout.cshtml");
            }
            else return View();
        }

        public IActionResult Register()
        {
            return View();
        }

        public IActionResult RegisterAction(string regLogin, string regPassword, string confirmPassword)
        {
            var user = _db.Users.FirstOrDefault(w => w.Login == regLogin);
            if (user != null) 
            {
                return BadRequest("Аккаунт с таким логином уже существует!");
            }

            if (regPassword != confirmPassword)
            {
                return BadRequest("Пароли не совпадают");
            }

            var newUser = new User()
            {
                Login = regLogin,
                Password = regPassword,
            };

            _db.Users.Add(newUser);
            _db.SaveChanges();

            return View("~/Views/Home/Login.cshtml");
        }
        public async Task<IActionResult> LoginAction(string login, string password)
        {
            if (HttpContext.User.Identity.IsAuthenticated)
            {
                return View("~/Views/Home/Logout.cshtml");
            }

            if (string.IsNullOrEmpty(login))
            {
                return BadRequest("Ты логин напиши хотя бы");
            }

            var user = _db.Users.FirstOrDefault(q => q.Login == login);

            if (user == null)
            {
                return NotFound("Логин говно");
            }

            if (user.Password != password)
            {
                return BadRequest("Пароль неверный");
            }

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Login),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);

            // Создаем аутентификационные куки
            var authProperties = new AuthenticationProperties
            {
                IsPersistent = true // Сохранять куки между сессиями
            };

            await HttpContext.SignInAsync(
                CookieAuthenticationDefaults.AuthenticationScheme,
                new ClaimsPrincipal(claimsIdentity),
                authProperties);

            return RedirectToAction("Index");
        }

        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return View("~/Views/Home/Index.cshtml");
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
