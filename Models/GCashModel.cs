using System.ComponentModel.DataAnnotations;

namespace HomeGroundCoffeeBar.Models
{
    public class GCashModel
    {

        [Key]
        public int Id { get; set; }

        public int AvailableBalance { get; set; }
        public int Amount { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}