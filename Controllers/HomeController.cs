using Microsoft.AspNetCore.Mvc;
using MilkyWay.Data;
using MilkyWay.Models;
using System.Diagnostics;

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
        public IActionResult Login()
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
        public IActionResult LoginAction(string login, string password)
        {
            if (string.IsNullOrEmpty(login))
            {
                return BadRequest("Ты логин напиши хотябы");
            }

            var user = _db.Users.FirstOrDefault(q => q.Login == login);

            if (user == null)
            {
                return NotFound("Логин говно");
            }

            return View("~/Views/Home/Index.cshtml");
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
