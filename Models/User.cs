using System.ComponentModel.DataAnnotations;

namespace MilkyWay.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }
        public string Login { get; set; }
        public string? Password { get; set; }
        public int? HighScore { get; set; }
    }
}
