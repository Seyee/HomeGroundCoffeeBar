using Microsoft.EntityFrameworkCore;
using HomeGroundCoffeeBar.Models;

namespace HomeGroundCoffeeBar.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }


        public DbSet<GCashModel> GCash { get; set; }
        public DbSet<PayMayaModel> PayMaya { get; set; }
    }
}