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

        [Authorize]
        public IActionResult LeaderBoard()
        {
            return View();
        }

        public IActionResult Login()
        {
            return View();
        }

        public IActionResult Register()
        {
            return View();
        }

        public IActionResult RegisterAction(string reglogin, string regpassword, string secondregpassword)
        {
            var user = _db.Users.FirstOrDefault(w => w.Login == reglogin);
            if (user != null) 
            {
                return BadRequest("Аккаунт с таким логином уже существует!");
            }

            if (regpassword != secondregpassword)
            {
                return BadRequest("Пароли не совпадают");
            }

            var newUser = new User()
            {
                Login = reglogin,
                Password = regpassword,
            };

            _db.Users.Add(newUser);
            _db.SaveChanges();

            return View("~/Views/Home/Index.cshtml");
        }
        public async Task<IActionResult> LoginAction(string login, string password)
        {
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

            // Создаем claims для пользователя
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, user.Login),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            // Создаем объект ClaimsIdentity
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

            return RedirectToAction("Index"); // Перенаправляем на главную страницу
        }
        public async Task<IActionResult> Logout()
        {
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return RedirectToAction("Index");
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
