namespace HomeGroundCoffeeBar.Models
{
    public class PayMayaModel
    {
        public int Id { get; set; }

        public int AvailBalance { get; set; }
        public int Amount { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;
    }
}