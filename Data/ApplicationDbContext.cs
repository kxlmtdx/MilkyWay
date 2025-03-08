using Microsoft.EntityFrameworkCore;
using MilkyWay.Models;

namespace MilkyWay.Data
{
    public class ApplicationDbContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
         : base(options)
        {

        }
    }
}
