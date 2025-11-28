using Microsoft.EntityFrameworkCore;
using HomeGroundCoffeeBar.Models;
using Models;

namespace HomeGroundCoffeeBar.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }


        public DbSet<GCashModel> GCash { get; set; }
        public DbSet<PayMayaModel> PayMaya { get; set; }
        public DbSet<UserModel> Users { get; set; }
    }
}
//